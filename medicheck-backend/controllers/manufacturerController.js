import Manufacturer from '../models/Manufacturer.js';
import Batch from '../models/Batch.js';
import BlockchainService from '../services/blockchainService.js';


// ✅ Get All Manufacturers
export const getAllManufacturers = async (req, res) => {
  try {
    console.log("🏭 Fetching all manufacturers...");
    
    const manufacturers = await Manufacturer.find({ isActive: true })
      .sort({ companyName: 1 })
      .select('companyName licenseNumber address contactEmail phone specialties')
      .lean();

    console.log(`✅ Found ${manufacturers.length} manufacturers`);
    
    res.json({
      success: true,
      data: manufacturers
    });
  } catch (error) {
    console.error("❌ Error fetching manufacturers:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching manufacturers",
      error: error.message
    });
  }
};

// ✅ Register New Manufacturer
export const registerManufacturer = async (req, res) => {
  try {
    const { companyName, licenseNumber, address, contactEmail, phone, specialties } = req.body;

    console.log("🏭 Registering manufacturer:", { companyName, licenseNumber });

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
      companyName: companyName.trim(),
      licenseNumber: licenseNumber.trim(),
      address: {
        street: address?.street?.trim() || '',
        city: address?.city?.trim() || '',
        state: address?.state?.trim() || '',
        country: address?.country?.trim() || 'Pakistan',
        zipCode: address?.zipCode?.trim() || ''
      },
      contactEmail: contactEmail.trim().toLowerCase(),
      phone: phone?.trim() || '',
      specialties: specialties || [],
      isActive: true
    });

    await manufacturer.save();

    console.log("✅ Manufacturer registered successfully:", companyName);

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

// ✅ Create Manufacturer Batch
export const createManufacturerBatch = async (req, res) => {
  try {
    const batchData = req.body;
    const user = req.user;

    console.log("🏭 Creating manufacturer batch with blockchain...");

    // 1. Save to database first
    const batch = new Batch({
      ...batchData,
      manufacturer: user.name || 'Unknown Manufacturer',
      status: 'manufactured'
    });
    await batch.save();

    let blockchainResult = null;
    let blockchainError = null;

    // 2. Try to register on blockchain
    try {
      blockchainResult = await BlockchainService.registerMedicineOnBlockchain({
        ...batchData,
        manufacturer: user.blockchainAddress || '0x0000000000000000000000000000000000000000'
      });

      // 3. Update database with blockchain info
      batch.blockchainVerified = true;
      batch.blockchainTransactionHash = blockchainResult.transactionHash;
      batch.blockchainBlockNumber = blockchainResult.blockNumber;
      await batch.save();

      console.log(`✅ Batch ${batch.batchNo} registered on blockchain:`, blockchainResult.transactionHash);

    } catch (error) {
      blockchainError = error.message;
      
      // If blockchain fails, still save to database but mark as not verified
      batch.blockchainVerified = false;
      batch.blockchainError = blockchainError;
      await batch.save();

      console.warn("⚠️ Batch saved to database but blockchain registration failed:", blockchainError);
    }

    const response = {
      success: true,
      message: blockchainResult ? 
        "Batch created and registered on blockchain" : 
        "Batch created but blockchain registration failed",
      data: batch
    };

    if (blockchainResult) {
      response.blockchain = blockchainResult;
    } else {
      response.warning = "Blockchain registration failed, medicine not verified on chain";
      response.blockchainError = blockchainError;
    }

    res.status(201).json(response);

  } catch (error) {
    console.error("❌ Error creating manufacturer batch:", error);
    res.status(500).json({
      success: false,
      message: "Error creating batch",
      error: error.message
    });
  }
};

// ✅ Get Manufacturer Batches
export const getManufacturerBatches = async (req, res) => {
  try {
    const batches = await Batch.find({ status: "manufactured" })
      .sort({ createdAt: -1 })
      .lean();

    console.log(`✅ Found ${batches.length} manufacturer batches`);
    
    res.json({
      success: true,
      data: batches
    });
  } catch (error) {
    console.error("❌ Error fetching manufacturer batches:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching manufacturer batches",
      error: error.message
    });
  }
};

