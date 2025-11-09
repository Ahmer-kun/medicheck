import PharmacyMedicine from "../models/PharmacyMedicine.js";
import PharmacyCompany from "../models/PharmacyCompany.js";
import Batch from "../models/Batch.js";
import mongoose from "mongoose";

/* --------------------------------------------
   ➕ Add Medicine to Specific Pharmacy Company
-------------------------------------------- */
export const addPharmacyMedicine = async (req, res) => {
  try {
    const {
      name,
      batchNo,
      medicineName,
      manufactureDate,
      expiryDate,
      formulation,
      quantity,
      manufacturer,
      pharmacyCompanyId,
      status = 'Active'
    } = req.body;

    console.log("📦 Adding medicine to pharmacy company:", { name, batchNo, pharmacyCompanyId });

    // Validate required fields
    if (!name || !batchNo || !medicineName || !manufactureDate || !expiryDate || !formulation || !quantity || !manufacturer || !pharmacyCompanyId) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided"
      });
    }

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(pharmacyCompanyId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid pharmacy company ID"
      });
    }

    // Verify pharmacy company exists
    const pharmacyCompany = await PharmacyCompany.findById(pharmacyCompanyId);
    if (!pharmacyCompany) {
      return res.status(404).json({
        success: false,
        message: "Pharmacy company not found"
      });
    }

    // Check if batch number already exists for this pharmacy company
    const existingMedicine = await PharmacyMedicine.findOne({
      batchNo: batchNo.trim(),
      pharmacyCompany: pharmacyCompanyId
    });
    
    if (existingMedicine) {
      return res.status(400).json({
        success: false,
        message: "Medicine with this batch number already exists in this pharmacy"
      });
    }

    // Create in PharmacyMedicine collection
    const pharmacyMedicine = new PharmacyMedicine({
      name: name.trim(),
      batchNo: batchNo.trim(),
      medicineName: (medicineName || name).trim(),
      manufactureDate: new Date(manufactureDate),
      expiryDate: new Date(expiryDate),
      formulation: formulation.trim(),
      quantity: parseInt(quantity),
      manufacturer: manufacturer.trim(),
      pharmacyCompany: pharmacyCompanyId,
      pharmacyName: pharmacyCompany.name,
      status: status,
      blockchainVerified: false
    });

    // Also create in main Batch collection for consistency and verification
    const batch = new Batch({
      batchNo: batchNo.trim(),
      name: name.trim(),
      medicineName: (medicineName || name).trim(),
      manufactureDate: new Date(manufactureDate),
      expiry: new Date(expiryDate),
      formulation: formulation.trim(),
      manufacturer: manufacturer.trim(),
      pharmacy: pharmacyCompany.name,
      quantity: parseInt(quantity),
      status: 'active',
      blockchainVerified: false
    });

    // Save both documents
    await Promise.all([pharmacyMedicine.save(), batch.save()]);

    console.log("✅ Medicine added successfully to pharmacy:", pharmacyCompany.name);

    res.status(201).json({
      success: true,
      message: "Medicine added successfully",
      data: pharmacyMedicine
    });

  } catch (error) {
    console.error("❌ Error adding pharmacy medicine:", error.message);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Medicine with this batch number already exists in this pharmacy"
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Error adding medicine",
      error: error.message
    });
  }
};

/* --------------------------------------------
   📋 Get All Medicines for a Pharmacy Company
-------------------------------------------- */
export const getPharmacyMedicines = async (req, res) => {
  try {
    const { pharmacyCompanyId } = req.params;

    let medicines;
    if (pharmacyCompanyId) {
      // Validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(pharmacyCompanyId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid pharmacy company ID"
        });
      }

      // Get medicines for specific pharmacy company
      medicines = await PharmacyMedicine.find({ pharmacyCompany: pharmacyCompanyId })
        .sort({ createdAt: -1 })
        .populate('pharmacyCompany', 'name licenseNumber contact');
    } else {
      // Get all medicines across all pharmacies
      medicines = await PharmacyMedicine.find()
        .sort({ createdAt: -1 })
        .populate('pharmacyCompany', 'name licenseNumber contact');
    }

    console.log(`✅ Fetched ${medicines.length} pharmacy medicines`);
    
    res.json({
      success: true,
      data: medicines
    });
  } catch (error) {
    console.error("❌ Error fetching pharmacy medicines:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching medicines",
      error: error.message
    });
  }
};

