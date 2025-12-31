// controllers/pharmacyMedicineController.js
import PharmacyMedicine from "../models/PharmacyMedicine.js";
import PharmacyCompany from "../models/PharmacyCompany.js";
import Batch from "../models/Batch.js";
import mongoose from "mongoose";
import BlockchainService from '../services/blockchainService.js';

// Helper function to format and log medicine data
const logMedicineData = (medicine, title = "MEDICINE DATA") => {
  console.log(`📋 ${title}:`);
  console.log('============================================');
  console.log(`batchNo: ${medicine.batchNo}`);
  console.log(`name: ${medicine.name}`);
  console.log(`medicineName: ${medicine.medicineName}`);
  console.log(`manufactureDate: ${medicine.manufactureDate}`);
  console.log(`expiryDate: ${medicine.expiryDate}`);
  console.log(`formulation: ${medicine.formulation}`);
  console.log(`quantity: ${medicine.quantity}`);
  console.log(`manufacturer: ${medicine.manufacturer}`);
  console.log(`pharmacy: ${medicine.pharmacy}`);
  console.log(`packaging: ${typeof medicine.packaging === 'object' ? JSON.stringify(medicine.packaging) : medicine.packaging}`);
  console.log(`status: ${medicine.status}`);
  if (medicine.currentOwner) console.log(`currentOwner: ${medicine.currentOwner}`);
  if (medicine.verified !== undefined) console.log(`verified: ${medicine.verified}`);
  console.log('============================================');
};

// Temporary storage models (will be created if they don't exist)
let TemporaryBatch, BlockchainSyncQueue;

/* --------------------------------------------
   🏗️ Initialize Temporary Models
-------------------------------------------- */
// const initializeTemporaryModels = async () => {
//   try {
//     // Try to import existing models
//     try {
//       const tmpBatch = await import("../models/TemporaryBatch.js");
//       TemporaryBatch = tmpBatch.default;
//     } catch {
//       // Create temporary model if doesn't exist
//       const temporaryBatchSchema = new mongoose.Schema({
//         batchNo: { type: String, required: true, unique: true },
//         name: { type: String, required: true },
//         medicineName: String,
//         manufactureDate: Date,
//         expiryDate: Date,
//         formulation: String,
//         quantity: Number,
//         manufacturer: String,
//         pharmacyCompany: mongoose.Schema.Types.ObjectId,
//         pharmacyName: String,
//         status: String,
//         blockchainVerified: { type: Boolean, default: false },
//         blockchainTransactionHash: String,
//         blockchainBlockNumber: Number,
//         syncedToMongo: { type: Boolean, default: false },
//         syncAttempts: { type: Number, default: 0 },
//         syncError: String,
//         lastSyncAttempt: Date
//       }, { timestamps: true });
      
//       TemporaryBatch = mongoose.model('TemporaryBatch', temporaryBatchSchema) || 
//                       mongoose.model('TemporaryBatch', temporaryBatchSchema, 'temporary_batches');
//     }

//     try {
//       const tmpQueue = await import("../models/BlockchainSyncQueue.js");
//       BlockchainSyncQueue = tmpQueue.default;
//     } catch {
//       // Create sync queue model if doesn't exist
//       const syncQueueSchema = new mongoose.Schema({
//         batchNo: { type: String, required: true, unique: true },
//         data: { type: Object, required: true },
//         error: String,
//         retryCount: { type: Number, default: 0 },
//         maxRetries: { type: Number, default: 5 },
//         status: { 
//           type: String, 
//           enum: ['pending', 'processing', 'completed', 'failed'],
//           default: 'pending'
//         },
//         lastAttempt: Date,
//         nextRetry: Date,
//         successData: {
//           transactionHash: String,
//           blockNumber: Number
//         }
//       }, { timestamps: true });
      
//       BlockchainSyncQueue = mongoose.model('BlockchainSyncQueue', syncQueueSchema) || 
//                            mongoose.model('BlockchainSyncQueue', syncQueueSchema, 'blockchain_sync_queue');
//     }
//   } catch (error) {
//     console.warn("⚠️ Could not initialize temporary models:", error.message);
//   }
// };

// // Initialize models on first import
// initializeTemporaryModels();

/* --------------------------------------------
   ⚡ HELPER FUNCTIONS FOR PARALLEL STORAGE
-------------------------------------------- */
// const queueForBlockchainSync = async (batchData, error) => {
//   try {
//     if (!BlockchainSyncQueue) await initializeTemporaryModels();
    
//     await BlockchainSyncQueue.create({
//       batchNo: batchData.batchNo,
//       data: batchData,
//       error: error,
//       retryCount: 0,
//       status: 'pending'
//     });
    
//     console.log(`📋 Queued ${batchData.batchNo} for blockchain sync`);
//   } catch (queueError) {
//     console.error("Failed to queue for sync:", queueError);
//   }
// };

// const storeInTemporaryBatch = async (batchData, blockchainResult = null) => {
//   try {
//     if (!TemporaryBatch) await initializeTemporaryModels();
    
//     await TemporaryBatch.create({
//       ...batchData,
//       blockchainVerified: !!blockchainResult,
//       blockchainTransactionHash: blockchainResult?.transactionHash,
//       blockchainBlockNumber: blockchainResult?.blockNumber,
//       syncedToMongo: false,
//       createdAt: new Date()
//     });
    
//     console.log(`💾 Stored ${batchData.batchNo} in temporary storage`);
//   } catch (tempError) {
//     console.error("Failed to store in temporary storage:", tempError);
//   }
// };

// const attemptStorageSync = async (batchData, mongoSuccess, blockchainSuccess) => {
//   try {
//     console.log(`🔄 Attempting storage sync for ${batchData.batchNo}...`);
    
//     if (!mongoSuccess && blockchainSuccess) {
//       // Try to save to MongoDB
//       const newPharmacyMedicine = new PharmacyMedicine({
//         ...batchData,
//         blockchainVerified: true,
//         blockchainTransactionHash: "from_temp_sync"
//       });
      
//       await newPharmacyMedicine.save();
//       console.log(`✅ Successfully synced ${batchData.batchNo} to PharmacyMedicine`);
//     }
    
//     if (!blockchainSuccess && mongoSuccess) {
//       // Try to save to Blockchain
//       const blockchainData = {
//         batchNo: batchData.batchNo,
//         name: batchData.name,
//         medicineName: batchData.medicineName,
//         manufactureDate: batchData.manufactureDate.toISOString().split('T')[0],
//         expiryDate: batchData.expiryDate.toISOString().split('T')[0],
//         formulation: batchData.formulation,
//         quantity: batchData.quantity,
//         manufacturer: batchData.manufacturer,
//         pharmacy: batchData.pharmacyName || "Pharmacy",
//         packaging: batchData.packaging || {},
//         status: batchData.status || 'At Pharmacy'
//       };
      
//       await BlockchainService.registerCompleteMedicine(blockchainData);
//       console.log(`✅ Successfully synced ${batchData.batchNo} to Blockchain`);
//     }
//   } catch (syncError) {
//     console.error(`❌ Sync failed for ${batchData.batchNo}:`, syncError.message);
//   }
// };


