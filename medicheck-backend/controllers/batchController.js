import Batch from "../models/Batch.js";
import PharmacyMedicine from "../models/PharmacyMedicine.js";

const dummyBatches = [
  {
    batchNo: "B001",
    name: "Paracetamol 500mg",
    medicineName: "Paracetamol",
    manufactureDate: "2024-01-15",
    expiry: "2025-12-31",
    formulation: "Tablet",
    manufacturer: "MediLife Labs",
    pharmacy: "Medico Plus",
    quantity: 1500,
    status: "active",
    blockchainVerified: true
  },
  {
    batchNo: "B002",
    name: "Amoxicillin 250mg",
    medicineName: "Amoxicillin",
    manufactureDate: "2024-02-01",
    expiry: "2026-03-15",
    formulation: "Capsule",
    manufacturer: "BioHeal Pharma",
    pharmacy: "HealthFirst",
    quantity: 2000,
    status: "active",
    blockchainVerified: true
  },
  {
    batchNo: "B003",
    name: "Ibuprofen 400mg",
    medicineName: "Ibuprofen",
    manufactureDate: "2024-01-20",
    expiry: "2025-11-30",
    formulation: "Tablet",
    manufacturer: "PharmaCare Solutions",
    pharmacy: "Curex Pharma",
    quantity: 800,
    status: "active",
    blockchainVerified: true
  }
];

/* --------------------------------------------
   🧪 Verify Batch by Batch No (Check Both Collections)
-------------------------------------------- */
export const verifyBatch = async (req, res) => {
  try {
    const { batchNo } = req.params;
    
    console.log("🔍 Verifying batch:", batchNo);

    // Check in main Batch collection first
    let batch = await Batch.findOne({ batchNo });
    let source = 'batch';

    // If not found in Batch collection, check PharmacyMedicine collection
    if (!batch) {
      batch = await PharmacyMedicine.findOne({ batchNo });
      source = 'pharmacy';
    }

    if (!batch) {
      // Check in dummy data as fallback
      const dummy = dummyBatches.find((b) => b.batchNo === batchNo);
      if (dummy) {
        const today = new Date();
        const expiryDate = new Date(dummy.expiry);
        const isExpired = expiryDate < today;
        
        return res.json({ 
          ...dummy, 
          verified: true,
          exists: true,
          authentic: !isExpired,
          message: isExpired ? 
            "❌ This batch is expired. Do not use this medicine." : 
            "✅ This medicine is authentic and safe to use.",
          source: 'dummy',
          status: isExpired ? 'Expired' : 'Active'
        });
      }
      return res.status(404).json({ 
        exists: false,
        message: "❌ Batch not found in system" 
      });
    }

    // Convert to plain object and add verification info
    const batchData = batch.toObject ? batch.toObject() : batch;
    
    const today = new Date();
    const expiryDate = new Date(batchData.expiryDate || batchData.expiry);
    const isExpired = expiryDate < today;

    const response = {
      exists: true,
      verified: true,
      authentic: !isExpired,
      message: isExpired ? 
        "❌ This batch is expired. Do not use this medicine." : 
        "✅ This medicine is authentic and safe to use.",
      batchNo: batchData.batchNo,
      name: batchData.name,
      medicineName: batchData.medicineName || batchData.name,
      formulation: batchData.formulation,
      expiry: batchData.expiryDate || batchData.expiry,
      manufacturer: batchData.manufacturer,
      pharmacy: batchData.pharmacy,
      status: isExpired ? 'Expired' : (batchData.status || 'Active'),
      source: source,
      blockchainVerified: batchData.blockchainVerified || false
    };

    // Add transaction hash if blockchain verified
    if (batchData.blockchainVerified) {
      response.transaction = `0x${Math.random().toString(16).slice(2)}`;
    }

    console.log("✅ Verification successful for:", batchNo);
    res.json(response);
  } catch (error) {
    console.error("❌ Error verifying batch:", error.message);
    res.status(500).json({ 
      exists: false,
      message: "Error verifying batch", 
      error: error.message 
    });
  }
};

