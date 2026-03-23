import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

async function createAdminOnly() {
  try {
    // Connect with explicit database name
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: "medicheck" // Specify the database name here
    });
    console.log('Connected to MongoDB database: medicheck');
    
    // Define ONLY the admin user
    const adminUser = {
      username: "admin",
      password: await bcrypt.hash("admin123", 10),
      role: "admin",
      name: "System Administrator",
      email: "admin@medicheck.com", // Optional email field
      isActive: true, // Activate the admin user
      createdAt: new Date()
    };
    
    console.log('Checking if admin already exists...');
    
    // Check if admin already exists
    const existingAdmin = await mongoose.connection.collection('users').findOne({ 
      username: "admin" 
    });
    
    if (existingAdmin) {
      console.log('Admin user already exists!');
      console.log(`   Username: ${existingAdmin.username}`);
      console.log(`   Role: ${existingAdmin.role}`);
      console.log(`   ID: ${existingAdmin._id}`);
      
      // Optionally update the existing admin
      const update = await mongoose.connection.collection('users').updateOne(
        { username: "admin" },
        { 
          $set: { 
            password: adminUser.password,
            isActive: true,
            updatedAt: new Date()
          }
        }
      );
      
      if (update.modifiedCount > 0) {
        console.log('Admin password updated successfully!');
      }
    } else {
      // Insert new admin user
      await mongoose.connection.collection('users').insertOne(adminUser);
      console.log('Admin user created successfully!');
      console.log(`   Username: admin`);
      console.log(`   Password: admin123`);
      console.log(`   Role: admin`);
    }
    
    // Shows all admin users for verification
    const allAdmins = await mongoose.connection.collection('users').find({ 
      role: "admin" 
    }).toArray();
    
    console.log(`\nTotal admin users in system: ${allAdmins.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

createAdminOnly();
