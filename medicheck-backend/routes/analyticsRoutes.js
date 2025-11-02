const express = require('express');
const {
  getDashboardStats,
  getBatchAnalytics
} = require('../controllers/analyticsController');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.get('/dashboard', getDashboardStats);
router.get('/batches', authorize('admin', 'analytics'), getBatchAnalytics);

module.exports = router;