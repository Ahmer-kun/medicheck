// controllers/pharmacyController.js
import PharmacyMedicine from "../models/PharmacyMedicine.js";
import Batch from "../models/Batch.js";

/* --------------------------------------------
   ➕ Add Medicine to Pharmacy (Store in Both Collections)
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
      status = 'Active',
      pharmacy = 'Pharmacy'
    } = req.body;

    console.log("📦 Adding pharmacy medicine:", { name, batchNo, medicineName, manufactureDate, expiryDate, formulation, quantity, manufacturer });

    // Check if batch number already exists in either collection
    const [existingBatch, existingPharmacyMedicine] = await Promise.all([
      Batch.findOne({ batchNo }),
      PharmacyMedicine.findOne({ batchNo })
    ]);
    
    if (existingBatch || existingPharmacyMedicine) {
      return res.status(400).json({
        success: false,
        message: "Medicine with this batch number already exists"
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
      status: status,
      pharmacy: pharmacy.trim(),
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
      pharmacy: pharmacy.trim(),
      quantity: parseInt(quantity),
      status: 'active',
      blockchainVerified: false
    });

    // Save both documents
    await Promise.all([pharmacyMedicine.save(), batch.save()]);

    console.log("✅ Medicine added successfully to both collections:", batchNo);

    res.status(201).json({
      success: true,
      message: "Medicine added successfully",
      data: pharmacyMedicine
    });

  } catch (error) {
    console.error("❌ Error adding pharmacy medicine:", error.message);
    res.status(500).json({
      success: false,
      message: "Error adding medicine",
      error: error.message
    });
  }
};

/* --------------------------------------------
   📋 Get All Pharmacy Medicines
-------------------------------------------- */
export const getPharmacyMedicines = async (req, res) => {
  try {
    const medicines = await PharmacyMedicine.find().sort({ createdAt: -1 });
    
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
   ✏️ Update Pharmacy Medicine Status
-------------------------------------------- */
export const updatePharmacyMedicine = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, blockchainVerified } = req.body;

    const updatedMedicine = await PharmacyMedicine.findByIdAndUpdate(
      id,
      { status, blockchainVerified },
      { new: true }
    );

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

    const medicine = await PharmacyMedicine.findOne({ batchNo });

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
      pharmacy: medicine.pharmacy,
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
   🧹 Initialize Dummy Pharmacy Medicines (Optional)
-------------------------------------------- */
export const initializePharmacyMedicines = async () => {
  try {
    const count = await PharmacyMedicine.countDocuments();
    if (count > 0) {
      console.log("ℹ️ Pharmacy medicines already exist, skipping initialization.");
      return;
    }

    const dummyPharmacyMedicines = [
      {
        name: "Paracetamol 500mg",
        batchNo: "PHARM-001",
        medicineName: "Paracetamol",
        manufactureDate: new Date("2024-01-15"),
        expiryDate: new Date("2025-12-31"),
        formulation: "Tablets",
        quantity: 1000,
        manufacturer: "MediLife Labs",
        pharmacy: "City Pharmacy",
        status: "Active",
        blockchainVerified: true
      },
      {
        name: "Amoxicillin 250mg",
        batchNo: "PHARM-002",
        medicineName: "Amoxicillin",
        manufactureDate: new Date("2024-02-01"),
        expiryDate: new Date("2026-03-15"),
        formulation: "Capsules",
        quantity: 500,
        manufacturer: "BioHeal Pharma",
        pharmacy: "HealthPlus Pharmacy",
        status: "Active",
        blockchainVerified: true
      },
      {
        name: "Vitamin C 1000mg",
        batchNo: "PHARM-003",
        medicineName: "Ascorbic Acid",
        manufactureDate: new Date("2024-03-10"),
        expiryDate: new Date("2025-11-30"),
        formulation: "Chewable Tablets",
        quantity: 2000,
        manufacturer: "NutraLife Labs",
        pharmacy: "Wellness Pharmacy",
        status: "In Transit",
        blockchainVerified: false
      }
    ];

    await PharmacyMedicine.insertMany(dummyPharmacyMedicines);
    
    // Also add to Batch collection
    const batchData = dummyPharmacyMedicines.map(med => ({
      batchNo: med.batchNo,
      name: med.name,
      medicineName: med.medicineName,
      manufactureDate: med.manufactureDate,
      expiry: med.expiryDate,
      formulation: med.formulation,
      manufacturer: med.manufacturer,
      pharmacy: med.pharmacy,
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


//          Only God knows what this does


// controllers/pharmacyController.js
// import PharmacyMedicine from "../models/PharmacyMedicine.js";
// import Batch from "../models/Batch.js";

// /* --------------------------------------------
//    ➕ Add Medicine to Pharmacy (Store in Both Collections)
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
//       status = 'Active',
//       pharmacy = 'Pharmacy'
//     } = req.body;

//     console.log("📦 Adding pharmacy medicine:", { name, batchNo, medicineName, manufactureDate, expiryDate, formulation, quantity, manufacturer });

//     // Check if batch number already exists in either collection
//     const [existingBatch, existingPharmacyMedicine] = await Promise.all([
//       Batch.findOne({ batchNo }),
//       PharmacyMedicine.findOne({ batchNo })
//     ]);
    
//     if (existingBatch || existingPharmacyMedicine) {
//       return res.status(400).json({
//         success: false,
//         message: "Medicine with this batch number already exists"
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
//       status: status,
//       pharmacy: pharmacy.trim(),
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
//       pharmacy: pharmacy.trim(),
//       quantity: parseInt(quantity),
//       status: 'active',
//       blockchainVerified: false
//     });

//     // Save both documents
//     await Promise.all([pharmacyMedicine.save(), batch.save()]);

//     console.log("✅ Medicine added successfully to both collections:", batchNo);

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
//    📋 Get All Pharmacy Medicines
// -------------------------------------------- */
// export const getPharmacyMedicines = async (req, res) => {
//   try {
//     const medicines = await PharmacyMedicine.find().sort({ createdAt: -1 });
    
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
//     );

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

//     const medicine = await PharmacyMedicine.findOne({ batchNo });

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
//       pharmacy: medicine.pharmacy,
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
//    🧹 Initialize Dummy Pharmacy Medicines (Optional)
// -------------------------------------------- */
// export const initializePharmacyMedicines = async () => {
//   try {
//     const count = await PharmacyMedicine.countDocuments();
//     if (count > 0) {
//       console.log("ℹ️ Pharmacy medicines already exist, skipping initialization.");
//       return;
//     }

//     const dummyPharmacyMedicines = [
//       {
//         name: "Paracetamol 500mg",
//         batchNo: "PHARM-001",
//         medicineName: "Paracetamol",
//         manufactureDate: new Date("2024-01-15"),
//         expiryDate: new Date("2025-12-31"),
//         formulation: "Tablets",
//         quantity: 1000,
//         manufacturer: "MediLife Labs",
//         pharmacy: "City Pharmacy",
//         status: "Active",
//         blockchainVerified: true
//       },
//       {
//         name: "Amoxicillin 250mg",
//         batchNo: "PHARM-002",
//         medicineName: "Amoxicillin",
//         manufactureDate: new Date("2024-02-01"),
//         expiryDate: new Date("2026-03-15"),
//         formulation: "Capsules",
//         quantity: 500,
//         manufacturer: "BioHeal Pharma",
//         pharmacy: "HealthPlus Pharmacy",
//         status: "Active",
//         blockchainVerified: true
//       },
//       {
//         name: "Vitamin C 1000mg",
//         batchNo: "PHARM-003",
//         medicineName: "Ascorbic Acid",
//         manufactureDate: new Date("2024-03-10"),
//         expiryDate: new Date("2025-11-30"),
//         formulation: "Chewable Tablets",
//         quantity: 2000,
//         manufacturer: "NutraLife Labs",
//         pharmacy: "Wellness Pharmacy",
//         status: "In Transit",
//         blockchainVerified: false
//       }
//     ];

//     await PharmacyMedicine.insertMany(dummyPharmacyMedicines);
    
//     // Also add to Batch collection
//     const batchData = dummyPharmacyMedicines.map(med => ({
//       batchNo: med.batchNo,
//       name: med.name,
//       medicineName: med.medicineName,
//       manufactureDate: med.manufactureDate,
//       expiry: med.expiryDate,
//       formulation: med.formulation,
//       manufacturer: med.manufacturer,
//       pharmacy: med.pharmacy,
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











// collaborated
//          this add the medicine to mongodb but it just doesnt veriy it



// // controllers/pharmacyController.js
// import Pharmacy from "../models/Pharmacy.js";
// import Batch from "../models/Batch.js";
// import PharmacyMedicine from "../models/PharmacyMedicine.js";

// /* --------------------------------------------
//    🌿 Get All Pharmacies (or Initialize Defaults)
// -------------------------------------------- */
// export const getPharmacies = async (req, res) => {
//   try {
//     const pharmacies = await Pharmacy.find();

//     if (!pharmacies.length) {
//       return res.status(200).json({
//         success: true,
//         message: "No pharmacies found. You can initialize default pharmacies.",
//         data: [],
//       });
//     }

//     res.status(200).json({
//       success: true,
//       total: pharmacies.length,
//       data: pharmacies,
//     });
//   } catch (error) {
//     console.error("❌ Error fetching pharmacies:", error.message);
//     res.status(500).json({
//       success: false,
//       message: "Server error while fetching pharmacies.",
//       error: error.message,
//     });
//   }
// };

// /* --------------------------------------------
//    🔗 Get Batches Linked to a Pharmacy
// -------------------------------------------- */
// export const getPharmacyBatches = async (req, res) => {
//   try {
//     const { pharmacyId } = req.params;

//     const batches = await Batch.find({ pharmacyId });

//     if (!batches.length) {
//       return res.status(404).json({
//         success: false,
//         message: "No batches found for this pharmacy.",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       pharmacyId,
//       totalBatches: batches.length,
//       data: batches,
//     });
//   } catch (error) {
//     console.error("❌ Error fetching pharmacy batches:", error.message);
//     res.status(500).json({
//       success: false,
//       message: "Server error fetching pharmacy batches.",
//       error: error.message,
//     });
//   }
// };

// /* --------------------------------------------
//    ➕ Add Medicine to Pharmacy (Store in Both Collections)
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
//       status,
//       pharmacy
//     } = req.body;

//     // Check if batch number already exists in either collection
//     const existingBatch = await Batch.findOne({ batchNo });
//     const existingPharmacyMedicine = await PharmacyMedicine.findOne({ batchNo });
    
//     if (existingBatch || existingPharmacyMedicine) {
//       return res.status(400).json({
//         success: false,
//         message: "Medicine with this batch number already exists"
//       });
//     }

//     // Create in PharmacyMedicine collection
//     const pharmacyMedicine = new PharmacyMedicine({
//       name,
//       batchNo,
//       medicineName: medicineName || name,
//       manufactureDate,
//       expiryDate,
//       formulation,
//       quantity: parseInt(quantity),
//       manufacturer,
//       status: status || 'Active',
//       pharmacy,
//       blockchainVerified: false
//     });

//     // Also create in main Batch collection for consistency
//     const batch = new Batch({
//       batchNo,
//       name,
//       medicineName: medicineName || name,
//       manufactureDate,
//       expiry: expiryDate,
//       formulation,
//       manufacturer,
//       pharmacy,
//       quantity: parseInt(quantity),
//       status: 'active',
//       blockchainVerified: false
//     });

//     // Save both documents
//     await Promise.all([pharmacyMedicine.save(), batch.save()]);

//     res.status(201).json({
//       success: true,
//       message: "Medicine added successfully",
//       data: {
//         pharmacyMedicine,
//         batch
//       }
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
//    📋 Get All Pharmacy Medicines
// -------------------------------------------- */
// export const getPharmacyMedicines = async (req, res) => {
//   try {
//     const medicines = await PharmacyMedicine.find().sort({ createdAt: -1 });
    
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
//    🏭 Initialize Dummy Pharmacies
// -------------------------------------------- */
// export const initializePharmacies = async () => {
//   try {
//     const count = await Pharmacy.countDocuments();
//     if (count > 0) {
//       console.log("ℹ️ Pharmacies already exist, skipping initialization.");
//       return;
//     }

//     const dummyPharmacies = [
//       { name: "Medico Plus", location: "Downtown Karachi" },
//       { name: "HealthFirst", location: "Lahore Central" },
//       { name: "Curex Pharma", location: "Islamabad Zone 2" },
//     ];

//     await Pharmacy.insertMany(dummyPharmacies);
//     console.log("✅ Dummy pharmacies initialized successfully.");
//   } catch (error) {
//     console.error("❌ Error initializing pharmacies:", error.message);
//   }
// };


//    ahmers code

// // controllers/pharmacyController.js
// import Pharmacy from "../models/Pharmacy.js";
// import Batch from "../models/Batch.js";

// /* --------------------------------------------
//    🌿 Get All Pharmacies (or Initialize Defaults)
// -------------------------------------------- */
// export const getPharmacies = async (req, res) => {
//   try {
//     const pharmacies = await Pharmacy.find();

//     if (!pharmacies.length) {
//       return res.status(200).json({
//         success: true,
//         message: "No pharmacies found. You can initialize default pharmacies.",
//         data: [],
//       });
//     }

//     res.status(200).json({
//       success: true,
//       total: pharmacies.length,
//       data: pharmacies,
//     });
//   } catch (error) {
//     console.error("❌ Error fetching pharmacies:", error.message);
//     res.status(500).json({
//       success: false,
//       message: "Server error while fetching pharmacies.",
//       error: error.message,
//     });
//   }
// };

// /* --------------------------------------------
//    🔗 Get Batches Linked to a Pharmacy
// -------------------------------------------- */
// export const getPharmacyBatches = async (req, res) => {
//   try {
//     const { pharmacyId } = req.params;

//     const batches = await Batch.find({ pharmacyId });

//     if (!batches.length) {
//       return res.status(404).json({
//         success: false,
//         message: "No batches found for this pharmacy.",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       pharmacyId,
//       totalBatches: batches.length,
//       data: batches,
//     });
//   } catch (error) {
//     console.error("❌ Error fetching pharmacy batches:", error.message);
//     res.status(500).json({
//       success: false,
//       message: "Server error fetching pharmacy batches.",
//       error: error.message,
//     });
//   }
// };

// /* --------------------------------------------
//    🏭 Initialize Dummy Pharmacies
// -------------------------------------------- */
// export const initializePharmacies = async () => {
//   try {
//     const count = await Pharmacy.countDocuments();
//     if (count > 0) {
//       console.log("ℹ️ Pharmacies already exist, skipping initialization.");
//       return;
//     }

//     const dummyPharmacies = [
//       { name: "Medico Plus", location: "Downtown Karachi" },
//       { name: "HealthFirst", location: "Lahore Central" },
//       { name: "Curex Pharma", location: "Islamabad Zone 2" },
//     ];

//     await Pharmacy.insertMany(dummyPharmacies);
//     console.log("✅ Dummy pharmacies initialized successfully.");
//   } catch (error) {
//     console.error("❌ Error initializing pharmacies:", error.message);
//   }
// };
