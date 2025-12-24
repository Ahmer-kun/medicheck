import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import Web3 from 'web3';
import BlockchainService from "./services/blockchainService.js";
import SyncWorker from "./services/syncWorker.js";
// Add this import at the top of server.js (after other imports)
import { checkMongoDBHealth, checkBlockchainHealth, safeModelCount, getSystemInfo } from './utils/healthHelper.js';
import transactionMonitor from './services/transactionMonitor.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';


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
import manufacturerCompanyRoutes from "./routes/manufacturerCompanyRoutes.js";
import supportRoutes from "./routes/supportRoutes.js";
// Add this import
import metamaskRoutes from "./routes/metamaskRoutes.js";
// Initialize demo data
import { initializeUsers } from "./controllers/authController.js";
import { initializeBatches } from "./controllers/batchController.js";
import { initializePharmacyMedicines } from "./controllers/pharmacyMedicineController.js"; // ✅ Correct import
import { initializePharmacyCompanies } from "./controllers/pharmacyCompanyController.js";

// added this new import 11-11-25
import { initializeManufacturers } from "./controllers/manufacturerController.js";

// dotenv.config(); // This loads .env into process.env


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env file from the root directory
dotenv.config({ path: join(__dirname, '.env') });
// Debug: Check if environment variables are loaded
console.log('🔍 Environment Variables Loaded:');
console.log('- PORT:', process.env.PORT);
console.log('- CONTRACT_ADDRESS:', process.env.CONTRACT_ADDRESS);
console.log('- MONGODB_URI:', process.env.MONGODB_URI ? '✓ Loaded' : '✗ Not Loaded');


BigInt.prototype.toJSON = function() {
  return this.toString();
};

// console.log('🔍 CONTRACT_ADDRESS loaded:', process.env.CONTRACT_ADDRESS); // Add this for debugging

const app = express();

// ✅ Security middleware
app.use(helmet());

// app.use(cors({
//   origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
// }));
app.use(cors({
  origin: ["https://medicheck-eight.vercel.app", "http://localhost:3000", "http://127.0.0.1:3000"],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
}));
app.options('*', cors()); // Enable pre-flight for all routes

// ✅ Enhanced authentication check middleware
app.use((req, res, next) => {
  // Skip auth for public routes
  const publicRoutes = [
    '/api/auth/login',
    '/api/auth/initialize-users',
    '/api/batches',
    '/api/batches/verify/',
    '/api/health',
    '/'
  ];
  
  const isPublicRoute = publicRoutes.some(route => 
    req.path.startsWith(route) || 
    req.path === route
  );

  if (isPublicRoute) {
    return next();
  }

  // Check for token in protected routes
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No token provided. Please login first.'
    });
  }

  next();
});

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




app.get('/api/system/health', async (req, res) => {
  try {
    console.log('🔍 Health check called');
    
    // 1. Check MongoDB connection - IMPROVED
    let mongoStatus = 'unknown';
    let mongoHealthy = false;
    let mongoError = null;
    let mongoDetails = {};
    
    try {
      const mongooseModule = await import('mongoose');
      const mongoose = mongooseModule.default;
      
      if (!mongoose) {
        throw new Error('Mongoose not available');
      }
      
      // Check if we have a connection object
      if (!mongoose.connection) {
        throw new Error('Mongoose connection object not available');
      }
      
      mongoStatus = mongoose.connection.readyState;
      mongoHealthy = mongoStatus === 1;
      
      mongoDetails = {
        readyState: mongoStatus,
        stateName: ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoStatus] || 'unknown',
        host: mongoose.connection.host || 'unknown',
        name: mongoose.connection.name || 'unknown'
      };
      
      console.log('MongoDB check:', mongoDetails);
      
    } catch (mongoCheckError) {
      console.error('MongoDB check failed:', mongoCheckError.message);
      mongoStatus = 'error';
      mongoError = mongoCheckError.message;
      mongoDetails = { error: mongoCheckError.message };
    }
    
    // 2. Check blockchain (keep existing)
    let blockchainStatus = 'unknown';
    let blockchainHealthy = false;
    let blockchainError = null;
    let blockchainInfo = {};
    
    try {
      const Web3 = await import('web3');
      const web3 = new Web3.default(process.env.BLOCKCHAIN_NETWORK || 'http://localhost:8545');
      
      const blockchainCheck = web3.eth.getBlockNumber();
      const timeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Blockchain check timeout')), 3000)
      );
      
      const blockNumber = await Promise.race([blockchainCheck, timeout]);
      blockchainStatus = 'connected';
      blockchainHealthy = true;
      blockchainInfo.blockNumber = blockNumber;
      
    } catch (error) {
      console.log('Blockchain check failed:', error.message);
      blockchainStatus = 'disconnected';
      blockchainError = error.message;
    }
    
    // 3. Prepare response
    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      storage: {
        mongodb: {
          status: mongoHealthy ? 'healthy' : 'unhealthy',
          connectionState: mongoStatus,
          details: mongoDetails,
          error: mongoError,
          operational: mongoHealthy
        },
        blockchain: {
          status: blockchainHealthy ? 'healthy' : 'unhealthy',
          connectionState: blockchainStatus,
          operational: blockchainHealthy,
          error: blockchainError,
          ...blockchainInfo
        }
      },
      systemStatus: mongoHealthy && blockchainHealthy ? 'operational' :
                   mongoHealthy ? 'database_only' :
                   blockchainHealthy ? 'blockchain_only' : 'critical',
      message: getHealthMessage(mongoHealthy, blockchainHealthy)
    };
    
    console.log('✅ Health check completed');
    res.json(response);
    
  } catch (error) {
    console.error('❌ Health check error:', error);
    res.status(500).json({
      success: false,
      message: 'Health check failed',
      error: error.message
    });
  }
});

function getHealthMessage(mongoHealthy, blockchainHealthy) {
  if (mongoHealthy && blockchainHealthy) return 'All systems operational';
  if (mongoHealthy) return 'Blockchain unavailable - operating in database-only mode';
  if (blockchainHealthy) return 'MongoDB unavailable - operating in blockchain-only mode';
  return 'Critical failure - both systems unavailable';
}


