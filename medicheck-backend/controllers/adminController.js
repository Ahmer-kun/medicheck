import Batch from '../models/Batch.js';
import User from '../models/User.js';
import PharmacyMedicine from '../models/PharmacyMedicine.js';
import PharmacyCompany from '../models/PharmacyCompany.js';
import mongoose from 'mongoose';

// ✅ Get Admin Dashboard Statistics
export const getAdminStats = async (req, res) => {
  try {
    console.log("📊 Fetching admin dashboard statistics...");

    // Get counts from all collections
    const [
      totalBatches,
      totalUsers,
      totalMedicines,
      totalPharmacyCompanies,
      activeBatches,
      expiredBatches,
      verifiedBatches,
      activeUsers,
      pendingBatchesCount
    ] = await Promise.all([
      Batch.countDocuments(),
      User.countDocuments(),
      PharmacyMedicine.countDocuments(),
      PharmacyCompany.countDocuments({ isActive: true }),
      Batch.countDocuments({ status: 'active' }),
      Batch.countDocuments({ 
        expiry: { $lt: new Date() } 
      }),
      Batch.countDocuments({ blockchainVerified: true }),
      User.countDocuments({ isActive: true }),
      Batch.countDocuments({ 
        $or: [
          { blockchainVerified: false },
          { status: { $in: ['pending', 'under_review'] } }
        ]
      })
    ]);

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentActivities = await getRecentActivity(sevenDaysAgo);

    // System health metrics
    const systemHealth = {
      database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
      uptime: Math.floor(process.uptime()),
      memoryUsage: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
      nodeVersion: process.version,
      timestamp: new Date().toLocaleString()
    };

    const stats = {
      overview: {
        totalBatches,
        totalUsers,
        totalMedicines,
        totalPharmacyCompanies,
        activeBatches,
        expiredBatches,
        verifiedBatches,
        activeUsers,
        pendingBatches: pendingBatchesCount
      },
      systemHealth,
      recentActivity: recentActivities.slice(0, 10) // Get top 10 most recent
    };

    console.log("✅ Admin stats fetched successfully");
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error("❌ Error fetching admin stats:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching admin statistics",
      error: error.message
    });
  }
};

// ✅ Get Recent Activity (Automated)
const getRecentActivity = async (sinceDate) => {
  try {
    const [recentBatches, recentMedicines, recentUsers] = await Promise.all([
      Batch.find({ createdAt: { $gte: sinceDate } })
        .sort({ createdAt: -1 })
        .select('batchNo name manufacturer createdAt status blockchainVerified')
        .lean(),
      PharmacyMedicine.find({ createdAt: { $gte: sinceDate } })
        .sort({ createdAt: -1 })
        .select('name batchNo manufacturer status createdAt blockchainVerified')
        .lean(),
      User.find({ createdAt: { $gte: sinceDate } })
        .sort({ createdAt: -1 })
        .select('username role name createdAt')
        .lean()
    ]);

    const activities = [
      ...recentBatches.map(batch => ({
        id: `batch-${batch._id}-${Date.now()}`,
        type: 'batch',
        action: batch.blockchainVerified ? 'Batch Verified' : 'Batch Created',
        message: `${batch.blockchainVerified ? 'Verified' : 'Created'} batch: ${batch.name} (${batch.batchNo})`,
        details: {
          batchNo: batch.batchNo,
          manufacturer: batch.manufacturer,
          status: batch.status
        },
        timestamp: batch.createdAt,
        user: 'System'
      })),
      ...recentMedicines.map(medicine => ({
        id: `medicine-${medicine._id}-${Date.now()}`,
        type: 'medicine',
        action: medicine.blockchainVerified ? 'Medicine Verified' : 'Medicine Added',
        message: `${medicine.blockchainVerified ? 'Verified' : 'Added'} medicine: ${medicine.name} (${medicine.batchNo})`,
        details: {
          batchNo: medicine.batchNo,
          manufacturer: medicine.manufacturer,
          status: medicine.status
        },
        timestamp: medicine.createdAt,
        user: 'System'
      })),
      ...recentUsers.map(user => ({
        id: `user-${user._id}-${Date.now()}`,
        type: 'user',
        action: 'User Created',
        message: `New user registered: ${user.name || user.username} (${user.role})`,
        details: {
          username: user.username,
          role: user.role
        },
        timestamp: user.createdAt,
        user: 'System'
      }))
    ];

    return activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    return [];
  }
};

