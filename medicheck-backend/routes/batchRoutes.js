// // routes/batchRoutes.js
// import express from 'express';
// import {
//   getAllBatches,
//   getBatch,
//   createBatch,
//   updateBatch,
//   acceptBatch,
//   verifyBatch,
//   initializeBatches
// } from '../controllers/batchController.js';
// import { auth, authorize } from '../middleware/auth.js';
// import { batchValidation, validate } from '../middleware/validation.js';

// const router = express.Router();

// /* --------------------------------------------
//    🌐 PUBLIC ROUTES
// -------------------------------------------- */
// router.get('/', getAllBatches);
// router.get('/:batchNo', getBatch);
// router.get('/verify/:batchNo', verifyBatch);

// /* --------------------------------------------
//    🔒 PROTECTED ROUTES (require auth)
// -------------------------------------------- */
// // router.use(auth);
// // router.post('/', authorize('admin', 'manufacturer'), validate(batchValidation.createBatch), createBatch);
// // router.put('/:batchNo', updateBatch);
// // router.put('/accept/:batchNo', authorize('admin', 'pharmacy'), acceptBatch);

// /* --------------------------------------------
//    🧩 DEVELOPMENT UTILITIES
// -------------------------------------------- */
// router.post('/initialize/batches', async (req, res) => {
//   try {
//     await initializeBatches();
//     res.json({ message: 'Default batches initialized successfully' });
//   } catch (error) {
//     res.status(500).json({ message: 'Error initializing batches', error: error.message });
//   }
// });

// export default router;  // <-- ESM default export




// routes/batchRoutes.js
import express from 'express';
import {
  getAllBatches,
  getBatch,
  createBatch,
  updateBatch,
  acceptBatch,
  verifyBatch,
  initializeBatches
} from '../controllers/batchController.js';
import { auth, authorize } from '../middleware/auth.js';
import { batchValidation, validate } from '../middleware/validation.js';

const router = express.Router();

/* --------------------------------------------
   🌐 PUBLIC ROUTES
-------------------------------------------- */
router.get('/', getAllBatches);
router.get('/:batchNo', getBatch);
router.get('/verify/:batchNo', verifyBatch);

/* --------------------------------------------
   🔒 PROTECTED ROUTES (require auth)
-------------------------------------------- */
// router.use(auth);
router.post('/', createBatch);
// router.put('/:batchNo', updateBatch);
// router.put('/accept/:batchNo', authorize('admin', 'pharmacy'), acceptBatch);

/* --------------------------------------------
   🧩 DEVELOPMENT UTILITIES
-------------------------------------------- */
router.post('/initialize/batches', async (req, res) => {
  try {
    await initializeBatches();
    res.json({ message: 'Default batches initialized successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error initializing batches', error: error.message });
  }
});

export default router;