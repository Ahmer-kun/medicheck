import PharmacyMedicine from "../models/PharmacyMedicine.js";
import PharmacyCompany from "../models/PharmacyCompany.js"; 
import Batch from "../models/Batch.js";
import BlockchainService from '../services/blockchainService.js';

/* --------------------------------------------
   Add Medicine to Pharmacy (Store in Both Collections)
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
      status = 'Active',
      pharmacy = 'Pharmacy'
    } = req.body;

    console.log("Adding pharmacy medicine:", { name, batchNo, medicineName, manufactureDate, expiryDate, formulation, quantity, manufacturer });

    // Check if batch number already exists in either collection
    const [existingBatch, existingPharmacyMedicine] = await Promise.all([
      Batch.findOne({ batchNo }),
      PharmacyMedicine.findOne({ batchNo })
    ]);
    
    if (existingBatch || existingPharmacyMedicine) {
      return res.status(400).json({
        success: false,
        message: "Medicine with this batch number already exists"
      });
    }

    // Create in PharmacyMedicine collection
    const pharmacyMedicine = new PharmacyMedicine({
      name: name.trim(),
      batchNo: batchNo.trim(),
      medicineName: (medicineName || name).trim(),
      manufactureDate: new Date(manufactureDate),
      expiryDate: new Date(expiryDate),
      formulation: formulation.trim(),
      quantity: parseInt(quantity),
      manufacturer: manufacturer.trim(),
      status: status,
      pharmacy: pharmacy.trim(),
      blockchainVerified: false
    });

    // Also create in main Batch collection for consistency and verification
    const batch = new Batch({
      batchNo: batchNo.trim(),
      name: name.trim(),
      medicineName: (medicineName || name).trim(),
      manufactureDate: new Date(manufactureDate),
      expiry: new Date(expiryDate),
      formulation: formulation.trim(),
      manufacturer: manufacturer.trim(),
      pharmacy: pharmacy.trim(),
      quantity: parseInt(quantity),
      status: 'active',
      blockchainVerified: false
    });

    // Save both documents
    await Promise.all([pharmacyMedicine.save(), batch.save()]);

    console.log("Medicine added successfully to both collections:", batchNo);

    res.status(201).json({
      success: true,
      message: "Medicine added successfully",
      data: pharmacyMedicine
    });

  } catch (error) {
    console.error("Error adding pharmacy medicine:", error.message);
    res.status(500).json({
      success: false,
      message: "Error adding medicine",
      error: error.message
    });
  }
};

/* --------------------------------------------
   Get All Pharmacy Medicines
-------------------------------------------- */
export const getPharmacyMedicines = async (req, res) => {
  try {
    const medicines = await PharmacyMedicine.find().sort({ createdAt: -1 });
    
    console.log(`Fetched ${medicines.length} pharmacy medicines`);
    
    res.json({
      success: true,
      data: medicines
    });
  } catch (error) {
    console.error("Error fetching pharmacy medicines:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching medicines",
      error: error.message
    });
  }
};

/* --------------------------------------------
   Update Pharmacy Medicine Status
-------------------------------------------- */
export const updatePharmacyMedicine = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, blockchainVerified } = req.body;

    const updatedMedicine = await PharmacyMedicine.findByIdAndUpdate(
      id,
      { status, blockchainVerified },
      { new: true }
    );

    if (!updatedMedicine) {
      return res.status(404).json({
        success: false,
        message: "Medicine not found"
      });
    }

    // Update Batch collection if exists
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
    console.error("Error updating pharmacy medicine:", error);
    res.status(500).json({
      success: false,
      message: "Error updating medicine",
      error: error.message
    });
  }
};

/* --------------------------------------------
   Verify Pharmacy Medicine (Database Check)
-------------------------------------------- */
export const verifyPharmacyMedicine = async (req, res) => {
  try {
    const { batchNo } = req.params;

    const medicine = await PharmacyMedicine.findOne({ batchNo });

    if (!medicine) {
      return res.status(404).json({
        success: false,
        exists: false,
        message: "Medicine not found in pharmacy database"
      });
    }

    const today = new Date();
    const expiryDate = new Date(medicine.expiryDate);
    const isExpired = expiryDate < today;

    res.json({
      success: true,
      exists: true,
      verified: true,
      authentic: !isExpired,
      message: isExpired ? 
        "This batch is expired. Do not use this medicine." : 
        "This medicine is authentic and safe to use.",
      batchNo: medicine.batchNo,
      name: medicine.name,
      medicineName: medicine.medicineName,
      formulation: medicine.formulation,
      expiry: medicine.expiryDate,
      manufacturer: medicine.manufacturer,
      pharmacy: medicine.pharmacy,
      status: isExpired ? 'Expired' : medicine.status,
      source: 'pharmacy',
      blockchainVerified: medicine.blockchainVerified
    });

  } catch (error) {
    console.error("Error verifying pharmacy medicine:", error);
    res.status(500).json({
      success: false,
      message: "Error verifying medicine",
      error: error.message
    });
  }
};

