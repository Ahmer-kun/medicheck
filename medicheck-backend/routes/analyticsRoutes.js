// analyticsRoutes.js
import express from 'express';
import { getDashboardStats, getBatchAnalytics } from '../controllers/analyticsController.js';
import { auth, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(auth);

router.get('/dashboard', getDashboardStats);
router.get('/batches', authorize('admin', 'analytics'), getBatchAnalytics);

export default router;   // <-- default export
