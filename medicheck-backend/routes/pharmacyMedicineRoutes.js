import express from "express";
import { 
  addPharmacyMedicine, 
  getPharmacyMedicines,
  getAllPharmacyMedicines,
  updatePharmacyMedicine,
  verifyPharmacyMedicine,
  initializePharmacyMedicines,
  deletePharmacyMedicine,
  acceptManufacturerBatchWithVerification,
  verifyBatchManually
} from "../controllers/pharmacyMedicineController.js";
import { auth, authorize } from "../middleware/auth.js";

const router = express.Router();

// 🌐 PUBLIC ROUTES (no authentication needed)
// Verify pharmacy medicine - Public access
router.get("/verify/:batchNo", verifyPharmacyMedicine);

// 🔒 PROTECTED ROUTES (require authentication)
router.use(auth);

// Get all medicines (all pharmacies) - Pharmacy & Admin only
router.get("/medicines", getAllPharmacyMedicines);

// Get medicines for specific pharmacy company
router.get("/medicines/:pharmacyCompanyId", authorize('pharmacy', 'admin'), getPharmacyMedicines);

// Add new medicine to specific pharmacy company
router.post("/medicines", authorize('pharmacy', 'admin'), addPharmacyMedicine);

// Update pharmacy medicine
router.put("/medicines/:id", authorize('pharmacy', 'admin'), updatePharmacyMedicine);

// DELETE pharmacy medicine
router.delete("/medicines/:id", authorize('pharmacy', 'admin'), deletePharmacyMedicine);

// ✅ UPDATED ROUTE: Accept manufacturer batch into pharmacy WITH VERIFICATION
router.post("/accept-batch", authorize('pharmacy', 'admin'), acceptManufacturerBatchWithVerification);

// ✅ NEW ROUTE: Manual verification for any batch
router.get("/verify-manually/:batchNo", authorize('pharmacy', 'admin'), verifyBatchManually);

// Get pharmacy stock
router.get("/stock/:pharmacyCompanyId", authorize('pharmacy', 'admin'), async (req, res) => {
  try {
    const { pharmacyCompanyId } = req.params;

    const PharmacyMedicine = (await import("../models/PharmacyMedicine.js")).default;

    const stock = await PharmacyMedicine.find({ 
      pharmacyCompany: pharmacyCompanyId 
    })
    .populate('pharmacyCompany', 'name licenseNumber contact')
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: stock
    });

  } catch (error) {
    console.error("Error fetching pharmacy stock:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching pharmacy stock",
      error: error.message
    });
  }
});

// Update quantity of existing medicine
router.put("/medicines/update-quantity", authorize('pharmacy', 'admin'), async (req, res) => {
  try {
    const { batchNo, additionalQuantity, pharmacyCompanyId } = req.body;

    const PharmacyMedicine = (await import("../models/PharmacyMedicine.js")).default;

    // Find the existing medicine
    const existingMedicine = await PharmacyMedicine.findOne({ 
      batchNo, 
      pharmacyCompany: pharmacyCompanyId 
    });

    if (!existingMedicine) {
      return res.status(404).json({
        success: false,
        message: "Medicine not found in pharmacy stock"
      });
    }

    // Update quantity
    existingMedicine.quantity += parseInt(additionalQuantity);
    await existingMedicine.save();

    res.json({
      success: true,
      message: "Quantity updated successfully",
      data: existingMedicine
    });

  } catch (error) {
    console.error("Error updating quantity:", error);
    res.status(500).json({
      success: false,
      message: "Error updating quantity",
      error: error.message
    });
  }
});

// ✅ NEW ROUTE: Register existing pharmacy medicine on blockchain
router.post("/medicines/:medicineId/register-blockchain", authorize('pharmacy', 'admin'), async (req, res) => {
  try {
    const { medicineId } = req.params;
    const user = req.user;

    const PharmacyMedicine = (await import("../models/PharmacyMedicine.js")).default;
    const PharmacyCompany = (await import("../models/PharmacyCompany.js")).default;
    const BlockchainService = (await import("../services/blockchainService.js")).default;
    
    const medicine = await PharmacyMedicine.findById(medicineId)
      .populate('pharmacyCompany', 'name');
    
    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: "Medicine not found"
      });
    }

    // Prepare blockchain data
    const blockchainData = {
      batchNo: medicine.batchNo,
      name: medicine.name,
      medicineName: medicine.medicineName,
      manufactureDate: medicine.manufactureDate,
      expiryDate: medicine.expiryDate,
      formulation: medicine.formulation,
      quantity: medicine.quantity,
      manufacturer: medicine.manufacturer,
      pharmacy: medicine.pharmacyName || medicine.pharmacyCompany?.name,
      packaging: medicine.packaging || {},
      status: medicine.status || 'At Pharmacy'
    };

    let blockchainResult = null;
    let blockchainError = null;

    try {
      blockchainResult = await BlockchainService.registerCompleteMedicine(blockchainData);
      
      medicine.blockchainVerified = true;
      medicine.blockchainTransactionHash = blockchainResult.transactionHash;
      medicine.registeredOnBlockchain = true;
      
      console.log(`✅ Medicine ${medicine.batchNo} registered on blockchain`);
      
    } catch (error) {
      blockchainError = error.message;
      console.error("❌ Blockchain registration failed:", error);
      medicine.blockchainError = blockchainError;
    }

    await medicine.save();

    res.json({
      success: true,
      message: blockchainResult ? 
        "Medicine registered on blockchain" : 
        "Blockchain registration failed",
      data: medicine,
      blockchain: blockchainResult ? {
        registered: true,
        transactionHash: blockchainResult.transactionHash
      } : {
        registered: false,
        error: blockchainError
      }
    });

  } catch (error) {
    console.error("❌ Blockchain registration error:", error);
    res.status(500).json({
      success: false,
      message: "Error registering on blockchain",
      error: error.message
    });
  }
});