/* --------------------------------------------
   📦 Get All Batches (Combine Both Collections)
-------------------------------------------- */
export const getAllBatches = async (req, res) => {
  try {
    const [batches, pharmacyMedicines] = await Promise.all([
      Batch.find().sort({ createdAt: -1 }),
      PharmacyMedicine.find().sort({ createdAt: -1 })
    ]);

    console.log(`📊 Found ${batches.length} batches and ${pharmacyMedicines.length} pharmacy medicines`);

    // Combine both collections for a unified view
    const allBatches = [
      ...batches.map(b => ({
        ...b.toObject(),
        source: 'batch',
        expiry: b.expiry // Use expiry for consistency
      })),
      ...pharmacyMedicines.map(pm => ({
        ...pm.toObject(),
        source: 'pharmacy',
        expiry: pm.expiryDate // Map expiryDate to expiry for consistency
      }))
    ];

    if (allBatches.length === 0) {
      console.log("⚠️ No batches found in DB — returning dummy data");
      return res.json(dummyBatches.map(b => ({...b, source: 'dummy'})));
    }

    // Sort by creation date (newest first)
    allBatches.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(allBatches);
  } catch (error) {
    console.error("❌ Error fetching batches:", error.message);
    res.status(500).json({ message: "Error fetching batches", error: error.message });
  }
};

/* --------------------------------------------
   📦 Get Single Batch by Batch No
-------------------------------------------- */
export const getBatch = async (req, res) => {
  try {
    const { batchNo } = req.params;
    const batch = await Batch.findOne({ batchNo });

    if (!batch) {
      const dummy = dummyBatches.find((b) => b.batchNo === batchNo);
      if (dummy) return res.json(dummy);
      return res.status(404).json({ message: "Batch not found" });
    }

    res.json(batch);
  } catch (error) {
    res.status(500).json({ message: "Error fetching batch", error: error.message });
  }
};

/* --------------------------------------------
   ➕ Create New Batch
-------------------------------------------- */
export const createBatch = async (req, res) => {
  try {
    const newBatch = new Batch(req.body);
    await newBatch.save();
    console.log("✅ New batch saved:", newBatch.batchNo);
    res.status(201).json(newBatch);
  } catch (error) {
    console.error("❌ Error creating batch:", error.message);
    res.status(500).json({ message: "Error creating batch", error: error.message });
  }
};

/* --------------------------------------------
   ✏️ Update Batch
-------------------------------------------- */
export const updateBatch = async (req, res) => {
  try {
    const { batchNo } = req.params;
    const updated = await Batch.findOneAndUpdate({ batchNo }, req.body, { new: true });

    if (!updated) {
      return res.status(404).json({ message: "Batch not found" });
    }

    console.log("✅ Batch updated:", batchNo);
    res.json(updated);
  } catch (error) {
    console.error("❌ Error updating batch:", error.message);
    res.status(500).json({ message: "Error updating batch", error: error.message });
  }
};

/* --------------------------------------------
   ✅ Accept Batch (Pharmacy)
-------------------------------------------- */
export const acceptBatch = async (req, res) => {
  try {
    const { batchNo } = req.params;
    const batch = await Batch.findOne({ batchNo });

    if (!batch) {
      return res.status(404).json({ message: "Batch not found" });
    }

    batch.status = "accepted";
    await batch.save();

    console.log("✅ Batch accepted:", batchNo);
    res.json(batch);
  } catch (error) {
    console.error("❌ Error accepting batch:", error.message);
    res.status(500).json({ message: "Error accepting batch", error: error.message });
  }
};

/* --------------------------------------------
   🧰 Initialize Dummy Data (DEV ONLY)
-------------------------------------------- */
export const initializeBatches = async () => {
  try {
    const count = await Batch.countDocuments();
    if (count === 0) {
      await Batch.insertMany(dummyBatches);
      console.log("🌱 Dummy batches inserted into MongoDB.");
    } else {
      console.log("ℹ️ MongoDB already has batches — skipping init.");
    }
  } catch (error) {
    console.error("❌ Error initializing dummy batches:", error.message);
  }
};


//        collab getting...verifybatch error


// import Batch from "../models/Batch.js";
// import PharmacyMedicine from "../models/PharmacyMedicine.js";

// /* ... (keep existing dummyBatches array) ... */