// ✅ Initialize Dummy Manufacturers
export const initializeManufacturers = async () => {
  try {
    const count = await Manufacturer.countDocuments({ isActive: true });
    if (count > 0) {
      console.log("ℹ️ Manufacturers already exist, skipping initialization.");
      return;
    }

    const dummyManufacturers = [
      {
        companyName: "MediLife Labs",
        licenseNumber: "MANU-PK-001",
        address: {
          street: "123 Industrial Zone",
          city: "Karachi",
          state: "Sindh",
          country: "Pakistan",
          zipCode: "75500"
        },
        contactEmail: "info@medilifelabs.com",
        phone: "+92-21-34567890",
        specialties: ["Tablets", "Capsules", "Injections"]
      },
      {
        companyName: "BioHeal Pharma",
        licenseNumber: "MANU-PK-002",
        address: {
          street: "456 Science Park",
          city: "Lahore",
          state: "Punjab",
          country: "Pakistan",
          zipCode: "54000"
        },
        contactEmail: "contact@biohealpharma.com",
        phone: "+92-42-37654321",
        specialties: ["Antibiotics", "Cardiac Drugs", "Diabetes Medicine"]
      },
      {
        companyName: "PharmaCare Solutions",
        licenseNumber: "MANU-PK-003",
        address: {
          street: "789 Tech Boulevard",
          city: "Islamabad",
          state: "Federal",
          country: "Pakistan",
          zipCode: "44000"
        },
        contactEmail: "admin@pharmacaresolutions.com",
        phone: "+92-51-23456789",
        specialties: ["Generic Medicines", "OTC Drugs", "Healthcare Products"]
      },
      {
        companyName: "NutraLife Labs",
        licenseNumber: "MANU-PK-004",
        address: {
          street: "321 Health Street",
          city: "Rawalpindi",
          state: "Punjab",
          country: "Pakistan",
          zipCode: "46000"
        },
        contactEmail: "care@nutralifelabs.com",
        phone: "+92-51-76543210",
        specialties: ["Vitamins", "Supplements", "Wellness Products"]
      }
    ];

    await Manufacturer.insertMany(dummyManufacturers);
    console.log("✅ Dummy manufacturers initialized successfully.");
  } catch (error) {
    console.error("❌ Error initializing manufacturers:", error.message);
  }
};



// import Batch from '../models/Batch.js';
// import Manufacturer from '../models/Manufacturer.js'; // Add this import

// const dummyManufactured = [
//   // ... your existing dummy data stays the same
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

// // ✅ EXISTING FUNCTION - KEEP THIS
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

// // 🆕 NEW FUNCTION: Register Manufacturer
// export const registerManufacturer = async (req, res) => {
//   try {
//     const { companyName, licenseNumber, address, contactEmail, phone, specialties } = req.body;

//     // Check if manufacturer already exists
//     const existingManufacturer = await Manufacturer.findOne({ 
//       $or: [{ companyName }, { licenseNumber }] 
//     });

//     if (existingManufacturer) {
//       return res.status(400).json({
//         success: false,
//         message: 'Manufacturer already exists with this name or license number'
//       });
//     }

//     // Create new manufacturer
//     const manufacturer = new Manufacturer({
//       companyName,
//       licenseNumber,
//       address,
//       contactEmail,
//       phone,
//       specialties: specialties || [],
//       isActive: true
//     });

//     await manufacturer.save();

//     res.status(201).json({
//       success: true,
//       message: 'Manufacturer registered successfully',
//       data: manufacturer
//     });

//   } catch (error) {
//     console.error('❌ Manufacturer registration error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error registering manufacturer',
//       error: error.message
//     });
//   }
// };

// // 🆕 NEW FUNCTION: Create Manufacturer Batch
// export const createManufacturerBatch = async (req, res) => {
//   try {
//     const {
//       batchNo,
//       name,
//       medicineName,
//       manufactureDate,
//       expiry,
//       formulation,
//       quantity,
//       manufacturer
//     } = req.body;

//     const newBatch = new Batch({
//       batchNo,
//       name,
//       medicineName,
//       manufactureDate,
//       expiry,
//       formulation,
//       manufacturer,
//       quantity,
//       status: 'manufactured', // Specific status for manufacturer-created batches
//       blockchainVerified: false
//     });

//     await newBatch.save();

//     res.status(201).json({
//       success: true,
//       message: 'Batch created successfully',
//       data: newBatch
//     });

//   } catch (error) {
//     console.error('❌ Batch creation error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error creating batch',
//       error: error.message
//     });
//   }
// };

// // 🆕 NEW FUNCTION: Get All Manufacturers
// export const getAllManufacturers = async (req, res) => {
//   try {
//     const manufacturers = await Manufacturer.find({ isActive: true });

//     res.json({
//       success: true,
//       data: manufacturers
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Error fetching manufacturers',
//       error: error.message
//     });
//   }
// };
