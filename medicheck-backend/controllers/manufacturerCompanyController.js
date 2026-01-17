import mongoose from "mongoose";
import ManufacturerCompany from "../models/ManufacturerCompany.js";
import Batch from "../models/Batch.js";

// Cache for stats to prevent frequent database queries
const statsCache = new Map();
const CACHE_DURATION = 30000; // 30 seconds

/* --------------------------------------------
   Get All Manufacturer Companies WITH BULK STATS
-------------------------------------------- */
export const getAllManufacturerCompanies = async (req, res) => {
  try {
    console.log("Fetching all manufacturer companies with bulk stats...");
    
    const companies = await ManufacturerCompany.find({ isActive: true })
      .sort({ companyName: 1 })
      .lean();

    if (companies.length === 0) {
      return res.json({
        success: true,
        data: []
      });
    }

    // Get company names for bulk query
    const companyNames = companies.map(company => company.companyName);

    // In the getAllManufacturerCompanies function, last updated the batchStats aggregation:
const batchStats = await Batch.aggregate([
  {
    $match: {
      manufacturer: { $in: companyNames }
    }
  },
  {
    $group: {
      _id: "$manufacturer",
      totalBatches: { $sum: 1 },
      verifiedBatches: {
        $sum: { $cond: [{ $eq: ["$blockchainVerified", true] }, 1, 0] }
      },
      expiredBatches: {
        $sum: {
          $cond: [{ $lt: ["$expiry", new Date()] }, 1, 0]
        }
      },
      activeBatches: {
        $sum: {
          $cond: [
            {
              $and: [
                { $eq: ["$status", "active"] },
                { $gte: ["$expiry", new Date()] }
              ]
            },
            1,
            0
          ]
        }
      }
    }
  }
]);
    // Convert stats to a map for easy lookup
    const statsMap = new Map();
    batchStats.forEach(stat => {
      statsMap.set(stat._id, {
        totalBatches: stat.totalBatches,
        verifiedBatches: stat.verifiedBatches,
        expiredBatches: stat.expiredBatches
      });
    });

    // Merge stats with companies
    const companiesWithStats = companies.map(company => {
      const companyStats = statsMap.get(company.companyName) || {
        totalBatches: 0,
        verifiedBatches: 0,
        expiredBatches: 0
      };
      
      return {
        ...company,
        ...companyStats
      };
    });

    console.log(`Fetched ${companies.length} manufacturer companies with bulk stats`);
    
    res.json({
      success: true,
      data: companiesWithStats
    });
  } catch (error) {
    console.error("Error fetching manufacturer companies:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching manufacturer companies",
      error: error.message
    });
  }
};

/* --------------------------------------------
   Get Manufacturer Company Statistics - OPTIMIZED
-------------------------------------------- */
export const getManufacturerCompanyStats = async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`Fetching detailed stats for manufacturer company: ${id}`);

    // Validate the ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid manufacturer company ID"
      });
    }

    // Get company name first
    const company = await ManufacturerCompany.findById(id);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Manufacturer company not found"
      });
    }

    // Check cache first
    const cacheKey = `manufacturer-stats-${id}`;
    const cached = statsCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log(`Returning cached stats for manufacturer: ${id}`);
      return res.json({
        success: true,
        data: cached.data,
        cached: true
      });
    }

    // Get detailed stats in a single aggregation
    const detailedStats = await Batch.aggregate([
      {
        $match: {
          manufacturer: company.companyName
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
                totalBatches: { $sum: 1 },
                verifiedBatches: {
                  $sum: { $cond: [{ $eq: ["$blockchainVerified", true] }, 1, 0] }
                },
                expiredBatches: {
                  $sum: { $cond: [{ $lt: ["$expiry", new Date()] }, 1, 0] }
                },
                activeBatches: {
                  $sum: {
                    $cond: [
                      {
                        $and: [
                          { $eq: ["$status", "active"] },
                          { $gte: ["$expiry", new Date()] }
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
      totalBatches: 0,
      verifiedBatches: 0,
      expiredBatches: 0,
      activeBatches: 0
    };

    const statsData = {
      totalBatches: totalStats.totalBatches,
      verifiedBatches: totalStats.verifiedBatches,
      expiredBatches: totalStats.expiredBatches,
      activeBatches: totalStats.activeBatches,
      statusDistribution: statusDistribution
    };

    // Cache the results
    statsCache.set(cacheKey, {
      data: statsData,
      timestamp: Date.now()
    });

    console.log(`Final detailed stats for manufacturer ${id}:`, statsData);

    res.json({
      success: true,
      data: statsData,
      cached: false
    });

  } catch (error) {
    console.error("Error fetching manufacturer stats:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching manufacturer statistics",
      error: error.message
    });
  }
};


/* --------------------------------------------
   Create New Manufacturer Company - ENHANCED VALIDATION
-------------------------------------------- */
export const createManufacturerCompany = async (req, res) => {
  try {
    const {
      companyName,
      licenseNumber,
      address,
      contactEmail,
      phone,
      specialties
    } = req.body;

    console.log("Creating manufacturer company:", { companyName, licenseNumber });

    // Enhanced input validation
    if (!companyName?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Company name is required"
      });
    }

    if (!licenseNumber?.trim()) {
      return res.status(400).json({
        success: false,
        message: "License number is required"
      });
    }

    if (!contactEmail?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Contact email is required"
      });
    }

    if (!phone?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required"
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactEmail.trim())) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address"
      });
    }

    // Phone format validation (basic)
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,15}$/;
    const cleanPhone = phone.replace(/\s/g, '');
    if (!phoneRegex.test(cleanPhone)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid phone number"
      });
    }

    // Address validation
    if (!address?.city?.trim()) {
      return res.status(400).json({
        success: false,
        message: "City is required"
      });
    }

    if (!address?.state?.trim()) {
      return res.status(400).json({
        success: false,
        message: "State is required"
      });
    }

    // Check length constraints
    if (companyName.trim().length > 100) {
      return res.status(400).json({
        success: false,
        message: "Company name cannot exceed 100 characters"
      });
    }

    if (licenseNumber.trim().length > 50) {
      return res.status(400).json({
        success: false,
        message: "License number cannot exceed 50 characters"
      });
    }

    // Check if company already exists
    const existingCompany = await ManufacturerCompany.findOne({
      $or: [
        { companyName: companyName.trim().toLowerCase() },
        { licenseNumber: licenseNumber.trim() }
      ]
    });

    if (existingCompany) {
      return res.status(400).json({
        success: false,
        message: "Manufacturer company with this name or license number already exists"
      });
    }

    // Validate specialties
    const validSpecialties = (specialties || []).filter(s => 
      s && s.trim() && s.trim().length <= 50
    ).slice(0, 10); // Limit to 10 specialties

    const manufacturerCompany = new ManufacturerCompany({
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
      phone: phone.trim(),
      specialties: validSpecialties,
      isActive: true
    });

    await manufacturerCompany.save();

    console.log("Manufacturer company created successfully:", companyName);

    res.status(201).json({
      success: true,
      message: "Manufacturer company created successfully",
      data: manufacturerCompany
    });

  } catch (error) {
    console.error("Error creating manufacturer company:", error.message);
    
    // Handle MongoDB validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: messages
      });
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Manufacturer company already exists with this name or license number"
      });
    }

    res.status(500).json({
      success: false,
      message: "Error creating manufacturer company",
      error: error.message
    });
  }
};