/* --------------------------------------------
   ➕ Add Medicine to Specific Pharmacy Company - STRICT DUAL
-------------------------------------------- */
export const addPharmacyMedicine = async (req, res) => {
  try {
    const {
      name,
      batchNo,
      medicineName,
      manufactureDate,
      expiryDate,
      formulation,
      quantity,
      manufacturer,
      pharmacyCompanyId,
      status = 'Active'
    } = req.body;

    console.log("📦 Adding medicine to pharmacy with STRICT DUAL STORAGE...");

    // Validate required fields
    if (!name || !batchNo || !medicineName || !manufactureDate || !expiryDate || !formulation || !quantity || !manufacturer || !pharmacyCompanyId) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided"
      });
    }

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(pharmacyCompanyId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid pharmacy company ID"
      });
    }

    // Find pharmacy company
    const pharmacyCompany = await PharmacyCompany.findById(pharmacyCompanyId);
    if (!pharmacyCompany) {
      return res.status(404).json({
        success: false,
        message: "Pharmacy company not found"
      });
    }

    // Check if batch already exists
    const existingMedicine = await PharmacyMedicine.findOne({ batchNo: batchNo.trim() });
    if (existingMedicine) {
      return res.status(400).json({
        success: false,
        message: "Medicine with this batch number already exists in pharmacy"
      });
    }

    // Prepare data for BOTH storage systems
    const pharmacyMedicineData = {
      name: name.trim(),
      batchNo: batchNo.trim(),
      medicineName: (medicineName || name).trim(),
      manufactureDate: new Date(manufactureDate),
      expiryDate: new Date(expiryDate),
      formulation: formulation.trim(),
      quantity: parseInt(quantity),
      manufacturer: manufacturer.trim(),
      pharmacyCompany: pharmacyCompanyId,
      pharmacyName: pharmacyCompany.name,
      status: status,
      blockchainVerified: false
    };

    const blockchainData = {
      batchNo: batchNo.trim(),
      name: name.trim(),
      medicineName: (medicineName || name).trim(),
      manufactureDate: new Date(manufactureDate).toISOString().split('T')[0],
      expiryDate: new Date(expiryDate).toISOString().split('T')[0],
      formulation: formulation.trim(),
      quantity: parseInt(quantity),
      manufacturer: manufacturer.trim(),
      pharmacy: pharmacyCompany.name,
      packaging: {},
      status: status
    };

    console.log('✅ Data prepared for DUAL storage');

    // ============ STRICT DUAL STORAGE ============
    
    let pharmacyMedicineResult = null;
    let blockchainResult = null;
    
    try {
      // Step 1: Store in MongoDB
      console.log('📝 Step 1: Storing in MongoDB...');
      
      pharmacyMedicineResult = new PharmacyMedicine({
        ...pharmacyMedicineData,
        blockchainVerified: false,
        dualStorageStatus: 'pending'
      });
      
      await pharmacyMedicineResult.save();
      console.log('✅ MongoDB storage successful');
      
    } catch (mongoError) {
      console.error('❌ MongoDB storage failed:', mongoError.message);
      
      if (mongoError.code === 11000) {
        return res.status(400).json({
          success: false,
          message: "Medicine already exists",
          duplicate: true
        });
      }
      
      return res.status(500).json({
        success: false,
        message: "MongoDB storage failed",
        error: mongoError.message
      });
    }
    
    // Step 2: Store on Blockchain
    if (pharmacyMedicineResult) {
      try {
        console.log('🔗 Step 2: Storing on Blockchain...');
        
        blockchainResult = await BlockchainService.registerCompleteMedicine(blockchainData);
        console.log('✅ Blockchain storage successful');
        
        // Update MongoDB with blockchain verification
        pharmacyMedicineResult.blockchainVerified = true;
        pharmacyMedicineResult.blockchainTransactionHash = blockchainResult.transactionHash;
        pharmacyMedicineResult.blockchainBlockNumber = blockchainResult.blockNumber;
        pharmacyMedicineResult.dualStorageStatus = 'completed';
        await pharmacyMedicineResult.save();
        
        // ============ SUCCESS: Both succeeded ============
        console.log(`🎉 DUAL STORAGE SUCCESSFUL for medicine: ${batchNo}`);
        
        const response = {
          success: true,
          message: "Medicine added successfully in both MongoDB and Blockchain",
          storage: {
            mongodb: true,
            blockchain: true,
            status: "fully_synced",
            requirement: "dual_storage"
          },
          data: pharmacyMedicineResult,
          blockchain: {
            transactionHash: blockchainResult.transactionHash,
            blockNumber: blockchainResult.blockNumber,
            explorerUrl: blockchainResult.explorerUrl || null
          }
        };
        
        return res.status(201).json(response);
        
      } catch (blockchainError) {
        console.error('❌ Blockchain storage failed:', blockchainError.message);
        
        // 🔴 CRITICAL FIX: ROLLBACK MongoDB since blockchain failed
        console.log('🔄 Rolling back MongoDB entry due to blockchain failure...');
        try {
          await PharmacyMedicine.findByIdAndDelete(pharmacyMedicineResult._id);
          console.log('✅ MongoDB entry rolled back successfully');
        } catch (rollbackError) {
          console.error('❌ Failed to rollback MongoDB entry:', rollbackError.message);
        }
        
        // Return complete failure
        return res.status(500).json({
          success: false,
          message: `Medicine registration failed: Both MongoDB and Blockchain storage must succeed. Blockchain error: ${blockchainError.message}`,
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
    console.error("❌ Error adding pharmacy medicine:", error.message);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Medicine with this batch number already exists",
        duplicate: true
      });
    }
    
    return res.status(500).json({
      success: false,
      message: "Error adding medicine",
      error: error.message
    });
  }
};


// export const addPharmacyMedicine = async (req, res) => {
//   try {
//     const {
//       name,
//       batchNo,
//       medicineName,
//       manufactureDate,
//       expiryDate,
//       formulation,
//       quantity,
//       manufacturer,
//       pharmacyCompanyId,
//       status = 'Active'
//     } = req.body;

//     console.log("📦 Adding medicine to pharmacy company with PARALLEL storage:", { name, batchNo, pharmacyCompanyId });

//     // Validate required fields
//     if (!name || !batchNo || !medicineName || !manufactureDate || !expiryDate || !formulation || !quantity || !manufacturer || !pharmacyCompanyId) {
//       return res.status(400).json({
//         success: false,
//         message: "All required fields must be provided"
//       });
//     }

//     // Validate ObjectId
//     if (!mongoose.Types.ObjectId.isValid(pharmacyCompanyId)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid pharmacy company ID"
//       });
//     }

//     // ⚡ PARALLEL VALIDATION
//     console.log("🔍 Starting parallel validation...");
    
//     const [pharmacyCompany, existingMedicine, existingBatch] = await Promise.allSettled([
//       // Verify pharmacy company exists
//       PharmacyCompany.findById(pharmacyCompanyId),
      
//       // Check if batch already exists in pharmacy medicine
//       PharmacyMedicine.findOne({ batchNo: batchNo.trim() }),
      
//       // Check if batch exists in manufacturer batches
//       Batch.findOne({ batchNo: batchNo.trim() })
//     ]);

//     // Process validation results
//     const pharmacyCompanyValue = pharmacyCompany.status === 'fulfilled' ? pharmacyCompany.value : null;
//     if (!pharmacyCompanyValue) {
//       return res.status(404).json({
//         success: false,
//         message: "Pharmacy company not found"
//       });
//     }

//     const existingMedicineValue = existingMedicine.status === 'fulfilled' ? existingMedicine.value : null;
//     const existingBatchValue = existingBatch.status === 'fulfilled' ? existingBatch.value : null;
    
//     if (existingMedicineValue) {
//       return res.status(400).json({
//         success: false,
//         message: "Medicine with this batch number already exists in pharmacy"
//       });
//     }

//     // Prepare data for parallel storage
//     const pharmacyMedicineData = {
//       name: name.trim(),
//       batchNo: batchNo.trim(),
//       medicineName: (medicineName || name).trim(),
//       manufactureDate: new Date(manufactureDate),
//       expiryDate: new Date(expiryDate),
//       formulation: formulation.trim(),
//       quantity: parseInt(quantity),
//       manufacturer: manufacturer.trim(),
//       pharmacyCompany: pharmacyCompanyId,
//       pharmacyName: pharmacyCompanyValue.name,
//       status: status,
//       blockchainVerified: false
//     };

//     const batchData = {
//       batchNo: batchNo.trim(),
//       name: name.trim(),
//       medicineName: (medicineName || name).trim(),
//       manufactureDate: new Date(manufactureDate),
//       expiry: new Date(expiryDate),
//       formulation: formulation.trim(),
//       manufacturer: manufacturer.trim(),
//       pharmacy: pharmacyCompanyValue.name,
//       quantity: parseInt(quantity),
//       status: 'active',
//       blockchainVerified: false
//     };

//     const blockchainData = {
//       batchNo: batchNo.trim(),
//       name: name.trim(),
//       medicineName: (medicineName || name).trim(),
//       manufactureDate: new Date(manufactureDate).toISOString().split('T')[0],
//       expiryDate: new Date(expiryDate).toISOString().split('T')[0],
//       formulation: formulation.trim(),
//       quantity: parseInt(quantity),
//       manufacturer: manufacturer.trim(),
//       pharmacy: pharmacyCompanyValue.name,
//       packaging: {},
//       status: 'At Pharmacy'
//     };

//     console.log('✅ Data prepared for parallel storage');

//     // ⚡⚡⚡ PARALLEL STORAGE IMPLEMENTATION ⚡⚡⚡
//     let pharmacyMedicineResult = null;
//     let batchResult = null;
//     let blockchainResult = null;
    
//     let pharmacyMedicineSuccess = false;
//     let batchSuccess = false;
//     let blockchainSuccess = false;
    
//     let errors = {};

//     // PARALLEL EXECUTION: Store in all systems simultaneously
//     const storagePromises = await Promise.allSettled([
//       // 1. Save to PharmacyMedicine collection
//       (async () => {
//         try {
//           const pharmacyMedicine = new PharmacyMedicine(pharmacyMedicineData);
//           pharmacyMedicineResult = await pharmacyMedicine.save();
//           pharmacyMedicineSuccess = true;
//           console.log(`✅ PharmacyMedicine storage successful: ${batchNo}`);
//           return { system: 'pharmacy_medicine', success: true, data: pharmacyMedicineResult };
//         } catch (error) {
//           console.error(`❌ PharmacyMedicine storage failed for ${batchNo}:`, error.message);
//           errors.pharmacyMedicine = error.message;
//           return { system: 'pharmacy_medicine', success: false, error: error.message };
//         }
//       })(),

