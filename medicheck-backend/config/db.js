import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    console.log('🔗 Attempting MongoDB connection to "medicheck" database...');
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: "medicheck" // ⬅️ ADD THIS LINE - SOLVES THE ERROR
    });
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`✅ Database: ${conn.connection.name}`);
    
    // Connection event handlers
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
    });

    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('⏹️ MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    process.exit(1);
  }
};

export default connectDB;

// import mongoose from 'mongoose';

// const connectDB = async () => {
//   try {
//     const conn = await mongoose.connect(process.env.MONGODB_URI, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });
    
//     console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
//     console.log(`✅ Database: ${conn.connection.name}`);
    
//     // Connection event handlers
//     mongoose.connection.on('error', (err) => {
//       console.error('❌ MongoDB connection error:', err);
//     });

//     mongoose.connection.on('disconnected', () => {
//       console.log('⚠️ MongoDB disconnected');
//     });

//     process.on('SIGINT', async () => {
//       await mongoose.connection.close();
//       console.log('⏹️ MongoDB connection closed through app termination');
//       process.exit(0);
//     });

//   } catch (error) {
//     console.error('❌ Database connection error:', error.message);
//     process.exit(1);
//   }
// };

// export default connectDB;