/* --------------------------------------------
   📋 Get All Medicines (All Pharmacies)
-------------------------------------------- */
export const getAllPharmacyMedicines = async (req, res) => {
  try {
    const medicines = await PharmacyMedicine.find()
      .sort({ createdAt: -1 })
      .populate('pharmacyCompany', 'name licenseNumber contact manager');
    
    console.log(`✅ Fetched ${medicines.length} medicines from all pharmacies`);
    
    res.json({
      success: true,
      data: medicines
    });
  } catch (error) {
    console.error("❌ Error fetching all pharmacy medicines:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching medicines",
      error: error.message
    });
  }
};

/* --------------------------------------------
   ✏️ Update Pharmacy Medicine Status
-------------------------------------------- */
export const updatePharmacyMedicine = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, blockchainVerified } = req.body;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid medicine ID"
      });
    }

    const updatedMedicine = await PharmacyMedicine.findByIdAndUpdate(
      id,
      { status, blockchainVerified },
      { new: true }
    ).populate('pharmacyCompany', 'name');

    if (!updatedMedicine) {
      return res.status(404).json({
        success: false,
        message: "Medicine not found"
      });
    }

    // Also update in Batch collection if exists
    await Batch.findOneAndUpdate(
      { batchNo: updatedMedicine.batchNo },
      { 
        status: status.toLowerCase(),
        blockchainVerified 
      }
    );

    res.json({
      success: true,
      message: "Medicine updated successfully",
      data: updatedMedicine
    });
  } catch (error) {
    console.error("❌ Error updating pharmacy medicine:", error);
    res.status(500).json({
      success: false,
      message: "Error updating medicine",
      error: error.message
    });
  }
};

/* --------------------------------------------
   🔍 Verify Pharmacy Medicine
-------------------------------------------- */
export const verifyPharmacyMedicine = async (req, res) => {
  try {
    const { batchNo } = req.params;

    const medicine = await PharmacyMedicine.findOne({ batchNo })
      .populate('pharmacyCompany', 'name licenseNumber contact');

    if (!medicine) {
      return res.status(404).json({
        success: false,
        exists: false,
        message: "Medicine not found in pharmacy database"
      });
    }

    const today = new Date();
    const expiryDate = new Date(medicine.expiryDate);
    const isExpired = expiryDate < today;

    res.json({
      success: true,
      exists: true,
      verified: true,
      authentic: !isExpired,
      message: isExpired ? 
        "❌ This batch is expired. Do not use this medicine." : 
        "✅ This medicine is authentic and safe to use.",
      batchNo: medicine.batchNo,
      name: medicine.name,
      medicineName: medicine.medicineName,
      formulation: medicine.formulation,
      expiry: medicine.expiryDate,
      manufacturer: medicine.manufacturer,
      pharmacy: medicine.pharmacyName,
      pharmacyCompany: medicine.pharmacyCompany,
      status: isExpired ? 'Expired' : medicine.status,
      source: 'pharmacy',
      blockchainVerified: medicine.blockchainVerified
    });

  } catch (error) {
    console.error("❌ Error verifying pharmacy medicine:", error);
    res.status(500).json({
      success: false,
      message: "Error verifying medicine",
      error: error.message
    });
  }
};

/* --------------------------------------------
   🗑️ Delete Pharmacy Medicine
-------------------------------------------- */
export const deletePharmacyMedicine = async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`🗑️ Deleting pharmacy medicine with ID: ${id}`);

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid medicine ID"
      });
    }

    // Find and delete the medicine
    const deletedMedicine = await PharmacyMedicine.findByIdAndDelete(id);

    if (!deletedMedicine) {
      return res.status(404).json({
        success: false,
        message: "Medicine not found"
      });
    }

    // Also delete from Batch collection if it exists there
    try {
      await Batch.findOneAndDelete({ batchNo: deletedMedicine.batchNo });
      console.log(`✅ Also removed from Batch collection: ${deletedMedicine.batchNo}`);
    } catch (batchError) {
      console.log("ℹ️ No matching batch found to delete, or error deleting batch:", batchError.message);
    }

    console.log(`✅ Successfully deleted medicine: ${deletedMedicine.name} (${deletedMedicine.batchNo})`);

    res.json({
      success: true,
      message: "Medicine deleted successfully",
      data: {
        id: deletedMedicine._id,
        name: deletedMedicine.name,
        batchNo: deletedMedicine.batchNo
      }
    });

  } catch (error) {
    console.error("❌ Error deleting pharmacy medicine:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting medicine",
      error: error.message
    });
  }
};

