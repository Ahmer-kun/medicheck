import mongoose from "mongoose";
import PharmacyCompany from "../models/PharmacyCompany.js";
import PharmacyMedicine from "../models/PharmacyMedicine.js";

// Cache for stats to prevent frequent database queries
const statsCache = new Map();
const CACHE_DURATION = 30000; // 30 seconds

/* --------------------------------------------
   🏪 Get All Pharmacy Companies WITH BULK STATS
-------------------------------------------- */
export const getAllPharmacyCompanies = async (req, res) => {
  try {
    console.log("🔄 Fetching all pharmacy companies with bulk stats...");
    
    const companies = await PharmacyCompany.find({ isActive: true })
      .sort({ name: 1 })
      .lean();

    if (companies.length === 0) {
      return res.json({
        success: true,
        data: []
      });
    }

    // Get company IDs for bulk query
    const companyIds = companies.map(company => company._id);

    // Bulk query for medicine counts - MUCH MORE EFFICIENT
    const medicineStats = await PharmacyMedicine.aggregate([
      {
        $match: {
          pharmacyCompany: { $in: companyIds }
        }
      },
      {
        $group: {
          _id: "$pharmacyCompany",
          totalMedicines: { $sum: 1 },
          verifiedMedicines: {
            $sum: { $cond: [{ $eq: ["$blockchainVerified", true] }, 1, 0] }
          },
          expiredMedicines: {
            $sum: {
              $cond: [{ $lt: ["$expiryDate", new Date()] }, 1, 0]
            }
          }
        }
      }
    ]);

    // Convert stats to a map for easy lookup
    const statsMap = new Map();
    medicineStats.forEach(stat => {
      statsMap.set(stat._id.toString(), {
        totalMedicines: stat.totalMedicines,
        verifiedMedicines: stat.verifiedMedicines,
        expiredMedicines: stat.expiredMedicines
      });
    });

    // Merge stats with companies
    const companiesWithStats = companies.map(company => {
      const companyStats = statsMap.get(company._id.toString()) || {
        totalMedicines: 0,
        verifiedMedicines: 0,
        expiredMedicines: 0
      };
      
      return {
        ...company,
        ...companyStats
      };
    });

    console.log(`✅ Fetched ${companies.length} pharmacy companies with bulk stats`);
    
    res.json({
      success: true,
      data: companiesWithStats
    });
  } catch (error) {
    console.error("❌ Error fetching pharmacy companies:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching pharmacy companies",
      error: error.message
    });
  }
};

/* --------------------------------------------
   📊 Get Pharmacy Company Statistics - OPTIMIZED
-------------------------------------------- */
export const getPharmacyCompanyStats = async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`📊 Fetching detailed stats for pharmacy company: ${id}`);

    // Validate the ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid pharmacy company ID"
      });
    }

    // Check cache first
    const cacheKey = `stats-${id}`;
    const cached = statsCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log(`📊 Returning cached stats for company: ${id}`);
      return res.json({
        success: true,
        data: cached.data,
        cached: true
      });
    }

    // Get detailed stats in a single aggregation
    const detailedStats = await PharmacyMedicine.aggregate([
      {
        $match: {
          pharmacyCompany: new mongoose.Types.ObjectId(id)
        }
      },
      {
        $facet: {
          statusDistribution: [
            {
              $group: {
                _id: "$status",
                count: { $sum: 1 }
              }
            }
          ],
          totalStats: [
            {
              $group: {
                _id: null,
                totalMedicines: { $sum: 1 },
                verifiedMedicines: {
                  $sum: { $cond: [{ $eq: ["$blockchainVerified", true] }, 1, 0] }
                },
                expiredMedicines: {
                  $sum: { $cond: [{ $lt: ["$expiryDate", new Date()] }, 1, 0] }
                },
                activeMedicines: {
                  $sum: {
                    $cond: [
                      {
                        $and: [
                          { $eq: ["$status", "Active"] },
                          { $gte: ["$expiryDate", new Date()] }
                        ]
                      },
                      1,
                      0
                    ]
                  }
                }
              }
            }
          ]
        }
      }
    ]);

    // Extract results
    const statusDistribution = detailedStats[0]?.statusDistribution || [];
    const totalStats = detailedStats[0]?.totalStats[0] || {
      totalMedicines: 0,
      verifiedMedicines: 0,
      expiredMedicines: 0,
      activeMedicines: 0
    };

    const statsData = {
      totalMedicines: totalStats.totalMedicines,
      verifiedMedicines: totalStats.verifiedMedicines,
      expiredMedicines: totalStats.expiredMedicines,
      activeMedicines: totalStats.activeMedicines,
      statusDistribution: statusDistribution
    };

    // Cache the results
    statsCache.set(cacheKey, {
      data: statsData,
      timestamp: Date.now()
    });

    console.log(`📊 Final detailed stats for company ${id}:`, statsData);

    res.json({
      success: true,
      data: statsData,
      cached: false
    });

  } catch (error) {
    console.error("❌ Error fetching pharmacy stats:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching pharmacy statistics",
      error: error.message
    });
  }
};



