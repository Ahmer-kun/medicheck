import Batch from '../models/Batch.js';
import Manufacturer from '../models/Manufacturer.js'; // Add this import

const dummyManufactured = [
  // ... your existing dummy data stays the same
  {
    batchNo: "M1001",
    name: "Ciprofloxacin 500mg",
    manufactureDate: "2025-01-20",
    expiry: "2027-01-20",
    formulation: "Tablet",
    manufacturer: "MediLife Labs",
    status: "manufactured",
    quantity: 5000
  },
  {
    batchNo: "M1002", 
    name: "Ibuprofen 200mg",
    manufactureDate: "2025-02-14",
    expiry: "2027-02-14",
    formulation: "Capsule",
    manufacturer: "PharmaNext",
    status: "manufactured",
    quantity: 3000
  }
];

// ✅ EXISTING FUNCTION - KEEP THIS
export const getManufacturerBatches = async (req, res) => {
  try {
    const batches = await Batch.find({ status: "manufactured" });

    if (batches.length === 0) {
      console.log("⚠️ No manufactured batches found, returning dummy data.");
      return res.json(dummyManufactured);
    }

    console.log("✅ Returning manufacturer batches from MongoDB.");
    res.json(batches);
  } catch (error) {
    res.status(500).json({ message: "Error fetching manufacturer batches", error: error.message });
  }
};

// 🆕 NEW FUNCTION: Register Manufacturer
export const registerManufacturer = async (req, res) => {
  try {
    const { companyName, licenseNumber, address, contactEmail, phone, specialties } = req.body;

    // Check if manufacturer already exists
    const existingManufacturer = await Manufacturer.findOne({ 
      $or: [{ companyName }, { licenseNumber }] 
    });

    if (existingManufacturer) {
      return res.status(400).json({
        success: false,
        message: 'Manufacturer already exists with this name or license number'
      });
    }

    // Create new manufacturer
    const manufacturer = new Manufacturer({
      companyName,
      licenseNumber,
      address,
      contactEmail,
      phone,
      specialties: specialties || [],
      isActive: true
    });

    await manufacturer.save();

    res.status(201).json({
      success: true,
      message: 'Manufacturer registered successfully',
      data: manufacturer
    });

  } catch (error) {
    console.error('❌ Manufacturer registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering manufacturer',
      error: error.message
    });
  }
};

// 🆕 NEW FUNCTION: Create Manufacturer Batch
export const createManufacturerBatch = async (req, res) => {
  try {
    const {
      batchNo,
      name,
      medicineName,
      manufactureDate,
      expiry,
      formulation,
      quantity,
      manufacturer
    } = req.body;

    const newBatch = new Batch({
      batchNo,
      name,
      medicineName,
      manufactureDate,
      expiry,
      formulation,
      manufacturer,
      quantity,
      status: 'manufactured', // Specific status for manufacturer-created batches
      blockchainVerified: false
    });

    await newBatch.save();

    res.status(201).json({
      success: true,
      message: 'Batch created successfully',
      data: newBatch
    });

  } catch (error) {
    console.error('❌ Batch creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating batch',
      error: error.message
    });
  }
};

// 🆕 NEW FUNCTION: Get All Manufacturers
export const getAllManufacturers = async (req, res) => {
  try {
    const manufacturers = await Manufacturer.find({ isActive: true });

    res.json({
      success: true,
      data: manufacturers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching manufacturers',
      error: error.message
    });
  }
};


// import Batch from '../models/Batch.js';

// const dummyManufactured = [
//   {
//     batchNo: "M1001",
//     name: "Ciprofloxacin 500mg",
//     manufactureDate: "2025-01-20",
//     expiry: "2027-01-20",
//     formulation: "Tablet",
//     manufacturer: "MediLife Labs",
//     status: "manufactured",
//     quantity: 5000
//   },
//   {
//     batchNo: "M1002",
//     name: "Ibuprofen 200mg",
//     manufactureDate: "2025-02-14",
//     expiry: "2027-02-14",
//     formulation: "Capsule",
//     manufacturer: "PharmaNext",
//     status: "manufactured",
//     quantity: 3000
//   }
// ];

// export const getManufacturerBatches = async (req, res) => {
//   try {
//     const batches = await Batch.find({ status: "manufactured" });

//     if (batches.length === 0) {
//       console.log("⚠️ No manufactured batches found, returning dummy data.");
//       return res.json(dummyManufactured);
//     }

//     console.log("✅ Returning manufacturer batches from MongoDB.");
//     res.json(batches);
//   } catch (error) {
//     res.status(500).json({ message: "Error fetching manufacturer batches", error: error.message });
//   }
// };