/* --------------------------------------------
   🧹 Initialize Dummy Pharmacy Medicines
-------------------------------------------- */
export const initializePharmacyMedicines = async () => {
  try {
    const count = await PharmacyMedicine.countDocuments();
    if (count > 0) {
      console.log("ℹ️ Pharmacy medicines already exist, skipping initialization.");
      return;
    }

    // Get existing pharmacy companies
    const pharmacyCompanies = await PharmacyCompany.find({ isActive: true });
    if (pharmacyCompanies.length === 0) {
      console.log("⚠️ No pharmacy companies found for medicine initialization");
      return;
    }

    const dummyMedicines = [
      {
        name: "Paracetamol 500mg",
        batchNo: "PHARM-MED-001",
        medicineName: "Paracetamol",
        manufactureDate: new Date("2024-01-15"),
        expiryDate: new Date("2025-12-31"),
        formulation: "Tablets",
        quantity: 1000,
        manufacturer: "MediLife Labs",
        status: "Active",
        blockchainVerified: true
      },
      {
        name: "Amoxicillin 250mg",
        batchNo: "PHARM-MED-002",
        medicineName: "Amoxicillin",
        manufactureDate: new Date("2024-02-01"),
        expiryDate: new Date("2026-03-15"),
        formulation: "Capsules",
        quantity: 500,
        manufacturer: "BioHeal Pharma",
        status: "Active",
        blockchainVerified: true
      },
      {
        name: "Vitamin C 1000mg",
        batchNo: "PHARM-MED-003",
        medicineName: "Ascorbic Acid",
        manufactureDate: new Date("2024-03-10"),
        expiryDate: new Date("2025-11-30"),
        formulation: "Chewable Tablets",
        quantity: 2000,
        manufacturer: "NutraLife Labs",
        status: "In Transit",
        blockchainVerified: false
      }
    ];

    // Distribute medicines among pharmacy companies
    const pharmacyMedicines = dummyMedicines.map((medicine, index) => ({
      ...medicine,
      pharmacyCompany: pharmacyCompanies[index % pharmacyCompanies.length]._id,
      pharmacyName: pharmacyCompanies[index % pharmacyCompanies.length].name
    }));

    await PharmacyMedicine.insertMany(pharmacyMedicines);
    
    // Also add to Batch collection
    const batchData = pharmacyMedicines.map(med => ({
      batchNo: med.batchNo,
      name: med.name,
      medicineName: med.medicineName,
      manufactureDate: med.manufactureDate,
      expiry: med.expiryDate,
      formulation: med.formulation,
      manufacturer: med.manufacturer,
      pharmacy: med.pharmacyName,
      quantity: med.quantity,
      status: 'active',
      blockchainVerified: med.blockchainVerified
    }));
    
    await Batch.insertMany(batchData);
    
    console.log("✅ Dummy pharmacy medicines initialized successfully.");
  } catch (error) {
    console.error("❌ Error initializing pharmacy medicines:", error.message);
  }
};





// import PharmacyMedicine from "../models/PharmacyMedicine.js";
// import PharmacyCompany from "../models/PharmacyCompany.js";
// import Batch from "../models/Batch.js";
// import mongoose from "mongoose";

// /* --------------------------------------------
//    ➕ Add Medicine to Specific Pharmacy Company
// -------------------------------------------- */
// export const addPharmacyMedicine = async (req, res) => {
//   try {
//     const {
//       name,
//       batchNo,
//       medicineName,
//       manufactureDate,
//       expiryDate,
//       formulation,
//       quantity,
//       manufacturer,
//       pharmacyCompanyId,
//       status = 'Active'
//     } = req.body;

//     console.log("📦 Adding medicine to pharmacy company:", { name, batchNo, pharmacyCompanyId });

//     // Validate required fields
//     if (!name || !batchNo || !medicineName || !manufactureDate || !expiryDate || !formulation || !quantity || !manufacturer || !pharmacyCompanyId) {
//       return res.status(400).json({
//         success: false,
//         message: "All required fields must be provided"
//       });
//     }