/* --------------------------------------------
   ➕ Create New Pharmacy Company
-------------------------------------------- */
export const createPharmacyCompany = async (req, res) => {
  try {
    const {
      name,
      licenseNumber,
      address,
      contact,
      manager,
      establishedDate,
      specialties
    } = req.body;

    console.log("🏪 Creating pharmacy company:", { name, licenseNumber, manager });

    // Check if company already exists
    const existingCompany = await PharmacyCompany.findOne({
      $or: [
        { name: name.trim() },
        { licenseNumber: licenseNumber.trim() }
      ]
    });

    if (existingCompany) {
      return res.status(400).json({
        success: false,
        message: "Pharmacy company with this name or license number already exists"
      });
    }

    const pharmacyCompany = new PharmacyCompany({
      name: name.trim(),
      licenseNumber: licenseNumber.trim(),
      address: {
        street: address?.street?.trim() || '',
        city: address?.city?.trim() || '',
        state: address?.state?.trim() || '',
        country: address?.country?.trim() || 'Pakistan',
        zipCode: address?.zipCode?.trim() || ''
      },
      contact: {
        phone: contact?.phone?.trim(),
        email: contact?.email?.trim().toLowerCase()
      },
      manager: manager.trim(),
      establishedDate: establishedDate ? new Date(establishedDate) : new Date(),
      specialties: specialties || [],
      isActive: true
    });

    await pharmacyCompany.save();

    console.log("✅ Pharmacy company created successfully:", name);

    res.status(201).json({
      success: true,
      message: "Pharmacy company created successfully",
      data: pharmacyCompany
    });

  } catch (error) {
    console.error("❌ Error creating pharmacy company:", error.message);
    res.status(500).json({
      success: false,
      message: "Error creating pharmacy company",
      error: error.message
    });
  }
};

/* --------------------------------------------
   ✏️ Update Pharmacy Company
-------------------------------------------- */
export const updatePharmacyCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedCompany = await PharmacyCompany.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    if (!updatedCompany) {
      return res.status(404).json({
        success: false,
        message: "Pharmacy company not found"
      });
    }

    res.json({
      success: true,
      message: "Pharmacy company updated successfully",
      data: updatedCompany
    });
  } catch (error) {
    console.error("❌ Error updating pharmacy company:", error);
    res.status(500).json({
      success: false,
      message: "Error updating pharmacy company",
      error: error.message
    });
  }
};

/* --------------------------------------------
   🗑️ Delete Pharmacy Company (Soft Delete)
-------------------------------------------- */
export const deletePharmacyCompany = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedCompany = await PharmacyCompany.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!deletedCompany) {
      return res.status(404).json({
        success: false,
        message: "Pharmacy company not found"
      });
    }

    res.json({
      success: true,
      message: "Pharmacy company deleted successfully",
      data: deletedCompany
    });
  } catch (error) {
    console.error("❌ Error deleting pharmacy company:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting pharmacy company",
      error: error.message
    });
  }
};



