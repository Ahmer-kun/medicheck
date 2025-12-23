import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

async function createUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    const users = [
      {
        username: "admin",
        password: await bcrypt.hash("admin123", 10),
        role: "admin",
        name: "System Administrator"
      },
      {
        username: "pharmacist", 
        password: await bcrypt.hash("pharma123", 10),
        role: "pharmacy",
        name: "Pharmacy Manager"
      },
      {
        username: "manufacturer",
        password: await bcrypt.hash("manu123", 10),
        role: "manufacturer",
        name: "Manufacturing Head"
      },
      {
        username: "viewer",
        password: await bcrypt.hash("view123", 10),
        role: "viewer",
        name: "Quality Viewer"
      },
      {
        username: "analytics",
        password: await bcrypt.hash("analytics123", 10),
        role: "analytics",
        name: "Data Analyst"
      }
    ];
    
    // Clear existing users
    await mongoose.connection.collection('users').deleteMany({});
    console.log('✅ Cleared existing users');
    
    // Insert new users
    await mongoose.connection.collection('users').insertMany(users);
    console.log('✅ 5 users created successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createUsers();