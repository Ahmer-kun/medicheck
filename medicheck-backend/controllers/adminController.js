import Batch from '../models/Batch.js';
import User from '../models/User.js';
import PharmacyMedicine from '../models/PharmacyMedicine.js';
import PharmacyCompany from '../models/PharmacyCompany.js';
import EmailService from '../services/emailService.js';
import mongoose from 'mongoose';



// Admin Dashboard Statistics
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

    console.log("Admin stats fetched successfully");
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching admin statistics",
      error: error.message
    });
  }
};

// Get Recent Activity (Automated)
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

// NEW CHANGE LOG FOR ACTIVE DEACTIVATE 
// Toggle User Status (Combined deactivate/reactivate)
export const toggleUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const adminId = req.user.id;

    // Prevent admin from modifying themselves
    if (userId === adminId) {
      return res.status(400).json({
        success: false,
        message: "Cannot modify your own account status"
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const newStatus = !user.isActive;
    const updateData = {
      isActive: newStatus
    };

    if (newStatus) {
      // Reactivating
      updateData.reactivatedAt = new Date();
      updateData.reactivatedBy = adminId;
      updateData.deactivatedAt = null;
      updateData.deactivatedBy = null;
    } else {
      // Deactivating
      updateData.deactivatedAt = new Date();
      updateData.deactivatedBy = adminId;
      updateData.reactivatedAt = null;
      updateData.reactivatedBy = null;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    ).select('username role name isActive deactivatedAt reactivatedAt');

    const action = newStatus ? 'reactivated' : 'deactivated';
    console.log(`User ${action}: ${updatedUser.username} by admin ${req.user.username}`);

    res.json({
      success: true,
      message: `User ${action} successfully`,
      data: updatedUser
    });

  } catch (error) {
    console.error("Error toggling user status:", error);
    res.status(500).json({
      success: false,
      message: "Error updating user status",
      error: error.message
    });
  }
};

// Deactivate User
export const deactivateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const adminId = req.user.id;

    // Prevent admin from deactivating themselves
    if (userId === adminId) {
      return res.status(400).json({
        success: false,
        message: "Cannot deactivate your own account"
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { 
        isActive: false,
        deactivatedAt: new Date(),
        deactivatedBy: adminId,
        reactivatedAt: null,
        reactivatedBy: null
      },
      { new: true }
    ).select('username role name isActive deactivatedAt');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    console.log(`User deactivated: ${user.username} by admin ${req.user.username}`);

    res.json({
      success: true,
      message: "User deactivated successfully",
      data: user
    });

  } catch (error) {
    console.error("Error deactivating user:", error);
    res.status(500).json({
      success: false,
      message: "Error deactivating user",
      error: error.message
    });
  }
};

// Reactivate User
export const reactivateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const adminId = req.user.id;

    const user = await User.findByIdAndUpdate(
      userId,
      { 
        isActive: true,
        reactivatedAt: new Date(),
        reactivatedBy: adminId,
        deactivatedAt: null,
        deactivatedBy: null
      },
      { new: true }
    ).select('username role name isActive reactivatedAt');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    console.log(`User reactivated: ${user.username} by admin ${req.user.username}`);

    res.json({
      success: true,
      message: "User reactivated successfully",
      data: user
    });

  } catch (error) {
    console.error("Error reactivating user:", error);
    res.status(500).json({
      success: false,
      message: "Error reactivating user",
      error: error.message
    });
  }
};

// Get user status history (optional)
export const getUserStatusHistory = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .select('username role name isActive deactivatedAt deactivatedBy reactivatedAt reactivatedBy createdAt')
      .populate('deactivatedBy', 'username name')
      .populate('reactivatedBy', 'username name');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const statusHistory = {
      username: user.username,
      name: user.name,
      role: user.role,
      currentStatus: user.isActive ? 'Active' : 'Deactivated',
      createdAt: user.createdAt,
      deactivatedAt: user.deactivatedAt,
      deactivatedBy: user.deactivatedBy,
      reactivatedAt: user.reactivatedAt,
      reactivatedBy: user.reactivatedBy
    };

    res.json({
      success: true,
      data: statusHistory
    });

  } catch (error) {
    console.error("Error fetching user status history:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user status history",
      error: error.message
    });
  }
};




// Get All Users (Fixed)
export const getSystemUsers = async (req, res) => {
  try {
    console.log("Fetching all system users...");
    
    const users = await User.find()
      .select('username role name email phone cnic address isActive createdAt updatedAt')
      .sort({ createdAt: -1 })
      .lean();

    console.log(`Found ${users.length} users`);
    
    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error("Error fetching system users:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching system users",
      error: error.message
    });
  }
};