//       // 2. Save to Batch collection
//       (async () => {
//         try {
//           const batch = new Batch(batchData);
//           batchResult = await batch.save();
//           batchSuccess = true;
//           console.log(`✅ Batch collection storage successful: ${batchNo}`);
//           return { system: 'batch', success: true, data: batchResult };
//         } catch (error) {
//           console.error(`❌ Batch collection storage failed for ${batchNo}:`, error.message);
//           errors.batch = error.message;
//           return { system: 'batch', success: false, error: error.message };
//         }
//       })(),

//       // 3. Register on blockchain (optional)
//       (async () => {
//         try {
//           blockchainResult = await BlockchainService.registerCompleteMedicine(blockchainData);
//           blockchainSuccess = true;
//           console.log(`✅ Blockchain storage successful: ${batchNo}`);
//           return { system: 'blockchain', success: true, data: blockchainResult };
//         } catch (error) {
//           console.warn(`⚠️ Blockchain storage failed for ${batchNo}:`, error.message);
//           errors.blockchain = error.message;
//           return { system: 'blockchain', success: false, error: error.message };
//         }
//       })()
//     ]);

//     // ⚡ Analyze results from parallel storage
//     console.log("📊 Parallel storage results:", {
//       pharmacyMedicineSuccess,
//       batchSuccess,
//       blockchainSuccess,
//       errors
//     });

//     // 📊 Determine operation success based on results
//     let overallSuccess = false;
//     let message = "";
//     let warning = null;
//     let needsSync = false;

//     if (pharmacyMedicineSuccess && batchSuccess && blockchainSuccess) {
//       // 🎉 PERFECT: All three succeeded
//       overallSuccess = true;
//       message = "Medicine added successfully to all systems";
      
//       // Update records with blockchain info
//       pharmacyMedicineResult.blockchainVerified = true;
//       pharmacyMedicineResult.blockchainTransactionHash = blockchainResult.transactionHash;
//       await pharmacyMedicineResult.save();
      
//       batchResult.blockchainVerified = true;
//       batchResult.blockchainTransactionHash = blockchainResult.transactionHash;
//       await batchResult.save();
      
//     } else if (pharmacyMedicineSuccess && batchSuccess && !blockchainSuccess) {
//       // ⚠️ MongoDB succeeded, blockchain failed
//       overallSuccess = true; // OPERATION STILL SUCCESSFUL
//       message = "Medicine added to database (Blockchain registration failed)";
//       warning = "Blockchain registration failed. Data is stored locally only.";
      
//       // Mark as not verified
//       pharmacyMedicineResult.blockchainVerified = false;
//       pharmacyMedicineResult.blockchainError = errors.blockchain;
//       await pharmacyMedicineResult.save();
      
//       batchResult.blockchainVerified = false;
//       batchResult.blockchainError = errors.blockchain;
//       await batchResult.save();
      
//       // Queue for later blockchain sync
//       needsSync = true;
//       await queueForBlockchainSync(pharmacyMedicineData, errors.blockchain);
      
//     } else if ((pharmacyMedicineSuccess || batchSuccess) && !blockchainSuccess) {
//       // ⚠️ At least one MongoDB succeeded, blockchain failed
//       overallSuccess = true; // OPERATION STILL SUCCESSFUL
//       message = "Medicine added partially (Blockchain registration failed)";
//       warning = "Blockchain registration failed. Some data may be incomplete.";
      
//       // Queue for sync
//       needsSync = true;
//       await queueForBlockchainSync(pharmacyMedicineData, errors.blockchain);
      
//     } else if (!pharmacyMedicineSuccess && !batchSuccess && blockchainSuccess) {
//       // ⚠️ Blockchain succeeded, MongoDB failed
//       overallSuccess = true; // OPERATION STILL SUCCESSFUL (data is immutable)
//       message = "Medicine registered on Blockchain (Database storage failed)";
//       warning = "Database storage failed. Data is on blockchain but may not appear in lists.";
      
//       // Store in temporary collection for MongoDB recovery
//       await storeInTemporaryBatch(pharmacyMedicineData, blockchainResult);
      
//     } else if (pharmacyMedicineSuccess || batchSuccess || blockchainSuccess) {
//       // ⚠️ At least one succeeded
//       overallSuccess = true;
//       message = "Medicine added partially";
//       warning = "Some storage systems failed. Data may be incomplete.";
      
//       // Queue for sync
//       needsSync = true;
      
//     } else {
//       // ❌ All failed
//       overallSuccess = false;
//       message = "Medicine addition failed in all storage systems";
//     }

//     // 🔄 If one succeeded, sync to the other later
//     if ((pharmacyMedicineSuccess || batchSuccess || blockchainSuccess) && needsSync) {
//       // Start background sync process (non-blocking)
//       setTimeout(async () => {
//         try {
//           await attemptStorageSync(pharmacyMedicineData, pharmacyMedicineSuccess || batchSuccess, blockchainSuccess);
//         } catch (syncError) {
//           console.error("Background sync failed:", syncError);
//         }
//       }, 0); // Non-blocking
//     }

//     // 📤 Prepare response
//     const response = {
//       success: overallSuccess,
//       message,
//       storage: {
//         pharmacyMedicine: pharmacyMedicineSuccess,
//         batch: batchSuccess,
//         blockchain: blockchainSuccess,
//         status: pharmacyMedicineSuccess && batchSuccess && blockchainSuccess ? "fully_synced" : 
//                 (pharmacyMedicineSuccess || batchSuccess) && blockchainSuccess ? "partial_synced" :
//                 (pharmacyMedicineSuccess || batchSuccess) ? "mongodb_only" :
//                 blockchainSuccess ? "blockchain_only" : "failed"
//       },
//       data: pharmacyMedicineResult || pharmacyMedicineData, // Return PharmacyMedicine data if available
//       warnings: warning ? [warning] : []
//     };

//     // Add blockchain transaction info if available
//     if (blockchainResult) {
//       response.blockchain = {
//         transactionHash: blockchainResult.transactionHash,
//         blockNumber: blockchainResult.blockNumber
//       };
//     }

//     // Add errors if any (for debugging)
//     if (Object.keys(errors).length > 0) {
//       response.errors = errors;
//     }

//     console.log(`📤 Final response for ${batchNo}:`, {
//       success: overallSuccess,
//       storageStatus: response.storage.status
//     });

//     // Return appropriate status code
//     const statusCode = overallSuccess ? 201 : 500;
//     res.status(statusCode).json(response);

//   } catch (error) {
//     console.error("❌ Error in parallel medicine addition:", error.message);
    
//     // Handle duplicate key errors
//     if (error.code === 11000) {
//       return res.status(400).json({
//         success: false,
//         message: "Medicine with this batch number already exists",
//         duplicate: true
//       });
//     }
    
//     // Handle validation errors
//     if (error.name === 'ValidationError') {
//       const errors = Object.values(error.errors).map(err => err.message);
//       return res.status(400).json({
//         success: false,
//         message: "Validation error",
//         errors: errors
//       });
//     }
    
//     res.status(500).json({
//       success: false,
//       message: "Error adding medicine",
//       error: error.message
//     });
//   }
// };

