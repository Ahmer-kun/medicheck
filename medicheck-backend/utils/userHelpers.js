const User = require('../models/User');

exports.getManufacturerUser = async () => {
  return await User.findOne({ role: 'manufacturer' });
};