const Batch = require('../models/Batch');
const User = require('../models/User');
const Pharmacy = require('../models/Pharmacy');

exports.getDashboardStats = async (req, res) => {
  try {
    // Total batches count
    const totalBatches = await Batch.countDocuments();
    
    // Active batches (not expired)
    const activeBatches = await Batch.countDocuments({
      expiryDate: { $gte: new Date() },
      status: 'active'
    });
    
    // Expired batches
    const expiredBatches = await Batch.countDocuments({
      $or: [
        { expiryDate: { $lt: new Date() } },
        { status: 'expired' }
      ]
    });

    // Total users
    const totalUsers = await User.countDocuments({ isActive: true });
    
    // Total pharmacies
    const totalPharmacies = await Pharmacy.countDocuments({ isActive: true });

    // Recent batches
    const recentBatches = await Batch.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('manufacturerId', 'name')
      .populate('pharmacyId', 'name');

    res.json({
      success: true,
      stats: {
        totalBatches,
        activeBatches,
        expiredBatches,
        totalUsers,
        totalPharmacies
      },
      recentBatches
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching analytics', error: error.message });
  }
};

exports.getBatchAnalytics = async (req, res) => {
  try {
    const batchStats = await Batch.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' }
        }
      }
    ]);

    const monthlyRegistrations = await Batch.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }
    ]);

    res.json({
      success: true,
      batchStats,
      monthlyRegistrations
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching batch analytics', error: error.message });
  }
};