app.get('/api/debug-sync-queue', async (req, res) => {
  try {
    let syncQueue = [];
    let tempBatches = [];
    
    try {
      // Try to get BlockchainSyncQueue model
      const BlockchainSyncQueueModule = await import('./models/BlockchainSyncQueue.js');
      const BlockchainSyncQueue = BlockchainSyncQueueModule.default;
      syncQueue = await BlockchainSyncQueue.find().sort({ createdAt: -1 }).limit(20);
    } catch (error) {
      console.log('BlockchainSyncQueue model not available:', error.message);
    }
    
    try {
      // Try to get TemporaryBatch model
      const TemporaryBatchModule = await import('./models/TemporaryBatch.js');
      const TemporaryBatch = TemporaryBatchModule.default;
      tempBatches = await TemporaryBatch.find({ syncedToMongo: false }).sort({ createdAt: -1 }).limit(20);
    } catch (error) {
      console.log('TemporaryBatch model not available:', error.message);
    }
    
    res.json({
      success: true,
      syncQueue: {
        total: syncQueue.length,
        pending: syncQueue.filter(item => item.status === 'pending').length,
        processing: syncQueue.filter(item => item.status === 'processing').length,
        failed: syncQueue.filter(item => item.status === 'failed').length,
        completed: syncQueue.filter(item => item.status === 'completed').length,
        items: syncQueue.map(item => ({
          batchNo: item.batchNo,
          status: item.status,
          retryCount: item.retryCount,
          nextRetry: item.nextRetry,
          createdAt: item.createdAt
        }))
      },
      tempBatches: {
        total: tempBatches.length,
        items: tempBatches.map(batch => ({
          batchNo: batch.batchNo,
          syncedToMongo: batch.syncedToMongo,
          syncAttempts: batch.syncAttempts,
          createdAt: batch.createdAt
        }))
      }
    });
  } catch (error) {
    console.error('Debug sync queue error:', error);
    res.status(500).json({
      success: false,
      message: 'Debug sync queue failed',
      error: error.message
    });
  }
});


  // ✅ Manual sync trigger