// const dummyBatches = [
//   {
//     batchNo: "B001",
//     name: "Paracetamol 500mg",
//     medicineName: "Paracetamol",
//     manufactureDate: "2024-01-15",
//     expiry: "2025-12-31",
//     formulation: "Tablet",
//     manufacturer: "MediLife Labs",
//     pharmacy: "Medico Plus",
//     quantity: 1500,
//     status: "active",
//     blockchainVerified: true
//   },
//   {
//     batchNo: "B002",
//     name: "Amoxicillin 250mg",
//     medicineName: "Amoxicillin",
//     manufactureDate: "2024-02-01",
//     expiry: "2026-03-15",
//     formulation: "Capsule",
//     manufacturer: "BioHeal Pharma",
//     pharmacy: "HealthFirst",
//     quantity: 2000,
//     status: "active",
//     blockchainVerified: true
//   },
//   {
//     batchNo: "B003",
//     name: "Ibuprofen 400mg",
//     medicineName: "Ibuprofen",
//     manufactureDate: "2024-01-20",
//     expiry: "2025-11-30",
//     formulation: "Tablet",
//     manufacturer: "PharmaCare Solutions",
//     pharmacy: "Curex Pharma",
//     quantity: 800,
//     status: "active",
//     blockchainVerified: true
//   },
//   {
//     batchNo: "B004",
//     name: "Vitamin C 1000mg",
//     medicineName: "Vitamin C",
//     manufactureDate: "2024-03-10",
//     expiry: "2026-03-10",
//     formulation: "Chewable Tablet",
//     manufacturer: "NutraLife Labs",
//     pharmacy: "Medico Plus",
//     quantity: 3000,
//     status: "active",
//     blockchainVerified: true
//   },
//   {
//     batchNo: "B005",
//     name: "Aspirin 75mg",
//     medicineName: "Aspirin",
//     manufactureDate: "2024-02-15",
//     expiry: "2025-08-15",
//     formulation: "Tablet",
//     manufacturer: "CardioCare Pharma",
//     pharmacy: "HealthFirst",
//     quantity: 2500,
//     status: "active",
//     blockchainVerified: true
//   },
//   {
//     batchNo: "B006",
//     name: "Omeprazole 20mg",
//     medicineName: "Omeprazole",
//     manufactureDate: "2024-01-30",
//     expiry: "2026-01-30",
//     formulation: "Capsule",
//     manufacturer: "GastroHealth Inc",
//     pharmacy: "Curex Pharma",
//     quantity: 1200,
//     status: "active",
//     blockchainVerified: true
//   },
//   {
//     batchNo: "B007",
//     name: "Metformin 500mg",
//     medicineName: "Metformin",
//     manufactureDate: "2024-02-28",
//     expiry: "2025-12-31",
//     formulation: "Tablet",
//     manufacturer: "DiabetoCare",
//     pharmacy: "Medico Plus",
//     quantity: 1800,
//     status: "active",
//     blockchainVerified: true
//   },
//   {
//     batchNo: "B008",
//     name: "Atorvastatin 20mg",
//     medicineName: "Atorvastatin",
//     manufactureDate: "2024-03-05",
//     expiry: "2026-06-15",
//     formulation: "Tablet",
//     manufacturer: "CholestoFix Pharma",
//     pharmacy: "HealthFirst",
//     quantity: 900,
//     status: "active",
//     blockchainVerified: true
//   },
//   {
//     batchNo: "B009",
//     name: "Cetirizine 10mg",
//     medicineName: "Cetirizine",
//     manufactureDate: "2024-01-25",
//     expiry: "2025-10-20",
//     formulation: "Tablet",
//     manufacturer: "AllergyFree Corp",
//     pharmacy: "Curex Pharma",
//     quantity: 2200,
//     status: "active",
//     blockchainVerified: true
//   },
//   {
//     batchNo: "B010",
//     name: "Levothyroxine 50mcg",
//     medicineName: "Levothyroxine",
//     manufactureDate: "2024-02-10",
//     expiry: "2026-02-10",
//     formulation: "Tablet",
//     manufacturer: "ThyroCare Solutions",
//     pharmacy: "Medico Plus",
//     quantity: 750,
//     status: "active",
//     blockchainVerified: true
//   }