/* --------------------------------------------
   ACCEPT & VERIFY MANUFACTURER BATCH (IMPROVED)
-------------------------------------------- */
export const acceptManufacturerBatch = async (req, res) => {
  try {
    const { batchNo, pharmacyCompanyId, acceptedQuantity } = req.body;
    const user = req.user;

    console.log(`Pharmacy accepting batch ${batchNo} from manufacturer...`);

    // STEP 1: Validate pharmacy company exists
    const pharmacyCompany = await PharmacyCompany.findById(pharmacyCompanyId);
    if (!pharmacyCompany) {
      return res.status(404).json({
        success: false,
        message: "Pharmacy company not found"
      });
    }

    // STEP 2: FIRST VERIFY THE BATCH IS AUTHENTIC
    console.log(`Verifying batch ${batchNo} authenticity before acceptance...`);
    
    let verificationResult = null;
    let verificationError = null;

    try {
      // Use the correct method name from your blockchain service
      verificationResult = await BlockchainService.getMedicineFromBlockchain(batchNo);
      
      if (!verificationResult || !verificationResult.exists) {
        return res.status(404).json({
          success: false,
          message: "Batch not found in blockchain system - cannot accept unverified medicine"
        });
      }

      // Check if batch is expired
      const expiryDate = new Date(verificationResult.expiryDate || verificationResult.expiry);
      const today = new Date();
      if (expiryDate < today) {
        return res.status(400).json({
          success: false,
          message: "Cannot accept expired medicine batch"
        });
      }

      console.log(`Batch verification successful: ${batchNo} is authentic`);

    } catch (error) {
      verificationError = error.message;
      console.warn("Blockchain verification failed:", verificationError);
      
      return res.status(400).json({
        success: false,
        message: "Could not verify batch authenticity - blockchain connection failed",
        error: verificationError
      });
    }

    // STEP 3: Find the original batch in database (additional check)
    const originalBatch = await Batch.findOne({ batchNo });
    if (!originalBatch) {
      return res.status(404).json({
        success: false,
        message: "Manufacturer batch not found in database"
      });
    }

    // STEP 4: Create pharmacy medicine record
    const pharmacyMedicine = new PharmacyMedicine({
      name: originalBatch.name,
      batchNo: originalBatch.batchNo,
      medicineName: originalBatch.medicineName || originalBatch.name,
      manufactureDate: originalBatch.manufactureDate,
      expiryDate: originalBatch.expiry,
      formulation: originalBatch.formulation,
      quantity: parseInt(acceptedQuantity || originalBatch.quantity),
      manufacturer: originalBatch.manufacturer,
      pharmacyCompany: pharmacyCompanyId,
      pharmacyName: pharmacyCompany.name, // Use company name, not user.pharmacyName
      status: 'In Stock',
      acceptedFromManufacturer: true,
      acceptanceDate: new Date(),
      blockchainVerified: true, // Now we know it's verified
      verificationData: {
        verifiedAt: new Date(),
        verifiedBy: user.username || 'Pharmacy System',
        blockchainConfirmed: true,
        manufacturer: verificationResult.manufacturer,
        manufactureDate: verificationResult.manufactureDate
      }
    });

    let blockchainTransferResult = null;
    let blockchainTransferError = null;

    // STEP 5: Transfer ownership on blockchain (optional but recommended)
    try {
      // Use user ID or company ID as address if no blockchain address
      const pharmacyIdentifier = user.blockchainAddress || pharmacyCompanyId.toString().slice(-20) || '0x0000000000000000000000000000000000000000';
      
      // Use correct method name - this might need adjustment based on your blockchain service
      blockchainTransferResult = await BlockchainService.transferMedicineOnBlockchain(
        batchNo,
        pharmacyIdentifier,
        "Pharmacy Acceptance"
      );

      // Update pharmacy medicine with transfer info
      pharmacyMedicine.blockchainTransactionHash = blockchainTransferResult.transactionHash;
      pharmacyMedicine.ownershipTransferred = true;
      pharmacyMedicine.transferredAt = new Date();

      console.log(`Batch ${batchNo} ownership transferred to pharmacy on blockchain`);

    } catch (error) {
      blockchainTransferError = error.message;
      console.warn("Blockchain transfer failed, but batch is verified:", blockchainTransferError);
      // Continue anyway since verification passed
    }

    await pharmacyMedicine.save();

    // STEP 6: Update original batch status
    originalBatch.status = 'accepted';
    originalBatch.pharmacy = pharmacyCompany.name;
    originalBatch.blockchainVerified = true; // Mark as verified
    await originalBatch.save();

    // STEP 7: Prepare response
    const response = {
      success: true,
      message: "Batch verified and accepted successfully",
      verification: {
        authentic: true,
        verifiedAt: new Date().toISOString(),
        manufacturer: verificationResult.manufacturer,
        expiry: verificationResult.expiryDate || verificationResult.expiry
      },
      data: pharmacyMedicine
    };

    if (blockchainTransferResult) {
      response.blockchainTransfer = {
        success: true,
        transactionHash: blockchainTransferResult.transactionHash
      };
    } else {
      response.warning = "Ownership transfer failed but batch is verified";
      response.blockchainError = blockchainTransferError;
    }

    console.log(`Pharmacy ${pharmacyCompany.name} successfully accepted verified batch: ${batchNo}`);
    
    res.json(response);

  } catch (error) {
    console.error("Error in batch acceptance process:", error);
    res.status(500).json({
      success: false,
      message: "Error during batch acceptance process",
      error: error.message
    });
  }
};

