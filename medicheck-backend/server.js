import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

// Security middleware
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Routes
import authRoutes from "./routes/authRoutes.js";
import batchRoutes from "./routes/batchRoutes.js";
// import pharmacyRoutes from "./routes/pharmacyRoutes.js"; // ✅ Pharmacy dashboard routes
import pharmacyMedicineRoutes from "./routes/pharmacyMedicineRoutes.js"; // Pharmacy medicine routes
import analyticsRoutes from "./routes/analyticsRoutes.js";
import manufacturerRoutes from './routes/manufacturerRoutes.js';
import adminRoutes from './routes/admin.js';
import pharmacyCompanyRoutes from "./routes/pharmacyCompanyRoutes.js";

// Initialize demo data
import { initializeUsers } from "./controllers/authController.js";
import { initializeBatches } from "./controllers/batchController.js";
import { initializePharmacyMedicines } from "./controllers/pharmacyMedicineController.js"; // ✅ Correct import
import { initializePharmacyCompanies } from "./controllers/pharmacyCompanyController.js";

dotenv.config();

const app = express();

// ✅ Security middleware
app.use(helmet());

// ✅ CORS middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true
}));

// ✅ Body parser limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ✅ Rate limiting
  // Rate limiting - MORE LENIENT FOR DEVELOPMENT
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute instead of 15
  max: 1000, // 1000 requests per minute instead of 100
  message: {
    success: false,
    message: 'Too many requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});



        // const limiter = rateLimit({
        //   windowMs: 15 * 60 * 1000, // 15 minutes
        //   max: 100 // limit each IP to 100 requests per windowMs
        // });
app.use('/api/', limiter);

// ✅ Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ✅ API routes - ORGANIZED PROPERLY
app.use("/api/auth", authRoutes);
app.use("/api/batches", batchRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/manufacturers", manufacturerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/pharmacy-companies", pharmacyCompanyRoutes);

// ✅ Pharmacy routes - BOTH FILES
// app.use("/api/pharmacy", pharmacyRoutes);        // Dashboard & general routes
app.use("/api/pharmacy", pharmacyMedicineRoutes); // Medicine management routes

// ✅ Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Medicheck Backend',
    version: '1.0.0'
  });
});

// ✅ Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Medicheck Backend API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      batches: '/api/batches',
      pharmacyCompanies: '/api/pharmacy-companies',
      pharmacy: {
        dashboard: '/api/pharmacy/dashboard',
        medicines: '/api/pharmacy/medicines',
        verify: '/api/pharmacy/verify/:batchNo'
      },
      analytics: '/api/analytics',
      admin: '/api/admin',
      manufacturers: '/api/manufacturers'
    }
  });
});

// ✅ Enhanced error handling middleware
app.use((err, req, res, next) => {
  console.error('Error Stack:', err.stack);
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: Object.values(err.errors).map(e => e.message)
    });
  }
  
  // Mongoose duplicate key error
  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: 'Duplicate field value entered'
    });
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ✅ 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false,
    message: 'Route not found' 
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    console.log('✅ MongoDB connected successfully');

    // Initialize demo data
    await initializeUsers();
    await initializePharmacyMedicines();
    await initializeBatches();
    await initializePharmacyCompanies();

    console.log('✅ All demo data initialized successfully');

    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`✅ Health check: http://localhost:${PORT}/api/health`);
      console.log(`✅ API Documentation: http://localhost:${PORT}/`);
      console.log('\n📋 Available Pharmacy Endpoints:');
      console.log('   📊 Dashboard: /api/pharmacy/dashboard');
      console.log('   💊 Medicines: /api/pharmacy/medicines');
      console.log('   🔍 Verify: /api/pharmacy/verify/:batchNo');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();


// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// import connectDB from "./config/db.js";