/* --------------------------------------------
   Update Manufacturer Company
-------------------------------------------- */
export const updateManufacturerCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedCompany = await ManufacturerCompany.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    if (!updatedCompany) {
      return res.status(404).json({
        success: false,
        message: "Manufacturer company not found"
      });
    }

    res.json({
      success: true,
      message: "Manufacturer company updated successfully",
      data: updatedCompany
    });
  } catch (error) {
    console.error("Error updating manufacturer company:", error);
    res.status(500).json({
      success: false,
      message: "Error updating manufacturer company",
      error: error.message
    });
  }
};

/* --------------------------------------------
   Delete Manufacturer Company (Soft Delete)
-------------------------------------------- */
export const deleteManufacturerCompany = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedCompany = await ManufacturerCompany.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!deletedCompany) {
      return res.status(404).json({
        success: false,
        message: "Manufacturer company not found"
      });
    }

    res.json({
      success: true,
      message: "Manufacturer company deleted successfully",
      data: deletedCompany
    });
  } catch (error) {
    console.error("Error deleting manufacturer company:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting manufacturer company",
      error: error.message
    });
  }
};

/* --------------------------------------------
   Initialize Dummy Manufacturer Companies
-------------------------------------------- */
export const initializeManufacturerCompanies = async () => {
  try {
    const count = await ManufacturerCompany.countDocuments({ isActive: true });
    if (count > 0) {
      console.log("Manufacturer companies already exist, skipping initialization.");
      return;
    }

    const dummyManufacturerCompanies = [];

    await ManufacturerCompany.insertMany(dummyManufacturerCompanies);
    console.log("Dummy manufacturer companies initialized successfully.");
  } catch (error) {
    console.error("Error initializing manufacturer companies:", error.message);
  }
};

/* --------------------------------------------
   Clear Stats Cache (for development)
-------------------------------------------- */
export const clearManufacturerStatsCache = async (req, res) => {
  try {
    const beforeSize = statsCache.size;
    statsCache.clear();
    console.log(`Cleared manufacturer stats cache (${beforeSize} entries)`);
    
    res.json({
      success: true,
      message: `Manufacturer stats cache cleared (${beforeSize} entries)`
    });
  } catch (error) {
    console.error("Error clearing cache:", error);
    res.status(500).json({
      success: false,
      message: "Error clearing cache",
      error: error.message
    });
  }
};


/* --------------------------------------------
   Update Manufacturer Company Blockchain Address
-------------------------------------------- */
export const updateManufacturerBlockchainAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const { blockchainAddress } = req.body;

    console.log(`Updating blockchain address for manufacturer company: ${id}`);

    // Validate the ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid manufacturer company ID"
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
    const updatedCompany = await ManufacturerCompany.findByIdAndUpdate(
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
        message: "Manufacturer company not found"
      });
    }

    console.log(`Blockchain address updated for ${updatedCompany.companyName}: ${updatedCompany.blockchainAddress || 'disconnected'}`);

    res.json({
      success: true,
      message: blockchainAddress ? 
        "Blockchain address connected successfully" : 
        "Blockchain address disconnected successfully",
      data: {
        id: updatedCompany._id,
        companyName: updatedCompany.companyName,
        blockchainAddress: updatedCompany.blockchainAddress,
        metamaskConnected: updatedCompany.metamaskConnected
      }
    });

  } catch (error) {
    console.error("Error updating manufacturer blockchain address:", error);
    res.status(500).json({
      success: false,
      message: "Error updating blockchain address",
      error: error.message
    });
  }
};

/* --------------------------------------------
   Get Manufacturer Company MetaMask Status
-------------------------------------------- */
export const getManufacturerMetaMaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    const company = await ManufacturerCompany.findById(id)
      .select('companyName blockchainAddress metamaskConnected metamaskConnectionData');
    
    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Manufacturer company not found"
      });
    }
    
    res.json({
      success: true,
      data: {
        companyName: company.companyName,
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
