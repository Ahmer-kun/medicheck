const express = require('express');
const {
  getAllBatches,
  getBatch,
  createBatch,
  updateBatch,
  acceptBatch,
  verifyBatch,
  initializeBatches
} = require('../controllers/batchController');
const { auth, authorize } = require('../middleware/auth');
const { batchValidation, validate } = require('../middleware/validation');

const router = express.Router();

// Public routes
router.get('/verify/:batchNo', verifyBatch);

// Protected routes
router.use(auth);

router.get('/', getAllBatches);
router.get('/:batchNo', getBatch);
router.post('/', authorize('admin', 'manufacturer'), validate(batchValidation.createBatch), createBatch);
router.put('/:batchNo', updateBatch);
router.put('/accept/:batchNo', authorize('admin', 'pharmacy'), acceptBatch);

// Initialize default batches (for development)
router.post('/initialize/batches', authorize('admin'), async (req, res) => {
  try {
    await initializeBatches();
    res.json({ message: 'Default batches initialized successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error initializing batches', error: error.message });
  }
});

module.exports = router;