// // Routes
// import authRoutes from "./routes/authRoutes.js";
// import batchRoutes from "./routes/batchRoutes.js";
// import pharmacyMedicineRoutes from "./routes/pharmacyMedicineRoutes.js";
// import analyticsRoutes from "./routes/analyticsRoutes.js";
// import manufacturerRoutes from './routes/manufacturerRoutes.js';
// import adminRoutes from './routes/admin.js';
// import pharmacyCompanyRoutes from "./routes/pharmacyCompanyRoutes.js";

// // Optional: Initialize demo data
// import { initializeUsers } from "./controllers/authController.js";
// import { initializeBatches } from "./controllers/batchController.js";
// import { initializePharmacyMedicines } from "./controllers/pharmacyMedicineController.js";
// import { initializePharmacyCompanies } from "./controllers/pharmacyCompanyController.js";

// dotenv.config();

// const app = express();

// // Middleware
// app.use(cors({
//   origin: process.env.CORS_ORIGIN || "http://localhost:3000",
//   credentials: true
// }));
// app.use(express.json());

// // Request logging middleware
// app.use((req, res, next) => {
//   console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
//   next();
// });

// // API routes
// app.use("/api/auth", authRoutes);
// app.use("/api/batches", batchRoutes);
// app.use("/api/analytics", analyticsRoutes);
// app.use("/api/manufacturers", manufacturerRoutes);
// app.use("/api/admin", adminRoutes);
// app.use("/api/pharmacy-companies", pharmacyCompanyRoutes);
// app.use("/api/pharmacy", pharmacyMedicineRoutes); // ✅ Only pharmacy medicine routes

// // Health check
// app.get('/api/health', (req, res) => {
//   res.json({ 
//     status: 'OK', 
//     timestamp: new Date().toISOString(),
//     service: 'Medicheck Backend',
//     version: '1.0.0'
//   });
// });

// // Root route
// app.get('/', (req, res) => {
//   res.json({ 
//     message: 'Medicheck Backend API',
//     version: '1.0.0',
//     endpoints: {
//       auth: '/api/auth',
//       batches: '/api/batches',
//       pharmacyCompanies: '/api/pharmacy-companies',
//       pharmacy: '/api/pharmacy',
//       analytics: '/api/analytics',
//       admin: '/api/admin',
//       manufacturers: '/api/manufacturers'
//     }
//   });
// });

// // Error handling middleware
// app.use((err, req, res, next) => {
//   console.error('Error Stack:', err.stack);
//   res.status(500).json({ 
//     success: false,
//     message: 'Internal Server Error',
//     error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong!'
//   });
// });

// // 404 handler
// app.use('*', (req, res) => {
//   res.status(404).json({ 
//     success: false,
//     message: 'Route not found' 
//   });
// });

// const PORT = process.env.PORT || 5000;

// const startServer = async () => {
//   try {
//     await connectDB();
//     console.log('✅ MongoDB connected successfully');

//     // Initialize demo data
//     await initializeUsers();
//     await initializePharmacyMedicines();
//     await initializeBatches();
//     await initializePharmacyCompanies();

//     console.log('✅ All demo data initialized successfully');

//     app.listen(PORT, () => {
//       console.log(`✅ Server running on port ${PORT}`);
//       console.log(`✅ Health check: http://localhost:${PORT}/api/health`);
//       console.log(`✅ API Documentation: http://localhost:${PORT}/`);
//       console.log('\n📋 Available Endpoints:');
//       console.log('   👥 Users: /api/auth');
//       console.log('   📦 Batches: /api/batches');
//       console.log('   🏪 Pharmacy Companies: /api/pharmacy-companies');
//       console.log('   💊 Pharmacy Medicines: /api/pharmacy');
//       console.log('   📊 Analytics: /api/analytics');
//       console.log('   ⚙️ Admin: /api/admin');
//       console.log('   🏭 Manufacturers: /api/manufacturers');
//     });
//   } catch (error) {
//     console.error('❌ Failed to start server:', error);
//     process.exit(1);
//   }
// };

// startServer();