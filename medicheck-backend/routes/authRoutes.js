const express = require('express');
const { login, initializeUsers } = require('../controllers/authController');
const { authValidation, validate } = require('../middleware/validation');

const router = express.Router();

router.post('/login', validate(authValidation.login), login);

// Initialize default users (for development)
router.post('/initialize-users', async (req, res) => {
  try {
    await initializeUsers();
    res.json({ message: 'Default users initialized successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error initializing users', error: error.message });
  }
});

module.exports = router;