/* --------------------------------------------
   🧹 Initialize Dummy Pharmacy Companies
-------------------------------------------- */
export const initializePharmacyCompanies = async () => {
  try {
    const count = await PharmacyCompany.countDocuments({ isActive: true });
    if (count > 0) {
      console.log("ℹ️ Pharmacy companies already exist, skipping initialization.");
      return;
    }

    const dummyPharmacyCompanies = [
      {
        name: "Medico Plus Pharmacy",
        licenseNumber: "PHARMA-PK-001",
        address: {
          street: "123 Main Boulevard",
          city: "Karachi",
          state: "Sindh",
          country: "Pakistan",
          zipCode: "75500"
        },
        contact: {
          phone: "+92-21-34567890",
          email: "info@medicoplus.com"
        },
        manager: "Ahmed Raza",
        specialties: ["General Medicine", "Prescription Drugs", "Health Supplements"]
      },
      {
        name: "HealthFirst Pharmacy",
        licenseNumber: "PHARMA-PK-002",
        address: {
          street: "456 Liberty Market",
          city: "Lahore",
          state: "Punjab",
          country: "Pakistan",
          zipCode: "54000"
        },
        contact: {
          phone: "+92-42-37654321",
          email: "contact@healthfirst.com"
        },
        manager: "Fatima Khan",
        specialties: ["Cardiac Care", "Diabetes Management", "Pediatric Medicine"]
      },
      {
        name: "Curex Pharmaceuticals",
        licenseNumber: "PHARMA-PK-003",
        address: {
          street: "789 Blue Area",
          city: "Islamabad",
          state: "Federal",
          country: "Pakistan",
          zipCode: "44000"
        },
        contact: {
          phone: "+92-51-23456789",
          email: "admin@curexpharma.com"
        },
        manager: "Bilal Ahmed",
        specialties: ["Specialty Drugs", "Import Medicines", "Hospital Supply"]
      },
      {
        name: "Wellness Forever Pharmacy",
        licenseNumber: "PHARMA-PK-004",
        address: {
          street: "321 Commercial Area",
          city: "Rawalpindi",
          state: "Punjab",
          country: "Pakistan",
          zipCode: "46000"
        },
        contact: {
          phone: "+92-51-76543210",
          email: "care@wellnessforever.com"
        },
        manager: "Sara Javed",
        specialties: ["Ayurvedic Medicine", "Wellness Products", "Natural Supplements"]
      }
    ];

    await PharmacyCompany.insertMany(dummyPharmacyCompanies);
    console.log("✅ Dummy pharmacy companies initialized successfully.");
  } catch (error) {
    console.error("❌ Error initializing pharmacy companies:", error.message);
  }
};

/* --------------------------------------------
   🔄 Clear Stats Cache (for development)
-------------------------------------------- */
export const clearStatsCache = async (req, res) => {
  try {
    const beforeSize = statsCache.size;
    statsCache.clear();
    console.log(`🧹 Cleared stats cache (${beforeSize} entries)`);
    
    res.json({
      success: true,
      message: `Stats cache cleared (${beforeSize} entries)`
    });
  } catch (error) {
    console.error("❌ Error clearing cache:", error);
    res.status(500).json({
      success: false,
      message: "Error clearing cache",
      error: error.message
    });
  }
};


export const updatePharmacyBlockchainAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const { blockchainAddress } = req.body;

    console.log(`🔗 Updating blockchain address for pharmacy company: ${id}`);

    // Validate the ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid pharmacy company ID"
      });
    }

    // Validate Ethereum address format
    if (blockchainAddress && blockchainAddress !== '') {
      const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
      if (!ethAddressRegex.test(blockchainAddress)) {
        return res.status(400).json({
          success: false,
          message: "Invalid Ethereum address format"
        });
      }
    }

    // Update the company with blockchain address
    const updatedCompany = await PharmacyCompany.findByIdAndUpdate(
      id,
      { 
        blockchainAddress: blockchainAddress ? blockchainAddress.toLowerCase() : '',
        metamaskConnected: !!blockchainAddress,
        ...(blockchainAddress && {
          metamaskConnectionData: {
            connectedAt: new Date(),
            address: blockchainAddress.toLowerCase()
          }
        }),
        ...(!blockchainAddress && {
          metamaskConnectionData: null
        })
      },
      { new: true, runValidators: true }
    );

    if (!updatedCompany) {
      return res.status(404).json({
        success: false,
        message: "Pharmacy company not found"
      });
    }

    console.log(`✅ Blockchain address updated for ${updatedCompany.name}: ${updatedCompany.blockchainAddress || 'disconnected'}`);

    res.json({
      success: true,
      message: blockchainAddress ? 
        "Blockchain address connected successfully" : 
        "Blockchain address disconnected successfully",
      data: {
        id: updatedCompany._id,
        companyName: updatedCompany.name,
        blockchainAddress: updatedCompany.blockchainAddress,
        metamaskConnected: updatedCompany.metamaskConnected
      }
    });

  } catch (error) {
    console.error("❌ Error updating pharmacy blockchain address:", error);
    res.status(500).json({
      success: false,
      message: "Error updating blockchain address",
      error: error.message
    });
  }
};