// POST endpoint for manual sync
app.post('/api/synchronize', async (req, res) => {
  try {
    console.log('🔄 Manual sync triggered via POST request');
    
    // Import sync worker
    const SyncWorkerModule = await import('./services/syncWorker.js');
    const SyncWorker = SyncWorkerModule.default;
    
    // Force immediate sync
    await SyncWorker.performSync();
    
    res.json({
      success: true,
      message: 'Manual synchronization completed successfully',
      timestamp: new Date().toISOString(),
      method: 'POST'
    });
  } catch (error) {
    console.error('❌ Manual sync failed:', error);
    res.status(500).json({
      success: false,
      message: 'Manual synchronization failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Also add a GET endpoint for easier testing
app.get('/api/synchronize', async (req, res) => {
  try {
    console.log('🔄 Manual sync triggered via GET request');
    
    const SyncWorkerModule = await import('./services/syncWorker.js');
    const SyncWorker = SyncWorkerModule.default;
    
    await SyncWorker.performSync();
    
    res.json({
      success: true,
      message: 'Manual synchronization completed successfully',
      timestamp: new Date().toISOString(),
      method: 'GET'
    });
  } catch (error) {
    console.error('❌ Manual sync failed:', error);
    res.status(500).json({
      success: false,
      message: 'Manual synchronization failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});



// Dedicated API to check Medicine data on blockchain
app.get('/api/blockchain/medicine/:batchNo/full', async (req, res) => {
  try {
    const { batchNo } = req.params;
    const BlockchainService = (await import('./services/blockchainService.js')).default;
    
    console.log(`🔍 Fetching full medicine data for: ${batchNo}`);
    
    // Get complete medicine data from blockchain
    const medicineData = await BlockchainService.getCompleteMedicineFromBlockchain(batchNo);
    
    if (!medicineData.exists) {
      return res.status(404).json({
        success: false,
        message: `Medicine ${batchNo} not found on blockchain`
      });
    }
    
    // Format the data similar to Register Medicine output
    const formattedData = {
      batchNo: medicineData.batchNo,
      name: medicineData.name,
      medicineName: medicineData.medicineName,
      manufactureDate: medicineData.manufactureDate,
      expiryDate: medicineData.expiryDate,
      formulation: medicineData.formulation,
      quantity: medicineData.quantity,
      manufacturer: medicineData.manufacturer,
      pharmacy: medicineData.pharmacy,
      packaging: medicineData.packaging ? JSON.stringify(medicineData.packaging) : '{}',
      status: medicineData.status,
      currentOwner: medicineData.currentOwner,
      timestamp: medicineData.timestamp,
      verified: medicineData.verified,
      verifiedBy: medicineData.verifiedBy,
      verifiedAt: medicineData.verifiedAt
    };
    
    console.log('📊 FULL MEDICINE DATA FROM BLOCKCHAIN:');
    console.log('=======================================');
    console.log(`batchNo: ${formattedData.batchNo}`);
    console.log(`name: ${formattedData.name}`);
    console.log(`medicineName: ${formattedData.medicineName}`);
    console.log(`manufactureDate: ${formattedData.manufactureDate}`);
    console.log(`expiryDate: ${formattedData.expiryDate}`);
    console.log(`formulation: ${formattedData.formulation}`);
    console.log(`quantity: ${formattedData.quantity}`);
    console.log(`manufacturer: ${formattedData.manufacturer}`);
    console.log(`pharmacy: ${formattedData.pharmacy}`);
    console.log(`packaging: ${formattedData.packaging}`);
    console.log(`status: ${formattedData.status}`);
    console.log('=======================================');
    
    res.json({
      success: true,
      message: 'Medicine data retrieved successfully',
      data: formattedData,
      rawBlockchainData: medicineData,
      explorerUrl: `https://sepolia.etherscan.io/address/${process.env.CONTRACT_ADDRESS}#readContract`
    });
    
  } catch (error) {
    console.error('❌ Error fetching medicine data:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching medicine data from blockchain',
      error: error.message
    });
  }
});




// In server.js
app.get('/api/debug-medicine-compare/:batchNo', async (req, res) => {
  try {
    const { batchNo } = req.params;
    const BlockchainService = (await import('./services/blockchainService.js')).default;
    
    console.log(`🔍 Comparing medicine data for: ${batchNo}`);
    
    // Get current data
    const currentData = await BlockchainService.getCompleteMedicineFromBlockchain(batchNo);
    
    // Also check transaction history
    let transferHistory = [];
    try {
      if (BlockchainService.contract?.methods?.getMedicineHistory) {
        transferHistory = await BlockchainService.contract.methods.getMedicineHistory(batchNo).call();
      }
    } catch (historyError) {
      console.log('Could not get history:', historyError.message);
    }
    
    res.json({
      success: true,
      batchNo: batchNo,
      currentMedicineData: currentData.exists ? {
        batchNo: currentData.batchNo,
        name: currentData.name,
        medicineName: currentData.medicineName,
        manufactureDate: currentData.manufactureDate,
        expiryDate: currentData.expiryDate,
        formulation: currentData.formulation,
        quantity: currentData.quantity,
        manufacturer: currentData.manufacturer,
        pharmacy: currentData.pharmacy,
        packaging: currentData.packaging,
        status: currentData.status,
        currentOwner: currentData.currentOwner,
        verified: currentData.verified
      } : null,
      transferHistory: transferHistory,
      contractAddress: process.env.CONTRACT_ADDRESS,
      existsOnBlockchain: currentData.exists
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});




// ✅ Check sync worker status
app.get('/api/sync-worker/status', async (req, res) => {
  try {
    const SyncWorkerModule = await import('./services/syncWorker.js');
    const SyncWorker = SyncWorkerModule.default;
    
    res.json({
      success: true,
      worker: {
        isRunning: SyncWorker.isRunning,
        syncInterval: SyncWorker.syncInterval,
        lastRun: new Date().toISOString()
      },
      message: 'Sync worker is ' + (SyncWorker.isRunning ? 'running' : 'stopped')
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get worker status',
      error: error.message
    });
  }
});

// ✅ Restart sync worker
app.post('/api/sync-worker/restart', async (req, res) => {
  try {
    const SyncWorkerModule = await import('./services/syncWorker.js');
    const SyncWorker = SyncWorkerModule.default;
    
    await SyncWorker.stop();
    await SyncWorker.start();
    
    res.json({
      success: true,
      message: 'Sync worker restarted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to restart sync worker',
      error: error.message
    });
  }
});



  // Add this to server.js - Debug MongoDB endpoint
app.get('/api/debug/mongodb', async (req, res) => {
  try {
    console.log('🔍 Debugging MongoDB connection...');
    
    // Try to import mongoose
    let mongooseInfo = {};
    try {
      const mongooseModule = await import('mongoose');
      mongooseInfo = {
        imported: true,
        module: typeof mongooseModule,
        hasDefault: !!mongooseModule.default,
        connection: {
          readyState: mongooseModule.default?.connection?.readyState,
          host: mongooseModule.default?.connection?.host,
          name: mongooseModule.default?.connection?.name,
          models: Object.keys(mongooseModule.default?.connection?.models || {})
        }
      };
      console.log('Mongoose import successful:', mongooseInfo);
    } catch (importError) {
      mongooseInfo = {
        imported: false,
        error: importError.message
      };
      console.error('Mongoose import failed:', importError);
    }
    
    // Check environment variables
    const envInfo = {
      MONGODB_URI: process.env.MONGODB_URI ? 'Set (hidden)' : 'Not set',
      MONGODB_URI_length: process.env.MONGODB_URI ? process.env.MONGODB_URI.length : 0
    };
    
    res.json({
      success: true,
      mongoose: mongooseInfo,
      environment: envInfo,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});



  app.get('/api/test-blockchain', async (req, res) => {
  try {
    const BlockchainService = (await import('./services/blockchainService.js')).default;
    const networkInfo = await BlockchainService.getNetworkInfo();
    
    res.json({
      success: true,
      blockchain: networkInfo,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Blockchain health check failed',
      error: error.message
    });
  }
});

// In server.js, add a test route
app.get('/api/test-blockchain-deploy', async (req, res) => {
  try {
    const blockchainService = (await import('./services/blockchainService.js')).default;
    
    // Test connection
    // await blockchainService.initialize();
    
    // Test contract call
    const account = await blockchainService.getDefaultAccount();
    const contractAddress = process.env.CONTRACT_ADDRESS;
    
    res.json({
      success: true,
      message: 'Blockchain connected successfully',
      contractAddress: contractAddress,
      testAccount: account,
      contractMethods: ['registerMedicine', 'getMedicine', 'verifyMedicine', 'transferMedicine']
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Blockchain test failed',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});








  app.get('/api/contract-health', async (req, res) => {
  try {
    const BlockchainService = (await import('./services/blockchainService.js')).default;
    // await BlockchainService.initialize();
    
    // Test basic contract calls (no BigInt)
    const owner = await BlockchainService.contract.methods.owner().call();
    const allBatches = await BlockchainService.contract.methods.getAllBatchNumbers().call();
    
    res.json({
      success: true,
      contractAddress: process.env.CONTRACT_ADDRESS,
      owner: owner,
      totalBatches: allBatches.length,
      batches: allBatches,
      networkId: 31337 // Hardhat local network ID
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      contractAddress: process.env.CONTRACT_ADDRESS
    });
  }
});



    // Test contract without BigInt issues
app.get('/api/blockchain/simple-health', async (req, res) => {
  try {
    const blockchainService = (await import('./services/blockchainService.js')).default;
    // await blockchainService.initialize();
    
    const accounts = await blockchainService.web3.eth.getAccounts();
    const lastBlock = await blockchainService.web3.eth.getBlock('latest');
    
    res.json({
      success: true,
      contractAddress: process.env.CONTRACT_ADDRESS,
      accounts: accounts.length,
      lastBlockNumber: lastBlock.number.toString(), // Convert to string
      gasLimit: lastBlock.gasLimit.toString(),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});



  app.get('/api/blockchain/enhanced-status', async (req, res) => {
  try {
    const BlockchainService = (await import('./services/blockchainService.js')).default;
    
    // Initialize if not already
    // if (!BlockchainService.isInitialized) {
    //   await BlockchainService.initialize();
    // }
    
    const networkInfo = await BlockchainService.getNetworkInfo();
    
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      blockchain: networkInfo,
      message: `Blockchain ${networkInfo.connected ? 'connected' : 'disconnected'}`,
      environment: process.env.NODE_ENV || 'development',
      contractConfigured: !!(process.env.CONTRACT_ADDRESS && 
                           process.env.CONTRACT_ADDRESS !== '0xYourDeployedContractAddressHere')
    });
    
  } catch (error) {
    console.error('Enhanced status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting enhanced blockchain status',
      error: error.message
    });
  }
});


// Test contract methods directly
app.get('/api/blockchain/test-methods', async (req, res) => {
  try {
    const BlockchainService = (await import('./services/blockchainService.js')).default;
    
    // if (!BlockchainService.isInitialized) {
    //   await BlockchainService.initialize();
    // }
    
    // Get available methods
    const methods = Object.keys(BlockchainService.contract.methods || {});
    
    // Test a simple method
    let testResult = { success: false, error: null };
    if (methods.includes('getAllBatchNumbers')) {
      try {
        const batches = await BlockchainService.contract.methods.getAllBatchNumbers().call();
        testResult = { 
          success: true, 
          batchCount: batches.length,
          batches: batches.slice(0, 10) // First 10 only
        };
      } catch (error) {
        testResult.error = error.message;
      }
    }
    
    res.json({
      success: true,
      contractAddress: process.env.CONTRACT_ADDRESS,
      totalMethods: methods.length,
      availableMethods: methods,
      testMethodResult: testResult,
      isInitialized: BlockchainService.isInitialized
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error testing contract methods',
      error: error.message
    });
  }
});


app.use('/api/', limiter);

// ✅ Request logging middleware
// app.use((req, res, next) => {
//   console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
//   next();
// });
  app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url} - Origin: ${req.headers.origin}`);
  console.log('Headers:', {
    'content-type': req.headers['content-type'],
    'authorization': req.headers['authorization'] ? 'present' : 'missing',
    'accept': req.headers['accept']
  });
  next();
});

// ✅ API routes - ORGANIZED PROPERLY
app.use("/api/auth", authRoutes);
app.use("/api/batches", batchRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/manufacturers", manufacturerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/pharmacy-companies", pharmacyCompanyRoutes);
app.use("/api/manufacturer-companies", manufacturerCompanyRoutes);
// ✅ Pharmacy routes - BOTH FILES
// app.use("/api/pharmacy", pharmacyRoutes);        // Dashboard & general routes
app.use("/api/pharmacy", pharmacyMedicineRoutes); // Medicine management routes
app.use("/api/support", supportRoutes);
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
app.get(['/', '/api'], (req, res) => {
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
      manufacturers: '/api/manufacturers',
      manufacturerCompanies: '/api/manufacturer-companies',
      support: '/api/support',
      health: '/api/health',
      blockchain: '/api/blockchain/health'
    },
    status: 'operational',
    timestamp: new Date().toISOString()
  });
});
// Add this route configuration
app.use("/api/metamask", metamaskRoutes);

  // CHECKPOINT TO SYNCHORIZE BLOCKCHAIN WITH OUR PHARMACY
app.post('/api/pharmacy/synchronize-blockchain', async (req, res) => {
  try {
    const PharmacyMedicine = (await import('./models/PharmacyMedicine.js')).default;
    const blockchainService = (await import('./services/blockchainService.js')).default;
    
    // Get all pharmacy medicines not on blockchain
    const medicines = await PharmacyMedicine.find({ 
      blockchainVerified: false,
      acceptedFromManufacturer: true 
    })
    .populate('pharmacyCompany', 'name')
    .limit(50); // Limit to prevent timeout
    
    const syncReport = {
      total: medicines.length,
      synchronized: 0,
      failed: 0,
      details: []
    };
    
    for (const medicine of medicines) {
      try {
        const blockchainData = {
          batchNo: medicine.batchNo,
          name: medicine.name,
          medicineName: medicine.medicineName,
          manufactureDate: medicine.manufactureDate,
          expiryDate: medicine.expiryDate,
          formulation: medicine.formulation,
          quantity: medicine.quantity,
          manufacturer: medicine.manufacturer,
          pharmacy: medicine.pharmacyName || medicine.pharmacyCompany?.name,
          packaging: medicine.packaging || {},
          status: medicine.status
        };
        
        const result = await blockchainService.registerCompleteMedicine(blockchainData);
        
        medicine.blockchainVerified = true;
        medicine.blockchainTransactionHash = result.transactionHash;
        await medicine.save();
        
        syncReport.synchronized++;
        syncReport.details.push({
          batchNo: medicine.batchNo,
          success: true,
          transaction: result.transactionHash
        });
        
      } catch (error) {
        syncReport.failed++;
        syncReport.details.push({
          batchNo: medicine.batchNo,
          success: false,
          error: error.message
        });
      }
    }
    
    res.json({
      success: true,
      message: 'Pharmacy-Blockchain synchronization completed',
      report: syncReport
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Synchronization failed',
      error: error.message
    });
  }
});

  // ADDED THIS CHECKPOINT TO CHECK A SPECIFIC BATCH'S STATUS
app.get('/api/debug-batch/:batchNo', async (req, res) => {
  try {
    const { batchNo } = req.params;
    
    console.log(`🔍 Debugging batch: ${batchNo}`);
    
    const Batch = (await import('./models/Batch.js')).default;
    const BlockchainService = (await import('./services/blockchainService.js')).default;
    
    // 1. Check MongoDB
    const mongoBatch = await Batch.findOne({ batchNo });
    console.log('📋 MongoDB batch:', mongoBatch ? {
      exists: true,
      blockchainVerified: mongoBatch.blockchainVerified,
      transactionHash: mongoBatch.blockchainTransactionHash,
      error: mongoBatch.blockchainError
    } : { exists: false });
    
    // 2. Initialize blockchain
    // await BlockchainService.initialize();
    
    // 3. Check blockchain
    let blockchainExists = false;
    try {
      blockchainExists = await BlockchainService.contract.methods.verifyMedicineExistence(batchNo).call();
      console.log('🔗 Blockchain exists:', blockchainExists);
    } catch (blockchainError) {
      console.error('❌ Blockchain check failed:', blockchainError.message);
    }
    
    // 4. Get all batch numbers from blockchain to see what's actually there
    let allBatchNumbers = [];
    try {
      allBatchNumbers = await BlockchainService.contract.methods.getAllBatchNumbers().call();
      console.log('📊 All batches on blockchain:', allBatchNumbers);
    } catch (error) {
      console.error('❌ Could not get all batch numbers:', error.message);
    }
    
    res.json({
      success: true,
      batchNo: batchNo,
      mongodb: {
        exists: !!mongoBatch,
        data: mongoBatch ? {
          id: mongoBatch._id,
          name: mongoBatch.name,
          blockchainVerified: mongoBatch.blockchainVerified,
          blockchainTransactionHash: mongoBatch.blockchainTransactionHash,
          blockchainError: mongoBatch.blockchainError
        } : null
      },
      blockchain: {
        exists: blockchainExists,
        totalBatches: allBatchNumbers.length,
        allBatches: allBatchNumbers
      },
      status: mongoBatch && blockchainExists ? 'BOTH' :
              mongoBatch && !blockchainExists ? 'MONGODB_ONLY' :
              !mongoBatch && blockchainExists ? 'BLOCKCHAIN_ONLY' : 'NEITHER'
    });
    
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// });

// 				DEBUG CONTACT FUNCTION
app.get('/api/debug-contract', async (req, res) => {
  try {
    const BlockchainService = (await import('./services/blockchainService.js')).default;
    // await BlockchainService.initialize();
    
    console.log('🔍 Debugging contract...');
    
    // Get all method names from the contract
    const methodNames = Object.keys(BlockchainService.contract.methods);
    console.log('📋 Contract methods:', methodNames);
    
    // Try to call verifyMedicineExistence with different signatures
    let simpleResult;
    try {
      // Try the simplest call
      simpleResult = await BlockchainService.contract.methods.verifyMedicineExistence('TEST123').call();
      console.log('✅ verifyMedicineExistence works:', simpleResult);
    } catch (simpleError) {
      console.log('❌ verifyMedicineExistence failed:', simpleError.message);
    }
    
    // Try getMedicine
    let getMedicineResult;
    try {
      getMedicineResult = await BlockchainService.contract.methods.getMedicine('TEST123').call();
      console.log('✅ getMedicine works');
    } catch (getMedicineError) {
      console.log('❌ getMedicine failed:', getMedicineError.message);
    }
    
    // Get contract bytecode to verify
    const code = await BlockchainService.web3.eth.getCode(process.env.CONTRACT_ADDRESS);
    console.log('🔗 Contract code length:', code.length);
    
    res.json({
      success: true,
      contractAddress: process.env.CONTRACT_ADDRESS,
      methods: methodNames,
      verifyMedicineExistence: simpleResult !== undefined ? 'works' : 'failed',
      getMedicine: getMedicineResult !== undefined ? 'works' : 'failed',
      hasCode: code.length > 2
    });
    
  } catch (error) {
    console.error('Contract debug error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});
				//DEBUG CONTRACTS ABI 
app.get('/api/debug-contract-abi', async (req, res) => {
  try {
    const BlockchainService = (await import('./services/blockchainService.js')).default;
    // await BlockchainService.initialize();
    
    // Try to call getAllBatchNumbers with different approaches
    let method1Result, method2Result, method3Result;
    
    // Method 1: Direct call
    try {
      method1Result = await BlockchainService.contract.methods.getAllBatchNumbers().call();
    } catch (error) {
      method1Result = { error: error.message };
    }
    
    // Method 2: Get contract bytecode and parse
    const bytecode = await BlockchainService.web3.eth.getCode(process.env.CONTRACT_ADDRESS);
    
    // Method 3: Try to get a specific batch
    try {
      method3Result = await BlockchainService.contract.methods.getMedicine('TEST').call();
    } catch (error) {
      method3Result = { error: error.message };
    }
    
    res.json({
      success: true,
      contractAddress: process.env.CONTRACT_ADDRESS,
      getAllBatchNumbers: method1Result,
      getMedicine: method3Result,
      bytecodeLength: bytecode.length,
      bytecodeExists: bytecode !== '0x',
      // Show available methods
      methods: Object.keys(BlockchainService.contract.methods)
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
			//VERIFY CONTRACTS
app.get('/api/verify-contract', async (req, res) => {
  try {
    const web3 = new Web3('http://localhost:8545');
    const code = await web3.eth.getCode(process.env.CONTRACT_ADDRESS);
    
    res.json({
      success: true,
      contractAddress: process.env.CONTRACT_ADDRESS,
      hasCode: code !== '0x' && code !== '0x0',
      codeLength: code.length,
      methods: await getAllContractMethods(process.env.CONTRACT_ADDRESS)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

async function getAllContractMethods(contractAddress) {
  try {
    const web3 = new Web3('http://localhost:8545');
    const contract = new web3.eth.Contract(contractABI, contractAddress);
    
    return Object.keys(contract.methods).filter(key => 
      typeof contract.methods[key] === 'function'
    );
  } catch (error) {
    return [`Error: ${error.message}`];
  }
}



// Add to server.js for testing
app.get('/api/debug-gas-price', async (req, res) => {
  try {
    const Web3 = await import('web3');
    const web3 = new Web3.default(process.env.BLOCKCHAIN_NETWORK);
    
    // Get current gas price from network
    const networkGasPrice = await web3.eth.getGasPrice();
    const networkGwei = web3.utils.fromWei(networkGasPrice, 'gwei');
    
    // Calculate Sepolia minimum
    const sepoliaMinGwei = 30;
    const sepoliaMinWei = web3.utils.toWei(sepoliaMinGwei.toString(), 'gwei');
    
    // Check balance
    const address = process.env.DEPLOYER_ADDRESS;
    const balance = await web3.eth.getBalance(address);
    const ethBalance = web3.utils.fromWei(balance, 'ether');
    
    res.json({
      success: true,
      gasAnalysis: {
        networkReported: `${networkGwei} gwei`,
        networkWei: networkGasPrice,
        sepoliaMinimum: `${sepoliaMinGwei} gwei`,
        sepoliaMinimumWei: sepoliaMinWei,
        problem: parseFloat(networkGwei) < sepoliaMinGwei ? 
          `NETWORK GAS TOO LOW (${networkGwei} < ${sepoliaMinGwei})` : 
          'OK',
        recommendation: parseFloat(networkGwei) < sepoliaMinGwei ?
          `Use ${sepoliaMinGwei}+ gwei for Sepolia` :
          'Network gas price is sufficient'
      },
      balance: {
        address: address,
        wei: balance,
        eth: ethBalance,
        hasEnough: parseFloat(ethBalance) > 0.001
      },
      network: await web3.eth.net.getId()
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Test ownership transfer
app.post('/api/test-ownership-transfer', async (req, res) => {
  try {
    const { batchNo, toAddress } = req.body;
    
    const BlockchainService = (await import('./services/blockchainService.js')).default;
    
    const result = await BlockchainService.transferMedicine(
      batchNo,
      toAddress,
      "Test Transfer",
      JSON.stringify({ test: true, date: new Date().toISOString() })
    );
    
    res.json({
      success: true,
      message: "Ownership transfer tested",
      transaction: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get batch owner
app.get('/api/blockchain/batch/:batchNo/owner', async (req, res) => {
  try {
    const { batchNo } = req.params;
    const BlockchainService = (await import('./services/blockchainService.js')).default;
    
    const ownerResult = await BlockchainService.getMedicineOwner(batchNo);
    
    res.json(ownerResult);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update pharmacy blockchain address
app.put('/api/pharmacy-companies/:id/blockchain-address', async (req, res) => {
  try {
    const { id } = req.params;
    const { blockchainAddress } = req.body;
    
    const PharmacyCompany = (await import('./models/PharmacyCompany.js')).default;
    
    // Validate address
    if (!blockchainAddress || !/^0x[a-fA-F0-9]{40}$/.test(blockchainAddress)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Ethereum address format"
      });
    }
    
    const updated = await PharmacyCompany.findByIdAndUpdate(
      id,
      { blockchainAddress: blockchainAddress.toLowerCase() },
      { new: true }
    );
    
    res.json({
      success: true,
      message: "Blockchain address updated",
      data: updated
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

  app.get('/api/debug-contract-methods', async (req, res) => {
  try {
    // Import the blockchain service
    const BlockchainService = (await import('./services/blockchainService.js')).default;
    
    // NO NEED TO CALL initialize() - it auto-initializes
    // if (!BlockchainService.isInitialized) {
    //   await BlockchainService.initialize(); // REMOVE THIS
    // }
    
    // Check if service is available
    if (!BlockchainService.isAvailable) {
      return res.json({
        success: false,
        message: 'Blockchain service not available',
        isAvailable: BlockchainService.isAvailable,
        contractAddress: process.env.CONTRACT_ADDRESS
      });
    }
    
    // Test 1: Get all batch numbers
    let allBatches = [];
    try {
      if (BlockchainService.contract?.methods?.getAllBatchNumbers) {
        allBatches = await BlockchainService.contract.methods.getAllBatchNumbers().call();
      }
    } catch (error) {
      console.log('getAllBatchNumbers error:', error.message);
    }
    
    // Test 2: Get owner
    let owner = 'unknown';
    try {
      if (BlockchainService.contract?.methods?.owner) {
        owner = await BlockchainService.contract.methods.owner().call();
      }
    } catch (error) {
      console.log('owner error:', error.message);
    }
    
    // Get all method names
    const methodNames = BlockchainService.contract ? 
      Object.keys(BlockchainService.contract.methods) : [];
    
    res.json({
      success: true,
      contractAddress: process.env.CONTRACT_ADDRESS,
      serviceAvailable: BlockchainService.isAvailable,
      contractInitialized: !!BlockchainService.contract,
      owner: owner,
      allBatches: allBatches,
      totalBatches: allBatches.length,
      totalMethods: methodNames.length,
      methods: methodNames.slice(0, 20), // First 20 methods only
      networkInfo: await BlockchainService.getNetworkInfo() // Use existing method
    });
    
  } catch (error) {
    console.error('Debug contract methods error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      contractAddress: process.env.CONTRACT_ADDRESS
    });
  }
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

  app.get('/api/blockchain/sync-queue', async (req, res) => {
  try {
    let syncQueue = [];
    let tempBatches = [];
    
    try {
      const BlockchainSyncQueue = (await import('./models/BlockchainSyncQueue.js')).default;
      syncQueue = await BlockchainSyncQueue.find().sort({ createdAt: -1 }).limit(20);
    } catch (error) {
      console.log('Sync queue model not available:', error.message);
    }
    
    try {
      const TemporaryBatch = (await import('./models/TemporaryBatch.js')).default;
      tempBatches = await TemporaryBatch.find().sort({ createdAt: -1 }).limit(20);
    } catch (error) {
      console.log('Temporary batch model not available:', error.message);
    }
    
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      syncQueue: {
        total: syncQueue.length,
        pending: syncQueue.filter(item => item.status === 'pending').length,
        processing: syncQueue.filter(item => item.status === 'processing').length,
        failed: syncQueue.filter(item => item.status === 'failed').length,
        completed: syncQueue.filter(item => item.status === 'completed').length,
        items: syncQueue.slice(0, 5).map(item => ({
          batchNo: item.batchNo,
          status: item.status,
          retryCount: item.retryCount,
          createdAt: item.createdAt
        }))
      },
      temporaryBatches: {
        total: tempBatches.length,
        notSynced: tempBatches.filter(b => !b.syncedToMongo).length,
        items: tempBatches.slice(0, 5).map(batch => ({
          batchNo: batch.batchNo,
          syncedToMongo: batch.syncedToMongo,
          syncAttempts: batch.syncAttempts,
          createdAt: batch.createdAt
        }))
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error getting sync queue status',
      error: error.message
    });
  }
});

// Replaced the verify-contract-deployment endpoint
app.get('/api/verify-contract-deployment', async (req, res) => {
  try {
    const Web3 = await import('web3');
    const { readFile } = await import('fs/promises');
    const { join, dirname } = await import('path');
    const { fileURLToPath } = await import('url');
    
    const web3 = new Web3.default(process.env.BLOCKCHAIN_NETWORK);
    
    const contractAddress = process.env.CONTRACT_ADDRESS;
    
    // Check if contract exists at address
    const code = await web3.eth.getCode(contractAddress);
    const hasCode = code !== '0x' && code !== '0x0';
    
    // Try to call a contract method
    let contractInfo = { success: false };
    if (hasCode) {
      try {
        // Load ABI using ES modules
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = dirname(__filename);
        const abiPath = join(__dirname, 'contracts', 'MedicineTrackerABI.json');
        
        const abiData = await readFile(abiPath, 'utf8');
        const contractABI = JSON.parse(abiData);
        
        const contract = new web3.eth.Contract(contractABI, contractAddress);
        
        // Try to get owner
        const owner = await contract.methods.owner().call();
        
        // Try to get batch count
        let batchCount = 0;
        try {
          const batches = await contract.methods.getAllBatchNumbers().call();
          batchCount = batches.length;
        } catch (batchError) {
          console.log('Could not get batches:', batchError.message);
        }
        
        contractInfo = {
          success: true,
          owner: owner,
          totalBatches: batchCount,
          methodsAvailable: [
            'owner',
            'getAllBatchNumbers',
            'verifyMedicineExistence',
            'getMedicine'
          ].filter(method => contract.methods[method])
        };
        
      } catch (contractError) {
        contractInfo.error = contractError.message;
        console.error('Contract error:', contractError);
      }
    }
    
    // Get network info
    const networkId = await web3.eth.net.getId();
    const blockNumber = await web3.eth.getBlockNumber();
    const gasPrice = await web3.eth.getGasPrice();
    
    res.json({
      success: true,
      contractAddress: contractAddress,
      contractDeployed: hasCode,
      codeLength: code.length,
      contractInfo: contractInfo,
      network: {
        id: networkId,
        name: networkId === 11155111 ? 'Sepolia' : `Unknown (${networkId})`,
        block: blockNumber,
        gasPrice: `${web3.utils.fromWei(gasPrice, 'gwei')} gwei`
      },
      account: {
        address: process.env.DEPLOYER_ADDRESS,
        balance: await web3.eth.getBalance(process.env.DEPLOYER_ADDRESS),
        balanceEth: web3.utils.fromWei(
          await web3.eth.getBalance(process.env.DEPLOYER_ADDRESS), 
          'ether'
        )
      }
    });
    
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});


app.post('/api/blockchain/force-sync', async (req, res) => {
  try {
    const SyncWorker = (await import('./services/syncWorker.js')).default;
    
    await SyncWorker.performSync();
    
    res.json({
      success: true,
      message: 'Forced sync completed',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Force sync failed',
      error: error.message
    });
  }
});

app.get('/api/blockchain/batch/:batchNo', async (req, res) => {
  try {
    const { batchNo } = req.params;
    const BlockchainService = (await import('./services/blockchainService.js')).default;
    
    // if (!BlockchainService.isInitialized) {
    //   await BlockchainService.initialize();
    // }
    
    // Check if exists
    const exists = await BlockchainService.verifyMedicineExistence(batchNo);
    
    let batchData = null;
    if (exists) {
      try {
        batchData = await BlockchainService.getCompleteMedicineFromBlockchain(batchNo);
      } catch (dataError) {
        console.log('Could not get complete data:', dataError.message);
      }
    }
    
    res.json({
      success: true,
      batchNo: batchNo,
      existsOnBlockchain: exists,
      data: batchData,
      contractAddress: process.env.CONTRACT_ADDRESS,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error checking batch on blockchain',
      error: error.message
    });
  }
});


//    TEST ALL

app.get('/api/test-all-blockchain', async (req, res) => {
  const endpoints = [
    '/api/blockchain/status',
    '/api/blockchain/real/status', 
    '/api/system/health/detailed',
    '/api/blockchain/enhanced-status',
    '/api/blockchain/test-methods'
  ];
  
  const results = [];
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`http://localhost:${PORT}${endpoint}`);
      const data = await response.json();
      results.push({
        endpoint,
        status: response.status,
        success: data.success || false
      });
    } catch (error) {
      results.push({
        endpoint,
        status: 500,
        success: false,
        error: error.message
      });
    }
  }
  
  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    endpoints: results,
    working: results.filter(r => r.success).length,
    total: results.length
  });
});


  // Enhanced blockchain status endpoint
app.get('/api/blockchain/status', async (req, res) => {
  try {
    const web3 = new Web3(process.env.BLOCKCHAIN_NETWORK || 'http://localhost:8545');
    
    let blockchainStatus = {
      isRealBlockchain: false,
      connected: false,
      networkName: 'Local',
      contract: null
    };
    
    try {
      // Test connection
      const blockNumber = await web3.eth.getBlockNumber();
      const networkId = await web3.eth.net.getId();
      
      blockchainStatus.connected = true;
      blockchainStatus.latestBlock = blockNumber;
      blockchainStatus.networkId = networkId;
      
      // Check if real blockchain
      const networkUrl = process.env.BLOCKCHAIN_NETWORK || '';
      blockchainStatus.isRealBlockchain = networkUrl.includes('infura.io') || 
                                         networkUrl.includes('sepolia') || 
                                         networkUrl.includes('mainnet');
      
      // Check contract
      if (process.env.CONTRACT_ADDRESS && 
          process.env.CONTRACT_ADDRESS !== '0xYourDeployedContractAddressHere') {
        const code = await web3.eth.getCode(process.env.CONTRACT_ADDRESS);
        blockchainStatus.contract = {
          exists: code !== '0x' && code !== '0x0',
          address: process.env.CONTRACT_ADDRESS,
          codeSize: code.length
        };
      }
      
      // Get gas price
      try {
        const gasPrice = await web3.eth.getGasPrice();
        blockchainStatus.gasPrice = web3.utils.fromWei(gasPrice, 'gwei') + ' gwei';
      } catch (gasError) {
        console.log('Gas price check failed:', gasError.message);
      }
      
      // Check balance if we have a deployer address
      if (process.env.DEPLOYER_ADDRESS) {
        try {
          const balance = await web3.eth.getBalance(process.env.DEPLOYER_ADDRESS);
          blockchainStatus.balance = web3.utils.fromWei(balance, 'ether') + ' ETH';
          blockchainStatus.hasBalance = parseFloat(web3.utils.fromWei(balance, 'ether')) > 0.01;
        } catch (balanceError) {
          console.log('Balance check failed:', balanceError.message);
        }
      }
      
    } catch (connectionError) {
      console.log('Blockchain connection failed:', connectionError.message);
      blockchainStatus.error = connectionError.message;
    }
    
    res.json({
      success: true,
      blockchain: blockchainStatus,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error checking blockchain status',
      error: error.message
    });
  }
});

// Simple health check endpoint
app.get('/api/blockchain/health', async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Blockchain service is available',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Blockchain health check failed',
      error: error.message
    });
  }
});

// Add this route in server.js, near the other blockchain routes
app.get('/api/blockchain/real/status-detailed', async (req, res) => {
  try {
    console.log('🔍 Detailed real blockchain status requested');
    
    const Web3 = await import('web3');
    const web3 = new Web3.default(process.env.BLOCKCHAIN_NETWORK);
    
    // Get detailed information
    const [blockNumber, networkId, gasPrice, isListening, chainId] = await Promise.all([
      web3.eth.getBlockNumber(),
      web3.eth.net.getId(),
      web3.eth.getGasPrice(),
      web3.eth.net.isListening(),
      web3.eth.getChainId()
    ]);
    
    // Get network name
    const networkName = getNetworkName(Number(chainId));
    
    // Check contract if exists
    let contractInfo = null;
    if (process.env.CONTRACT_ADDRESS && 
        process.env.CONTRACT_ADDRESS !== '0xYourDeployedContractAddressHere') {
      try {
        const code = await web3.eth.getCode(process.env.CONTRACT_ADDRESS);
        contractInfo = {
          address: process.env.CONTRACT_ADDRESS,
          hasCode: code !== '0x' && code !== '0x0',
          codeSize: code.length,
          isPlaceholder: process.env.CONTRACT_ADDRESS.includes('YourDeployedContract')
        };
      } catch (contractError) {
        contractInfo = { error: contractError.message };
      }
    }
    
    // Check deployer balance
    let balanceInfo = null;
    if (process.env.DEPLOYER_ADDRESS) {
      try {
        const balance = await web3.eth.getBalance(process.env.DEPLOYER_ADDRESS);
        balanceInfo = {
          address: process.env.DEPLOYER_ADDRESS,
          balance: web3.utils.fromWei(balance, 'ether'),
          balanceWei: balance.toString(),
          hasEnough: parseFloat(web3.utils.fromWei(balance, 'ether')) > 0.001
        };
      } catch (balanceError) {
        balanceInfo = { error: balanceError.message };
      }
    }
    
    const response = {
      success: true,
      connected: isListening,
      networkName: networkName,
      networkId: Number(networkId),
      chainId: Number(chainId),
      latestBlock: Number(blockNumber),
      gasPrice: `${web3.utils.fromWei(gasPrice, 'gwei')} gwei`,
      isTestnet: [5, 11155111, 80001, 97].includes(Number(networkId)),
      contract: contractInfo,
      wallet: balanceInfo,
      timestamp: new Date().toISOString(),
      rpcUrl: process.env.BLOCKCHAIN_NETWORK?.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')
    };
    
    res.json(response);
    
  } catch (error) {
    console.error('❌ Detailed blockchain status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get detailed blockchain status',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Add this near the end of server.js, before app.listen()
app.get('/api/debug-routes', (req, res) => {
  const routes = [];
  
  // Helper to extract routes
  function extractRoutes(layer, path = '') {
    if (layer.route) {
      // Regular route
      const routePath = path + (layer.route.path === '/' ? '' : layer.route.path);
      const methods = Object.keys(layer.route.methods).map(m => m.toUpperCase()).join(', ');
      routes.push({
        path: routePath,
        methods: methods,
        type: 'route'
      });
    } else if (layer.name === 'router' && layer.handle.stack) {
      // Router middleware
      const routerPath = layer.regexp.toString().replace(/^\/\^\\\//, '').replace(/\\\/\?\$\/.*/, '');
      layer.handle.stack.forEach(sublayer => {
        extractRoutes(sublayer, path + routerPath);
      });
    } else if (layer.name === 'bound dispatch') {
      // Middleware
      routes.push({
        path: path,
        name: layer.name,
        type: 'middleware'
      });
    }
  }
  
  // Extract all routes
  app._router.stack.forEach(layer => {
    extractRoutes(layer);
  });
  
  // Filter and format
  const apiRoutes = routes
    .filter(r => r.type === 'route')
    .map(r => ({
      path: r.path,
      methods: r.methods
    }))
    .sort((a, b) => a.path.localeCompare(b.path));
  
  res.json({
    success: true,
    totalRoutes: apiRoutes.length,
    routes: apiRoutes,
    missingRoutes: [
      '/api/system/health/detailed',
      '/api/blockchain/real/status'
    ].filter(route => !apiRoutes.some(r => r.path === route))
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

    // Initialize demo data...
    
    // Start background sync worker
    SyncWorker.start();
    console.log('✅ Background sync worker started');


	  app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
   // app.listen(PORT, () => {
   //    console.log(`✅ Server running on port ${PORT}`);
   //  });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Clean shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Shutting down gracefully...');
  await SyncWorker.stop();
  process.exit(0);
});


transactionMonitor.startMonitoring();
app.get('/api/blockchain/transaction/:txHash', async (req, res) => {
  try {
    const status = await transactionMonitor.getTransactionStatus(req.params.txHash);
    res.json({ success: true, data: status });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Test email endpoint
app.get('/api/test-email', async (req, res) => {
  try {
    const testUser = {
      username: 'testuser',
      name: 'Test User', 
      role: 'admin',
      email: 'contact.medicheck@gmail.com' // Your test email
    };

    const emailService = (await import('./services/emailService.js')).default;
    const result = await emailService.sendUserRegistrationEmail(testUser, 'TestPass123');

    res.json({
      success: true,
      mode: result.simulated ? 'simulation' : 'live',
      message: result.simulated ? 
        'Email simulation working - check server logs' : 
        'Real email sent successfully',
      messageId: result.messageId
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error testing email',
      error: error.message
    });
  }
});

// Route 1: Detailed Health Check
app.get('/api/system/health/detailed', async (req, res) => {
  try {
    console.log('🔍 Detailed health check requested');
    
    // Import health helper
    const healthHelper = await import('./utils/healthHelper.js');
    
    // Run checks in parallel
    const [mongoStatus, blockchainStatus] = await Promise.allSettled([
      healthHelper.checkMongoDBHealth(),
      healthHelper.checkBlockchainHealth()
    ]);
    
    // Process results
    const mongoResult = mongoStatus.status === 'fulfilled' ? mongoStatus.value : {
      healthy: false,
      error: mongoStatus.reason?.message || 'MongoDB check failed',
      readyState: -1,
      stateName: 'error'
    };
    
    const blockchainResult = blockchainStatus.status === 'fulfilled' ? blockchainStatus.value : {
      connected: false,
      healthy: false,
      error: blockchainStatus.reason?.message || 'Blockchain check failed'
    };
    
    // Get system info
    const systemInfo = healthHelper.getSystemInfo();
    
    // Determine overall status
    let overallStatus = 'critical';
    let statusMessage = 'System is experiencing issues';
    
    if (mongoResult.healthy && blockchainResult.healthy) {
      overallStatus = 'operational';
      statusMessage = 'All systems operational';
    } else if (mongoResult.healthy && !blockchainResult.healthy) {
      overallStatus = 'degraded';
      statusMessage = 'Blockchain unavailable - operating in database-only mode';
    } else if (!mongoResult.healthy && blockchainResult.healthy) {
      overallStatus = 'degraded';
      statusMessage = 'MongoDB unavailable - operating in blockchain-only mode';
    }
    
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      status: {
        overall: overallStatus,
        message: statusMessage,
        mongodb: mongoResult,
        blockchain: blockchainResult
      },
      system: systemInfo,
      recommendations: [
        !mongoResult.healthy ? 'Check MongoDB connection' : null,
        !blockchainResult.healthy ? 'Check blockchain network' : null
      ].filter(Boolean)
    });
    
  } catch (error) {
    console.error('❌ Detailed health check failed:', error);
    res.status(500).json({
      success: false,
      message: 'Detailed health check failed',
      error: error.message
    });
  }
});

// Route 2: Real Blockchain Status
app.get('/api/blockchain/real/status', async (req, res) => {
  try {
    console.log('🔍 Real blockchain status check requested');
    
    let realBlockchainInfo = {
      available: false,
      error: null,
      details: {}
    };
    
    try {
      // Try to import the real blockchain service
      const realBlockchainModule = await import('../services/realBlockchainService.js');
      const service = realBlockchainModule.default;
      
      if (service) {
        console.log('✅ Real blockchain service loaded');
        
        // Check if the service has the method
        if (typeof service.getNetworkInfo === 'function') {
          console.log('🔄 Calling getNetworkInfo()...');
          const networkInfo = await service.getNetworkInfo();
          console.log('✅ Network info received:', networkInfo);
          
          realBlockchainInfo.details = networkInfo;
          realBlockchainInfo.available = networkInfo.connected || false;
          realBlockchainInfo.error = networkInfo.error;
        } else {
          console.log('❌ getNetworkInfo method not found');
          realBlockchainInfo.error = 'getNetworkInfo method not available';
        }
      } else {
        console.log('❌ Real blockchain service not available');
        realBlockchainInfo.error = 'Real blockchain service not available';
      }
      
    } catch (importError) {
      console.error('❌ Failed to import real blockchain service:', importError);
      realBlockchainInfo.error = `Service import failed: ${importError.message}`;
    }
    
    // Always respond with something
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      message: 'Real blockchain status check completed',
      realBlockchain: realBlockchainInfo,
      serviceAvailable: realBlockchainInfo.available,
      error: realBlockchainInfo.error
    });
    
  } catch (error) {
    console.error('❌ Real blockchain status check failed:', error);
    res.status(500).json({
      success: false,
      message: 'Real blockchain status check failed',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

app.post('/api/blockchain/real/register', async (req, res) => {
  try {
    const batchData = req.body;
    const RealBlockchainService = (await import('../services/realBlockchainService.js')).default;
    
    const result = await RealBlockchainService.registerMedicine(batchData);
    
    res.json({
      success: true,
      message: 'Medicine registered on real blockchain',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Real blockchain registration failed',
      error: error.message
    });
  }
});

app.get('/api/blockchain/real/faucet/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const RealBlockchainService = (await import('../services/realBlockchainService.js')).default;
    
    await RealBlockchainService.getTestETHFromFaucet(address);
    
    res.json({
      success: true,
      message: 'Faucet information generated',
      address: address,
      instructions: 'Check server logs for faucet URLs'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating faucet info',
      error: error.message
    });
  }
});



// Real blockchain health check
app.get('/api/blockchain/real/health', async (req, res) => {
  try {
    const web3 = new Web3(process.env.BLOCKCHAIN_NETWORK);
    
    // Check connection
    const isListening = await web3.eth.net.isListening();
    const networkId = await web3.eth.net.getId();
    const blockNumber = await web3.eth.getBlockNumber();
    const gasPrice = await web3.eth.getGasPrice();
    
    // Get contract info if exists
    let contractInfo = null;
    if (process.env.CONTRACT_ADDRESS && process.env.CONTRACT_ADDRESS !== '0xYourDeployedContractAddressHere') {
      const code = await web3.eth.getCode(process.env.CONTRACT_ADDRESS);
      contractInfo = {
        address: process.env.CONTRACT_ADDRESS,
        hasCode: code !== '0x',
        codeLength: code.length
      };
    }
    
    res.json({
      success: true,
      realBlockchain: {
        connected: isListening,
        networkId: Number(networkId),
        networkName: getNetworkName(Number(networkId)),
        latestBlock: Number(blockNumber),
        gasPrice: web3.utils.fromWei(gasPrice, 'gwei') + ' gwei',
        contract: contractInfo,
        networkUrl: process.env.BLOCKCHAIN_NETWORK
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Real blockchain health check failed',
      error: error.message,
      network: process.env.BLOCKCHAIN_NETWORK
    });
  }
});

function getNetworkName(chainId) {
  const networks = {
    1: 'Ethereum Mainnet',
    5: 'Goerli Testnet',
    11155111: 'Sepolia Testnet',
    80001: 'Polygon Mumbai',
    97: 'BNB Smart Chain Testnet',
    56: 'BNB Smart Chain Mainnet',
    137: 'Polygon Mainnet',
    42161: 'Arbitrum One',
    10: 'Optimism',
    31337: 'Hardhat Local',
    1337: 'Local Testnet'
  };
  return networks[chainId] || `Unknown Network (${chainId})`;
}
startServer();
