import express from 'express';
import { 
  getAdminStats,
  getPendingBatches,
  updateBatchStatus,
  getSystemUsers,
  updateUser,
  getSystemLogs,
  createUser,
  deleteUser,
  getAllBatches,
  getRecallList,
  deleteRecall, toggleUserStatus,
  deactivateUser,
  reactivateUser,
  getUserStatusHistory, resetUserPassword
} from '../controllers/adminController.js';
import { auth, authorize } from '../middleware/auth.js';

const router = express.Router();

// 🔒 All admin routes require authentication and admin role
router.use(auth);
router.use(authorize('admin'));

/* --------------------------------------------
   📊 DASHBOARD & STATISTICS
-------------------------------------------- */
router.get('/stats', getAdminStats);
router.get('/pending-batches', getPendingBatches);

/* --------------------------------------------
   👥 USER MANAGEMENT
-------------------------------------------- */
router.get('/users', getSystemUsers);
router.post('/users', createUser);
router.put('/users/:userId', updateUser);
router.delete('/users/:userId', deleteUser);

/* --------------------------------------------
   👥 USER STATUS MANAGEMENT
-------------------------------------------- */
router.put('/users/:userId/deactivate', deactivateUser);
router.put('/users/:userId/reactivate', reactivateUser);
router.put('/users/:userId/toggle-status', toggleUserStatus);
router.get('/users/:userId/status-history', getUserStatusHistory);
// Password reset endpoint
router.put('/users/:userId/reset-password', resetUserPassword);
/* --------------------------------------------
   📦 BATCH MANAGEMENT
-------------------------------------------- */
router.get('/batches', getAllBatches);
router.put('/batches/:batchId', updateBatchStatus);

/* --------------------------------------------
   📋 SYSTEM LOGS
-------------------------------------------- */
router.get('/logs', getSystemLogs);

/* --------------------------------------------
   ⚠️ RECALL MANAGEMENT
-------------------------------------------- */
router.get('/recalls', getRecallList);
router.delete('/recalls/:recallId', deleteRecall);

/* --------------------------------------------
   🏪 PHARMACY COMPANY MANAGEMENT
-------------------------------------------- */
router.get('/pharmacy-companies', async (req, res) => {
  try {
    const PharmacyCompany = (await import("../models/PharmacyCompany.js")).default;
    
    const companies = await PharmacyCompany.find()
      .sort({ name: 1 })
      .lean();

    res.json({
      success: true,
      data: companies
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching pharmacy companies",
      error: error.message
    });
  }
});

export default router;