//     // Validate ObjectId
//     if (!mongoose.Types.ObjectId.isValid(pharmacyCompanyId)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid pharmacy company ID"
//       });
//     }

//     // Verify pharmacy company exists
//     const pharmacyCompany = await PharmacyCompany.findById(pharmacyCompanyId);
//     if (!pharmacyCompany) {
//       return res.status(404).json({
//         success: false,
//         message: "Pharmacy company not found"
//       });
//     }

//     // Check if batch number already exists for this pharmacy company
//     const existingMedicine = await PharmacyMedicine.findOne({
//       batchNo: batchNo.trim(),
//       pharmacyCompany: pharmacyCompanyId
//     });
    
//     if (existingMedicine) {
//       return res.status(400).json({
//         success: false,
//         message: "Medicine with this batch number already exists in this pharmacy"
//       });
//     }

//     // Create in PharmacyMedicine collection
//     const pharmacyMedicine = new PharmacyMedicine({
//       name: name.trim(),
//       batchNo: batchNo.trim(),
//       medicineName: (medicineName || name).trim(),
//       manufactureDate: new Date(manufactureDate),
//       expiryDate: new Date(expiryDate),
//       formulation: formulation.trim(),
//       quantity: parseInt(quantity),
//       manufacturer: manufacturer.trim(),
//       pharmacyCompany: pharmacyCompanyId,
//       pharmacyName: pharmacyCompany.name,
//       status: status,
//       blockchainVerified: false
//     });

//     // Also create in main Batch collection for consistency and verification
//     const batch = new Batch({
//       batchNo: batchNo.trim(),
//       name: name.trim(),
//       medicineName: (medicineName || name).trim(),
//       manufactureDate: new Date(manufactureDate),
//       expiry: new Date(expiryDate),
//       formulation: formulation.trim(),
//       manufacturer: manufacturer.trim(),
//       pharmacy: pharmacyCompany.name,
//       quantity: parseInt(quantity),
//       status: 'active',
//       blockchainVerified: false
//     });

//     // Save both documents
//     await Promise.all([pharmacyMedicine.save(), batch.save()]);

//     console.log("✅ Medicine added successfully to pharmacy:", pharmacyCompany.name);

//     res.status(201).json({
//       success: true,
//       message: "Medicine added successfully",
//       data: pharmacyMedicine
//     });

//   } catch (error) {
//     console.error("❌ Error adding pharmacy medicine:", error.message);
    
//     // Handle duplicate key errors
//     if (error.code === 11000) {
//       return res.status(400).json({
//         success: false,
//         message: "Medicine with this batch number already exists in this pharmacy"
//       });
//     }
    
//     res.status(500).json({
//       success: false,
//       message: "Error adding medicine",
//       error: error.message
//     });
//   }
// };

// /* --------------------------------------------
//    📋 Get All Medicines for a Pharmacy Company
// -------------------------------------------- */
// export const getPharmacyMedicines = async (req, res) => {
//   try {
//     const { pharmacyCompanyId } = req.params;

//     let medicines;
//     if (pharmacyCompanyId) {
//       // Validate ObjectId
//       if (!mongoose.Types.ObjectId.isValid(pharmacyCompanyId)) {
//         return res.status(400).json({
//           success: false,
//           message: "Invalid pharmacy company ID"
//         });
//       }

//       // Get medicines for specific pharmacy company
//       medicines = await PharmacyMedicine.find({ pharmacyCompany: pharmacyCompanyId })
//         .sort({ createdAt: -1 })
//         .populate('pharmacyCompany', 'name licenseNumber contact');
//     } else {
//       // Get all medicines across all pharmacies
//       medicines = await PharmacyMedicine.find()
//         .sort({ createdAt: -1 })
//         .populate('pharmacyCompany', 'name licenseNumber contact');
//     }

//     console.log(`✅ Fetched ${medicines.length} pharmacy medicines`);
    
//     res.json({
//       success: true,
//       data: medicines
//     });
//   } catch (error) {
//     console.error("❌ Error fetching pharmacy medicines:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error fetching medicines",
//       error: error.message
//     });
//   }
// };

