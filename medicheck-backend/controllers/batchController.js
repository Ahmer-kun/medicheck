import Batch from "../models/Batch.js";
import PharmacyMedicine from "../models/PharmacyMedicine.js";
import BlockchainService from '../services/blockchainService.js'; 
const dummyBatches = [
];

/* --------------------------------------------
   ➕ Create New Batch - STRICT DUAL STORAGE
-------------------------------------------- */
export const createBatch = async (req, res) => {
  try {
    const {
      batchNo,
      name,
      medicineName,
      manufactureDate,
      expiry,
      formulation,
      manufacturer,
      pharmacy,
      quantity,
      packSize
    } = req.body;

    console.log("Creating batch with STRICT DUAL STORAGE:", { batchNo });

    // Validate required fields
    if (!batchNo || !name || !manufactureDate || !expiry || !quantity || !manufacturer) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: batchNo, name, manufactureDate, expiry, quantity, manufacturer"
      });
    }

    // Validate dates
    const validateDate = (dateString, fieldName) => {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        throw new Error(`Invalid ${fieldName}: ${dateString}`);
      }
      return date;
    };

    const validManufactureDate = validateDate(manufactureDate, 'manufactureDate');
    const validExpiryDate = validateDate(expiry, 'expiryDate');

    if (validExpiryDate <= validManufactureDate) {
      throw new Error('Expiry date must be after manufacture date');
    }

    // Check if batch already exists
    const existingBatch = await Batch.findOne({ batchNo: batchNo.trim() });
    if (existingBatch) {
      return res.status(400).json({
        success: false,
        message: `Batch "${batchNo}" already exists`,
        duplicate: true
      });
    }

    // Prepare data for BOTH storage systems
    const batchData = {
      batchNo: batchNo.trim(),
      name: name.trim(),
      medicineName: (medicineName || name).trim(),
      manufactureDate: validManufactureDate,
      expiry: validExpiryDate,
      formulation: formulation?.trim() || 'Tablet',
      manufacturer: manufacturer.trim(),
      pharmacy: pharmacy?.trim() || "To be assigned",
      quantity: parseInt(quantity) || 1,
      packaging: {
        packSize: packSize?.trim() || "1X1",
        unitType: "units"
      },
      status: "manufactured"
    };

    const blockchainData = {
      batchNo: batchData.batchNo,
      name: batchData.name,
      medicineName: batchData.medicineName,
      manufactureDate: batchData.manufactureDate.toISOString().split('T')[0],
      expiryDate: batchData.expiry.toISOString().split('T')[0],
      formulation: batchData.formulation,
      quantity: parseInt(batchData.quantity),
      manufacturer: batchData.manufacturer,
      pharmacy: batchData.pharmacy,
      packaging: JSON.stringify(batchData.packaging),
      status: "active"
    };

    console.log('Data prepared for DUAL storage');
    
    // ============ DUAL STORAGE: MongoDB first, then Blockchain ============
    
    let mongoResult = null;
    let blockchainResult = null;
    
    try {
      // Step 1: Store in MongoDB
      console.log('Step 1: Storing in MongoDB...');
      
      const newBatch = new Batch({
        ...batchData,
        blockchainVerified: false,
        dualStorageStatus: 'pending'
      });
      
      mongoResult = await newBatch.save();
      console.log('MongoDB storage successful');
      
    } catch (mongoError) {
      console.error('MongoDB storage failed:', mongoError.message);
      
      if (mongoError.code === 11000) {
        return res.status(400).json({
          success: false,
          message: "Batch number already exists",
          duplicate: true
        });
      }
      
      return res.status(500).json({
        success: false,
        message: "MongoDB storage failed",
        error: mongoError.message
      });
    }
    
    // Step 2: Store on Blockchain (only if MongoDB succeeded)
    if (mongoResult) {
      try {
        console.log('Step 2: Storing on Blockchain...');
        
        blockchainResult = await BlockchainService.registerCompleteMedicine(blockchainData);
        console.log('Blockchain storage successful');
        
        // Update MongoDB with blockchain verification
        mongoResult.blockchainVerified = true;
        mongoResult.blockchainTransactionHash = blockchainResult.transactionHash;
        mongoResult.blockchainBlockNumber = blockchainResult.blockNumber;
        mongoResult.dualStorageStatus = 'completed';
        await mongoResult.save();
        
        // ============ SUCCESS: Both succeeded ============
        console.log(`DUAL STORAGE SUCCESSFUL for ${batchNo}`);
        
        const response = {
          success: true,
          message: "Batch created successfully in both MongoDB and Blockchain",
          storage: {
            mongodb: true,
            blockchain: true,
            status: "fully_synced",
            requirement: "dual_storage"
          },
          data: mongoResult,
          blockchain: {
            transactionHash: blockchainResult.transactionHash,
            blockNumber: blockchainResult.blockNumber,
            explorerUrl: blockchainResult.explorerUrl || null
          }
        };
        
        return res.status(201).json(response);
        
      } catch (blockchainError) {
        console.error('Blockchain storage failed:', blockchainError.message);
        
        // New Function : ROLLBACK MongoDB since blockchain failed
        console.log('Rolling back MongoDB entry due to blockchain failure...');
        try {
          await Batch.findByIdAndDelete(mongoResult._id);
          console.log('MongoDB entry rolled back successfully');
        } catch (rollbackError) {
          console.error('Failed to rollback MongoDB entry:', rollbackError.message);
        }
        
        // Return complete failure
        return res.status(500).json({
          success: false,
          message: `Batch registration failed: Both MongoDB and Blockchain storage must succeed. Blockchain error: ${blockchainError.message}`,
          storage: {
            mongodb: false,
            blockchain: false,
            status: "rolled_back",
            requirement: "dual_storage_failed"
          }
        });
      }
    }
    
  } catch (error) {
    console.error("Error in dual batch creation:", error.message);
    
    return res.status(500).json({
      success: false,
      message: "Batch creation failed",
      error: error.message,
      requires: "Both MongoDB and Blockchain storage must succeed"
    });
  }
};

