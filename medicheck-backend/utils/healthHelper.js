// utils/healthHelper.js
import mongoose from 'mongoose';

// Helper functions for health checks
export async function safeModelCount(modelName, filter = {}) {
  try {
    let Model;
    
    // Dynamically import the model
    switch (modelName) {
      case 'BlockchainSyncQueue':
        try {
          const model = await import('../models/BlockchainSyncQueue.js');
          Model = model.default;
        } catch (error) {
          console.log(`Could not import BlockchainSyncQueue: ${error.message}`);
          return 0;
        }
        break;
        
      case 'TemporaryBatch':
        try {
          const model = await import('../models/TemporaryBatch.js');
          Model = model.default;
        } catch (error) {
          console.log(`Could not import TemporaryBatch: ${error.message}`);
          return 0;
        }
        break;
        
      default:
        return 0;
    }
    
    if (Model && typeof Model.countDocuments === 'function') {
      return await Model.countDocuments(filter);
    }
    return 0;
  } catch (error) {
    console.log(`Model ${modelName} count failed:`, error.message);
    return 0;
  }
}

export async function checkMongoDBHealth() {
  try {
    if (!mongoose) {
      return {
        healthy: false,
        readyState: 0,
        stateName: 'disconnected',
        error: 'Mongoose not available',
        models: { count: 0, names: [] }
      };
    }
    
    const readyState = mongoose.connection.readyState;
    const stateNames = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    
    const stateName = stateNames[readyState] || 'unknown';
    
    // Get model names from mongoose
    let modelNames = [];
    try {
      modelNames = Object.keys(mongoose.connection.models || {});
    } catch (modelError) {
      console.log('Error getting model names:', modelError.message);
    }
    
    return {
      healthy: readyState === 1,
      readyState,
      stateName,
      host: mongoose.connection.host || 'unknown',
      name: mongoose.connection.name || 'unknown',
      models: {
        count: modelNames.length,
        names: modelNames.slice(0, 10) // Show first 10 models
      }
    };
  } catch (error) {
    return {
      healthy: false,
      readyState: -1,
      stateName: 'error',
      error: error.message,
      models: { count: 0, names: [] }
    };
  }
}

export async function checkBlockchainHealth() {
  try {
    // Import Web3 dynamically
    const { default: Web3 } = await import('web3');
    
    const rpcUrl = process.env.BLOCKCHAIN_NETWORK || 'http://localhost:8545';
    const web3 = new Web3(rpcUrl);
    
    // Test connection with timeout
    const blockchainCheck = web3.eth.getBlockNumber();
    const timeout = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Blockchain connection timeout after 5 seconds')), 5000)
    );
    
    const blockNumber = await Promise.race([blockchainCheck, timeout]);
    
    const result = {
      connected: true,
      healthy: true,
      details: {
        blockNumber: Number(blockNumber),
        rpcUrl: rpcUrl.replace(/\/\/[^:]+:[^@]+@/, '//***:***@') // Hide credentials
      }
    };
    
    // Check contract if address is configured
    if (process.env.CONTRACT_ADDRESS && 
        process.env.CONTRACT_ADDRESS !== '0xYourDeployedContractAddressHere') {
      try {
        const code = await web3.eth.getCode(process.env.CONTRACT_ADDRESS);
        result.details.contract = {
          address: process.env.CONTRACT_ADDRESS,
          hasCode: code !== '0x' && code !== '0x0',
          codeLength: code.length,
          isPlaceholder: process.env.CONTRACT_ADDRESS.includes('YourDeployedContract')
        };
      } catch (contractError) {
        result.details.contractError = contractError.message;
      }
    }
    
    return result;
  } catch (error) {
    return {
      connected: false,
      healthy: false,
      error: error.message,
      details: {
        rpcUrl: process.env.BLOCKCHAIN_NETWORK || 'Not configured',
        suggestion: error.message.includes('timeout') ? 
          'Check if your blockchain node is running' :
          'Check RPC URL in .env file'
      }
    };
  }
}

export function getSystemInfo() {
  return {
    nodeVersion: process.version,
    platform: process.platform,
    architecture: process.arch,
    memory: {
      rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`
    },
    uptime: `${Math.floor(process.uptime())} seconds`,
    environment: process.env.NODE_ENV || 'development',
    pid: process.pid,
    cwd: process.cwd()
  };
}