/* --------------------------------------------
   MANUAL VERIFICATION FOR EXISTING INVENTORY
-------------------------------------------- */
export const verifyBatchManually = async (req, res) => {
  try {
    const { batchNo } = req.params;
    const user = req.user;

    console.log(`Manual verification requested for batch: ${batchNo}`);

    const verificationResult = await BlockchainService.getMedicineFromBlockchain(batchNo);
    
    if (!verificationResult || !verificationResult.exists) {
      return res.json({
        success: false,
        verified: false,
        message: "Batch not found in blockchain system - may be counterfeit"
      });
    }

    // Check expiry
    const expiryDate = new Date(verificationResult.expiryDate || verificationResult.expiry);
    const today = new Date();
    const isExpired = expiryDate < today;

    res.json({
      success: true,
      verified: true,
      authentic: !isExpired,
      message: isExpired ? 
        "Batch verified but EXPIRED - do not dispense" : 
        "Batch verified and AUTHENTIC",
      data: {
        batchNo: verificationResult.batchNo,
        name: verificationResult.name,
        manufacturer: verificationResult.manufacturer,
        expiryDate: verificationResult.expiryDate || verificationResult.expiry,
        verifiedBy: user.username,
        verifiedAt: new Date(),
        blockchainData: verificationResult
      }
    });

  } catch (error) {
    console.error("Manual verification error:", error);
    res.status(500).json({
      success: false,
      verified: false,
      message: "Verification failed due to system error"
    });
  }
};

/* --------------------------------------------
   VERIFY MEDICINE ON BLOCKCHAIN (Update Status)
-------------------------------------------- */
export const verifyMedicineOnBlockchain = async (req, res) => {
  try {
    const { medicineId } = req.params;
    const user = req.user;

    console.log(`Verifying medicine ${medicineId} on blockchain...`);

    const medicine = await PharmacyMedicine.findById(medicineId);
    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: "Medicine not found"
      });
    }

    let blockchainResult = null;
    let blockchainError = null;

    // Verify on blockchain
    try {
      blockchainResult = await BlockchainService.verifyMedicineOnBlockchain(medicine.batchNo);

      // Update medicine verification status
      medicine.blockchainVerified = true;
      medicine.verificationTransactionHash = blockchainResult.transactionHash;
      medicine.verifiedAt = new Date();
      medicine.verifiedBy = user.name || user.username || 'Unknown Verifier';
      await medicine.save();

      console.log(`Medicine ${medicine.batchNo} verified on blockchain`);

    } catch (error) {
      blockchainError = error.message;
      console.error("Blockchain verification failed:", blockchainError);
    }

    const response = {
      success: true,
      message: blockchainResult ? 
        "Medicine verified on blockchain" : 
        "Medicine verification failed on blockchain",
      data: medicine
    };

    if (blockchainResult) {
      response.blockchain = blockchainResult;
    } else {
      response.error = "Blockchain verification failed";
      response.blockchainError = blockchainError;
    }

    res.json(response);

  } catch (error) {
    console.error("Error verifying medicine:", error);
    res.status(500).json({
      success: false,
      message: "Error verifying medicine",
      error: error.message
    });
  }
};

/* --------------------------------------------
   INITIALIZE DUMMY PHARMACY MEDICINES
-------------------------------------------- */
export const initializePharmacyMedicines = async () => {
  try {
    const count = await PharmacyMedicine.countDocuments();
    if (count > 0) {
      console.log("Pharmacy medicines already exist, skipping initialization.");
      return;
    }

    const dummyPharmacyMedicines = [
      // Your dummy data here
    ];

    await PharmacyMedicine.insertMany(dummyPharmacyMedicines);
    
    // Also add to Batch collection
    const batchData = dummyPharmacyMedicines.map(med => ({
      batchNo: med.batchNo,
      name: med.name,
      medicineName: med.medicineName,
      manufactureDate: med.manufactureDate,
      expiry: med.expiryDate,
      formulation: med.formulation,
      manufacturer: med.manufacturer,
      pharmacy: med.pharmacy,
      quantity: med.quantity,
      status: 'active',
      blockchainVerified: med.blockchainVerified
    }));
    
    await Batch.insertMany(batchData);
    
    console.log("Dummy pharmacy medicines initialized successfully.");
  } catch (error) {
    console.error("Error initializing pharmacy medicines:", error.message);
  }
};