// ]

// /* --------------------------------------------
//    🧪 Verify Batch by Batch No (Check Both Collections)
// -------------------------------------------- */
// export const verifyBatch = async (req, res) => {
//   try {
//     const { batchNo } = req.params;
    
//     console.log("🔍 Verifying batch:", batchNo);

//     // Check in main Batch collection first
//     let batch = await Batch.findOne({ batchNo });
//     let source = 'batch';

//     // If not found in Batch collection, check PharmacyMedicine collection
//     if (!batch) {
//       batch = await PharmacyMedicine.findOne({ batchNo });
//       source = 'pharmacy';
//     }

//     if (!batch) {
//       // Check in dummy data as fallback
//       const dummy = dummyBatches.find((b) => b.batchNo === batchNo);
//       if (dummy) {
//         const today = new Date();
//         const expiryDate = new Date(dummy.expiry);
//         const isExpired = expiryDate < today;
        
//         return res.json({ 
//           ...dummy, 
//           verified: true,
//           exists: true,
//           authentic: !isExpired,
//           message: isExpired ? 
//             "❌ This batch is expired. Do not use this medicine." : 
//             "✅ This medicine is authentic and safe to use.",
//           source: 'dummy',
//           status: isExpired ? 'Expired' : 'Active'
//         });
//       }
//       return res.status(404).json({ 
//         exists: false,
//         message: "❌ Batch not found in system" 
//       });
//     }

//     // Convert to plain object and add verification info
//     const batchData = batch.toObject ? batch.toObject() : batch;
    
//     const today = new Date();
//     const expiryDate = new Date(batchData.expiryDate || batchData.expiry);
//     const isExpired = expiryDate < today;

//     const response = {
//       exists: true,
//       verified: true,
//       authentic: !isExpired,
//       message: isExpired ? 
//         "❌ This batch is expired. Do not use this medicine." : 
//         "✅ This medicine is authentic and safe to use.",
//       batchNo: batchData.batchNo,
//       name: batchData.name,
//       medicineName: batchData.medicineName || batchData.name,
//       formulation: batchData.formulation,
//       expiry: batchData.expiryDate || batchData.expiry,
//       manufacturer: batchData.manufacturer,
//       pharmacy: batchData.pharmacy,
//       status: isExpired ? 'Expired' : (batchData.status || 'Active'),
//       source: source,
//       blockchainVerified: batchData.blockchainVerified || false
//     };

//     // Add transaction hash if blockchain verified
//     if (batchData.blockchainVerified) {
//       response.transaction = `0x${Math.random().toString(16).slice(2)}`;
//     }

//     console.log("✅ Verification successful for:", batchNo);
//     res.json(response);
//   } catch (error) {
//     console.error("❌ Error verifying batch:", error.message);
//     res.status(500).json({ 
//       exists: false,
//       message: "Error verifying batch", 
//       error: error.message 
//     });
//   }
// };

// /* --------------------------------------------
//    📦 Get All Batches (Combine Both Collections)
// -------------------------------------------- */
// export const getAllBatches = async (req, res) => {
//   try {
//     const [batches, pharmacyMedicines] = await Promise.all([
//       Batch.find().sort({ createdAt: -1 }),
//       PharmacyMedicine.find().sort({ createdAt: -1 })
//     ]);

//     console.log(`📊 Found ${batches.length} batches and ${pharmacyMedicines.length} pharmacy medicines`);

//     // Combine both collections for a unified view
//     const allBatches = [
//       ...batches.map(b => ({
//         ...b.toObject(),
//         source: 'batch',
//         expiry: b.expiry // Use expiry for consistency
//       })),
//       ...pharmacyMedicines.map(pm => ({
//         ...pm.toObject(),
//         source: 'pharmacy',
//         expiry: pm.expiryDate // Map expiryDate to expiry for consistency
//       }))
//     ];

//     if (allBatches.length === 0) {
//       console.log("⚠️ No batches found in DB — returning dummy data");
//       return res.json(dummyBatches.map(b => ({...b, source: 'dummy'})));
//     }

//     // Sort by creation date (newest first)
//     allBatches.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

