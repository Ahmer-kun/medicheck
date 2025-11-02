const express = require('express');
const {
  getAllPharmacies,
  getPharmacy,
  initializePharmacies
} = require('../controllers/pharmacyController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.get('/', getAllPharmacies);
router.get('/:id', getPharmacy);

// Initialize default pharmacies (for development)
router.post('/initialize/pharmacies', async (req, res) => {
  try {
    await initializePharmacies();
    res.json({ message: 'Default pharmacies initialized successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error initializing pharmacies', error: error.message });
  }
});

module.exports = router;