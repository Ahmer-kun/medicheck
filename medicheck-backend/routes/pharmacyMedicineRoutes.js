import express from "express";
import { 
  addPharmacyMedicine, 
  getPharmacyMedicines,
  getAllPharmacyMedicines,
  updatePharmacyMedicine,
  verifyPharmacyMedicine,
  initializePharmacyMedicines,
  deletePharmacyMedicine
} from "../controllers/pharmacyMedicineController.js";
import { auth, authorize } from "../middleware/auth.js"; // ADD THIS IMPORT

const router = express.Router();

// 🔒 PROTECTED ROUTES (require authentication)
router.use(auth);

// Get all medicines (all pharmacies) - Pharmacy & Admin only
router.get("/medicines", authorize('pharmacy', 'admin'), getAllPharmacyMedicines);

// Get medicines for specific pharmacy company
router.get("/medicines/:pharmacyCompanyId", authorize('pharmacy', 'admin'), getPharmacyMedicines);

// Add new medicine to specific pharmacy company
router.post("/medicines", authorize('pharmacy', 'admin'), addPharmacyMedicine);

// Update pharmacy medicine
router.put("/medicines/:id", authorize('pharmacy', 'admin'), updatePharmacyMedicine);

// DELETE pharmacy medicine
router.delete("/medicines/:id", authorize('pharmacy', 'admin'), deletePharmacyMedicine);

// 🌐 PUBLIC ROUTES (no authentication needed)
// Verify pharmacy medicine - Public access
router.get("/verify/:batchNo", verifyPharmacyMedicine);

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


// import express from "express";
// import { 
//   addPharmacyMedicine, 
//   getPharmacyMedicines,
//   getAllPharmacyMedicines,
//   updatePharmacyMedicine,
//   verifyPharmacyMedicine,
//   initializePharmacyMedicines,
//   deletePharmacyMedicine // ADD THIS IMPORT
// } from "../controllers/pharmacyMedicineController.js";

// const router = express.Router();

// // Get all medicines (all pharmacies)
// router.get("/medicines", getAllPharmacyMedicines);

// // Get medicines for specific pharmacy company
// router.get("/medicines/:pharmacyCompanyId", getPharmacyMedicines);

// // Add new medicine to specific pharmacy company
// router.post("/medicines", addPharmacyMedicine);

// // Update pharmacy medicine
// router.put("/medicines/:id", updatePharmacyMedicine);

// // DELETE pharmacy medicine - ADD THIS ROUTE
// router.delete("/medicines/:id", deletePharmacyMedicine);

// // Verify pharmacy medicine
// router.get("/verify/:batchNo", verifyPharmacyMedicine);

// // Initialize dummy data (development only)
// router.post("/initialize", async (req, res) => {
//   try {
//     await initializePharmacyMedicines();
//     res.json({ 
//       success: true, 
//       message: "Pharmacy medicines initialized successfully" 
//     });
//   } catch (error) {
//     res.status(500).json({ 
//       success: false, 
//       message: "Error initializing pharmacy medicines", 
//       error: error.message 
//     });
//   }
// });

// export default router;