//     res.json(allBatches);
//   } catch (error) {
//     console.error("❌ Error fetching batches:", error.message);
//     res.status(500).json({ message: "Error fetching batches", error: error.message });
//   }
// };



// /* --------------------------------------------
//    📦 Get Single Batch by Batch No
// -------------------------------------------- */
// export const getBatch = async (req, res) => {
//   try {
//     const { batchNo } = req.params;
//     const batch = await Batch.findOne({ batchNo });

//     if (!batch) {
//       const dummy = dummyBatches.find((b) => b.batchNo === batchNo);
//       if (dummy) return res.json(dummy);
//       return res.status(404).json({ message: "Batch not found" });
//     }

//     res.json(batch);
//   } catch (error) {
//     res.status(500).json({ message: "Error fetching batch", error: error.message });
//   }
// };

// // /* --------------------------------------------
// //    🧪 Verify Batch by Batch No
// // -------------------------------------------- */
// // export const verifyBatch = async (req, res) => {
// //   try {
// //     const { batchNo } = req.params;
// //     const batch = await Batch.findOne({ batchNo });

// //     if (!batch) {
// //       const dummy = dummyBatches.find((b) => b.batchNo === batchNo);
// //       if (dummy) return res.json({ ...dummy, verified: true });
// //       return res.status(404).json({ message: "Batch not found" });
// //     }

// //     res.json({ ...batch.toObject(), verified: true });
// //   } catch (error) {
// //     res.status(500).json({ message: "Error verifying batch", error: error.message });
// //   }
// // };

// /* --------------------------------------------
//    ➕ Create New Batch
// -------------------------------------------- */
// export const createBatch = async (req, res) => {
//   try {
//     const newBatch = new Batch(req.body);
//     await newBatch.save();
//     console.log("✅ New batch saved:", newBatch.batchNo);
//     res.status(201).json(newBatch);
//   } catch (error) {
//     console.error("❌ Error creating batch:", error.message);
//     res.status(500).json({ message: "Error creating batch", error: error.message });
//   }
// };

// /* --------------------------------------------
//    ✏️ Update Batch
// -------------------------------------------- */
// export const updateBatch = async (req, res) => {
//   try {
//     const { batchNo } = req.params;
//     const updated = await Batch.findOneAndUpdate({ batchNo }, req.body, { new: true });

//     if (!updated) {
//       return res.status(404).json({ message: "Batch not found" });
//     }

//     console.log("✅ Batch updated:", batchNo);
//     res.json(updated);
//   } catch (error) {
//     console.error("❌ Error updating batch:", error.message);
//     res.status(500).json({ message: "Error updating batch", error: error.message });
//   }
// };

// /* --------------------------------------------
//    ✅ Accept Batch (Pharmacy)
// -------------------------------------------- */
// export const acceptBatch = async (req, res) => {
//   try {
//     const { batchNo } = req.params;
//     const batch = await Batch.findOne({ batchNo });

//     if (!batch) {
//       return res.status(404).json({ message: "Batch not found" });
//     }

//     batch.status = "accepted";
//     await batch.save();

//     console.log("✅ Batch accepted:", batchNo);
//     res.json(batch);
//   } catch (error) {
//     console.error("❌ Error accepting batch:", error.message);
//     res.status(500).json({ message: "Error accepting batch", error: error.message });
//   }
// };

// /* --------------------------------------------
//    🧰 Initialize Dummy Data (DEV ONLY)
// -------------------------------------------- */
// export const initializeBatches = async () => {
//   try {
//     const count = await Batch.countDocuments();
//     if (count === 0) {
//       await Batch.insertMany(dummyBatches);
//       console.log("🌱 Dummy batches inserted into MongoDB.");
//     } else {
//       console.log("ℹ️ MongoDB already has batches — skipping init.");
//     }
//   } catch (error) {
//     console.error("❌ Error initializing dummy batches:", error.message);
//   }
// };











//    ahmers code

// import Batch from "../models/Batch.js";