// Helper functions for parallel storage
async function queueForBlockchainSync(batchData, error) {
  try {
    const BlockchainSyncQueue = (await import("../models/BlockchainSyncQueue.js")).default || 
      createTemporaryQueueModel();
    
    await BlockchainSyncQueue.create({
      batchNo: batchData.batchNo,
      data: batchData,
      error: error,
      retryCount: 0,
      status: 'pending'
    });
    
    console.log(`Queued ${batchData.batchNo} for blockchain sync`);
  } catch (queueError) {
    console.error("Failed to queue for sync:", queueError);
  }
}

async function storeTemporaryBatch(batchData, blockchainResult) {
  try {
    const TemporaryBatch = (await import("../models/TemporaryBatch.js")).default ||
      createTemporaryBatchModel();
    
    await TemporaryBatch.create({
      ...batchData,
      blockchainVerified: true,
      blockchainTransactionHash: blockchainResult.transactionHash,
      blockchainBlockNumber: blockchainResult.blockNumber,
      syncedToMongo: false,
      createdAt: new Date()
    });
    
    console.log(`Stored ${batchData.batchNo} in temporary storage for MongoDB recovery`);
  } catch (tempError) {
    console.error("Failed to store in temporary storage:", tempError);
  }
}

async function attemptStorageSync(batchData, mongoSuccess, blockchainSuccess) {
  try {
    console.log(`Attempting storage sync for ${batchData.batchNo}...`);
    
    if (!mongoSuccess && blockchainSuccess) {
      // Try to save to MongoDB
      const Batch = (await import("../models/Batch.js")).default;
      const newBatch = new Batch({
        ...batchData,
        blockchainVerified: true,
        blockchainTransactionHash: "from_temp_sync"
      });
      
      await newBatch.save();
      console.log(`Successfully synced ${batchData.batchNo} to MongoDB`);
    }
    
    if (!blockchainSuccess && mongoSuccess) {
      // Try to save to Blockchain
      const BlockchainService = (await import("../services/blockchainService.js")).default;
      const blockchainData = {
        ...batchData,
        manufactureDate: batchData.manufactureDate.toISOString().split('T')[0],
        expiryDate: batchData.expiry.toISOString().split('T')[0],
        packaging: JSON.stringify(batchData.packaging),
        status: "active"
      };
      
      await BlockchainService.registerCompleteMedicine(blockchainData);
      console.log(`Successfully synced ${batchData.batchNo} to Blockchain`);
    }
  } catch (syncError) {
    console.error(`Sync failed for ${batchData.batchNo}:`, syncError.message);
  }
}