/* --------------------------------------------
   📋 Accept Manufacturer Batch - STRICT DUAL
-------------------------------------------- */
export const acceptManufacturerBatchWithVerification = async (req, res) => {
  try {
    const { batchNo, pharmacyCompanyId, acceptedQuantity } = req.body;
    const user = req.user;

    console.log(`🏥 Pharmacy accepting batch ${batchNo} with STRICT DUAL STORAGE...`);

    // 1. Find pharmacy company
    const pharmacyCompany = await PharmacyCompany.findById(pharmacyCompanyId);
    if (!pharmacyCompany) {
      return res.status(404).json({
        success: false,
        message: "Pharmacy company not found"
      });
    }

    let pharmacyBlockchainAddress;
    try {
      const BlockchainService = (await import('../services/blockchainService.js')).default;
      pharmacyBlockchainAddress = await BlockchainService.getPharmacyBlockchainAddress(pharmacyCompanyId);
      console.log(`🏥 Pharmacy blockchain address: ${pharmacyBlockchainAddress}`);
    } catch (addressError) {
      console.warn('⚠️ Could not get pharmacy blockchain address:', addressError.message);
      // Fallback to default account
      const BlockchainService = (await import('../services/blockchainService.js')).default;
      pharmacyBlockchainAddress = await BlockchainService.getDefaultAccount();
    }

    // 2. Find manufacturer batch
    const originalBatch = await Batch.findOne({ batchNo });
    if (!originalBatch) {
      return res.status(404).json({
        success: false,
        message: "Manufacturer batch not found"
      });
    }

    // 3. Check for duplicates
    const existingPharmacyMedicine = await PharmacyMedicine.findOne({
      batchNo: batchNo,
      pharmacyCompany: pharmacyCompanyId
    });
    
    if (existingPharmacyMedicine) {
      return res.status(400).json({
        success: false,
        message: "Batch already accepted by this pharmacy"
      });
    }

    // 4. Prepare data for BOTH storage systems
    const pharmacyMedicineData = {
      name: originalBatch.name,
      batchNo: originalBatch.batchNo,
      medicineName: originalBatch.medicineName || originalBatch.name,
      manufactureDate: originalBatch.manufactureDate,
      expiryDate: originalBatch.expiry,
      formulation: originalBatch.formulation,
      quantity: parseInt(acceptedQuantity || originalBatch.quantity),
      manufacturer: originalBatch.manufacturer,
      pharmacyCompany: pharmacyCompanyId,
      pharmacyName: pharmacyCompany.name,
      status: 'At Pharmacy',
      acceptedFromManufacturer: true,
      acceptanceDate: new Date()
    };

    const blockchainData = {
      batchNo: originalBatch.batchNo,
      name: originalBatch.name,
      medicineName: originalBatch.medicineName || originalBatch.name,
      manufactureDate: originalBatch.manufactureDate.toISOString().split('T')[0],
      expiryDate: originalBatch.expiry.toISOString().split('T')[0],
      formulation: originalBatch.formulation,
      quantity: parseInt(acceptedQuantity || originalBatch.quantity),
      manufacturer: originalBatch.manufacturer,
      pharmacy: pharmacyCompany.name,
      packaging: JSON.stringify(originalBatch.packaging || {}),
      status: 'At Pharmacy'
    };

    console.log('✅ Data prepared for DUAL storage');

    // ============ STRICT DUAL STORAGE ============
    
    let pharmacyMedicineResult = null;
    let blockchainResult = null;
    
    try {
      // Step 1: Store in MongoDB
      console.log('📝 Step 1: Storing in MongoDB...');
      
      pharmacyMedicineResult = new PharmacyMedicine({
        ...pharmacyMedicineData,
        blockchainVerified: false,
        dualStorageStatus: 'pending'
      });
      
      await pharmacyMedicineResult.save();
      console.log('✅ MongoDB storage successful');
      
    } catch (mongoError) {
      console.error('❌ MongoDB storage failed:', mongoError.message);
      
      if (mongoError.code === 11000) {
        return res.status(400).json({
          success: false,
          message: "Batch already exists in pharmacy",
          duplicate: true
        });
      }
      
      return res.status(500).json({
        success: false,
        message: "MongoDB storage failed",
        error: mongoError.message
      });
    }
    
    // Step 2: Store/Update on Blockchain

    if (pharmacyMedicineResult) {
  try {
    console.log('🔗 Step 2: Updating on Blockchain...');
    
    // Check if batch already exists on blockchain
    const existsOnBlockchain = await BlockchainService.verifyMedicineExistence(batchNo);
    
    if (existsOnBlockchain) {
      // ✅ RESTORING ORIGINAL 2-STEP PROCESS:
      // 1. First, record the TRANSFER from manufacturer to pharmacy
      
      // Get pharmacy company to get its blockchain address
      const pharmacyCompany = await PharmacyCompany.findById(pharmacyCompanyId);
      
      // Prepare transfer metadata
      const transferMetadata = {
        transferType: 'manufacturer_to_pharmacy',
        manufacturer: originalBatch.manufacturer,
        pharmacy: pharmacyCompany.name,
        acceptedQuantity: parseInt(acceptedQuantity || originalBatch.quantity),
        transferredAt: new Date().toISOString(),
        blockchainNetwork: 'Sepolia Testnet',
        action: 'Pharmacy Acceptance'
      };
      
      console.log('📦 Recording transfer on blockchain...');
      
      // Call transferMedicine function
      const transferResult = await BlockchainService.transferMedicine(
        batchNo,
        pharmacyCompany.blockchainAddress || await BlockchainService.getDefaultAccount(),
        "Pharmacy Acceptance",
        JSON.stringify(transferMetadata)
      );
      
      console.log(`✅ Transfer recorded: ${transferResult.transactionHash}`);
      
      // 2. Second, UPDATE the medicine status and details
      console.log('📝 Updating medicine status on blockchain...');
      
      blockchainResult = await BlockchainService.updateMedicineOnBlockchain(
        batchNo,
        "At Pharmacy",
        pharmacyCompany.name,
        parseInt(acceptedQuantity || originalBatch.quantity)
      );
      
      console.log(`✅ Status updated: ${blockchainResult.transactionHash}`);
      
      // Combine both results
      blockchainResult = {
        ...blockchainResult,
        transferTransactionHash: transferResult.transactionHash,
        combinedAction: true,
        actions: ['transferred', 'updated'],
        explorerUrls: {
          transfer: transferResult.explorerUrl,
          update: blockchainResult.explorerUrl
        }
      };
      
    } else {
      // Batch doesn't exist on blockchain yet, register it
      blockchainResult = await BlockchainService.registerCompleteMedicine(blockchainData);
      console.log('✅ Blockchain registration successful');
    }
    
    // Update MongoDB with blockchain verification
    pharmacyMedicineResult.blockchainVerified = true;
    pharmacyMedicineResult.blockchainTransactionHash = blockchainResult.transactionHash;
    pharmacyMedicineResult.blockchainBlockNumber = blockchainResult.blockNumber;
    pharmacyMedicineResult.blockchainTransferHash = blockchainResult.transferTransactionHash;
    pharmacyMedicineResult.dualStorageStatus = 'completed';
    await pharmacyMedicineResult.save();
    
    // Update original batch status
    originalBatch.status = 'accepted';
    originalBatch.pharmacy = pharmacyCompany.name;
    originalBatch.updatedAt = new Date();
    await originalBatch.save();
    
    // ============ SUCCESS: Both succeeded ============
    console.log(`🎉 DUAL STORAGE SUCCESSFUL for pharmacy acceptance: ${batchNo}`);
    
    const response = {
      success: true,
      message: "Batch accepted successfully in both MongoDB and Blockchain",
      storage: {
        mongodb: true,
        blockchain: true,
        status: "fully_synced",
        requirement: "dual_storage"
      },
      data: pharmacyMedicineResult,
      blockchain: {
        transferHash: blockchainResult.transferTransactionHash,
        updateHash: blockchainResult.transactionHash,
        updateBlockNumber: blockchainResult.blockNumber,
        explorerUrls: blockchainResult.explorerUrls
      }
    };
    
    return res.status(201).json(response);
    
  } catch (blockchainError) {
    console.error('❌ Blockchain update failed:', blockchainError.message);
    
    // 🔴 CRITICAL FIX: ROLLBACK MongoDB since blockchain failed
    console.log('🔄 Rolling back MongoDB entry due to blockchain failure...');
    try {
      await PharmacyMedicine.findByIdAndDelete(pharmacyMedicineResult._id);
      console.log('✅ MongoDB entry rolled back successfully');
    } catch (rollbackError) {
      console.error('❌ Failed to rollback MongoDB entry:', rollbackError.message);
    }
    
    // Return complete failure
    return res.status(500).json({
      success: false,
      message: `Batch acceptance failed: Both MongoDB and Blockchain storage must succeed. Blockchain error: ${blockchainError.message}`,
      storage: {
        mongodb: false,
        blockchain: false,
        status: "rolled_back",
        requirement: "dual_storage_failed"
      }
    });
  }
}


    // ONLY HAS UPDATE LOGIC FOR ACCEPTANCE @ BlockChain
    // if (pharmacyMedicineResult) {
    //   try {
    //     console.log('🔗 Step 2: Updating on Blockchain...');
        
    //     // Check if batch already exists on blockchain
    //     const existsOnBlockchain = await BlockchainService.verifyMedicineExistence(batchNo);
        
    //     if (existsOnBlockchain) {
    //       // Update existing blockchain record
    //       blockchainResult = await BlockchainService.updateMedicineOnBlockchain(
    //         batchNo,
    //         "At Pharmacy",
    //         pharmacyCompany.name,
    //         parseInt(acceptedQuantity || originalBatch.quantity)
    //       );
    //       console.log('✅ Blockchain update successful');
    //     } else {
    //       // Register new on blockchain
    //       blockchainResult = await BlockchainService.registerCompleteMedicine(blockchainData);
    //       console.log('✅ Blockchain registration successful');
    //     }
        
    //     // Update MongoDB with blockchain verification
    //     pharmacyMedicineResult.blockchainVerified = true;
    //     pharmacyMedicineResult.blockchainTransactionHash = blockchainResult.transactionHash;
    //     pharmacyMedicineResult.blockchainBlockNumber = blockchainResult.blockNumber;
    //     pharmacyMedicineResult.dualStorageStatus = 'completed';
    //     await pharmacyMedicineResult.save();
        
    //     // Update original batch status
    //     originalBatch.status = 'accepted';
    //     originalBatch.pharmacy = pharmacyCompany.name;
    //     originalBatch.updatedAt = new Date();
    //     await originalBatch.save();
        
    //     // ============ SUCCESS: Both succeeded ============
    //     console.log(`🎉 DUAL STORAGE SUCCESSFUL for pharmacy acceptance: ${batchNo}`);
        
    //     const response = {
    //       success: true,
    //       message: "Batch accepted successfully in both MongoDB and Blockchain",
    //       storage: {
    //         mongodb: true,
    //         blockchain: true,
    //         status: "fully_synced",
    //         requirement: "dual_storage"
    //       },
    //       data: pharmacyMedicineResult,
    //       blockchain: {
    //         transactionHash: blockchainResult.transactionHash,
    //         blockNumber: blockchainResult.blockNumber,
    //         explorerUrl: blockchainResult.explorerUrl || null
    //       }
    //     };
        
    //     return res.status(201).json(response);
        
    //   } catch (blockchainError) {
    //     console.error('❌ Blockchain update failed:', blockchainError.message);
        
    //     // 🔴 CRITICAL FIX: ROLLBACK MongoDB since blockchain failed
    //     console.log('🔄 Rolling back MongoDB entry due to blockchain failure...');
    //     try {
    //       await PharmacyMedicine.findByIdAndDelete(pharmacyMedicineResult._id);
    //       console.log('✅ MongoDB entry rolled back successfully');
    //     } catch (rollbackError) {
    //       console.error('❌ Failed to rollback MongoDB entry:', rollbackError.message);
    //     }
        
    //     // Return complete failure
    //     return res.status(500).json({
    //       success: false,
    //       message: `Batch acceptance failed: Both MongoDB and Blockchain storage must succeed. Blockchain error: ${blockchainError.message}`,
    //       storage: {
    //         mongodb: false,
    //         blockchain: false,
    //         status: "rolled_back",
    //         requirement: "dual_storage_failed"
    //       }
    //     });
    //   }
    // }
    
  } catch (error) {
    console.error("❌ Error in pharmacy batch acceptance:", error.message);
    
    return res.status(500).json({
      success: false,
      message: "Pharmacy batch acceptance failed",
      error: error.message,
      requires: "Both MongoDB and Blockchain storage must succeed"
    });
  }
};