// ✅ Update User
export const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;

    const allowedUpdates = ['role', 'isActive', 'name', 'email', 'phone', 'cnic', 'address'];
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
    ).select('username role name email phone cnic address isActive createdAt');

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
    console.error("Error updating user:", error);
    res.status(500).json({
      success: false,
      message: "Error updating user",
      error: error.message
    });
  }
};

// Delete User
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    console.log("Deleting user:", userId);

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

    console.log("User deleted successfully:", deletedUser.username);

    res.json({
      success: true,
      message: "User deleted successfully",
      data: {
        id: deletedUser._id,
        username: deletedUser.username
      }
    });

  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting user",
      error: error.message
    });
  }
};

// Get All Batches (Fixed)
export const getAllBatches = async (req, res) => {
  try {
    console.log("Fetching all batches for admin...");

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

    console.log(`Found ${allBatches.length} total batches`);

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

// Get Pending Batches for Approval
export const getPendingBatches = async (req, res) => {
  try {
    console.log("Fetching pending batches for admin approval...");

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

    console.log(`Found ${allPendingItems.length} pending items`);
    
    res.json({
      success: true,
      data: allPendingItems
    });
  } catch (error) {
    console.error("Error fetching pending batches:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching pending batches",
      error: error.message
    });
  }
};

// Approve/Reject Batch
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

    console.log(`Admin ${action} successful for: ${updatedItem.batchNo || updatedItem.name}`);
    
    res.json({
      success: true,
      message: `Batch ${action}d successfully`,
      data: updatedItem
    });
  } catch (error) {
    console.error("Error updating batch status:", error);
    res.status(500).json({
      success: false,
      message: "Error updating batch status",
      error: error.message
    });
  }
};

// Get System Logs (Automated)
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
    console.error("Error fetching system logs:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching system logs",
      error: error.message
    });
  }
};

// Get Recall List
export const getRecallList = async (req, res) => {
  try {
    console.log("Fetching recall list...");

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

    console.log(`Found ${recallList.length} items for recall`);

    res.json({
      success: true,
      data: recallList
    });
  } catch (error) {
    console.error("Error fetching recall list:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching recall list",
      error: error.message
    });
  }
};

// Delete Recall Item
export const deleteRecall = async (req, res) => {
  try {
    const { recallId } = req.params;

    console.log(`Deleting recall item: ${recallId}`);

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


// Created New User Email Connectivity
export const createUser = async (req, res) => {
  try {
    const { username, password, role, name, email, phone, cnic, address } = req.body;

    console.log("Creating new user:", { username, role, name, phone, cnic });

    // Validate required fields
    if (!username || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Username, password, and role are required"
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [
        { username: username.trim().toLowerCase() },
        { cnic: cnic?.trim() }
      ]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this username or CNIC already exists"
      });
    }

    // Hash password
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.default.hash(password, 10);

    // Create new user with all fields
    const newUser = new User({
      username: username.trim().toLowerCase(),
      password: hashedPassword,
      role: role,
      name: name?.trim() || username,
      email: email?.trim().toLowerCase() || `${username}@medicheck.com`,
      phone: phone?.trim() || '',
      cnic: cnic?.trim() || '',
      address: address?.trim() || '',
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
      phone: newUser.phone,
      cnic: newUser.cnic,
      address: newUser.address,
      isActive: newUser.isActive,
      createdAt: newUser.createdAt
    };

    console.log("User created successfully:", username);

    // Mails sent automatically no need for aync
    try {
      await EmailService.sendUserRegistrationEmail(userResponse, password);
      console.log("Welcome email sent to:", userResponse.email);
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
      // Don't fail the request if email fails
    }

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: userResponse,
      emailSent: true
    });

  } catch (error) {
    console.error("Error creating user:", error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      if (error.keyPattern?.cnic) {
        return res.status(400).json({
          success: false,
          message: "User with this CNIC already exists"
        });
      }
    }
    
    res.status(500).json({
      success: false,
      message: "Error creating user",
      error: error.message
    });
  }
};

// Update Password Reset to send email
export const resetUserPassword = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newPassword } = req.body;

    // Validate password strength
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long"
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Hash the new password
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.default.hash(newPassword, 10);

    // Update user password
    user.password = hashedPassword;
    await user.save();

    console.log(`Password reset for user: ${user.username} by admin ${req.user.username}`);

    // Send password reset email
    try {
      await EmailService.sendPasswordResetEmail(user, newPassword);
      console.log("Password reset email sent to:", user.email);
    } catch (emailError) {
      console.error("Failed to send password reset email:", emailError);
    }

    res.json({
      success: true,
      message: "Password reset successfully",
      emailSent: true
    });

  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({
      success: false,
      message: "Error resetting password",
      error: error.message
    });
  }
};