// Temporary models if they don't exist
function createTemporaryQueueModel() {
  const mongoose = require('mongoose');
  const schema = new mongoose.Schema({
    batchNo: String,
    data: Object,
    error: String,
    retryCount: { type: Number, default: 0 },
    status: { type: String, default: 'pending' },
    lastAttempt: Date,
    createdAt: { type: Date, default: Date.now }
  });
  return mongoose.model('BlockchainSyncQueue', schema);
}

function createTemporaryBatchModel() {
  const mongoose = require('mongoose');
  const schema = new mongoose.Schema({
    ...batchSchema.obj, // Reuse batch schema
    blockchainVerified: Boolean,
    blockchainTransactionHash: String,
    blockchainBlockNumber: Number,
    syncedToMongo: { type: Boolean, default: false },
    syncError: String,
    createdAt: { type: Date, default: Date.now }
  });
  return mongoose.model('TemporaryBatch', schema);
}

/* --------------------------------------------
   Verify Batch by Batch No (Check Both Collections)
-------------------------------------------- */
export const verifyBatch = async (req, res) => {
  try {
    const { batchNo } = req.params;
    
    console.log("Verifying batch:", batchNo);

    // Check in main Batch collection first
    let batch = await Batch.findOne({ batchNo });
    let source = 'batch';

    // If not found in Batch collection, check PharmacyMedicine collection
    if (!batch) {
      batch = await PharmacyMedicine.findOne({ batchNo });
      source = 'pharmacy';
    }

    if (!batch) {
      // Check in dummy data as fallback
      const dummy = dummyBatches.find((b) => b.batchNo === batchNo);
      if (dummy) {
        const today = new Date();
        // Clear time for accurate date comparison
        today.setHours(0, 0, 0, 0);
        
        const expiryDate = new Date(dummy.expiry);
        expiryDate.setHours(0, 0, 0, 0);
        
        // FIXED: Medicine expires TODAY is considered expired
        const isExpired = expiryDate <= today;
        
        return res.json({ 
          ...dummy, 
          verified: true,
          exists: true,
          authentic: !isExpired,
          message: isExpired ? 
            "This medicine is EXPIRED. Do not use!" : 
            "This medicine is authentic and safe to use.",
          source: 'dummy',
          status: isExpired ? 'Expired' : 'Active'
        });
      }
      return res.status(404).json({ 
        exists: false,
        message: "Batch not found in system" 
      });
    }

    // Convert to plain object and add verification info
    const batchData = batch.toObject ? batch.toObject() : batch;
    
    const today = new Date();
    // Clear time for accurate date comparison
    today.setHours(0, 0, 0, 0);
    
    // Handle different field names for expiry date
    const expiryDateStr = batchData.expiryDate || batchData.expiry;
    const expiryDate = new Date(expiryDateStr);
    expiryDate.setHours(0, 0, 0, 0);
    
    // FIXED: Medicine expires TODAY is considered expired (use <= instead of <)
    const isExpired = expiryDate <= today;
    
    // Calculate days remaining (negative if expired)
    const daysRemaining = Math.floor((expiryDate - today) / (1000 * 60 * 60 * 24));
    
    // SAFE BLOCKCHAIN CHECK - don't fail the whole verification if blockchain fails
    let blockchainData = { exists: false };
    try {
      blockchainData = await BlockchainService.getCompleteMedicineFromBlockchain(batchNo);
    } catch (blockchainError) {
      console.warn("Blockchain check failed, continuing without it:", blockchainError.message);
      // Continue with database verification only
    }

    // Prepare message based on status
    let message = "";
    if (isExpired) {
      message = "This medicine is EXPIRED. Do not use!";
    } else if (daysRemaining === 0) {
      message = "This medicine expires TODAY - Use immediately";
    } else if (blockchainData.exists) {
      message = "Medicine VERIFIED on Blockchain - Safe to Use";
    } else {
      message = "Medicine found but not blockchain verified";
    }

    const response = {
      exists: true,
      verified: true,
      authentic: !isExpired && (blockchainData.exists || true), // Allow DB-only verification
      message: message,
      batchNo: batchData.batchNo,
      name: batchData.name,
      medicineName: batchData.medicineName || batchData.name,
      formulation: batchData.formulation,
      expiry: expiryDateStr,
      expiryDate: expiryDateStr, // Add both for compatibility
      manufacturer: batchData.manufacturer,
      pharmacy: batchData.pharmacy,
      quantity: Number(batchData.quantity),
      packaging: batchData.packaging,
      status: isExpired ? 'Expired' : (daysRemaining === 0 ? 'Expires Today' : (batchData.status || 'Active')),
      source: source,
      blockchainVerified: blockchainData.exists,
      isExpired: isExpired, // Add explicit isExpired field
      daysRemaining: daysRemaining, 
      expiryCheck: {
        expiryDate: expiryDate.toISOString().split('T')[0],
        today: today.toISOString().split('T')[0],
        daysRemaining: daysRemaining,
        isExpired: isExpired,
        expiresToday: daysRemaining === 0
      },
      blockchainData: blockchainData.exists ? {
        existsOnChain: true,
        transactionHash: blockchainData.transactionHash,
        verified: blockchainData.verified,
        currentOwner: blockchainData.currentOwner
      } : {
        existsOnChain: false,
        warning: "Not found on blockchain"
      }
    };

    console.log("Verification successful for:", batchNo);
    console.log("Expiry check:", {
      expiryDate: response.expiryCheck.expiryDate,
      today: response.expiryCheck.today,
      isExpired: response.isExpired,
      daysRemaining: response.daysRemaining,
      expiresToday: response.expiryCheck.expiresToday
    });
    
    res.json(response);
  } catch (error) {
    console.error("Error verifying batch:", error.message);
    // Return a more helpful error message
    res.status(500).json({ 
      exists: false,
      message: "Error verifying batch. Please try again.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/* --------------------------------------------
   Get Available Manufacturer Batches (Not Accepted by Pharmacies)
-------------------------------------------- */

  export const getAvailableManufacturerBatches = async (req, res) => {
  try {
    const PharmacyMedicine = (await import("../models/PharmacyMedicine.js")).default;

    // Get all manufacturer batches
    const manufacturerBatches = await Batch.find({
      status: { $in: ['active', 'manufactured'] } // Only show non-accepted batches
    }).sort({ createdAt: -1 });

    // Get all batch numbers that have been accepted by pharmacies
    const acceptedBatchNumbers = await PharmacyMedicine.distinct('batchNo');

    // Filter out batches that are already in pharmacy inventory
    const availableBatches = manufacturerBatches.filter(batch => 
      !acceptedBatchNumbers.includes(batch.batchNo) && 
      batch.status !== 'accepted' && 
      batch.status !== 'at_pharmacy'
    );

    console.log(`Found ${availableBatches.length} available manufacturer batches (filtered out ${acceptedBatchNumbers.length} accepted batches)`);

    res.json({
      success: true,
      data: availableBatches,
      stats: {
        totalManufacturerBatches: manufacturerBatches.length,
        availableBatches: availableBatches.length,
        acceptedBatches: acceptedBatchNumbers.length
      }
    });
  } catch (error) {
    console.error("Error fetching available manufacturer batches:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching available manufacturer batches",
      error: error.message
    });
  }
};

/* --------------------------------------------
   Get All Batches (Combine Both Collections)
-------------------------------------------- */
export const getAllBatches = async (req, res) => {
  try {
    const [batches, pharmacyMedicines] = await Promise.all([
      Batch.find().sort({ createdAt: -1 }),
      PharmacyMedicine.find().sort({ createdAt: -1 })
    ]);

    console.log(`Found ${batches.length} batches and ${pharmacyMedicines.length} pharmacy medicines`);

    // Combine both collections for a unified view
    const allBatches = [
      ...batches.map(b => ({
        ...b.toObject(),
        source: 'batch',
        expiry: b.expiry //For Consistency use expiry
      })),
      ...pharmacyMedicines.map(pm => ({
        ...pm.toObject(),
        source: 'pharmacy',
        expiry: pm.expiryDate // Map expiryDate to expiry for consistency
      }))
    ];

    if (allBatches.length === 0) {
      console.log("No batches found in DB — returning dummy data");
      return res.json(dummyBatches.map(b => ({...b, source: 'dummy'})));
    }

    // Sort by creation date (newest first)
    allBatches.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      success: true,
      data: allBatches
    });
  } catch (error) {
    console.error("Error fetching batches:", error.message);
    res.status(500).json({ 
      success: false,
      message: "Error fetching batches", 
      error: error.message 
    });
  }
};

/* --------------------------------------------
   Get Single Batch by Batch No
-------------------------------------------- */
export const getBatch = async (req, res) => {
  try {
    const { batchNo } = req.params;
    
    console.log(`Fetching batch: ${batchNo}`);

    // First check in main Batch collection
    let batch = await Batch.findOne({ batchNo });

    if (!batch) {
      // If not found, check in PharmacyMedicine collection
      const PharmacyMedicine = (await import("../models/PharmacyMedicine.js")).default;
      batch = await PharmacyMedicine.findOne({ batchNo });
      
      if (batch) {
        // Convert PharmacyMedicine to batch-like format
        const batchData = batch.toObject();
        return res.json({
          success: true,
          data: {
            ...batchData,
            expiry: batchData.expiryDate,
            source: 'pharmacy_medicine'
          }
        });
      }
      
      // Check in dummy data as fallback (only for development)
      if (process.env.NODE_ENV === 'development') {
        const dummy = dummyBatches.find((b) => b.batchNo === batchNo);
        if (dummy) {
          return res.json({
            success: true,
            data: dummy,
            source: 'dummy'
          });
        }
      }
      
      return res.status(404).json({ 
        success: false,
        message: `Batch "${batchNo}" not found` 
      });
    }

    res.json({
      success: true,
      data: batch,
      source: 'batch'
    });
  } catch (error) {
    console.error("Error fetching batch:", error.message);
    res.status(500).json({ 
      success: false,
      message: "Error fetching batch", 
      error: error.message 
    });
  }
};

/* --------------------------------------------
   Update Batch
-------------------------------------------- */
export const updateBatch = async (req, res) => {
  try {
    const { batchNo } = req.params;
    const updated = await Batch.findOneAndUpdate({ batchNo }, req.body, { new: true });

    if (!updated) {
      return res.status(404).json({ 
        success: false,
        message: "Batch not found" 
      });
    }

    console.log("Batch updated:", batchNo);
    res.json({
      success: true,
      message: "Batch updated successfully",
      data: updated
    });
  } catch (error) {
    console.error("Error updating batch:", error.message);
    res.status(500).json({ 
      success: false,
      message: "Error updating batch", 
      error: error.message 
    });
  }
};

/* --------------------------------------------
   Accept Batch (Pharmacy)
-------------------------------------------- */
export const acceptBatch = async (req, res) => {
  try {
    const { batchNo } = req.params;
    const batch = await Batch.findOne({ batchNo });

    if (!batch) {
      return res.status(404).json({ 
        success: false,
        message: "Batch not found" 
      });
    }

    batch.status = "accepted";
    await batch.save();

    console.log("Batch accepted:", batchNo);
    res.json({
      success: true,
      message: "Batch accepted successfully",
      data: batch
    });
  } catch (error) {
    console.error("Error accepting batch:", error.message);
    res.status(500).json({ 
      success: false,
      message: "Error accepting batch", 
      error: error.message 
    });
  }
};

/* --------------------------------------------
   Initialize Dummy Data (DEV ONLY)
-------------------------------------------- */
export const initializeBatches = async () => {
  try {
    const count = await Batch.countDocuments();
    if (count === 0) {
      await Batch.insertMany(dummyBatches);
      console.log("Dummy batches inserted into MongoDB.");
    } else {
      console.log("MongoDB already has batches — skipping init.");
    }
  } catch (error) {
    console.error("Error initializing dummy batches:", error.message);
  }
};

/* --------------------------------------------
   IMPORT BATCHES FROM EXCEL - UPDATED
-------------------------------------------- */
export const importBatchesFromExcel = async (req, res) => {
  try {
    const { batches, manufacturerCompanyId } = req.body;
    
    console.log(`Importing ${batches?.length || 0} batches from Excel for company: ${manufacturerCompanyId}`);

    // Validate input
    if (!batches || !Array.isArray(batches) || batches.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No batch data provided or invalid format"
      });
    }

    if (!manufacturerCompanyId) {
      return res.status(400).json({
        success: false,
        message: "Manufacturer company ID is required"
      });
    }

    const ManufacturerCompany = (await import("../models/ManufacturerCompany.js")).default;
    
    // Find manufacturer company
    const manufacturerCompany = await ManufacturerCompany.findById(manufacturerCompanyId);
    if (!manufacturerCompany) {
      return res.status(404).json({
        success: false,
        message: "Manufacturer company not found"
      });
    }

    const results = {
      total: batches.length,
      success: 0,
      failed: 0,
      details: []
    };

    const importedBatches = [];

    for (const batchData of batches) {
      try {
        console.log(`Processing batch: ${batchData.batchNo || 'Unknown'}`);
        
        // Validate required fields
        const requiredFields = ['medicineName', 'batchNo', 'quantity'];
        const missingFields = requiredFields.filter(field => {
          const value = batchData[field];
          return !value && value !== 0;
        });
        
        if (missingFields.length > 0) {
          throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
        }

        // Check if batch already exists
        const existingBatch = await Batch.findOne({ batchNo: batchData.batchNo.trim() });
        if (existingBatch) {
          results.details.push({
            batchNo: batchData.batchNo,
            status: 'skipped',
            message: 'Batch already exists'
          });
          results.failed++;
          continue;
        }

        // Format batch data
        const today = new Date();
        const manufactureDate = batchData.manufactureDate ? new Date(batchData.manufactureDate) : today;
        const expiryDate = batchData.expiryDate ? new Date(batchData.expiryDate) : new Date(today);
        expiryDate.setFullYear(expiryDate.getFullYear() + 1); // Default to 1 year from now

        const formattedBatch = {
          batchNo: batchData.batchNo.trim(),
          name: batchData.medicineName.trim(),
          medicineName: batchData.medicineName.trim(),
          manufactureDate: manufactureDate.toISOString().split('T')[0],
          expiry: expiryDate.toISOString().split('T')[0],
          formulation: batchData.formulation || 'Tablet',
          manufacturer: manufacturerCompany.companyName,
          pharmacy: "To be assigned",
          quantity: parseInt(batchData.quantity) || 1,
          packaging: {
            packSize: batchData.packSize || "1X1",
            unitType: "units"
          },
          status: "manufactured"
        };

        console.log('Formatted batch:', formattedBatch);

        // STRICT DUAL STORAGE IMPLEMENTATION
        let mongoResult = null;
        
        try {
          // Create batch in MongoDB
          const newBatch = new Batch({
            ...formattedBatch,
            blockchainVerified: false,
            dualStorageStatus: 'pending'
          });
          
          mongoResult = await newBatch.save();
          console.log('MongoDB storage successful');
          
          // Try blockchain registration
          const blockchainData = {
            ...formattedBatch,
            manufactureDate: formattedBatch.manufactureDate,
            expiryDate: formattedBatch.expiry,
            packaging: JSON.stringify(formattedBatch.packaging),
            status: "active",
            quantity: parseInt(formattedBatch.quantity)
          };
          
          const blockchainResult = await BlockchainService.registerCompleteMedicine(blockchainData);
          
          // Update MongoDB with blockchain verification
          newBatch.blockchainVerified = true;
          newBatch.blockchainTransactionHash = blockchainResult?.transactionHash;
          newBatch.blockchainBlockNumber = blockchainResult?.blockNumber;
          newBatch.dualStorageStatus = 'completed';
          await newBatch.save();
          
          results.details.push({
            batchNo: batchData.batchNo,
            status: 'success',
            message: 'Added with blockchain verification',
            transactionHash: blockchainResult?.transactionHash
          });
          
          importedBatches.push(newBatch);
          results.success++;
          
        } catch (storageError) {
          // ROLLBACK if either storage fails
          if (mongoResult) {
            console.log('Rolling back MongoDB entry...');
            try {
              await Batch.findByIdAndDelete(mongoResult._id);
              console.log('MongoDB entry rolled back');
            } catch (rollbackError) {
              console.error('Rollback failed:', rollbackError.message);
            }
          }
          
          results.details.push({
            batchNo: batchData.batchNo,
            status: 'failed',
            error: storageError.message,
            requirement: 'dual_storage_failed'
          });
          results.failed++;
        }

      } catch (error) {
        console.error(`Error importing batch ${batchData.batchNo || 'Unknown'}:`, error.message);
        results.details.push({
          batchNo: batchData.batchNo || 'Unknown',
          status: 'failed',
          error: error.message
        });
        results.failed++;
      }
    }

    // Update manufacturer company stats
    const totalBatches = await Batch.countDocuments({ 
      manufacturer: manufacturerCompany.companyName 
    });
    
    manufacturerCompany.totalBatches = totalBatches;
    await manufacturerCompany.save();

    console.log(`Excel import completed: ${results.success}/${results.total} successful`);

    res.json({
      success: true,
      message: `Import completed: ${results.success} successful, ${results.failed} failed`,
      results: results,
      importedCount: results.success,
      manufacturerCompany: {
        id: manufacturerCompany._id,
        name: manufacturerCompany.companyName,
        updatedBatches: totalBatches
      },
      importedBatches: importedBatches.map(b => ({
        id: b._id,
        batchNo: b.batchNo,
        name: b.name,
        quantity: b.quantity,
        blockchainVerified: b.blockchainVerified
      }))
    });

  } catch (error) {
    console.error("Excel import error:", error);
    res.status(500).json({
      success: false,
      message: "Error importing batches from Excel",
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};


// export const importBatchesFromExcel = async (req, res) => {
//   try {
//     const { batches, manufacturerCompanyId } = req.body;
    
//     console.log(`📊 Importing ${batches?.length || 0} batches from Excel for company: ${manufacturerCompanyId}`);

//     // Validate input
//     if (!batches || !Array.isArray(batches) || batches.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "No batch data provided or invalid format"
//       });
//     }

//     if (!manufacturerCompanyId) {
//       return res.status(400).json({
//         success: false,
//         message: "Manufacturer company ID is required"
//       });
//     }

//     const ManufacturerCompany = (await import("../models/ManufacturerCompany.js")).default;
    
//     // Find manufacturer company
//     const manufacturerCompany = await ManufacturerCompany.findById(manufacturerCompanyId);
//     if (!manufacturerCompany) {
//       return res.status(404).json({
//         success: false,
//         message: "Manufacturer company not found"
//       });
//     }

//     const results = {
//       total: batches.length,
//       success: 0,
//       failed: 0,
//       details: []
//     };

//     const importedBatches = [];

//     for (const batchData of batches) {
//       try {
//         console.log(`Processing batch: ${batchData.batchNo || 'Unknown'}`);
        
//         // Validate required fields
//         const requiredFields = ['medicineName', 'batchNo', 'quantity'];
//         const missingFields = requiredFields.filter(field => {
//           const value = batchData[field];
//           return !value && value !== 0;
//         });
        
//         if (missingFields.length > 0) {
//           throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
//         }

//         // Check if batch already exists
//         const existingBatch = await Batch.findOne({ batchNo: batchData.batchNo.trim() });
//         if (existingBatch) {
//           results.details.push({
//             batchNo: batchData.batchNo,
//             status: 'skipped',
//             message: 'Batch already exists'
//           });
//           results.failed++;
//           continue;
//         }

//         // Format batch data
//         const today = new Date();
//         const expiryDate = batchData.expiryDate ? new Date(batchData.expiryDate) : new Date(today);
//         expiryDate.setFullYear(expiryDate.getFullYear() + 1); // Default to 1 year from now

//         const formattedBatch = {
//           batchNo: batchData.batchNo.trim(),
//           name: batchData.medicineName.trim(),
//           medicineName: batchData.medicineName.trim(),
//           manufactureDate: batchData.manufactureDate || today.toISOString().split('T')[0],
//           expiry: expiryDate.toISOString().split('T')[0],
//           formulation: batchData.formulation || 'Tablet',
//           manufacturer: manufacturerCompany.companyName,
//           pharmacy: "To be assigned",
//           quantity: parseInt(batchData.quantity) || 1,
//           packaging: {
//             packSize: batchData.packSize || "1X1",
//             unitType: "units"
//           },
//           status: "manufactured",
//           blockchainVerified: false,
//           source: 'excel_import'
//         };

//         console.log('Formatted batch:', formattedBatch);

//         // Save to database
//         const newBatch = new Batch(formattedBatch);
//         await newBatch.save();

//         // Try blockchain registration (but don't fail if it doesn't work)
//         try {
//           const blockchainData = {
//             ...formattedBatch,
//             manufactureDate: formattedBatch.manufactureDate,
//             expiryDate: formattedBatch.expiry,
//             packaging: JSON.stringify(formattedBatch.packaging),
//             status: "active"
//           };

//           const blockchainResult = await BlockchainService.registerCompleteMedicine(blockchainData);
          
//           newBatch.blockchainVerified = true;
//           newBatch.blockchainTransactionHash = blockchainResult?.transactionHash;
//           newBatch.blockchainBlockNumber = blockchainResult?.blockNumber;
//           await newBatch.save();

//           results.details.push({
//             batchNo: batchData.batchNo,
//             status: 'success',
//             message: 'Added with blockchain verification',
//             transactionHash: blockchainResult?.transactionHash
//           });

//         } catch (blockchainError) {
//           console.warn(`Blockchain registration failed for ${batchData.batchNo}:`, blockchainError.message);
          
//           // Still save batch even if blockchain fails
//           newBatch.blockchainVerified = false;
//           newBatch.blockchainError = blockchainError.message;
//           await newBatch.save();

//           results.details.push({
//             batchNo: batchData.batchNo,
//             status: 'partial_success',
//             message: 'Added without blockchain verification',
//             warning: blockchainError.message
//           });
//         }

//         importedBatches.push(newBatch);
//         results.success++;

//       } catch (error) {
//         console.error(`❌ Error importing batch ${batchData.batchNo || 'Unknown'}:`, error.message);
//         results.details.push({
//           batchNo: batchData.batchNo || 'Unknown',
//           status: 'failed',
//           error: error.message
//         });
//         results.failed++;
//       }
//     }

//     // Update manufacturer company stats
//     const totalBatches = await Batch.countDocuments({ 
//       manufacturer: manufacturerCompany.companyName 
//     });
    
//     manufacturerCompany.totalBatches = totalBatches;
//     await manufacturerCompany.save();

//     console.log(`✅ Excel import completed: ${results.success}/${results.total} successful`);

//     res.json({
//       success: true,
//       message: `Import completed: ${results.success} successful, ${results.failed} failed`,
//       results: results,
//       importedCount: results.success,
//       manufacturerCompany: {
//         id: manufacturerCompany._id,
//         name: manufacturerCompany.companyName,
//         updatedBatches: totalBatches
//       },
//       importedBatches: importedBatches.map(b => ({
//         id: b._id,
//         batchNo: b.batchNo,
//         name: b.name,
//         quantity: b.quantity
//       }))
//     });

//   } catch (error) {
//     console.error("❌ Excel import error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error importing batches from Excel",
//       error: error.message,
//       stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
//     });
//   }
// };