// const batchProcessing = new Set(); // Track ongoing batch processing

// export const acceptManufacturerBatchWithVerification = async (req, res) => {
//   try {
//     const { batchNo, pharmacyCompanyId, acceptedQuantity } = req.body;
//     const user = req.user;

//     console.log(`🏥 Pharmacy accepting batch ${batchNo} from manufacturer...`);

//     // ⚡ DEBOUNCE CHECK: Prevent duplicate processing
//     if (batchProcessing.has(batchNo)) {
//       return res.status(400).json({
//         success: false,
//         message: `Batch ${batchNo} is already being processed. Please wait.`
//       });
//     }
    
//     // Add to processing set
//     batchProcessing.add(batchNo);

//     // 1. Find pharmacy company
//     const pharmacyCompany = await PharmacyCompany.findById(pharmacyCompanyId);
//     if (!pharmacyCompany) {
//       batchProcessing.delete(batchNo);
//       return res.status(404).json({
//         success: false,
//         message: "Pharmacy company not found"
//       });
//     }

//     // 🔥 Check if pharmacy has blockchain address
//     if (!pharmacyCompany.blockchainAddress || pharmacyCompany.blockchainAddress === "") {
//       batchProcessing.delete(batchNo);
//       return res.status(400).json({
//         success: false,
//         message: "Pharmacy company does not have a blockchain address configured.",
//         requiresBlockchainAddress: true,
//         pharmacyCompanyId: pharmacyCompanyId
//       });
//     }

//     // 2. Find the original manufacturer batch
//     const originalBatch = await Batch.findOne({ batchNo });
//     if (!originalBatch) {
//       batchProcessing.delete(batchNo);
//       return res.status(404).json({
//         success: false,
//         message: "Manufacturer batch not found"
//       });
//     }

//     // ⚡ DUPLICATE CHECK: Check if already accepted by THIS pharmacy
//     const existingPharmacyMedicine = await PharmacyMedicine.findOne({
//       batchNo: batchNo,
//       pharmacyCompany: pharmacyCompanyId
//     });
    
//     if (existingPharmacyMedicine) {
//       batchProcessing.delete(batchNo);
//       // Update quantity if already exists
//       existingPharmacyMedicine.quantity += parseInt(acceptedQuantity || originalBatch.quantity);
//       existingPharmacyMedicine.updatedAt = new Date();
//       await existingPharmacyMedicine.save();
      
//       return res.json({
//         success: true,
//         message: "Batch quantity updated",
//         data: existingPharmacyMedicine,
//         action: "quantity_updated"
//       });
//     }

//     // 3. Find manufacturer company to get blockchain address
//     let manufacturerAddress = "0x0000000000000000000000000000000000000000";
//     try {
//       const ManufacturerCompany = (await import("../models/ManufacturerCompany.js")).default;
//       const manufacturerCompany = await ManufacturerCompany.findOne({ 
//         companyName: originalBatch.manufacturer 
//       });
      
//       if (manufacturerCompany && manufacturerCompany.blockchainAddress) {
//         manufacturerAddress = manufacturerCompany.blockchainAddress;
//         console.log(`🏭 Found manufacturer blockchain address: ${manufacturerAddress}`);
//       } else {
//         console.log(`⚠️ Manufacturer ${originalBatch.manufacturer} has no blockchain address, using default`);
//       }
//     } catch (error) {
//       console.log(`⚠️ Could not find manufacturer company: ${error.message}`);
//     }

//     // 4. VERIFY ON BLOCKCHAIN BEFORE ACCEPTING
//     console.log(`🔍 Step 1: Verifying batch ${batchNo} on blockchain...`);
//     let blockchainVerification = null;
//     let blockchainVerificationError = null;
    
//     try {
//       // First verify the batch exists on blockchain
//       const existsOnBlockchain = await BlockchainService.verifyMedicineExistence(batchNo);
      
//       if (!existsOnBlockchain) {
//         batchProcessing.delete(batchNo);
//         return res.status(400).json({
//           success: false,
//           message: "Batch not found on blockchain. Cannot accept unverified medicine."
//         });
//       }
      
//       // Get medicine data from blockchain
//       blockchainVerification = await BlockchainService.getMedicineFromBlockchain(batchNo);
      
//       if (!blockchainVerification.exists) {
//         batchProcessing.delete(batchNo);
//         return res.status(400).json({
//           success: false,
//           message: "Could not verify batch authenticity on blockchain"
//         });
//       }
      
//       console.log(`✅ Batch ${batchNo} verified on blockchain`);
      
//       // Log the original medicine data from blockchain
//       console.log('📋 ORIGINAL MEDICINE DATA FROM BLOCKCHAIN:');
//       logMedicineData(blockchainVerification);
      
//       // Check expiry date
//       const expiryDate = new Date(blockchainVerification.expiryDate);
//       const today = new Date();
//       if (expiryDate < today) {
//         batchProcessing.delete(batchNo);
//         return res.status(400).json({
//           success: false,
//           message: "Cannot accept expired medicine batch"
//         });
//       }
      
//       // 🔥 Get current owner from blockchain
//       const ownerResult = await BlockchainService.getMedicineOwner(batchNo);
//       console.log(`👤 Current owner on blockchain: ${ownerResult.owner}`);
      
//     } catch (error) {
//       blockchainVerificationError = error.message;
//       console.error(`❌ Blockchain verification failed: ${blockchainVerificationError}`);
      
//       if (error.message.includes("Too Many Requests")) {
//         batchProcessing.delete(batchNo);
//         return res.status(429).json({
//           success: false,
//           message: "Blockchain network is busy. Please wait a moment and try again.",
//           retryAfter: 30
//         });
//       }
      
//       batchProcessing.delete(batchNo);
//       return res.status(400).json({
//         success: false,
//         message: "Blockchain verification failed. Cannot accept unverified medicine.",
//         error: blockchainVerificationError
//       });
//     }

//     // 5. CHECK IF ALREADY ACCEPTED BY ANY PHARMACY (in database)
//     if (originalBatch.status === 'accepted' || originalBatch.status === 'at_pharmacy') {
//       batchProcessing.delete(batchNo);
//       return res.status(400).json({
//         success: false,
//         message: "Batch already accepted by another pharmacy",
//         currentStatus: originalBatch.status
//       });
//     }

//     // 6. 🔥 CRITICAL: TRANSFER OWNERSHIP AND UPDATE MEDICINE ON BLOCKCHAIN
//     console.log(`🔗 Step 2: Transferring ownership AND updating medicine on blockchain...`);
//     let blockchainTransferResult = null;
//     let blockchainUpdateResult = null;
//     let blockchainTransferError = null;
//     let ownershipTransferred = false;
//     let medicineUpdated = false;

//     try {
//       console.log(`📤 Transferring batch ${batchNo} from ${manufacturerAddress} to ${pharmacyCompany.blockchainAddress}`);
      
//       // Prepare metadata for transfer
//       const transferMetadata = {
//         transferType: "manufacturer_to_pharmacy",
//         manufacturer: originalBatch.manufacturer,
//         pharmacy: pharmacyCompany.name,
//         pharmacyCompanyId: pharmacyCompanyId,
//         acceptedQuantity: parseInt(acceptedQuantity || originalBatch.quantity),
//         transferredBy: user.username || user.name,
//         transferredAt: new Date().toISOString(),
//         previousOwner: manufacturerAddress,
//         newOwner: pharmacyCompany.blockchainAddress,
//         action: "ownership_transfer_and_update"
//       };
      
