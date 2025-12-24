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
      dbName: "medicheck" // Explicitly specify database
    });
    console.log('✅ Connected to MongoDB database: medicheck');
    
    // Define ONLY the admin user
    const adminUser = {
      username: "admin",
      password: await bcrypt.hash("admin123", 10),
      role: "admin",
      name: "System Administrator",
      email: "admin@medicheck.com", // Add email if your User model has it
      isActive: true, // Ensure account is active
      createdAt: new Date()
    };
    
    console.log('🔍 Checking if admin already exists...');
    
    // Check if admin already exists
    const existingAdmin = await mongoose.connection.collection('users').findOne({ 
      username: "admin" 
    });
    
    if (existingAdmin) {
      console.log('⚠️ Admin user already exists!');
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
        console.log('✅ Admin password updated successfully!');
      }
    } else {
      // Insert new admin user
      await mongoose.connection.collection('users').insertOne(adminUser);
      console.log('✅ Admin user created successfully!');
      console.log(`   Username: admin`);
      console.log(`   Password: admin123`);
      console.log(`   Role: admin`);
    }
    
    // Show all admin users for verification
    const allAdmins = await mongoose.connection.collection('users').find({ 
      role: "admin" 
    }).toArray();
    
    console.log(`\n📊 Total admin users in system: ${allAdmins.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

createAdminOnly();

// import mongoose from 'mongoose';
// import bcrypt from 'bcryptjs';
// import dotenv from 'dotenv';

// dotenv.config();

// async function createUsers() {
//   try {
//     await mongoose.connect(process.env.MONGODB_URI);
//     console.log('✅ Connected to MongoDB');
    
//     const users = [
//       {
//         username: "admin",
//         password: await bcrypt.hash("admin123", 10),
//         role: "admin",
//         name: "System Administrator"
//       },
//       {
//         username: "pharmacist", 
//         password: await bcrypt.hash("pharma123", 10),
//         role: "pharmacy",
//         name: "Pharmacy Manager"
//       },
//       {
//         username: "manufacturer",
//         password: await bcrypt.hash("manu123", 10),
//         role: "manufacturer",
//         name: "Manufacturing Head"
//       },
//       {
//         username: "viewer",
//         password: await bcrypt.hash("view123", 10),
//         role: "viewer",
//         name: "Quality Viewer"
//       },
//       {
//         username: "analytics",
//         password: await bcrypt.hash("analytics123", 10),
//         role: "analytics",
//         name: "Data Analyst"
//       }
//     ];
    
//     // Clear existing users
//     await mongoose.connection.collection('users').deleteMany({});
//     console.log('✅ Cleared existing users');
    
//     // Insert new users
//     await mongoose.connection.collection('users').insertMany(users);
//     console.log('✅ 5 users created successfully!');
    
//     process.exit(0);
//   } catch (error) {
//     console.error('❌ Error:', error);
//     process.exit(1);
//   }
// }

// createUsers();
