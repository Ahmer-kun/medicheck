import express from "express";
import { 
  getAllManufacturerCompanies,
  createManufacturerCompany,
  updateManufacturerCompany,
  deleteManufacturerCompany,
  getManufacturerCompanyStats,
  clearManufacturerStatsCache,
  updateManufacturerBlockchainAddress, 
  getManufacturerMetaMaskStatus 
} from "../controllers/manufacturerCompanyController.js";
import { auth, authorize } from "../middleware/auth.js";

const router = express.Router();

// PROTECTED ROUTES (requires authentication)
router.use(auth);

// Get All Manufacturer Companies - USES CONTROLLER FUNCTION
router.get("/", authorize('admin', 'manufacturer'), getAllManufacturerCompanies);

// Create New Manufacturer Company - USES CONTROLLER FUNCTION  
router.post("/", authorize('admin', 'manufacturer'), createManufacturerCompany);

// Updates manufacturer company
router.put("/:id", authorize('manufacturer', 'admin'), updateManufacturerCompany);

// Deletes manufacturer company (soft delete)
router.delete("/:id", authorize('manufacturer', 'admin'), deleteManufacturerCompany);

// Get manufacturer company statistics
router.get("/:id/stats", authorize('manufacturer', 'admin'), getManufacturerCompanyStats);

// Clear stats cache (development only)
router.delete("/cache/clear", authorize('admin'), clearManufacturerStatsCache);

// Initialize dummy data (development only)
router.post("/initialize", authorize('admin'), async (req, res) => {
  try {
    await initializeManufacturerCompanies();
    res.json({ 
      success: true, 
      message: "Manufacturer companies initialized successfully" 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error initializing manufacturer companies", 
      error: error.message 
    });
  }
});

// Update blockchain address for manufacturer company
router.put("/:id/blockchain-address", updateManufacturerBlockchainAddress);

// Get MetaMask status for manufacturer company
router.get("/:id/metamask-status", getManufacturerMetaMaskStatus);

export default router;
