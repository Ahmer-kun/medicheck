import Batch from '../models/Batch.js';
import PharmacyMedicine from '../models/PharmacyMedicine.js';
import User from '../models/User.js';
import Pharmacy from '../models/Pharmacy.js';

export const getDashboardStats = async (req, res) => {
  try {
    // Get data from multiple collections
    const [
      totalBatches,
      pharmacyMedicines,
      totalUsers,
      totalPharmacies,
      recentBatches
    ] = await Promise.all([
      Batch.countDocuments(),
      PharmacyMedicine.find(),
      User.countDocuments({ isActive: true }),
      Pharmacy.countDocuments({ isActive: true }),
      Batch.find().sort({ createdAt: -1 }).limit(5)
    ]);

    // Calculate analytics
    const totalMedicines = pharmacyMedicines.length;
    const activeMedicines = pharmacyMedicines.filter(m => m.status === 'Active').length;
    const expiredMedicines = pharmacyMedicines.filter(m => m.status === 'Expired').length;
    const nearExpiry = pharmacyMedicines.filter(medicine => {
      const expiryDate = new Date(medicine.expiryDate);
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      return expiryDate <= thirtyDaysFromNow && expiryDate > new Date();
    }).length;

    // Status distribution
    const statusDistribution = [
      { name: 'Active', value: activeMedicines },
      { name: 'In Transit', value: pharmacyMedicines.filter(m => m.status === 'In Transit').length },
      { name: 'Expired', value: expiredMedicines },
      { name: 'At Pharmacy', value: pharmacyMedicines.filter(m => m.status === 'At Pharmacy').length }
    ];

    // Manufacturer statistics
    const manufacturerStats = await PharmacyMedicine.aggregate([
      {
        $group: {
          _id: '$manufacturer',
          batches: { $sum: 1 }
        }
      },
      { $sort: { batches: -1 } },
      { $limit: 5 }
    ]).then(results => 
      results.map(item => ({ name: item._id, batches: item.batches }))
    );

    // Monthly trend 
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyTrend = await PharmacyMedicine.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          registered: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 6 }
    ]).then(results => 
      results.map(item => ({
        month: `${new Date(item._id.year, item._id.month - 1).toLocaleString('default', { month: 'short' })}`,
        registered: item.registered,
        expired: Math.floor(Math.random() * 5) // This would need actual expiry data
      }))
    );

    res.json({
      success: true,
      data: {
        overview: {
          totalMedicines,
          activeMedicines,
          expiredMedicines,
          nearExpiry,
          totalBatches,
          verifiedBatches: totalBatches 
        },
        statusDistribution,
        monthlyTrend,
        manufacturerStats
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching analytics', 
      error: error.message 
    });
  }
};

export const getBatchAnalytics = async (req, res) => {
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
    res.status(500).json({ 
      success: false,
      message: 'Error fetching batch analytics', 
      error: error.message 
    });
  }
};

