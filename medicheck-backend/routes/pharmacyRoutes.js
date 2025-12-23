import express from "express";
import { auth, authorize } from "../middleware/auth.js";

const router = express.Router();

// 🔒 All routes require pharmacy or admin role
router.use(auth);
router.use(authorize('pharmacy', 'admin'));

/* --------------------------------------------
   🏪 PHARMACY DASHBOARD ROUTES
-------------------------------------------- */

// GET /api/pharmacy/dashboard - Pharmacy dashboard stats
router.get("/dashboard", async (req, res) => {
  try {
    const PharmacyMedicine = (await import("../models/PharmacyMedicine.js")).default;
    const PharmacyCompany = (await import("../models/PharmacyCompany.js")).default;
    
    const [medicineStats, companyCount] = await Promise.all([
      PharmacyMedicine.aggregate([
        {
          $group: {
            _id: null,
            totalMedicines: { $sum: 1 },
            activeMedicines: {
              $sum: { $cond: [{ $eq: ["$status", "Active"] }, 1, 0] }
            },
            expiredMedicines: {
              $sum: { $cond: [{ $lt: ["$expiryDate", new Date()] }, 1, 0] }
            },
            verifiedMedicines: {
              $sum: { $cond: ["$blockchainVerified", 1, 0] }
            },
            totalQuantity: { $sum: "$quantity" }
          }
        }
      ]),
      PharmacyCompany.countDocuments({ isActive: true })
    ]);

    const stats = medicineStats[0] || {
      totalMedicines: 0,
      activeMedicines: 0,
      expiredMedicines: 0,
      verifiedMedicines: 0,
      totalQuantity: 0
    };

    res.json({
      success: true,
      data: {
        ...stats,
        totalCompanies: companyCount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching pharmacy dashboard",
      error: error.message
    });
  }
});

export default router;