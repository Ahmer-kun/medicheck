const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

// Initialize default users
const initializeDefaultUsers = async () => {
  const defaultUsers = [
    {
      username: 'admin',
      password: 'admin123',
      role: 'admin',
      name: 'System Administrator'
    },
    {
      username: 'pharmacist',
      password: 'pharma123',
      role: 'pharmacy',
      name: 'Pharmacy Manager'
    },
    {
      username: 'manufacturer',
      password: 'manu123',
      role: 'manufacturer',
      name: 'Manufacturing Head'
    },
    {
      username: 'viewer',
      password: 'view123',
      role: 'viewer',
      name: 'Quality Viewer'
    },
    {
      username: 'analytics',
      password: 'analytics123',
      role: 'analytics',
      name: 'Data Analyst'
    }
  ];

  for (const userData of defaultUsers) {
    const existingUser = await User.findOne({ username: userData.username });
    if (!existingUser) {
      await User.create(userData);
      console.log(`Created default user: ${userData.username}`);
    }
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Please provide username and password' });
    }

    const user = await User.findOne({ username }).select('+password');

    if (!user || !(await user.correctPassword(password))) {
      return res.status(401).json({ message: 'Incorrect username or password' });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'Account deactivated' });
    }

    const token = signToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        name: user.name
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
};

exports.initializeUsers = initializeDefaultUsers;