//       // 🔥 STEP A: TRANSFER OWNERSHIP (creates event log)
//       blockchainTransferResult = await BlockchainService.transferMedicine(
//         batchNo,
//         pharmacyCompany.blockchainAddress,
//         "Pharmacy Acceptance",
//         JSON.stringify(transferMetadata)
//       );
      
//       ownershipTransferred = true;
//       console.log(`✅ Ownership transferred successfully!`);
//       console.log(`   Transaction Hash: ${blockchainTransferResult.transactionHash}`);
      
//       // 🔥 STEP B: UPDATE ACTUAL MEDICINE DATA ON BLOCKCHAIN
//       console.log(`🔄 Step 3: Updating actual medicine data on blockchain...`);
//       console.log('📝 Updating medicine with:', {
//         batchNo: batchNo,
//         newStatus: "At Pharmacy",
//         newPharmacy: pharmacyCompany.name,
//         newQuantity: parseInt(acceptedQuantity || originalBatch.quantity)
//       });
      
//       try {
//         // This updates the actual medicine record on blockchain
//         blockchainUpdateResult = await BlockchainService.updateMedicineOnBlockchain(
//           batchNo,
//           "At Pharmacy",  // New status - updates the medicine record
//           pharmacyCompany.name,  // New pharmacy - updates the medicine record
//           parseInt(acceptedQuantity || originalBatch.quantity)  // Quantity - updates the medicine record
//         );
        
//         medicineUpdated = true;
//         console.log(`✅ Medicine data updated on blockchain!`);
//         console.log(`   Update Transaction Hash: ${blockchainUpdateResult.transactionHash}`);
        
//       } catch (updateError) {
//         console.error(`❌ Medicine update failed: ${updateError.message}`);
//         console.log('⚠️ Ownership was transferred but medicine details not updated');
//         // Continue anyway - at least ownership is transferred
//       }
      
//     } catch (transferError) {
//       blockchainTransferError = transferError.message;
//       console.error(`⚠️ Blockchain transfer failed: ${blockchainTransferError}`);
      
//       if (transferError.message.includes("Too Many Requests")) {
//         console.log('🔄 Rate limited, trying verification as fallback...');
        
//         try {
//           blockchainTransferResult = await BlockchainService.verifyMedicine(batchNo);
//           console.log(`✅ Fallback verification successful: ${blockchainTransferResult.transactionHash}`);
//         } catch (verifyError) {
//           console.error(`❌ Both transfer and verification failed: ${verifyError.message}`);
//         }
//       }
//     }

//     // 7. 🔍 GET AND VERIFY UPDATED MEDICINE DATA FROM BLOCKCHAIN
//     console.log(`🔍 Step 4: Fetching updated medicine data from blockchain...`);
//     let updatedBlockchainData = null;
//     try {
//       // Wait a moment to ensure blockchain state is updated
//       await new Promise(resolve => setTimeout(resolve, 3000));
      
//       updatedBlockchainData = await BlockchainService.getCompleteMedicineFromBlockchain(batchNo);
      
//       if (updatedBlockchainData.exists) {
//         console.log('✅ UPDATED MEDICINE DATA FROM BLOCKCHAIN:');
//         console.log('============================================');
//         console.log(`batchNo: ${updatedBlockchainData.batchNo}`);
//         console.log(`name: ${updatedBlockchainData.name}`);
//         console.log(`medicineName: ${updatedBlockchainData.medicineName}`);
//         console.log(`manufactureDate: ${updatedBlockchainData.manufactureDate}`);
//         console.log(`expiryDate: ${updatedBlockchainData.expiryDate}`);
//         console.log(`formulation: ${updatedBlockchainData.formulation}`);
//         console.log(`quantity: ${updatedBlockchainData.quantity}`);
//         console.log(`manufacturer: ${updatedBlockchainData.manufacturer}`);
//         console.log(`pharmacy: ${updatedBlockchainData.pharmacy}`); // Should now be "Testing Phase 1"
//         console.log(`packaging: ${JSON.stringify(updatedBlockchainData.packaging)}`);
//         console.log(`status: ${updatedBlockchainData.status}`); // Should now be "At Pharmacy"
//         console.log(`currentOwner: ${updatedBlockchainData.currentOwner}`);
//         console.log(`verified: ${updatedBlockchainData.verified}`);
//         console.log(`timestamp: ${updatedBlockchainData.timestamp}`);
//         console.log(`verifiedBy: ${updatedBlockchainData.verifiedBy}`);
//         console.log(`verifiedAt: ${updatedBlockchainData.verifiedAt}`);
//         console.log('============================================');
        
//         // Verify the updates worked correctly
//         const updateVerification = {
//           pharmacyUpdated: updatedBlockchainData.pharmacy === pharmacyCompany.name,
//           statusUpdated: updatedBlockchainData.status === "At Pharmacy",
//           quantityUpdated: updatedBlockchainData.quantity === parseInt(acceptedQuantity || originalBatch.quantity),
//           ownerUpdated: updatedBlockchainData.currentOwner.toLowerCase() === pharmacyCompany.blockchainAddress.toLowerCase()
//         };
        
//         console.log('📊 UPDATE VERIFICATION:', updateVerification);
        
//         if (!updateVerification.pharmacyUpdated) {
//           console.warn(`⚠️ Pharmacy not updated correctly. Expected: ${pharmacyCompany.name}, Got: ${updatedBlockchainData.pharmacy}`);
//         }
        
//         if (!updateVerification.statusUpdated) {
//           console.warn(`⚠️ Status not updated correctly. Expected: At Pharmacy, Got: ${updatedBlockchainData.status}`);
//         }
        
//       } else {
//         console.warn('⚠️ Could not fetch updated medicine data from blockchain - medicine does not exist');
//       }
//     } catch (fetchError) {
//       console.error('❌ Error fetching updated medicine data:', fetchError.message);
//       updatedBlockchainData = {
//         error: fetchError.message,
//         exists: false
//       };
//     }

//     // 8. CREATE PHARMACY MEDICINE RECORD
//     const pharmacyMedicine = new PharmacyMedicine({
//       name: originalBatch.name,
//       batchNo: originalBatch.batchNo,
//       medicineName: originalBatch.medicineName || originalBatch.name,
//       manufactureDate: originalBatch.manufactureDate,
//       expiryDate: originalBatch.expiry,
//       formulation: originalBatch.formulation,
//       quantity: parseInt(acceptedQuantity || originalBatch.quantity),
//       manufacturer: originalBatch.manufacturer,
//       pharmacyCompany: pharmacyCompanyId,
//       pharmacyName: pharmacyCompany.name,
//       status: 'At Pharmacy',
//       acceptedFromManufacturer: true,
//       acceptanceDate: new Date(),
//       blockchainVerified: !!blockchainTransferResult,
//       blockchainTransactionHash: blockchainTransferResult?.transactionHash,
//       blockchainBlockNumber: blockchainTransferResult?.blockNumber,
//       blockchainUpdateTransactionHash: blockchainUpdateResult?.transactionHash,
//       // Track both operations
//       ownershipTransferred: ownershipTransferred,
//       medicineDetailsUpdated: medicineUpdated,
//       previousOwner: manufacturerAddress,
//       currentOwner: pharmacyCompany.blockchainAddress,
//       blockchainTransferError: blockchainTransferError,
//       originalBatchId: originalBatch._id,
//       verificationData: {
//         verifiedAt: new Date(),
//         verifiedBy: user.username || 'Pharmacy System',
//         blockchainConfirmed: !!blockchainTransferResult,
//         manufacturer: originalBatch.manufacturer,
//         manufactureDate: originalBatch.manufactureDate,
//         expiryDate: originalBatch.expiry,
//         ownershipTransferred: ownershipTransferred,
//         medicineUpdated: medicineUpdated,
//         blockchainVerification: blockchainVerification ? {
//           exists: true,
//           manufacturer: blockchainVerification.manufacturer,
//           expiryDate: blockchainVerification.expiryDate,
//           verified: blockchainVerification.verified,
//           currentPharmacy: blockchainVerification.pharmacy,
//           currentStatus: blockchainVerification.status
//         } : null,
//         updateVerification: updatedBlockchainData?.exists ? {
//           pharmacyMatch: updatedBlockchainData.pharmacy === pharmacyCompany.name,
//           statusMatch: updatedBlockchainData.status === "At Pharmacy",
//           quantityMatch: updatedBlockchainData.quantity === parseInt(acceptedQuantity || originalBatch.quantity)
//         } : null
//       },
//       // Add the full blockchain data snapshot
//       blockchainDataSnapshot: updatedBlockchainData?.exists ? updatedBlockchainData : null
//     });

//     try {
//       await pharmacyMedicine.save();
//       console.log(`✅ Pharmacy medicine record created for ${batchNo}`);
//     } catch (saveError) {
//       if (saveError.code === 11000) {
//         console.log(`⚠️ Duplicate batch detected, fetching existing record`);
//         const existingRecord = await PharmacyMedicine.findOne({
//           batchNo: batchNo,
//           pharmacyCompany: pharmacyCompanyId
//         });
        