// ✅ Get All Users (Fixed)
export const getSystemUsers = async (req, res) => {
  try {
    console.log("👥 Fetching all system users...");
    
    const users = await User.find()
      .select('username role name email isActive createdAt updatedAt')
      .sort({ createdAt: -1 })
      .lean();

    console.log(`✅ Found ${users.length} users`);
    
    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error("❌ Error fetching system users:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching system users",
      error: error.message
    });
  }
};

// ✅ Create New User (Enhanced)
export const createUser = async (req, res) => {
  try {
    const { username, password, role, name, email } = req.body;

    console.log("👤 Creating new user:", { username, role, name });

    // Validate required fields
    if (!username || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Username, password, and role are required"
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      username: username.trim().toLowerCase() 
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this username already exists"
      });
    }

    // Hash password
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.default.hash(password, 10);

    // Create new user
    const newUser = new User({
      username: username.trim().toLowerCase(),
      password: hashedPassword,
      role: role,
      name: name?.trim() || username,
      email: email?.trim().toLowerCase() || `${username}@medicheck.com`,
      isActive: true
    });

    await newUser.save();

    // Return user without password
    const userResponse = {
      id: newUser._id,
      username: newUser.username,
      role: newUser.role,
      name: newUser.name,
      email: newUser.email,
      isActive: newUser.isActive,
      createdAt: newUser.createdAt
    };

    console.log("✅ User created successfully:", username);

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: userResponse
    });

  } catch (error) {
    console.error("❌ Error creating user:", error);
    res.status(500).json({
      success: false,
      message: "Error creating user",
      error: error.message
    });
  }
};

// ✅ Update User
export const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;

    const allowedUpdates = ['role', 'isActive', 'name'];
    const updateData = {};
    
    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        updateData[field] = updates[field];
      }
    });

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('username role name email isActive createdAt');

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      message: "User updated successfully",
      data: updatedUser
    });
  } catch (error) {
    console.error("❌ Error updating user:", error);
    res.status(500).json({
      success: false,
      message: "Error updating user",
      error: error.message
    });
  }
};

// ✅ Delete User
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    console.log("🗑️ Deleting user:", userId);

    // Prevent admin from deleting themselves
    if (req.user.id === userId) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete your own account"
      });
    }

    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    console.log("✅ User deleted successfully:", deletedUser.username);

    res.json({
      success: true,
      message: "User deleted successfully",
      data: {
        id: deletedUser._id,
        username: deletedUser.username
      }
    });

  } catch (error) {
    console.error("❌ Error deleting user:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting user",
      error: error.message
    });
  }
};

// ✅ Get All Batches (Fixed)
export const getAllBatches = async (req, res) => {
  try {
    console.log("📦 Fetching all batches for admin...");

    const batches = await Batch.find()
      .sort({ createdAt: -1 })
      .select('batchNo name medicineName manufactureDate expiry formulation manufacturer pharmacy quantity status blockchainVerified createdAt')
      .lean();

    // Also get pharmacy medicines
    const pharmacyMedicines = await PharmacyMedicine.find()
      .populate('pharmacyCompany', 'name')
      .sort({ createdAt: -1 })
      .select('name batchNo medicineName manufactureDate expiryDate formulation manufacturer quantity status blockchainVerified pharmacyCompany createdAt')
      .lean();

    // Combine and format all batches
    const allBatches = [
      ...batches.map(batch => ({
        ...batch,
        type: 'manufacturer_batch',
        id: batch._id,
        expiry: batch.expiry,
        source: 'manufacturer'
      })),
      ...pharmacyMedicines.map(medicine => ({
        ...medicine,
        type: 'pharmacy_medicine',
        id: medicine._id,
        expiry: medicine.expiryDate,
        pharmacy: medicine.pharmacyCompany?.name || 'Unknown Pharmacy',
        source: 'pharmacy'
      }))
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    console.log(`✅ Found ${allBatches.length} total batches`);

    res.json({
      success: true,
      data: allBatches
    });
  } catch (error) {
    console.error("❌ Error fetching batches:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching batches",
      error: error.message
    });
  }
};

