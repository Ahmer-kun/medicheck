import express from "express";
import { 
  getAllPharmacyCompanies,
  createPharmacyCompany,
  updatePharmacyCompany,
  deletePharmacyCompany,
  getPharmacyCompanyStats,
  clearStatsCache,
  initializePharmacyCompanies,
  updatePharmacyBlockchainAddress, // Add this
  getPharmacyMetaMaskStatus // Add this
} from "../controllers/pharmacyCompanyController.js";

const router = express.Router();

// Get all pharmacy companies
router.get("/", getAllPharmacyCompanies);

// Create new pharmacy company
router.post("/", createPharmacyCompany);

// Update pharmacy company
router.put("/:id", updatePharmacyCompany);

// Delete pharmacy company (soft delete)
router.delete("/:id", deletePharmacyCompany);

// Get pharmacy company statistics
router.get("/:id/stats", getPharmacyCompanyStats);

// Clear stats cache (development only)
router.delete("/cache/clear", clearStatsCache);

// Debug route: Get detailed medicine info for a company
router.get("/:id/medicines-detailed", async (req, res) => {
  try {
    const { id } = req.params;
    
    const PharmacyMedicine = (await import("../models/PharmacyMedicine.js")).default;
    
    const medicines = await PharmacyMedicine.find({ pharmacyCompany: id })
      .populate('pharmacyCompany', 'name licenseNumber')
      .select('name batchNo status blockchainVerified expiryDate quantity')
      .lean();
    
    const stats = {
      total: medicines.length,
      verified: medicines.filter(m => m.blockchainVerified).length,
      expired: medicines.filter(m => new Date(m.expiryDate) < new Date()).length,
      active: medicines.filter(m => m.status === 'Active').length,
      medicines: medicines.map(m => ({
        name: m.name,
        batchNo: m.batchNo,
        status: m.status,
        verified: m.blockchainVerified,
        expiryDate: m.expiryDate,
        quantity: m.quantity
      }))
    };
    
    console.log(`🔍 Detailed debug for company ${id}:`, stats);
    
    res.json({
      success: true,
      companyId: id,
      stats: stats
    });
  } catch (error) {
    console.error("Detailed debug error:", error);
    res.status(500).json({
      success: false,
      message: "Error in detailed debug",
      error: error.message
    });
  }
});

// Initialize dummy data (development only)
router.post("/initialize", async (req, res) => {
  try {
    await initializePharmacyCompanies();
    res.json({ 
      success: true, 
      message: "Pharmacy companies initialized successfully" 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error initializing pharmacy companies", 
      error: error.message 
    });
  }
});


// pharmacyCompanyRoutes.js - Add these routes

// Update blockchain address for pharmacy company
router.put("/:id/blockchain-address", updatePharmacyBlockchainAddress);

// Get MetaMask status for pharmacy company
router.get("/:id/metamask-status", getPharmacyMetaMaskStatus);
// temporary Route

// Add this temporary route to see what's available
// router.get("/debug-exports", async (req, res) => {
//   try {
//     const controller = await import("../controllers/pharmacyCompanyController.js");
//     res.json({
//       availableExports: Object.keys(controller),
//       success: true
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// });

export default router;


// import express from "express";
// import { 
//   getAllPharmacyCompanies,
//   createPharmacyCompany,
//   updatePharmacyCompany,
//   deletePharmacyCompany,
//   getPharmacyCompanyStats,
//   initializePharmacyCompanies,
//   clearStatsCache
// } from "../controllers/pharmacyCompanyController.js";

// const router = express.Router();

// // Get all pharmacy companies with stats
// router.get("/", getAllPharmacyCompanies);

// // Create new pharmacy company
// router.post("/", createPharmacyCompany);

// // Update pharmacy company
// router.put("/:id", updatePharmacyCompany);

// // Delete pharmacy company (soft delete)
// router.delete("/:id", deletePharmacyCompany);

// // Get pharmacy company statistics
// router.get("/:id/stats", getPharmacyCompanyStats);

// // Clear stats cache (development only)
// router.delete("/cache/clear", clearStatsCache);

// // Debug route: Get detailed medicine info for a company
// router.get("/:id/medicines-detailed", async (req, res) => {
//   try {
//     const { id } = req.params;
    
//     const PharmacyMedicine = (await import("../models/PharmacyMedicine.js")).default;
    
//     const medicines = await PharmacyMedicine.find({ pharmacyCompany: id })
//       .populate('pharmacyCompany', 'name licenseNumber')
//       .select('name batchNo status blockchainVerified expiryDate quantity')
//       .lean();
    
//     const stats = {
//       total: medicines.length,
//       verified: medicines.filter(m => m.blockchainVerified).length,
//       expired: medicines.filter(m => new Date(m.expiryDate) < new Date()).length,
//       active: medicines.filter(m => m.status === 'Active').length,
//       medicines: medicines.map(m => ({
//         name: m.name,
//         batchNo: m.batchNo,
//         status: m.status,
//         verified: m.blockchainVerified,
//         expiryDate: m.expiryDate,
//         quantity: m.quantity
//       }))
//     };
    
//     console.log(`🔍 Detailed debug for company ${id}:`, stats);
    
//     res.json({
//       success: true,
//       companyId: id,
//       stats: stats
//     });
//   } catch (error) {
//     console.error("Detailed debug error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error in detailed debug",
//       error: error.message
//     });
//   }
// });

// // Initialize dummy data (development only)
// router.post("/initialize", async (req, res) => {
//   try {
//     await initializePharmacyCompanies();
//     // Clear cache after initialization
//     const cache = new Map();
//     cache.clear();
    
//     res.json({ 
//       success: true, 
//       message: "Pharmacy companies initialized successfully" 
//     });
//   } catch (error) {
//     res.status(500).json({ 
//       success: false, 
//       message: "Error initializing pharmacy companies", 
//       error: error.message 
//     });
//   }
// });

// export default router;