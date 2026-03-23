// routes/batchRoutes.js - UPDATED VERSION

import express from 'express';
import mongoose from 'mongoose';
import {
  getAllBatches,
  getBatch,
  createBatch,
  updateBatch,
  acceptBatch,
  verifyBatch,
  initializeBatches,
  getAvailableManufacturerBatches
} from '../controllers/batchController.js';
import { auth, authorize } from '../middleware/auth.js';
import { batchValidation, validate } from '../middleware/validation.js';
import Batch from '../models/Batch.js';
import { importBatchesFromExcel } from '../controllers/batchController.js';

const router = express.Router();

/* --------------------------------------------
   PUBLIC ROUTES
-------------------------------------------- */
router.get('/', getAllBatches);

// Note: Remember to Put the verify route BEFORE the :batchNo route to avoid conflicts | that goes for other projects too
router.get('/verify/:batchNo', verifyBatch);

// Get single batch by batchNo - Only after specific routes
router.get('/:batchNo', getBatch);

/* --------------------------------------------
   PROTECTED ROUTES (require auth)
-------------------------------------------- */
router.use(auth);

router.post('/', createBatch);
router.put('/:batchNo', updateBatch);
router.put('/accept/:batchNo', authorize('admin', 'pharmacy'), acceptBatch);

/* --------------------------------------------
   DELETE BATCH ROUTE - ENHANCED
-------------------------------------------- */
router.delete('/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    
    console.log(`Deleting batch with identifier: ${identifier}`);
    
    let deletedBatch;
    
    // Try different approaches
    if (mongoose.Types.ObjectId.isValid(identifier)) {
      // Standard MongoDB ObjectId
      deletedBatch = await Batch.findByIdAndDelete(identifier);
    } else {
      // Try as batch number
      deletedBatch = await Batch.findOneAndDelete({ batchNo: identifier });
    }
    
    if (!deletedBatch) {
      // Check if it's a pharmacy medicine
      const PharmacyMedicine = (await import("../models/PharmacyMedicine.js")).default;
      const deletedPharmacyMedicine = await PharmacyMedicine.findOneAndDelete({
        $or: [
          { _id: identifier },
          { batchNo: identifier }
        ]
      });
      
      if (deletedPharmacyMedicine) {
        console.log(`Pharmacy medicine deleted: ${deletedPharmacyMedicine.batchNo}`);
        return res.json({
          success: true,
          message: "Pharmacy medicine deleted successfully",
          data: {
            id: deletedPharmacyMedicine._id,
            batchNo: deletedPharmacyMedicine.batchNo,
            name: deletedPharmacyMedicine.name,
            type: 'pharmacy_medicine'
          }
        });
      }
      
      return res.status(404).json({
        success: false,
        message: "Batch or medicine not found"
      });
    }
    
    console.log(`Batch deleted: ${deletedBatch.batchNo}`);
    
    res.json({
      success: true,
      message: "Batch deleted successfully",
      data: {
        id: deletedBatch._id,
        batchNo: deletedBatch.batchNo,
        name: deletedBatch.name,
        type: 'batch'
      }
    });
    
  } catch (error) {
    console.error("Error deleting batch:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting batch",
      error: error.message
    });
  }
});

/* --------------------------------------------
   GET AVAILABLE MANUFACTURER BATCHES
-------------------------------------------- */
router.get('/available/manufacturer', getAvailableManufacturerBatches);

// In batchRoutes.js
router.get('/manufacturer/:manufacturerName/available', async (req, res) => {
  try {
    const { manufacturerName } = req.params;
    
    // Get batches from THIS manufacturer that are NOT accepted by any pharmacy
    const batches = await Batch.find({
      manufacturer: manufacturerName,
      status: { $nin: ['accepted', 'at_pharmacy'] } 
    }).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: batches,
      count: batches.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching manufacturer batches",
      error: error.message
    });
  }
});

/* --------------------------------------------
   DEVELOPMENT UTILITIES
-------------------------------------------- */
router.post('/initialize/batches', async (req, res) => {
  try {
    await initializeBatches();
    res.json({ 
      success: true,
      message: 'Default batches initialized successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error initializing batches', 
      error: error.message 
    });
  }
});

// Excel Import Route
router.post('/import-excel', auth, authorize('manufacturer', 'admin'), async (req, res) => {
  try {
    console.log('Excel import request received');
    
    // Use the controller function directly
    await importBatchesFromExcel(req, res);
  } catch (error) {
    console.error('Excel import route error:', error);
    res.status(500).json({
      success: false,
      message: "Excel import route error",
      error: error.message
    });
  }
});

export default router;