// /* --------------------------------------------
//    🧪 Dummy Data (used if DB is empty)
// -------------------------------------------- */
// const dummyBatches = [
//   {
//     batchNo: "B001",
//     name: "Paracetamol 500mg",
//     medicineName: "Paracetamol",
//     manufactureDate: "2024-01-15",
//     expiry: "2025-12-31",
//     formulation: "Tablet",
//     manufacturer: "MediLife Labs",
//     pharmacy: "Medico Plus",
//     quantity: 1500,
//     status: "active",
//     blockchainVerified: true
//   },
//   {
//     batchNo: "B002",
//     name: "Amoxicillin 250mg",
//     medicineName: "Amoxicillin",
//     manufactureDate: "2024-02-01",
//     expiry: "2026-03-15",
//     formulation: "Capsule",
//     manufacturer: "BioHeal Pharma",
//     pharmacy: "HealthFirst",
//     quantity: 2000,
//     status: "active",
//     blockchainVerified: true
//   },
//   {
//     batchNo: "B003",
//     name: "Ibuprofen 400mg",
//     medicineName: "Ibuprofen",
//     manufactureDate: "2024-01-20",
//     expiry: "2025-11-30",
//     formulation: "Tablet",
//     manufacturer: "PharmaCare Solutions",
//     pharmacy: "Curex Pharma",
//     quantity: 800,
//     status: "active",
//     blockchainVerified: true
//   },
//   {
//     batchNo: "B004",
//     name: "Vitamin C 1000mg",
//     medicineName: "Vitamin C",
//     manufactureDate: "2024-03-10",
//     expiry: "2026-03-10",
//     formulation: "Chewable Tablet",
//     manufacturer: "NutraLife Labs",
//     pharmacy: "Medico Plus",
//     quantity: 3000,
//     status: "active",
//     blockchainVerified: true
//   },
//   {
//     batchNo: "B005",
//     name: "Aspirin 75mg",
//     medicineName: "Aspirin",
//     manufactureDate: "2024-02-15",
//     expiry: "2025-08-15",
//     formulation: "Tablet",
//     manufacturer: "CardioCare Pharma",
//     pharmacy: "HealthFirst",
//     quantity: 2500,
//     status: "active",
//     blockchainVerified: true
//   },
//   {
//     batchNo: "B006",
//     name: "Omeprazole 20mg",
//     medicineName: "Omeprazole",
//     manufactureDate: "2024-01-30",
//     expiry: "2026-01-30",
//     formulation: "Capsule",
//     manufacturer: "GastroHealth Inc",
//     pharmacy: "Curex Pharma",
//     quantity: 1200,
//     status: "active",
//     blockchainVerified: true
//   },
//   {
//     batchNo: "B007",
//     name: "Metformin 500mg",
//     medicineName: "Metformin",
//     manufactureDate: "2024-02-28",
//     expiry: "2025-12-31",
//     formulation: "Tablet",
//     manufacturer: "DiabetoCare",
//     pharmacy: "Medico Plus",
//     quantity: 1800,
//     status: "active",
//     blockchainVerified: true
//   },
//   {
//     batchNo: "B008",
//     name: "Atorvastatin 20mg",
//     medicineName: "Atorvastatin",
//     manufactureDate: "2024-03-05",
//     expiry: "2026-06-15",
//     formulation: "Tablet",
//     manufacturer: "CholestoFix Pharma",
//     pharmacy: "HealthFirst",
//     quantity: 900,
//     status: "active",
//     blockchainVerified: true
//   },
//   {
//     batchNo: "B009",
//     name: "Cetirizine 10mg",
//     medicineName: "Cetirizine",
//     manufactureDate: "2024-01-25",
//     expiry: "2025-10-20",
//     formulation: "Tablet",
//     manufacturer: "AllergyFree Corp",
//     pharmacy: "Curex Pharma",
//     quantity: 2200,
//     status: "active",
//     blockchainVerified: true
//   },
//   {
//     batchNo: "B010",
//     name: "Levothyroxine 50mcg",
//     medicineName: "Levothyroxine",
//     manufactureDate: "2024-02-10",
//     expiry: "2026-02-10",
//     formulation: "Tablet",
//     manufacturer: "ThyroCare Solutions",
//     pharmacy: "Medico Plus",
//     quantity: 750,
//     status: "active",
//     blockchainVerified: true
//   }

// ]