// ✅ Get Pending Batches for Approval
export const getPendingBatches = async (req, res) => {
  try {
    console.log("🔄 Fetching pending batches for admin approval...");

    // Find batches that need admin approval (not verified, or specific status)
    const pendingBatches = await Batch.find({
      $or: [
        { blockchainVerified: false },
        { status: { $in: ['pending', 'under_review'] } }
      ]
    })
    .sort({ createdAt: -1 })
    .select('batchNo name manufacturer manufactureDate expiry formulation quantity status blockchainVerified createdAt')
    .lean();

    // Also check pharmacy medicines that need approval
    const pendingMedicines = await PharmacyMedicine.find({
      blockchainVerified: false
    })
    .populate('pharmacyCompany', 'name licenseNumber')
    .sort({ createdAt: -1 })
    .select('name batchNo manufacturer expiryDate formulation quantity status blockchainVerified pharmacyCompany createdAt')
    .lean();

    const allPendingItems = [
      ...pendingBatches.map(batch => ({
        ...batch,
        type: 'batch',
        id: batch._id,
        expiry: batch.expiry
      })),
      ...pendingMedicines.map(medicine => ({
        ...medicine,
        type: 'pharmacy_medicine',
        id: medicine._id,
        expiry: medicine.expiryDate,
        pharmacy: medicine.pharmacyCompany?.name || 'Unknown Pharmacy'
      }))
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    console.log(`✅ Found ${allPendingItems.length} pending items`);
    
    res.json({
      success: true,
      data: allPendingItems
    });
  } catch (error) {
    console.error("❌ Error fetching pending batches:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching pending batches",
      error: error.message
    });
  }
};

// ✅ Approve/Reject Batch
export const updateBatchStatus = async (req, res) => {
  try {
    const { batchId } = req.params;
    const { action, reason } = req.body; // action: 'approve' or 'reject'

    console.log(`🔄 Admin ${action} for batch: ${batchId}`);

    let updatedItem;
    
    // Check if it's a batch or pharmacy medicine
    if (req.body.type === 'pharmacy_medicine') {
      updatedItem = await PharmacyMedicine.findByIdAndUpdate(
        batchId,
        { 
          blockchainVerified: action === 'approve',
          status: action === 'approve' ? 'Active' : 'Rejected'
        },
        { new: true }
      ).populate('pharmacyCompany', 'name');
    } else {
      updatedItem = await Batch.findByIdAndUpdate(
        batchId,
        { 
          blockchainVerified: action === 'approve',
          status: action === 'approve' ? 'active' : 'rejected'
        },
        { new: true }
      );
    }

    if (!updatedItem) {
      return res.status(404).json({
        success: false,
        message: "Batch or medicine not found"
      });
    }

    console.log(`✅ Admin ${action} successful for: ${updatedItem.batchNo || updatedItem.name}`);
    
    res.json({
      success: true,
      message: `Batch ${action}d successfully`,
      data: updatedItem
    });
  } catch (error) {
    console.error("❌ Error updating batch status:", error);
    res.status(500).json({
      success: false,
      message: "Error updating batch status",
      error: error.message
    });
  }
};

// ✅ Get System Logs (Automated)
export const getSystemLogs = async (req, res) => {
  try {
    console.log("📋 Fetching system logs...");

    // Get recent activities as logs
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentActivities = await getRecentActivity(sevenDaysAgo);

    // Format as logs
    const logs = recentActivities.map(activity => ({
      id: activity.id,
      message: activity.message,
      time: new Date(activity.timestamp).toLocaleTimeString(),
      date: new Date(activity.timestamp).toLocaleDateString(),
      type: activity.type,
      user: activity.user,
      details: activity.details
    }));

    res.json({
      success: true,
      data: logs
    });
  } catch (error) {
    console.error("❌ Error fetching system logs:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching system logs",
      error: error.message
    });
  }
};