// /* --------------------------------------------
//    📋 Get All Medicines (All Pharmacies)
// -------------------------------------------- */
// export const getAllPharmacyMedicines = async (req, res) => {
//   try {
//     const medicines = await PharmacyMedicine.find()
//       .sort({ createdAt: -1 })
//       .populate('pharmacyCompany', 'name licenseNumber contact manager');
    
//     console.log(`✅ Fetched ${medicines.length} medicines from all pharmacies`);
    
//     res.json({
//       success: true,
//       data: medicines
//     });
//   } catch (error) {
//     console.error("❌ Error fetching all pharmacy medicines:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error fetching medicines",
//       error: error.message
//     });
//   }
// };

// /* --------------------------------------------
//    ✏️ Update Pharmacy Medicine Status
// -------------------------------------------- */
// export const updatePharmacyMedicine = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { status, blockchainVerified } = req.body;

//     // Validate ObjectId
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid medicine ID"
//       });
//     }

//     const updatedMedicine = await PharmacyMedicine.findByIdAndUpdate(
//       id,
//       { status, blockchainVerified },
//       { new: true }
//     ).populate('pharmacyCompany', 'name');

//     if (!updatedMedicine) {
//       return res.status(404).json({
//         success: false,
//         message: "Medicine not found"
//       });
//     }

//     // Also update in Batch collection if exists
//     await Batch.findOneAndUpdate(
//       { batchNo: updatedMedicine.batchNo },
//       { 
//         status: status.toLowerCase(),
//         blockchainVerified 
//       }
//     );

//     res.json({
//       success: true,
//       message: "Medicine updated successfully",
//       data: updatedMedicine
//     });
//   } catch (error) {
//     console.error("❌ Error updating pharmacy medicine:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error updating medicine",
//       error: error.message
//     });
//   }
// };

// /* --------------------------------------------
//    🔍 Verify Pharmacy Medicine
// -------------------------------------------- */
// export const verifyPharmacyMedicine = async (req, res) => {
//   try {
//     const { batchNo } = req.params;

//     const medicine = await PharmacyMedicine.findOne({ batchNo })
//       .populate('pharmacyCompany', 'name licenseNumber contact');

//     if (!medicine) {
//       return res.status(404).json({
//         success: false,
//         exists: false,
//         message: "Medicine not found in pharmacy database"
//       });
//     }

//     const today = new Date();
//     const expiryDate = new Date(medicine.expiryDate);
//     const isExpired = expiryDate < today;

//     res.json({
//       success: true,
//       exists: true,
//       verified: true,
//       authentic: !isExpired,
//       message: isExpired ? 
//         "❌ This batch is expired. Do not use this medicine." : 
//         "✅ This medicine is authentic and safe to use.",
//       batchNo: medicine.batchNo,
//       name: medicine.name,
//       medicineName: medicine.medicineName,
//       formulation: medicine.formulation,
//       expiry: medicine.expiryDate,
//       manufacturer: medicine.manufacturer,
//       pharmacy: medicine.pharmacyName,
//       pharmacyCompany: medicine.pharmacyCompany,
//       status: isExpired ? 'Expired' : medicine.status,
//       source: 'pharmacy',
//       blockchainVerified: medicine.blockchainVerified
//     });

//   } catch (error) {
//     console.error("❌ Error verifying pharmacy medicine:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error verifying medicine",
//       error: error.message
//     });
//   }
// };

// /* --------------------------------------------
//    🧹 Initialize Dummy Pharmacy Medicines
// -------------------------------------------- */
// export const initializePharmacyMedicines = async () => {
//   try {
//     const count = await PharmacyMedicine.countDocuments();
//     if (count > 0) {
//       console.log("ℹ️ Pharmacy medicines already exist, skipping initialization.");
//       return;
//     }

//     // Get existing pharmacy companies
//     const pharmacyCompanies = await PharmacyCompany.find({ isActive: true });
//     if (pharmacyCompanies.length === 0) {
//       console.log("⚠️ No pharmacy companies found for medicine initialization");
//       return;
//     }