// /* --------------------------------------------
//    📦 Get All Batches
// -------------------------------------------- */
// export const getAllBatches = async (req, res) => {
//   try {
//     const batches = await Batch.find();

//     if (batches.length === 0) {
//       console.log("⚠️ No batches found in DB — returning dummy data");
//       return res.json(dummyBatches);
//     }

//     res.json(batches);
//   } catch (error) {
//     console.error("❌ Error fetching batches:", error.message);
//     res.status(500).json({ message: "Error fetching batches", error: error.message });
//   }
// };

// /* --------------------------------------------
//    📦 Get Single Batch by Batch No
// -------------------------------------------- */
// export const getBatch = async (req, res) => {
//   try {
//     const { batchNo } = req.params;
//     const batch = await Batch.findOne({ batchNo });

//     if (!batch) {
//       const dummy = dummyBatches.find((b) => b.batchNo === batchNo);
//       if (dummy) return res.json(dummy);
//       return res.status(404).json({ message: "Batch not found" });
//     }

//     res.json(batch);
//   } catch (error) {
//     res.status(500).json({ message: "Error fetching batch", error: error.message });
//   }
// };

// /* --------------------------------------------
//    🧪 Verify Batch by Batch No
// -------------------------------------------- */
// export const verifyBatch = async (req, res) => {
//   try {
//     const { batchNo } = req.params;
//     const batch = await Batch.findOne({ batchNo });

//     if (!batch) {
//       const dummy = dummyBatches.find((b) => b.batchNo === batchNo);
//       if (dummy) return res.json({ ...dummy, verified: true });
//       return res.status(404).json({ message: "Batch not found" });
//     }

//     res.json({ ...batch.toObject(), verified: true });
//   } catch (error) {
//     res.status(500).json({ message: "Error verifying batch", error: error.message });
//   }
// };

// /* --------------------------------------------
//    ➕ Create New Batch
// -------------------------------------------- */
// export const createBatch = async (req, res) => {
//   try {
//     const newBatch = new Batch(req.body);
//     await newBatch.save();
//     console.log("✅ New batch saved:", newBatch.batchNo);
//     res.status(201).json(newBatch);
//   } catch (error) {
//     console.error("❌ Error creating batch:", error.message);
//     res.status(500).json({ message: "Error creating batch", error: error.message });
//   }
// };

// /* --------------------------------------------
//    ✏️ Update Batch
// -------------------------------------------- */
// export const updateBatch = async (req, res) => {
//   try {
//     const { batchNo } = req.params;
//     const updated = await Batch.findOneAndUpdate({ batchNo }, req.body, { new: true });

//     if (!updated) {
//       return res.status(404).json({ message: "Batch not found" });
//     }

//     console.log("✅ Batch updated:", batchNo);
//     res.json(updated);
//   } catch (error) {
//     console.error("❌ Error updating batch:", error.message);
//     res.status(500).json({ message: "Error updating batch", error: error.message });
//   }
// };

// /* --------------------------------------------
//    ✅ Accept Batch (Pharmacy)
// -------------------------------------------- */
// export const acceptBatch = async (req, res) => {
//   try {
//     const { batchNo } = req.params;
//     const batch = await Batch.findOne({ batchNo });

//     if (!batch) {
//       return res.status(404).json({ message: "Batch not found" });
//     }

//     batch.status = "accepted";
//     await batch.save();

//     console.log("✅ Batch accepted:", batchNo);
//     res.json(batch);
//   } catch (error) {
//     console.error("❌ Error accepting batch:", error.message);
//     res.status(500).json({ message: "Error accepting batch", error: error.message });
//   }
// };

// /* --------------------------------------------
//    🧰 Initialize Dummy Data (DEV ONLY)
// -------------------------------------------- */
// export const initializeBatches = async () => {
//   try {
//     const count = await Batch.countDocuments();
//     if (count === 0) {
//       await Batch.insertMany(dummyBatches);
//       console.log("🌱 Dummy batches inserted into MongoDB.");
//     } else {
//       console.log("ℹ️ MongoDB already has batches — skipping init.");
//     }
//   } catch (error) {
//     console.error("❌ Error initializing dummy batches:", error.message);
//   }
// };