// ✅ NEW ROUTE: Verify pharmacy batch on blockchain
router.get("/verify-blockchain/:batchNo", authorize('pharmacy', 'admin', 'viewer'), async (req, res) => {
  try {
    const { batchNo } = req.params;

    const PharmacyMedicine = (await import("../models/PharmacyMedicine.js")).default;
    const Batch = (await import("../models/Batch.js")).default;
    const BlockchainService = (await import("../services/blockchainService.js")).default;
    
    console.log(`🔍 Verifying pharmacy batch on blockchain: ${batchNo}`);

    // 1. Check in blockchain
    const blockchainResult = await BlockchainService.getCompleteMedicineFromBlockchain(batchNo);
    
    // 2. Check in pharmacy database
    const pharmacyMedicine = await PharmacyMedicine.findOne({ batchNo })
      .populate('pharmacyCompany', 'name licenseNumber');
    
    // 3. Check in manufacturer database
    const manufacturerBatch = await Batch.findOne({ batchNo });

    const verificationResult = {
      existsOnBlockchain: blockchainResult.exists,
      existsInPharmacy: !!pharmacyMedicine,
      existsInManufacturer: !!manufacturerBatch,
      
      blockchainData: blockchainResult.exists ? {
        verified: blockchainResult.verified,
        currentOwner: blockchainResult.currentOwner,
        manufacturer: blockchainResult.manufacturer,
        pharmacy: blockchainResult.pharmacy,
        status: blockchainResult.status
      } : null,
      
      pharmacyData: pharmacyMedicine ? {
        pharmacyName: pharmacyMedicine.pharmacyName,
        company: pharmacyMedicine.pharmacyCompany?.name,
        status: pharmacyMedicine.status,
        acceptedDate: pharmacyMedicine.acceptanceDate,
        blockchainVerified: pharmacyMedicine.blockchainVerified
      } : null,
      
      manufacturerData: manufacturerBatch ? {
        manufacturer: manufacturerBatch.manufacturer,
        manufactureDate: manufacturerBatch.manufactureDate,
        originalStatus: manufacturerBatch.status
      } : null,
      
      // Verification summary
      isAuthentic: blockchainResult.exists && 
                   blockchainResult.verified && 
                   !!pharmacyMedicine,
      
      supplyChainComplete: blockchainResult.exists && 
                          manufacturerBatch && 
                          pharmacyMedicine,
      
      recommendations: []
    };

    // Generate recommendations
    if (!blockchainResult.exists) {
      verificationResult.recommendations.push("Register this batch on blockchain");
    }
    
    if (!pharmacyMedicine) {
      verificationResult.recommendations.push("Add this batch to pharmacy inventory");
    }
    
    if (blockchainResult.exists && !blockchainResult.verified) {
      verificationResult.recommendations.push("Verify this batch on blockchain");
    }

    res.json({
      success: true,
      data: verificationResult
    });

  } catch (error) {
    console.error("❌ Verification error:", error);
    res.status(500).json({
      success: false,
      message: "Verification failed",
      error: error.message
    });
  }
});

// ✅ NEW ROUTE: Get all blockchain-verified pharmacy medicines
router.get("/blockchain-verified", authorize('pharmacy', 'admin'), async (req, res) => {
  try {
    const PharmacyMedicine = (await import("../models/PharmacyMedicine.js")).default;
    
    const medicines = await PharmacyMedicine.find({ blockchainVerified: true })
      .populate('pharmacyCompany', 'name')
      .sort({ updatedAt: -1 });
    
    res.json({
      success: true,
      data: medicines,
      count: medicines.length
    });
  } catch (error) {
    console.error("Error fetching blockchain-verified medicines:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching blockchain-verified medicines"
    });
  }
});

// Initialize dummy data (development only) - Admin only
router.post("/initialize", authorize('admin'), async (req, res) => {
  try {
    await initializePharmacyMedicines();
    res.json({ 
      success: true, 
      message: "Pharmacy medicines initialized successfully" 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error initializing pharmacy medicines", 
      error: error.message 
    });
  }
});

export default router;