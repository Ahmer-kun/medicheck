const Pharmacy = require('../models/Pharmacy');

// Initialize default pharmacies
const initializeDefaultPharmacies = async () => {
  const defaultPharmacies = [
    {
      name: "Dvago Pharmacy",
      location: "Karachi, Pakistan",
      manager: "Ahmed Khan",
      contact: {
        email: "ahmed@dvagopharmacy.com",
        phone: "+92-300-1234567"
      },
      stats: {
        totalBatches: 45,
        activeBatches: 38,
        expiredBatches: 7
      },
      rating: 4.5
    },
    {
      name: "Apollo Pharmacy",
      location: "Delhi, India",
      manager: "Rajesh Kumar",
      contact: {
        email: "rajesh@apollopharmacy.com",
        phone: "+91-9876543210"
      },
      stats: {
        totalBatches: 67,
        activeBatches: 59,
        expiredBatches: 8
      },
      rating: 4.7
    },
    {
      name: "MediCare Pharmacy",
      location: "Islamabad, Pakistan",
      manager: "Zainab Shah",
      contact: {
        email: "zainab@medicarepharmacy.com",
        phone: "+92-300-7654321"
      },
      stats: {
        totalBatches: 52,
        activeBatches: 45,
        expiredBatches: 7
      },
      rating: 4.4
    }
  ];

  for (const pharmacyData of defaultPharmacies) {
    const existingPharmacy = await Pharmacy.findOne({ name: pharmacyData.name });
    if (!existingPharmacy) {
      await Pharmacy.create(pharmacyData);
      console.log(`Created default pharmacy: ${pharmacyData.name}`);
    }
  }
};

exports.getAllPharmacies = async (req, res) => {
  try {
    const pharmacies = await Pharmacy.find({ isActive: true }).sort({ name: 1 });
    
    res.json({
      success: true,
      pharmacies
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pharmacies', error: error.message });
  }
};

exports.getPharmacy = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findById(req.params.id);
    
    if (!pharmacy) {
      return res.status(404).json({ message: 'Pharmacy not found' });
    }

    res.json({
      success: true,
      pharmacy
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pharmacy', error: error.message });
  }
};

exports.initializePharmacies = initializeDefaultPharmacies;