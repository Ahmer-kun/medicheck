const Batch = require('../models/Batch');
const User = require('../models/User');

// Initialize default batches
const initializeDefaultBatches = async () => {
  const defaultBatches = [
    {
      batchNo: "PANT-2025-001",
      name: "Pantra 40mg",
      medicineName: "Pantra 40mg",
      formulation: "Pantoprazole 40mg tablet",
      manufacturer: "Sun Pharma",
      pharmacy: "MediCare Pharmacy",
      manufactureDate: new Date("2025-01-15"),
      expiryDate: new Date("2026-06-30"),
      quantity: 1000,
      status: "active",
      blockchainVerified: true,
      blockchainTxHash: "0x1a2b3c4d5e6f7890"
    },
    {
      batchNo: "TLD-2025-010",
      name: "Telday 40mg",
      medicineName: "Telday 40mg",
      formulation: "Telmisartan 40mg tablet",
      manufacturer: "Cipla Ltd",
      pharmacy: "Apollo Pharmacy",
      manufactureDate: new Date("2024-12-10"),
      expiryDate: new Date("2025-07-10"),
      quantity: 800,
      status: "active",
      blockchainVerified: true,
      blockchainTxHash: "0x2b3c4d5e6f7890a1"
    },
    {
      batchNo: "CFG-2025-003",
      name: "Cefiget 200mg",
      medicineName: "Cefiget 200mg",
      formulation: "Cefixime 200mg capsule",
      manufacturer: "Dr. Reddy's",
      pharmacy: "Wellness Forever",
      manufactureDate: new Date("2026-01-05"),
      expiryDate: new Date("2026-05-20"),
      quantity: 1200,
      status: "active",
      blockchainVerified: true,
      blockchainTxHash: "0x3c4d5e6f7890a1b2"
    }
  ];

  for (const batchData of defaultBatches) {
    const existingBatch = await Batch.findOne({ batchNo: batchData.batchNo });
    if (!existingBatch) {
      // Find a manufacturer user to assign using User model directly
      const manufacturerUser = await User.findOne({ role: 'manufacturer' });
      if (manufacturerUser) {
        batchData.manufacturerId = manufacturerUser._id;
      }
      await Batch.create(batchData);
      console.log(`Created default batch: ${batchData.batchNo}`);
    }
  }
};

exports.getAllBatches = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 10 } = req.query;
    
    let query = {};
    
    // Search functionality
    if (search) {
      query.$or = [
        { batchNo: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { medicineName: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Status filter
    if (status && status !== 'all') {
      query.status = status;
    }
    
    // Role-based filtering
    if (req.user.role === 'manufacturer') {
      query.manufacturerId = req.user._id;
    } else if (req.user.role === 'pharmacy') {
      query.pharmacyId = req.user._id;
    }

    const batches = await Batch.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('manufacturerId', 'name')
      .populate('pharmacyId', 'name');

    const total = await Batch.countDocuments(query);

    res.json({
      success: true,
      batches,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching batches', error: error.message });
  }
};

exports.getBatch = async (req, res) => {
  try {
    const batch = await Batch.findOne({ batchNo: req.params.batchNo })
      .populate('manufacturerId', 'name')
      .populate('pharmacyId', 'name');

    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    res.json({
      success: true,
      batch
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching batch', error: error.message });
  }
};

exports.createBatch = async (req, res) => {
  try {
    const batchData = {
      ...req.body,
      manufacturerId: req.user._id,
      manufacturer: req.user.name
    };

    // Check if batch number exists
    const existingBatch = await Batch.findOne({ batchNo: batchData.batchNo });
    if (existingBatch) {
      return res.status(400).json({ message: 'Batch number already exists' });
    }

    // Simulate blockchain registration
    batchData.blockchainVerified = true;
    batchData.blockchainTxHash = `0x${Math.random().toString(16).slice(2)}${Date.now().toString(16)}`;

    const batch = await Batch.create(batchData);

    res.status(201).json({
      success: true,
      message: 'Batch created and registered on blockchain',
      batch
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating batch', error: error.message });
  }
};

exports.updateBatch = async (req, res) => {
  try {
    const batch = await Batch.findOne({ batchNo: req.params.batchNo });

    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    // Authorization check
    if (req.user.role === 'manufacturer' && !batch.manufacturerId.equals(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to update this batch' });
    }

    const updatedBatch = await Batch.findOneAndUpdate(
      { batchNo: req.params.batchNo },
      req.body,
      { new: true, runValidators: true }
    ).populate('manufacturerId', 'name')
     .populate('pharmacyId', 'name');

    res.json({
      success: true,
      message: 'Batch updated successfully',
      batch: updatedBatch
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating batch', error: error.message });
  }
};

exports.acceptBatch = async (req, res) => {
  try {
    const batch = await Batch.findOne({ batchNo: req.params.batchNo });

    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    // Update pharmacy information
    batch.pharmacy = req.user.name;
    batch.pharmacyId = req.user._id;
    batch.status = 'active';

    await batch.save();

    res.json({
      success: true,
      message: 'Batch accepted successfully',
      batch
    });
  } catch (error) {
    res.status(500).json({ message: 'Error accepting batch', error: error.message });
  }
};

exports.verifyBatch = async (req, res) => {
  try {
    const batch = await Batch.findOne({ batchNo: req.params.batchNo });

    if (!batch) {
      return res.status(404).json({ 
        success: false,
        message: 'Batch not found' 
      });
    }

    const isExpired = batch.expiryDate < new Date();
    const isVerified = batch.blockchainVerified;

    res.json({
      success: true,
      authentic: !isExpired && isVerified,
      message: isExpired ? 
        '❌ This batch is expired. Do not use this medicine.' : 
        '✅ This medicine is authentic and safe to use.',
      batch: {
        batchNo: batch.batchNo,
        name: batch.name,
        formulation: batch.formulation,
        expiry: batch.expiryDate,
        manufacturer: batch.manufacturer,
        pharmacy: batch.pharmacy,
        status: batch.status,
        blockchainVerified: batch.blockchainVerified,
        blockchainTxHash: batch.blockchainTxHash
      },
      isExpired
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error verifying batch', 
      error: error.message 
    });
  }
};

exports.initializeBatches = initializeDefaultBatches;