// ✅ Get Recall List
export const getRecallList = async (req, res) => {
  try {
    console.log("⚠️ Fetching recall list...");

    // Find expired batches and medicines
    const expiredBatches = await Batch.find({
      expiry: { $lt: new Date() }
    })
    .select('batchNo name manufactureDate expiry formulation manufacturer')
    .lean();

    const expiredMedicines = await PharmacyMedicine.find({
      expiryDate: { $lt: new Date() }
    })
    .populate('pharmacyCompany', 'name')
    .select('name batchNo manufactureDate expiryDate formulation manufacturer pharmacyCompany')
    .lean();

    const recallList = [
      ...expiredBatches.map(batch => ({
        id: `batch-${batch._id}`,
        batchNo: batch.batchNo,
        name: batch.name,
        reason: 'Medicine expired',
        date: new Date(batch.expiry).toLocaleDateString(),
        severity: 'High',
        type: 'batch',
        manufacturer: batch.manufacturer
      })),
      ...expiredMedicines.map(medicine => ({
        id: `medicine-${medicine._id}`,
        batchNo: medicine.batchNo,
        name: medicine.name,
        reason: 'Medicine expired',
        date: new Date(medicine.expiryDate).toLocaleDateString(),
        severity: 'High',
        type: 'pharmacy_medicine',
        manufacturer: medicine.manufacturer,
        pharmacy: medicine.pharmacyCompany?.name
      }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    console.log(`✅ Found ${recallList.length} items for recall`);

    res.json({
      success: true,
      data: recallList
    });
  } catch (error) {
    console.error("❌ Error fetching recall list:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching recall list",
      error: error.message
    });
  }
};

// ✅ Delete Recall Item
export const deleteRecall = async (req, res) => {
  try {
    const { recallId } = req.params;

    console.log(`🗑️ Deleting recall item: ${recallId}`);

    // Extract type and ID from recallId format: "type-id"
    const [type, id] = recallId.split('-');

    if (type === 'batch') {
      await Batch.findByIdAndDelete(id);
    } else if (type === 'medicine') {
      await PharmacyMedicine.findByIdAndDelete(id);
    }

    res.json({
      success: true,
      message: "Recall item deleted successfully"
    });
  } catch (error) {
    console.error("❌ Error deleting recall:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting recall item",
      error: error.message
    });
  }
};


// // // ✅ FIXED IMPORTS:
// // import Batch from '../models/Batch.js';
// // import User from '../models/User.js';

// // const dummyAdminData = {
// //   totalBatches: 4,
// //   activeBatches: 3,
// //   acceptedBatches: 1,
// //   recentActivity: [
// //     { action: "New Batch Created", user: "MediLife Labs", date: "2025-10-15" },
// //     { action: "Batch Accepted", user: "CityCare Pharmacy", date: "2025-10-20" },
// //     { action: "System Initialized", user: "Admin", date: "2025-10-10" }
// //   ]
// // };

// // // ✅ CHANGED TO export const
// // export const getAdminOverview = async (req, res) => {
// //   try {
// //     const totalBatches = await Batch.countDocuments();
// //     const activeBatches = await Batch.countDocuments({ status: "active" });
// //     const acceptedBatches = await Batch.countDocuments({ status: "accepted" });
// //     const recentActivity = []; // You can add logging later

// //     // If DB empty, return dummy
// //     if (totalBatches === 0) {
// //       console.log("⚠️ No admin data in DB, returning dummy overview.");
// //       return res.json(dummyAdminData);
// //     }

// //     res.json({
// //       totalBatches,
// //       activeBatches,
// //       acceptedBatches,
// //       recentActivity
// //     });
// //   } catch (error) {
// //     res.status(500).json({ message: "Error fetching admin overview", error: error.message });
// //   }
// // };


// import Batch from '../models/Batch.js';
// import User from '../models/User.js';
// import PharmacyMedicine from '../models/PharmacyMedicine.js';
// import PharmacyCompany from '../models/PharmacyCompany.js';

// // ✅ Get Admin Dashboard Statistics
// export const getAdminStats = async (req, res) => {
//   try {
//     console.log("📊 Fetching admin dashboard statistics...");

//     // Get counts from all collections
//     const [
//       totalBatches,
//       totalUsers,
//       totalMedicines,
//       totalPharmacyCompanies,
//       activeBatches,
//       expiredBatches,
//       verifiedBatches,
//       activeUsers
//     ] = await Promise.all([
//       Batch.countDocuments(),
//       User.countDocuments(),
//       PharmacyMedicine.countDocuments(),
//       PharmacyCompany.countDocuments({ isActive: true }),
//       Batch.countDocuments({ status: 'active' }),
//       Batch.countDocuments({ 
//         expiry: { $lt: new Date() } 
//       }),
//       Batch.countDocuments({ blockchainVerified: true }),
//       User.countDocuments({ isActive: true })
//     ]);

//     // Get recent activity (last 7 days)
//     const sevenDaysAgo = new Date();
//     sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

//     const recentBatches = await Batch.find({
//       createdAt: { $gte: sevenDaysAgo }
//     })
//     .sort({ createdAt: -1 })
//     .limit(10)
//     .select('batchNo name manufacturer createdAt status')
//     .lean();

//     const recentMedicines = await PharmacyMedicine.find({
//       createdAt: { $gte: sevenDaysAgo }
//     })
//     .sort({ createdAt: -1 })
//     .limit(10)
//     .select('name batchNo manufacturer status createdAt')
//     .lean();

//     // Format recent activity
//     const recentActivity = [
//       ...recentBatches.map(batch => ({
//         type: 'batch',
//         message: `New batch registered: ${batch.name}`,
//         batchNo: batch.batchNo,
//         manufacturer: batch.manufacturer,
//         timestamp: batch.createdAt,
//         status: batch.status
//       })),
//       ...recentMedicines.map(medicine => ({
//         type: 'medicine',
//         message: `Medicine added: ${medicine.name}`,
//         batchNo: medicine.batchNo,
//         manufacturer: medicine.manufacturer,
//         timestamp: medicine.createdAt,
//         status: medicine.status
//       }))
//     ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
//      .slice(0, 10); // Get top 10 most recent

//     const stats = {
//       overview: {
//         totalBatches,
//         totalUsers,
//         totalMedicines,
//         totalPharmacyCompanies,
//         activeBatches,
//         expiredBatches,
//         verifiedBatches,
//         activeUsers
//       },
//       systemHealth: {
//         database: 'Connected',
//         uptime: process.uptime(),
//         memoryUsage: process.memoryUsage(),
//         nodeVersion: process.version
//       },
//       recentActivity
//     };

//     console.log("✅ Admin stats fetched successfully");
//     res.json({
//       success: true,
//       data: stats
//     });
//   } catch (error) {
//     console.error("❌ Error fetching admin stats:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error fetching admin statistics",
//       error: error.message
//     });
//   }
// };

// // ✅ Get Pending Batches for Approval
// export const getPendingBatches = async (req, res) => {
//   try {
//     console.log("🔄 Fetching pending batches for admin approval...");

//     // Find batches that need admin approval (not verified, or specific status)
//     const pendingBatches = await Batch.find({
//       $or: [
//         { blockchainVerified: false },
//         { status: { $in: ['pending', 'under_review'] } }
//       ]
//     })
//     .sort({ createdAt: -1 })
//     .select('batchNo name manufacturer manufactureDate expiry formulation quantity status blockchainVerified createdAt')
//     .lean();

//     // Also check pharmacy medicines that need approval
//     const pendingMedicines = await PharmacyMedicine.find({
//       blockchainVerified: false
//     })
//     .populate('pharmacyCompany', 'name licenseNumber')
//     .sort({ createdAt: -1 })
//     .select('name batchNo manufacturer expiryDate formulation quantity status blockchainVerified pharmacyCompany createdAt')
//     .lean();

//     const allPendingItems = [
//       ...pendingBatches.map(batch => ({
//         ...batch,
//         type: 'batch',
//         id: batch._id,
//         expiry: batch.expiry
//       })),
//       ...pendingMedicines.map(medicine => ({
//         ...medicine,
//         type: 'pharmacy_medicine',
//         id: medicine._id,
//         expiry: medicine.expiryDate,
//         pharmacy: medicine.pharmacyCompany?.name || 'Unknown Pharmacy'
//       }))
//     ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

//     console.log(`✅ Found ${allPendingItems.length} pending items`);
    
//     res.json({
//       success: true,
//       data: allPendingItems
//     });
//   } catch (error) {
//     console.error("❌ Error fetching pending batches:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error fetching pending batches",
//       error: error.message
//     });
//   }
// };

// // ✅ Approve/Reject Batch
// export const updateBatchStatus = async (req, res) => {
//   try {
//     const { batchId } = req.params;
//     const { action, reason } = req.body; // action: 'approve' or 'reject'

//     console.log(`🔄 Admin ${action} for batch: ${batchId}`);

//     let updatedItem;
    
//     // Check if it's a batch or pharmacy medicine
//     if (req.body.type === 'pharmacy_medicine') {
//       updatedItem = await PharmacyMedicine.findByIdAndUpdate(
//         batchId,
//         { 
//           blockchainVerified: action === 'approve',
//           status: action === 'approve' ? 'Active' : 'Rejected'
//         },
//         { new: true }
//       ).populate('pharmacyCompany', 'name');
//     } else {
//       updatedItem = await Batch.findByIdAndUpdate(
//         batchId,
//         { 
//           blockchainVerified: action === 'approve',
//           status: action === 'approve' ? 'active' : 'rejected'
//         },
//         { new: true }
//       );
//     }

//     if (!updatedItem) {
//       return res.status(404).json({
//         success: false,
//         message: "Batch or medicine not found"
//       });
//     }

//     console.log(`✅ Admin ${action} successful for: ${updatedItem.batchNo || updatedItem.name}`);
    
//     res.json({
//       success: true,
//       message: `Batch ${action}d successfully`,
//       data: updatedItem
//     });
//   } catch (error) {
//     console.error("❌ Error updating batch status:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error updating batch status",
//       error: error.message
//     });
//   }
// };

// // ✅ Get System Users
// export const getSystemUsers = async (req, res) => {
//   try {
//     const users = await User.find()
//       .select('username role name isActive createdAt')
//       .sort({ createdAt: -1 })
//       .lean();

//     res.json({
//       success: true,
//       data: users
//     });
//   } catch (error) {
//     console.error("❌ Error fetching system users:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error fetching system users",
//       error: error.message
//     });
//   }
// };

// // ✅ Update User Role/Status
// export const updateUser = async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const updates = req.body;

//     const allowedUpdates = ['role', 'isActive', 'name'];
//     const updateData = {};
    
//     allowedUpdates.forEach(field => {
//       if (updates[field] !== undefined) {
//         updateData[field] = updates[field];
//       }
//     });

//     const updatedUser = await User.findByIdAndUpdate(
//       userId,
//       updateData,
//       { new: true, runValidators: true }
//     ).select('username role name isActive createdAt');

//     if (!updatedUser) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found"
//       });
//     }

//     res.json({
//       success: true,
//       message: "User updated successfully",
//       data: updatedUser
//     });
//   } catch (error) {
//     console.error("❌ Error updating user:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error updating user",
//       error: error.message
//     });
//   }
// };





// // ✅ Create New User
// export const createUser = async (req, res) => {
//   try {
//     const { username, password, role, name, email } = req.body;

//     console.log("👤 Creating new user:", { username, role, name });

//     // Validate required fields
//     if (!username || !password || !role) {
//       return res.status(400).json({
//         success: false,
//         message: "Username, password, and role are required"
//       });
//     }

//     // Check if user already exists
//     const existingUser = await User.findOne({ 
//       $or: [
//         { username: username.trim().toLowerCase() },
//         ...(email ? [{ email: email.trim().toLowerCase() }] : [])
//       ]
//     });

//     if (existingUser) {
//       return res.status(400).json({
//         success: false,
//         message: "User with this username or email already exists"
//       });
//     }

//     // Hash password
//     const bcrypt = await import('bcryptjs');
//     const hashedPassword = await bcrypt.default.hash(password, 10);

//     // Create new user
//     const newUser = new User({
//       username: username.trim().toLowerCase(),
//       password: hashedPassword,
//       role: role,
//       name: name?.trim() || username,
//       email: email?.trim().toLowerCase(),
//       isActive: true
//     });

//     await newUser.save();

//     // Return user without password
//     const userResponse = {
//       id: newUser._id,
//       username: newUser.username,
//       role: newUser.role,
//       name: newUser.name,
//       email: newUser.email,
//       isActive: newUser.isActive,
//       createdAt: newUser.createdAt
//     };

//     console.log("✅ User created successfully:", username);

//     res.status(201).json({
//       success: true,
//       message: "User created successfully",
//       data: userResponse
//     });

//   } catch (error) {
//     console.error("❌ Error creating user:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error creating user",
//       error: error.message
//     });
//   }
// };

// // ✅ Delete User
// export const deleteUser = async (req, res) => {
//   try {
//     const { userId } = req.params;

//     console.log("🗑️ Deleting user:", userId);

//     // Prevent admin from deleting themselves
//     if (req.user.id === userId) {
//       return res.status(400).json({
//         success: false,
//         message: "Cannot delete your own account"
//       });
//     }

//     const deletedUser = await User.findByIdAndDelete(userId);

//     if (!deletedUser) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found"
//       });
//     }

//     console.log("✅ User deleted successfully:", deletedUser.username);

//     res.json({
//       success: true,
//       message: "User deleted successfully",
//       data: {
//         id: deletedUser._id,
//         username: deletedUser.username
//       }
//     });

//   } catch (error) {
//     console.error("❌ Error deleting user:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error deleting user",
//       error: error.message
//     });
//   }
// };






// // ✅ Get System Logs (placeholder - you can implement logging later)
// export const getSystemLogs = async (req, res) => {
//   try {
//     // This would typically come from a logging system
//     // For now, return empty array or mock data
//     const logs = [];
    
//     res.json({
//       success: true,
//       data: logs
//     });
//   } catch (error) {
//     console.error("❌ Error fetching system logs:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error fetching system logs",
//       error: error.message
//     });
//   }
// };