/* --------------------------------------------
   🔍 Get Pharmacy Company MetaMask Status
-------------------------------------------- */
export const getPharmacyMetaMaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    const company = await PharmacyCompany.findById(id)
      .select('name blockchainAddress metamaskConnected metamaskConnectionData');
    
    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Pharmacy company not found"
      });
    }
    
    res.json({
      success: true,
      data: {
        companyName: company.name,
        blockchainAddress: company.blockchainAddress,
        metamaskConnected: company.metamaskConnected,
        connectionData: company.metamaskConnectionData
      }
    });
  } catch (error) {
    console.error("Error getting MetaMask status:", error);
    res.status(500).json({
      success: false,
      message: "Error getting MetaMask status",
      error: error.message
    });
  }
};

// ... keep the rest of your functions (createPharmacyCompany, updatePharmacyCompany, etc.) the same


// Good news is this works

// bad news is its slow


// import mongoose from "mongoose";
// import PharmacyCompany from "../models/PharmacyCompany.js";
// import PharmacyMedicine from "../models/PharmacyMedicine.js";

// // Cache for stats to prevent frequent database queries
// const statsCache = new Map();
// const CACHE_DURATION = 30000; // 30 seconds

// /* --------------------------------------------
//    🏪 Get All Pharmacy Companies
// -------------------------------------------- */
// export const getAllPharmacyCompanies = async (req, res) => {
//   try {
//     const companies = await PharmacyCompany.find({ isActive: true })
//       .sort({ name: 1 });

//     console.log(`✅ Fetched ${companies.length} pharmacy companies`);
    
//     res.json({
//       success: true,
//       data: companies
//     });
//   } catch (error) {
//     console.error("❌ Error fetching pharmacy companies:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error fetching pharmacy companies",
//       error: error.message
//     });
//   }
// };

// /* --------------------------------------------
//    ➕ Create New Pharmacy Company
// -------------------------------------------- */
// export const createPharmacyCompany = async (req, res) => {
//   try {
//     const {
//       name,
//       licenseNumber,
//       address,
//       contact,
//       manager,
//       establishedDate,
//       specialties
//     } = req.body;

//     console.log("🏪 Creating pharmacy company:", { name, licenseNumber, manager });

//     // Check if company already exists
//     const existingCompany = await PharmacyCompany.findOne({
//       $or: [
//         { name: name.trim() },
//         { licenseNumber: licenseNumber.trim() }
//       ]
//     });

//     if (existingCompany) {
//       return res.status(400).json({
//         success: false,
//         message: "Pharmacy company with this name or license number already exists"
//       });
//     }

//     const pharmacyCompany = new PharmacyCompany({
//       name: name.trim(),
//       licenseNumber: licenseNumber.trim(),
//       address: {
//         street: address?.street?.trim() || '',
//         city: address?.city?.trim() || '',
//         state: address?.state?.trim() || '',
//         country: address?.country?.trim() || 'Pakistan',
//         zipCode: address?.zipCode?.trim() || ''
//       },
//       contact: {
//         phone: contact?.phone?.trim(),
//         email: contact?.email?.trim().toLowerCase()
//       },
//       manager: manager.trim(),
//       establishedDate: establishedDate ? new Date(establishedDate) : new Date(),
//       specialties: specialties || [],
//       isActive: true
//     });