//         if (existingRecord) {
//           existingRecord.quantity += parseInt(acceptedQuantity || originalBatch.quantity);
//           existingRecord.updatedAt = new Date();
//           await existingRecord.save();
          
//           console.log(`✅ Updated existing record for ${batchNo}`);
//         }
//       } else {
//         throw saveError;
//       }
//     }

//     // 9. UPDATE ORIGINAL BATCH STATUS
//     originalBatch.status = 'accepted';
//     originalBatch.pharmacy = pharmacyCompany.name;
//     originalBatch.pharmacyCompanyId = pharmacyCompanyId;
//     originalBatch.acceptedDate = new Date();
//     originalBatch.acceptedBy = user.username;
//     originalBatch.updatedAt = new Date();
//     originalBatch.blockchainVerified = true;
//     originalBatch.ownershipTransferred = ownershipTransferred;
//     originalBatch.medicineDetailsUpdated = medicineUpdated;
    
//     if (blockchainTransferResult) {
//       originalBatch.blockchainTransactionHash = blockchainTransferResult.transactionHash;
//       originalBatch.blockchainBlockNumber = blockchainTransferResult.blockNumber;
//     }
    
//     if (blockchainUpdateResult) {
//       originalBatch.blockchainUpdateTransactionHash = blockchainUpdateResult.transactionHash;
//     }
    
//     await originalBatch.save();

//     console.log(`✅ Pharmacy ${pharmacyCompany.name} successfully accepted batch: ${batchNo}`);
    
//     // 10. PREPARE RESPONSE
//     const response = {
//       success: true,
//       message: ownershipTransferred ? 
//         "Batch verified, transferred, and updated successfully" : 
//         medicineUpdated ? "Batch verified and updated (transfer failed)" :
//         "Batch verified and accepted (blockchain operations failed)",
//       verification: {
//         blockchainVerified: true,
//         verifiedAt: new Date().toISOString(),
//         manufacturer: blockchainVerification?.manufacturer || originalBatch.manufacturer,
//         expiry: blockchainVerification?.expiryDate || originalBatch.expiry,
//         existsOnBlockchain: true,
//         ownershipTransferred: ownershipTransferred,
//         medicineUpdated: medicineUpdated
//       },
//       // THIS IS THE KEY PART: Show full medicine data similar to Register Medicine
//       medicineData: updatedBlockchainData?.exists ? {
//         batchNo: updatedBlockchainData.batchNo,
//         name: updatedBlockchainData.name,
//         medicineName: updatedBlockchainData.medicineName,
//         manufactureDate: updatedBlockchainData.manufactureDate,
//         expiryDate: updatedBlockchainData.expiryDate,
//         formulation: updatedBlockchainData.formulation,
//         quantity: updatedBlockchainData.quantity,
//         manufacturer: updatedBlockchainData.manufacturer,
//         pharmacy: updatedBlockchainData.pharmacy, // Updated pharmacy name
//         packaging: updatedBlockchainData.packaging ? JSON.stringify(updatedBlockchainData.packaging) : '{}',
//         status: updatedBlockchainData.status, // Updated status
//         currentOwner: updatedBlockchainData.currentOwner,
//         verified: updatedBlockchainData.verified,
//         timestamp: updatedBlockchainData.timestamp,
//         verifiedBy: updatedBlockchainData.verifiedBy,
//         verifiedAt: updatedBlockchainData.verifiedAt
//       } : null,
//       data: {
//         manufacturerBatch: {
//           id: originalBatch._id,
//           batchNo: originalBatch.batchNo,
//           status: 'accepted',
//           pharmacy: pharmacyCompany.name,
//           acceptedDate: originalBatch.acceptedDate,
//           blockchainVerified: originalBatch.blockchainVerified,
//           ownershipTransferred: originalBatch.ownershipTransferred,
//           medicineUpdated: originalBatch.medicineDetailsUpdated
//         },
//         pharmacyMedicine: {
//           id: pharmacyMedicine._id,
//           batchNo: pharmacyMedicine.batchNo,
//           name: pharmacyMedicine.name,
//           status: 'At Pharmacy',
//           pharmacy: pharmacyCompany.name,
//           acceptedDate: pharmacyMedicine.acceptanceDate,
//           quantity: pharmacyMedicine.quantity,
//           blockchainVerified: pharmacyMedicine.blockchainVerified,
//           blockchainTransactionHash: pharmacyMedicine.blockchainTransactionHash,
//           blockchainUpdateTransactionHash: pharmacyMedicine.blockchainUpdateTransactionHash,
//           ownershipTransferred: pharmacyMedicine.ownershipTransferred,
//           medicineUpdated: pharmacyMedicine.medicineDetailsUpdated,
//           currentOwner: pharmacyMedicine.currentOwner
//         }
//       }
//     };

//     // Add blockchain transaction details if available
//     if (blockchainTransferResult) {
//       response.blockchainTransfer = {
//         transactionSuccessful: true,
//         action: "ownership_transfer",
//         transactionHash: blockchainTransferResult.transactionHash,
//         blockNumber: blockchainTransferResult.blockNumber,
//         explorerUrl: `https://sepolia.etherscan.io/tx/${blockchainTransferResult.transactionHash}`,
//         from: manufacturerAddress,
//         to: pharmacyCompany.blockchainAddress,
//         // Show what was transferred
//         medicineTransferred: {
//           batchNo: batchNo,
//           name: originalBatch.name,
//           quantity: parseInt(acceptedQuantity || originalBatch.quantity)
//         }
//       };
//     }
    
//     if (blockchainUpdateResult) {
//       response.blockchainUpdate = {
//         transactionSuccessful: true,
//         action: "medicine_update",
//         transactionHash: blockchainUpdateResult.transactionHash,
//         blockNumber: blockchainUpdateResult.blockNumber,
//         explorerUrl: `https://sepolia.etherscan.io/tx/${blockchainUpdateResult.transactionHash}`,
//         updatedFields: {
//           status: "At Pharmacy",
//           pharmacy: pharmacyCompany.name,
//           quantity: parseInt(acceptedQuantity || originalBatch.quantity)
//         },
//         // Show the updated medicine data
//         resultingMedicineData: updatedBlockchainData?.exists ? {
//           pharmacy: updatedBlockchainData.pharmacy,
//           status: updatedBlockchainData.status,
//           quantity: updatedBlockchainData.quantity
//         } : null
//       };
//     }

//     if (!ownershipTransferred && blockchainTransferError) {
//       response.warning = "Batch accepted in database but ownership transfer failed";
//       response.blockchainError = blockchainTransferError;
//       response.recommendation = "Run manual ownership transfer later";
//     }
    
//     if (!medicineUpdated && ownershipTransferred) {
//       response.warning = "Ownership transferred but medicine details not updated";
//       response.recommendation = "Run manual update later or check again";
//     }

//     // Log success
//     console.log(`🎉 Pharmacy acceptance complete for ${batchNo}`);
//     console.log(`📊 Batch now owned by: ${pharmacyCompany.name} (${pharmacyCompany.blockchainAddress})`);
    
//     // Clean up processing set
//     batchProcessing.delete(batchNo);
    
//     res.json(response);

//   } catch (error) {
//     // Clean up processing set on any error
//     if (batchNo) batchProcessing.delete(batchNo);
    
//     console.error("❌ Error in batch acceptance process:", error);
    
//     if (error.code === 11000) {
//       return res.status(400).json({
//         success: false,
//         message: "This batch has already been accepted by your pharmacy.",
//         duplicate: true
//       });
//     }
    
//     if (error.message.includes("Too Many Requests")) {
//       return res.status(429).json({
//         success: false,
//         message: "Blockchain network is busy. Please wait 30 seconds and try again.",
//         retryAfter: 30
//       });
//     }
    
//     res.status(500).json({
//       success: false,
//       message: "Error during batch acceptance process",
//       error: error.message,
//       phase: "general_error"
//     });
//   }
//};

/* --------------------------------------------
   🔍 MANUAL VERIFICATION FOR EXISTING INVENTORY
-------------------------------------------- */
export const verifyBatchManually = async (req, res) => {
  try {
    const { batchNo } = req.params;
    const user = req.user;

    console.log(`🔍 Manual verification requested for batch: ${batchNo}`);

    const verificationResult = await BlockchainService.getMedicineFromBlockchain(batchNo);
    
    if (!verificationResult.exists) {
      return res.json({
        success: false,
        verified: false,
        message: "❌ Batch not found in blockchain system - may be counterfeit"
      });
    }

    // Check expiry
    const expiryDate = new Date(verificationResult.expiryDate);
    const today = new Date();
    const isExpired = expiryDate < today;

    res.json({
      success: true,
      verified: true,
      authentic: !isExpired,
      message: isExpired ? 
        "✅ Batch verified but EXPIRED - do not dispense" : 
        "✅ Batch verified and AUTHENTIC",
      data: {
        batchNo: verificationResult.batchNo,
        name: verificationResult.name,
        manufacturer: verificationResult.manufacturer,
        expiryDate: verificationResult.expiryDate,
        verifiedBy: user.username,
        verifiedAt: new Date()
      }
    });

  } catch (error) {
    console.error("❌ Manual verification error:", error);
    res.status(500).json({
      success: false,
      verified: false,
      message: "Verification failed due to system error"
    });
  }
};