//     const dummyMedicines = [
//       {
//         name: "Paracetamol 500mg",
//         batchNo: "PHARM-MED-001",
//         medicineName: "Paracetamol",
//         manufactureDate: new Date("2024-01-15"),
//         expiryDate: new Date("2025-12-31"),
//         formulation: "Tablets",
//         quantity: 1000,
//         manufacturer: "MediLife Labs",
//         status: "Active",
//         blockchainVerified: true
//       },
//       {
//         name: "Amoxicillin 250mg",
//         batchNo: "PHARM-MED-002",
//         medicineName: "Amoxicillin",
//         manufactureDate: new Date("2024-02-01"),
//         expiryDate: new Date("2026-03-15"),
//         formulation: "Capsules",
//         quantity: 500,
//         manufacturer: "BioHeal Pharma",
//         status: "Active",
//         blockchainVerified: true
//       },
//       {
//         name: "Vitamin C 1000mg",
//         batchNo: "PHARM-MED-003",
//         medicineName: "Ascorbic Acid",
//         manufactureDate: new Date("2024-03-10"),
//         expiryDate: new Date("2025-11-30"),
//         formulation: "Chewable Tablets",
//         quantity: 2000,
//         manufacturer: "NutraLife Labs",
//         status: "In Transit",
//         blockchainVerified: false
//       }
//     ];

//     // Distribute medicines among pharmacy companies
//     const pharmacyMedicines = dummyMedicines.map((medicine, index) => ({
//       ...medicine,
//       pharmacyCompany: pharmacyCompanies[index % pharmacyCompanies.length]._id,
//       pharmacyName: pharmacyCompanies[index % pharmacyCompanies.length].name
//     }));

//     await PharmacyMedicine.insertMany(pharmacyMedicines);
    
//     // Also add to Batch collection
//     const batchData = pharmacyMedicines.map(med => ({
//       batchNo: med.batchNo,
//       name: med.name,
//       medicineName: med.medicineName,
//       manufactureDate: med.manufactureDate,
//       expiry: med.expiryDate,
//       formulation: med.formulation,
//       manufacturer: med.manufacturer,
//       pharmacy: med.pharmacyName,
//       quantity: med.quantity,
//       status: 'active',
//       blockchainVerified: med.blockchainVerified
//     }));
    
//     await Batch.insertMany(batchData);
    
//     console.log("✅ Dummy pharmacy medicines initialized successfully.");
//   } catch (error) {
//     console.error("❌ Error initializing pharmacy medicines:", error.message);
//   }
// };









//                        iGNORE BELOW
//          6-11-25 error



// import PharmacyMedicine from "../models/PharmacyMedicine.js";
// import PharmacyCompany from "../models/PharmacyCompany.js";
// import Batch from "../models/Batch.js";

// /* --------------------------------------------
//    ➕ Add Medicine to Specific Pharmacy Company
// -------------------------------------------- */
// export const addPharmacyMedicine = async (req, res) => {
//   try {
//     const {
//       name,
//       batchNo,
//       medicineName,
//       manufactureDate,
//       expiryDate,
//       formulation,
//       quantity,
//       manufacturer,
//       pharmacyCompanyId,
//       status = 'Active'
//     } = req.body;

//     console.log("📦 Adding medicine to pharmacy company:", { name, batchNo, pharmacyCompanyId });

//     // Verify pharmacy company exists
//     const pharmacyCompany = await PharmacyCompany.findById(pharmacyCompanyId);
//     if (!pharmacyCompany) {
//       return res.status(404).json({
//         success: false,
//         message: "Pharmacy company not found"
//       });
//     }

//     // Check if batch number already exists for this pharmacy company
//     const existingMedicine = await PharmacyMedicine.findOne({
//       batchNo: batchNo.trim(),
//       pharmacyCompany: pharmacyCompanyId
//     });
    
//     if (existingMedicine) {
//       return res.status(400).json({
//         success: false,
//         message: "Medicine with this batch number already exists in this pharmacy"
//       });
//     }

//     // Create in PharmacyMedicine collection
//     const pharmacyMedicine = new PharmacyMedicine({
//       name: name.trim(),
//       batchNo: batchNo.trim(),
//       medicineName: (medicineName || name).trim(),
//       manufactureDate: new Date(manufactureDate),
//       expiryDate: new Date(expiryDate),
//       formulation: formulation.trim(),
//       quantity: parseInt(quantity),
//       manufacturer: manufacturer.trim(),
//       pharmacyCompany: pharmacyCompanyId,
//       pharmacyName: pharmacyCompany.name,
//       status: status,
//       blockchainVerified: false
//     });