//     await pharmacyCompany.save();

//     console.log("✅ Pharmacy company created successfully:", name);

//     res.status(201).json({
//       success: true,
//       message: "Pharmacy company created successfully",
//       data: pharmacyCompany
//     });

//   } catch (error) {
//     console.error("❌ Error creating pharmacy company:", error.message);
//     res.status(500).json({
//       success: false,
//       message: "Error creating pharmacy company",
//       error: error.message
//     });
//   }
// };

// /* --------------------------------------------
//    ✏️ Update Pharmacy Company
// -------------------------------------------- */
// export const updatePharmacyCompany = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const updates = req.body;

//     const updatedCompany = await PharmacyCompany.findByIdAndUpdate(
//       id,
//       updates,
//       { new: true, runValidators: true }
//     );

//     if (!updatedCompany) {
//       return res.status(404).json({
//         success: false,
//         message: "Pharmacy company not found"
//       });
//     }

//     res.json({
//       success: true,
//       message: "Pharmacy company updated successfully",
//       data: updatedCompany
//     });
//   } catch (error) {
//     console.error("❌ Error updating pharmacy company:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error updating pharmacy company",
//       error: error.message
//     });
//   }
// };

// /* --------------------------------------------
//    🗑️ Delete Pharmacy Company (Soft Delete)
// -------------------------------------------- */
// export const deletePharmacyCompany = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const deletedCompany = await PharmacyCompany.findByIdAndUpdate(
//       id,
//       { isActive: false },
//       { new: true }
//     );

//     if (!deletedCompany) {
//       return res.status(404).json({
//         success: false,
//         message: "Pharmacy company not found"
//       });
//     }

//     res.json({
//       success: true,
//       message: "Pharmacy company deleted successfully",
//       data: deletedCompany
//     });
//   } catch (error) {
//     console.error("❌ Error deleting pharmacy company:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error deleting pharmacy company",
//       error: error.message
//     });
//   }
// };

// /* --------------------------------------------
//    📊 Get Pharmacy Company Statistics
// -------------------------------------------- */
// export const getPharmacyCompanyStats = async (req, res) => {
//   try {
//     const { id } = req.params;

//     console.log(`📊 Fetching stats for pharmacy company: ${id}`);

//     // Validate the ID
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid pharmacy company ID"
//       });
//     }

//     // Check cache first
//     const cacheKey = `stats-${id}`;
//     const cached = statsCache.get(cacheKey);
//     if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
//       console.log(`📊 Returning cached stats for company: ${id}`);
//       return res.json({
//         success: true,
//         data: cached.data,
//         cached: true
//       });
//     }

//     // Verify company exists first
//     const company = await PharmacyCompany.findById(id);
//     if (!company) {
//       return res.status(404).json({
//         success: false,
//         message: "Pharmacy company not found"
//       });
//     }

//     // Get all counts in parallel for better performance
//     const [
//       totalMedicines,
//       verifiedMedicines,
//       expiredMedicines,
//       activeMedicines,
//       medicineStats
//     ] = await Promise.all([
//       // Total medicines count
//       PharmacyMedicine.countDocuments({ pharmacyCompany: id }),
      
//       // Verified medicines count
//       PharmacyMedicine.countDocuments({ 
//         pharmacyCompany: id, 
//         blockchainVerified: true 
//       }),
      
//       // Expired medicines count
//       PharmacyMedicine.countDocuments({
//         pharmacyCompany: id,
//         expiryDate: { $lt: new Date() }
//       }),
      
//       // Active medicines count
//       PharmacyMedicine.countDocuments({
//         pharmacyCompany: id,
//         status: 'Active',
//         expiryDate: { $gte: new Date() }
//       }),
      
//       // Status distribution
//       PharmacyMedicine.aggregate([
//         {
//           $match: { 
//             pharmacyCompany: new mongoose.Types.ObjectId(id) 
//           }
//         },
//         {
//           $group: {
//             _id: '$status',
//             count: { $sum: 1 }
//           }
//         }
//       ])
//     ]);

