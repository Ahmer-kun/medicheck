// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');

// const userSchema = new mongoose.Schema({
//   username: {
//     type: String,
//     required: true,
//     unique: true,
//     trim: true
//   },
//   password: {
//     type: String,
//     required: true,
//     minlength: 6
//   },
//   role: {
//     type: String,
//     required: true,
//     enum: ['admin', 'manufacturer', 'pharmacy', 'viewer', 'analytics']
//   },
//   name: {
//     type: String,
//     required: true
//   },
//   isActive: {
//     type: Boolean,
//     default: true
//   }
// }, {
//   timestamps: true
// });

// userSchema.pre('save', async function(next) {
//   if (!this.isModified('password')) return next();
//   this.password = await bcrypt.hash(this.password, 12);
//   next();
// });

// userSchema.methods.correctPassword = async function(candidatePassword) {
//   return await bcrypt.compare(candidatePassword, this.password);
// };

// module.exports = mongoose.model('User', userSchema);



const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['admin', 'pharmacist', 'manufacturer', 'viewer', 'analytics'],
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Static method to get manufacturer user (if needed)
userSchema.statics.getManufacturerUser = async function() {
  return await this.findOne({ role: 'manufacturer' });
};

// Static method to create default users
userSchema.statics.createDefaultUsers = async function() {
  const defaultUsers = [
    {
      name: 'System Administrator',
      email: 'admin@medicheck.com',
      password: 'admin123',
      role: 'admin'
    },
    {
      name: 'Pharmacist User',
      email: 'pharmacist@medicheck.com',
      password: 'pharma123',
      role: 'pharmacist'
    },
    {
      name: 'Manufacturer User',
      email: 'manufacturer@medicheck.com',
      password: 'manufacturer123',
      role: 'manufacturer'
    },
    {
      name: 'Viewer User',
      email: 'viewer@medicheck.com',
      password: 'viewer123',
      role: 'viewer'
    },
    {
      name: 'Analytics User',
      email: 'analytics@medicheck.com',
      password: 'analytics123',
      role: 'analytics'
    }
  ];

  try {
    for (const userData of defaultUsers) {
      const existingUser = await this.findOne({ email: userData.email });
      if (!existingUser) {
        await this.create(userData);
        console.log(`Created default user: ${userData.role}`);
      } else {
        console.log(`User already exists: ${userData.role}`);
      }
    }
    console.log('Default users initialization completed');
  } catch (error) {
    console.error('Error creating default users:', error);
    throw error;
  }
};

const User = mongoose.model('User', userSchema);

module.exports = User;