//     // Also create in main Batch collection for consistency and verification
//     const batch = new Batch({
//       batchNo: batchNo.trim(),
//       name: name.trim(),
//       medicineName: (medicineName || name).trim(),
//       manufactureDate: new Date(manufactureDate),
//       expiry: new Date(expiryDate),
//       formulation: formulation.trim(),
//       manufacturer: manufacturer.trim(),
//       pharmacy: pharmacyCompany.name,
//       quantity: parseInt(quantity),
//       status: 'active',
//       blockchainVerified: false
//     });

//     // Save both documents
//     await Promise.all([pharmacyMedicine.save(), batch.save()]);

//     console.log("✅ Medicine added successfully to pharmacy:", pharmacyCompany.name);

//     res.status(201).json({
//       success: true,
//       message: "Medicine added successfully",
//       data: pharmacyMedicine
//     });

//   } catch (error) {
//     console.error("❌ Error adding pharmacy medicine:", error.message);
//     res.status(500).json({
//       success: false,
//       message: "Error adding medicine",
//       error: error.message
//     });
//   }
// };

// /* --------------------------------------------
//    📋 Get All Medicines for a Pharmacy Company
// -------------------------------------------- */
// export const getPharmacyMedicines = async (req, res) => {
//   try {
//     const { pharmacyCompanyId } = req.params;

//     let medicines;
//     if (pharmacyCompanyId) {
//       // Get medicines for specific pharmacy company
//       medicines = await PharmacyMedicine.find({ pharmacyCompany: pharmacyCompanyId })
//         .sort({ createdAt: -1 })
//         .populate('pharmacyCompany', 'name licenseNumber contact');
//     } else {
//       // Get all medicines across all pharmacies
//       medicines = await PharmacyMedicine.find()
//         .sort({ createdAt: -1 })
//         .populate('pharmacyCompany', 'name licenseNumber contact');
//     }

//     console.log(`✅ Fetched ${medicines.length} pharmacy medicines`);
    
//     res.json({
//       success: true,
//       data: medicines
//     });
//   } catch (error) {
//     console.error("❌ Error fetching pharmacy medicines:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error fetching medicines",
//       error: error.message
//     });
//   }
// };

// /* --------------------------------------------
//    📋 Get All Medicines (All Pharmacies)
// -------------------------------------------- */
// export const getAllPharmacyMedicines = async (req, res) => {
//   try {
//     const medicines = await PharmacyMedicine.find()
//       .sort({ createdAt: -1 })
//       .populate('pharmacyCompany', 'name licenseNumber contact manager');
    
//     console.log(`✅ Fetched ${medicines.length} medicines from all pharmacies`);
    
//     res.json({
//       success: true,
//       data: medicines
//     });
//   } catch (error) {
//     console.error("❌ Error fetching all pharmacy medicines:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error fetching medicines",
//       error: error.message
//     });
//   }
// };

// /* --------------------------------------------
//    ✏️ Update Pharmacy Medicine Status
// -------------------------------------------- */
// export const updatePharmacyMedicine = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { status, blockchainVerified } = req.body;

//     const updatedMedicine = await PharmacyMedicine.findByIdAndUpdate(
//       id,
//       { status, blockchainVerified },
//       { new: true }
//     ).populate('pharmacyCompany', 'name');

//     if (!updatedMedicine) {
//       return res.status(404).json({
//         success: false,
//         message: "Medicine not found"
//       });
//     }

//     // Also update in Batch collection if exists
//     await Batch.findOneAndUpdate(
//       { batchNo: updatedMedicine.batchNo },
//       { 
//         status: status.toLowerCase(),
//         blockchainVerified 
//       }
//     );

//     res.json({
//       success: true,
//       message: "Medicine updated successfully",
//       data: updatedMedicine
//     });
//   } catch (error) {
//     console.error("❌ Error updating pharmacy medicine:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error updating medicine",
//       error: error.message
//     });
//   }
// };

// /* --------------------------------------------
//    🔍 Verify Pharmacy Medicine
// -------------------------------------------- */
// export const verifyPharmacyMedicine = async (req, res) => {
//   try {
//     const { batchNo } = req.params;

//     const medicine = await PharmacyMedicine.findOne({ batchNo })
//       .populate('pharmacyCompany', 'name licenseNumber contact');