//     const statsData = {
//       totalMedicines,
//       verifiedMedicines,
//       expiredMedicines,
//       activeMedicines,
//       statusDistribution: medicineStats,
//       companyName: company.name
//     };

//     // Cache the results
//     statsCache.set(cacheKey, {
//       data: statsData,
//       timestamp: Date.now()
//     });

//     console.log(`📊 Final stats for company ${company.name}:`, statsData);

//     res.json({
//       success: true,
//       data: statsData,
//       cached: false
//     });

//   } catch (error) {
//     console.error("❌ Error fetching pharmacy stats:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error fetching pharmacy statistics",
//       error: error.message
//     });
//   }
// };

// /* --------------------------------------------
//    🧹 Initialize Dummy Pharmacy Companies
// -------------------------------------------- */
// export const initializePharmacyCompanies = async () => {
//   try {
//     const count = await PharmacyCompany.countDocuments({ isActive: true });
//     if (count > 0) {
//       console.log("ℹ️ Pharmacy companies already exist, skipping initialization.");
//       return;
//     }

//     const dummyPharmacyCompanies = [
//       {
//         name: "Medico Plus Pharmacy",
//         licenseNumber: "PHARMA-PK-001",
//         address: {
//           street: "123 Main Boulevard",
//           city: "Karachi",
//           state: "Sindh",
//           country: "Pakistan",
//           zipCode: "75500"
//         },
//         contact: {
//           phone: "+92-21-34567890",
//           email: "info@medicoplus.com"
//         },
//         manager: "Ahmed Raza",
//         specialties: ["General Medicine", "Prescription Drugs", "Health Supplements"]
//       },
//       {
//         name: "HealthFirst Pharmacy",
//         licenseNumber: "PHARMA-PK-002",
//         address: {
//           street: "456 Liberty Market",
//           city: "Lahore",
//           state: "Punjab",
//           country: "Pakistan",
//           zipCode: "54000"
//         },
//         contact: {
//           phone: "+92-42-37654321",
//           email: "contact@healthfirst.com"
//         },
//         manager: "Fatima Khan",
//         specialties: ["Cardiac Care", "Diabetes Management", "Pediatric Medicine"]
//       },
//       {
//         name: "Curex Pharmaceuticals",
//         licenseNumber: "PHARMA-PK-003",
//         address: {
//           street: "789 Blue Area",
//           city: "Islamabad",
//           state: "Federal",
//           country: "Pakistan",
//           zipCode: "44000"
//         },
//         contact: {
//           phone: "+92-51-23456789",
//           email: "admin@curexpharma.com"
//         },
//         manager: "Bilal Ahmed",
//         specialties: ["Specialty Drugs", "Import Medicines", "Hospital Supply"]
//       },
//       {
//         name: "Wellness Forever Pharmacy",
//         licenseNumber: "PHARMA-PK-004",
//         address: {
//           street: "321 Commercial Area",
//           city: "Rawalpindi",
//           state: "Punjab",
//           country: "Pakistan",
//           zipCode: "46000"
//         },
//         contact: {
//           phone: "+92-51-76543210",
//           email: "care@wellnessforever.com"
//         },
//         manager: "Sara Javed",
//         specialties: ["Ayurvedic Medicine", "Wellness Products", "Natural Supplements"]
//       }
//     ];

//     await PharmacyCompany.insertMany(dummyPharmacyCompanies);
//     console.log("✅ Dummy pharmacy companies initialized successfully.");
//   } catch (error) {
//     console.error("❌ Error initializing pharmacy companies:", error.message);
//   }
// };

// /* --------------------------------------------
//    🔄 Clear Stats Cache (for development)
// -------------------------------------------- */
// export const clearStatsCache = async (req, res) => {
//   try {
//     const beforeSize = statsCache.size;
//     statsCache.clear();
//     console.log(`🧹 Cleared stats cache (${beforeSize} entries)`);
    
//     res.json({
//       success: true,
//       message: `Stats cache cleared (${beforeSize} entries)`
//     });
//   } catch (error) {
//     console.error("❌ Error clearing cache:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error clearing cache",
//       error: error.message
//     });
//   }
// };