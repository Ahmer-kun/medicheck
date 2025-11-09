import express from 'express';
import { 
  getManufacturerBatches,
  registerManufacturer,
  createManufacturerBatch,
  getAllManufacturers
} from '../controllers/manufacturerController.js';
import { auth, authorize } from '../middleware/auth.js';

const router = express.Router();

// 🌐 PUBLIC ROUTES
router.post('/register', registerManufacturer);
router.get('/list', getAllManufacturers);

// 🔒 PROTECTED ROUTES
router.use(auth);
router.get('/batches', authorize('manufacturer', 'admin'), getManufacturerBatches);
router.post('/batches', authorize('manufacturer', 'admin'), createManufacturerBatch);

export default router;

// import express from 'express';
// import { getManufacturerBatches } from '../controllers/manufacturerController.js';

// const router = express.Router();

// router.get('/', getManufacturerBatches);

// export default router;