//     if (!medicine) {
//       return res.status(404).json({
//         success: false,
//         exists: false,
//         message: "Medicine not found in pharmacy database"
//       });
//     }

//     const today = new Date();
//     const expiryDate = new Date(medicine.expiryDate);
//     const isExpired = expiryDate < today;

//     res.json({
//       success: true,
//       exists: true,
//       verified: true,
//       authentic: !isExpired,
//       message: isExpired ? 
//         "❌ This batch is expired. Do not use this medicine." : 
//         "✅ This medicine is authentic and safe to use.",
//       batchNo: medicine.batchNo,
//       name: medicine.name,
//       medicineName: medicine.medicineName,
//       formulation: medicine.formulation,
//       expiry: medicine.expiryDate,
//       manufacturer: medicine.manufacturer,
//       pharmacy: medicine.pharmacyName,
//       pharmacyCompany: medicine.pharmacyCompany,
//       status: isExpired ? 'Expired' : medicine.status,
//       source: 'pharmacy',
//       blockchainVerified: medicine.blockchainVerified
//     });

//   } catch (error) {
//     console.error("❌ Error verifying pharmacy medicine:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error verifying medicine",
//       error: error.message
//     });
//   }
// };

// /* --------------------------------------------
//    🧹 Initialize Dummy Pharmacy Medicines
// -------------------------------------------- */
// export const initializePharmacyMedicines = async () => {
//   try {
//     const count = await PharmacyMedicine.countDocuments();
//     if (count > 0) {
//       console.log("ℹ️ Pharmacy medicines already exist, skipping initialization.");
//       return;
//     }

//     // Get existing pharmacy companies
//     const pharmacyCompanies = await PharmacyCompany.find({ isActive: true });
//     if (pharmacyCompanies.length === 0) {
//       console.log("⚠️ No pharmacy companies found for medicine initialization");
//       return;
//     }

//     const dummyMedicines = [
//       {
//         name: "Paracetamol 500mg",
//         batchNo: "PHARM-MED-001",
//         medicineName: "Paracetamol",
//         manufactureDate: new Date("2024-01-15"),
//         expiryDate: new Date("2025-12-31"),
//         formulation: "Tablets",
//         quantity: 1000,
//         manufacturer: "MediLife Labs",
//         status: "Active",
//         blockchainVerified: true
//       },
//       {
//         name: "Amoxicillin 250mg",
//         batchNo: "PHARM-MED-002",
//         medicineName: "Amoxicillin",
//         manufactureDate: new Date("2024-02-01"),
//         expiryDate: new Date("2026-03-15"),
//         formulation: "Capsules",
//         quantity: 500,
//         manufacturer: "BioHeal Pharma",
//         status: "Active",
//         blockchainVerified: true
//       },
//       {
//         name: "Vitamin C 1000mg",
//         batchNo: "PHARM-MED-003",
//         medicineName: "Ascorbic Acid",
//         manufactureDate: new Date("2024-03-10"),
//         expiryDate: new Date("2025-11-30"),
//         formulation: "Chewable Tablets",
//         quantity: 2000,
//         manufacturer: "NutraLife Labs",
//         status: "In Transit",
//         blockchainVerified: false
//       }
//     ];

//     // Distribute medicines among pharmacy companies
//     const pharmacyMedicines = dummyMedicines.map((medicine, index) => ({
//       ...medicine,
//       pharmacyCompany: pharmacyCompanies[index % pharmacyCompanies.length]._id,
//       pharmacyName: pharmacyCompanies[index % pharmacyCompanies.length].name
//     }));

//     await PharmacyMedicine.insertMany(pharmacyMedicines);
    
//     // Also add to Batch collection
//     const batchData = pharmacyMedicines.map(med => ({
//       batchNo: med.batchNo,
//       name: med.name,
//       medicineName: med.medicineName,
//       manufactureDate: med.manufactureDate,
//       expiry: med.expiryDate,
//       formulation: med.formulation,
//       manufacturer: med.manufacturer,
//       pharmacy: med.pharmacyName,
//       quantity: med.quantity,
//       status: 'active',
//       blockchainVerified: med.blockchainVerified
//     }));
    
//     await Batch.insertMany(batchData);
    
//     console.log("✅ Dummy pharmacy medicines initialized successfully.");
//   } catch (error) {
//     console.error("❌ Error initializing pharmacy medicines:", error.message);
//   }
// };