/* --------------------------------------------
   📋 Get Medicines for a Pharmacy Company
-------------------------------------------- */
export const getPharmacyMedicines = async (req, res) => {
  try {
    const { pharmacyCompanyId } = req.params;

    let medicines;
    if (pharmacyCompanyId) {
      // Validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(pharmacyCompanyId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid pharmacy company ID"
        });
      }

      // Get medicines for specific pharmacy company
      medicines = await PharmacyMedicine.find({ pharmacyCompany: pharmacyCompanyId })
        .sort({ createdAt: -1 })
        .populate('pharmacyCompany', 'name licenseNumber contact');
    } else {
      // Get all medicines across all pharmacies
      medicines = await PharmacyMedicine.find()
        .sort({ createdAt: -1 })
        .populate('pharmacyCompany', 'name licenseNumber contact');
    }

    console.log(`✅ Fetched ${medicines.length} pharmacy medicines`);
    
    res.json({
      success: true,
      data: medicines
    });
  } catch (error) {
    console.error("❌ Error fetching pharmacy medicines:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching medicines",
      error: error.message
    });
  }
};

/* --------------------------------------------
   📋 Get All Medicines (All Pharmacies)
-------------------------------------------- */
export const getAllPharmacyMedicines = async (req, res) => {
  try {
    console.log("📋 Fetching all pharmacy medicines for verification...");
    
    const medicines = await PharmacyMedicine.find()
      .sort({ createdAt: -1 })
      .populate('pharmacyCompany', 'name licenseNumber contact manager')
      .select('name batchNo medicineName manufactureDate expiryDate formulation manufacturer quantity status blockchainVerified pharmacyCompany pharmacyName acceptedFromManufacturer');
    
    console.log(`✅ Fetched ${medicines.length} medicines from all pharmacies for verification`);
    
    // Return simplified data for public access
    const publicMedicines = medicines.map(medicine => ({
      _id: medicine._id,
      name: medicine.name,
      batchNo: medicine.batchNo,
      medicineName: medicine.medicineName,
      formulation: medicine.formulation,
      manufacturer: medicine.manufacturer,
      expiryDate: medicine.expiryDate,
      quantity: medicine.quantity,
      status: medicine.status,
      pharmacyName: medicine.pharmacyName,
      blockchainVerified: medicine.blockchainVerified,
      acceptedFromManufacturer: medicine.acceptedFromManufacturer
    }));
    
    res.json({
      success: true,
      data: publicMedicines
    });
  } catch (error) {
    console.error("❌ Error fetching all pharmacy medicines:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching medicines for verification",
      error: error.message
    });
  }
};

/* --------------------------------------------
   ✏️ Update Pharmacy Medicine Status
-------------------------------------------- */
export const updatePharmacyMedicine = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, blockchainVerified } = req.body;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid medicine ID"
      });
    }

    const updatedMedicine = await PharmacyMedicine.findByIdAndUpdate(
      id,
      { status, blockchainVerified },
      { new: true }
    ).populate('pharmacyCompany', 'name');

    if (!updatedMedicine) {
      return res.status(404).json({
        success: false,
        message: "Medicine not found"
      });
    }

    // Also update in Batch collection if exists
    await Batch.findOneAndUpdate(
      { batchNo: updatedMedicine.batchNo },
      { 
        status: status.toLowerCase(),
        blockchainVerified 
      }
    );

    res.json({
      success: true,
      message: "Medicine updated successfully",
      data: updatedMedicine
    });
  } catch (error) {
    console.error("❌ Error updating pharmacy medicine:", error);
    res.status(500).json({
      success: false,
      message: "Error updating medicine",
      error: error.message
    });
  }
};

/* --------------------------------------------
   🔍 Verify Pharmacy Medicine
-------------------------------------------- */
export const verifyPharmacyMedicine = async (req, res) => {
  try {
    const { batchNo } = req.params;

    const medicine = await PharmacyMedicine.findOne({ batchNo })
      .populate('pharmacyCompany', 'name licenseNumber contact');

    if (!medicine) {
      return res.status(404).json({
        success: false,
        exists: false,
        message: "Medicine not found in pharmacy database"
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const expiryDate = new Date(medicine.expiryDate);
    expiryDate.setHours(0, 0, 0, 0);
    
    const isExpired = expiryDate < today;

    // Prepare message
    let message = "";
    if (isExpired) {
      message = "❌ This medicine is EXPIRED. Do not use!";
    } else if (medicine.blockchainVerified) {
      message = "✅ Medicine VERIFIED on Blockchain - Safe to Use";
    } else {
      message = "⚠️ Medicine found but not blockchain verified";
    }

    res.json({
      success: true,
      exists: true,
      verified: true,
      authentic: !isExpired,
      message: message,
      batchNo: medicine.batchNo,
      name: medicine.name,
      medicineName: medicine.medicineName,
      formulation: medicine.formulation,
      expiry: medicine.expiryDate,
      expiryDate: medicine.expiryDate,
      manufacturer: medicine.manufacturer,
      pharmacy: medicine.pharmacyName,
      pharmacyCompany: medicine.pharmacyCompany,
      status: isExpired ? 'Expired' : medicine.status,
      source: 'pharmacy',
      blockchainVerified: medicine.blockchainVerified,
      isExpired: isExpired,
      expiryCheck: {
        expiryDate: expiryDate.toISOString().split('T')[0],
        today: today.toISOString().split('T')[0],
        daysRemaining: Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24))
      }
    });

  } catch (error) {
    console.error("❌ Error verifying pharmacy medicine:", error);
    res.status(500).json({
      success: false,
      message: "Error verifying medicine",
      error: error.message
    });
  }
};

/* --------------------------------------------
   🗑️ Delete Pharmacy Medicine
-------------------------------------------- */
export const deletePharmacyMedicine = async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`🗑️ Deleting pharmacy medicine with ID: ${id}`);

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid medicine ID"
      });
    }

    // Find and delete the medicine
    const deletedMedicine = await PharmacyMedicine.findByIdAndDelete(id);

    if (!deletedMedicine) {
      return res.status(404).json({
        success: false,
        message: "Medicine not found"
      });
    }

    // Also delete from Batch collection if it exists there
    try {
      await Batch.findOneAndDelete({ batchNo: deletedMedicine.batchNo });
      console.log(`✅ Also removed from Batch collection: ${deletedMedicine.batchNo}`);
    } catch (batchError) {
      console.log("ℹ️ No matching batch found to delete, or error deleting batch:", batchError.message);
    }

    console.log(`✅ Successfully deleted medicine: ${deletedMedicine.name} (${deletedMedicine.batchNo})`);

    res.json({
      success: true,
      message: "Medicine deleted successfully",
      data: {
        id: deletedMedicine._id,
        name: deletedMedicine.name,
        batchNo: deletedMedicine.batchNo
      }
    });

  } catch (error) {
    console.error("❌ Error deleting pharmacy medicine:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting medicine",
      error: error.message
    });
  }
};

/* --------------------------------------------
   🧹 Initialize Dummy Pharmacy Medicines
-------------------------------------------- */
export const initializePharmacyMedicines = async () => {
  try {
    const count = await PharmacyMedicine.countDocuments();
    if (count > 0) {
      console.log("ℹ️ Pharmacy medicines already exist, skipping initialization.");
      return;
    }

    // Get existing pharmacy companies
    const pharmacyCompanies = await PharmacyCompany.find({ isActive: true });
    if (pharmacyCompanies.length === 0) {
      console.log("⚠️ No pharmacy companies found for medicine initialization");
      return;
    }

    const dummyMedicines = [
      // Your dummy medicines array here
    ];

    // Distribute medicines among pharmacy companies
    const pharmacyMedicines = dummyMedicines.map((medicine, index) => ({
      ...medicine,
      pharmacyCompany: pharmacyCompanies[index % pharmacyCompanies.length]._id,
      pharmacyName: pharmacyCompanies[index % pharmacyCompanies.length].name
    }));

    await PharmacyMedicine.insertMany(pharmacyMedicines);
    
    // Also add to Batch collection
    const batchData = pharmacyMedicines.map(med => ({
      batchNo: med.batchNo,
      name: med.name,
      medicineName: med.medicineName,
      manufactureDate: med.manufactureDate,
      expiry: med.expiryDate,
      formulation: med.formulation,
      manufacturer: med.manufacturer,
      pharmacy: med.pharmacyName,
      quantity: med.quantity,
      status: 'active',
      blockchainVerified: med.blockchainVerified
    }));
    
    await Batch.insertMany(batchData);
    
    console.log("✅ Dummy pharmacy medicines initialized successfully.");
  } catch (error) {
    console.error("❌ Error initializing pharmacy medicines:", error.message);
  }
};