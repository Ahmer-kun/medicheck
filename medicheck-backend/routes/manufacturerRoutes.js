import express from 'express';
import { 
  getManufacturerBatches,
  registerManufacturer,
  createManufacturerBatch,
  getAllManufacturers,
  initializeManufacturers
} from '../controllers/manufacturerController.js';
import { auth, authorize } from '../middleware/auth.js';

const router = express.Router();

// 🌐 PUBLIC ROUTES
router.get('/list', getAllManufacturers);
router.post('/register', registerManufacturer);

// 🔒 PROTECTED ROUTES
router.use(auth);
router.get('/batches', authorize('manufacturer', 'admin'), getManufacturerBatches);
router.post('/batches', authorize('manufacturer', 'admin'), createManufacturerBatch);

// 🧩 DEVELOPMENT UTILITIES
router.post('/initialize', async (req, res) => {
  try {
    await initializeManufacturers();
    res.json({ 
      success: true, 
      message: "Manufacturers initialized successfully" 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error initializing manufacturers", 
      error: error.message 
    });
  }
});

export default router;


// import express from 'express';
// import { 
//   getManufacturerBatches,
//   registerManufacturer,
//   createManufacturerBatch,
//   getAllManufacturers
// } from '../controllers/manufacturerController.js';
// import { auth, authorize } from '../middleware/auth.js';

// const router = express.Router();

// // 🌐 PUBLIC ROUTES
// router.post('/register', registerManufacturer);
// router.get('/list', getAllManufacturers);

// // 🔒 PROTECTED ROUTES
// router.use(auth);
// router.get('/batches', authorize('manufacturer', 'admin'), getManufacturerBatches);
// router.post('/batches', authorize('manufacturer', 'admin'), createManufacturerBatch);

// export default router;