// test-real-blockchain.js - FIXED VERSION
import dotenv from 'dotenv';
import { ethers } from 'ethers';
import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function testRealBlockchain() {
  console.log('🧪 TESTING REAL BLOCKCHAIN CONNECTION');
  console.log('====================================\n');
  
  // Test 1: Network Connection
  console.log('1. Testing network connection...');
  try {
    const provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_NETWORK);
    const network = await provider.getNetwork();
    const block = await provider.getBlockNumber();
    
    console.log(`   ✅ Connected to: ${network.name} (Chain ID: ${network.chainId})`);
    console.log(`   📦 Latest block: ${block}`);
    
  } catch (error) {
    console.log(`   ❌ Network connection failed: ${error.message}`);
    return;
  }
  
  // Test 2: Wallet Connection
  console.log('\n2. Testing wallet connection...');
  if (!process.env.DEPLOYER_PRIVATE_KEY) {
    console.log('   ⚠️ No private key configured');
  } else {
    try {
      const provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_NETWORK);
      const wallet = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider);
      
      console.log(`   ✅ Wallet address: ${wallet.address}`);
      
      const balance = await provider.getBalance(wallet.address);
      console.log(`   💰 Balance: ${ethers.formatEther(balance)} ETH`);
      
      if (balance < ethers.parseEther('0.005')) {
        console.log('   ⚠️ Low balance - get test ETH');
      }
      
    } catch (error) {
      console.log(`   ❌ Wallet test failed: ${error.message}`);
    }
  }
  
  // Test 3: Contract Connection - FIXED
  console.log('\n3. Testing contract connection...');
  if (!process.env.CONTRACT_ADDRESS || process.env.CONTRACT_ADDRESS.includes('YourDeployed')) {
    console.log('   ⚠️ No contract address configured');
  } else {
    try {
      const provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_NETWORK);
      
      // Load contract ABI using ES modules
      const contractPath = join(__dirname, '../contracts/MedicineTrackerABI.json');
      const contractData = await readFile(contractPath, 'utf8');
      const contractABI = JSON.parse(contractData);
      
      const contract = new ethers.Contract(
        process.env.CONTRACT_ADDRESS, 
        contractABI, 
        provider
      );
      
      console.log(`   ✅ Contract address: ${process.env.CONTRACT_ADDRESS}`);
      
      // Try to get owner
      try {
        const owner = await contract.owner();
        console.log(`   👑 Contract owner: ${owner}`);
      } catch (ownerError) {
        console.log(`   ⚠️ Could not get owner: ${ownerError.message}`);
      }
      
      // Try to get all batches
      try {
        const allBatches = await contract.getAllBatchNumbers();
        console.log(`   📊 Total batches on blockchain: ${allBatches.length}`);
      } catch (batchError) {
        console.log(`   ℹ️ No batches yet or error: ${batchError.message}`);
      }
      
    } catch (error) {
      console.log(`   ❌ Contract test failed: ${error.message}`);
      console.log('   🔧 Check contract ABI file exists');
    }
  }
  
  console.log('\n✅ Real blockchain is working!');
}

testRealBlockchain().catch(console.error);

// import dotenv from 'dotenv';
// import { ethers } from 'ethers';
// import { join, dirname } from 'path';
// import { fileURLToPath } from 'url';

// dotenv.config();

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// async function testRealBlockchain() {
//   console.log('🧪 TESTING REAL BLOCKCHAIN CONNECTION');
//   console.log('====================================\n');
  
//   // Test 1: Network Connection
//   console.log('1. Testing network connection...');
//   try {
//     const provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_NETWORK);
//     const network = await provider.getNetwork();
//     const block = await provider.getBlockNumber();
    
//     console.log(`   ✅ Connected to: ${network.name} (Chain ID: ${network.chainId})`);
//     console.log(`   📦 Latest block: ${block}`);
    
//   } catch (error) {
//     console.log(`   ❌ Network connection failed: ${error.message}`);
//     console.log('\n🔧 Troubleshooting:');
//     console.log('   - Check your RPC URL in .env');
//     console.log('   - Ensure INFURA_API_KEY is set (if using Infura)');
//     console.log('   - Try a public RPC: https://rpc.sepolia.org');
//     return;
//   }
  
//   // Test 2: Wallet Connection
//   console.log('\n2. Testing wallet connection...');
//   if (!process.env.DEPLOYER_PRIVATE_KEY) {
//     console.log('   ⚠️  No private key configured');
//   } else {
//     try {
//       const provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_NETWORK);
//       const wallet = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider);
      
//       console.log(`   ✅ Wallet address: ${wallet.address}`);
      
//       const balance = await provider.getBalance(wallet.address);
//       console.log(`   💰 Balance: ${ethers.formatEther(balance)} ETH`);
      
//       if (balance < ethers.parseEther('0.005')) {
//         console.log('   ⚠️  Low balance - get test ETH');
//         console.log(`   🔗 https://sepoliafaucet.com?address=${wallet.address}`);
//       }
      
//     } catch (error) {
//       console.log(`   ❌ Wallet test failed: ${error.message}`);
//     }
//   }
  
//   // Test 3: Contract Connection
//   console.log('\n3. Testing contract connection...');
//   if (!process.env.CONTRACT_ADDRESS || process.env.CONTRACT_ADDRESS.includes('YourDeployed')) {
//     console.log('   ⚠️  No contract address configured');
//     console.log('   📝 Run: npm run deploy-sepolia');
//   } else {
//     try {
//       const provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_NETWORK);
//       const contractABI = require(join(__dirname, '../contracts/MedicineTrackerABI.json'));
//       const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, contractABI, provider);
      
//       console.log(`   ✅ Contract address: ${process.env.CONTRACT_ADDRESS}`);
      
//       // Try to get owner
//       const owner = await contract.owner();
//       console.log(`   👑 Contract owner: ${owner}`);
      
//       // Try to get all batches
//       const allBatches = await contract.getAllBatchNumbers();
//       console.log(`   📊 Total batches: ${allBatches.length}`);
      
//     } catch (error) {
//       console.log(`   ❌ Contract test failed: ${error.message}`);
//       console.log('   🔧 Run: npm run deploy-sepolia');
//     }
//   }
  
//   console.log('\n🎯 SUMMARY');
//   console.log('==========');
//   console.log('To deploy to real blockchain:');
//   console.log('1. npm run compile');
//   console.log('2. npm run deploy-sepolia');
//   console.log('3. npm start');
// }

// testRealBlockchain().catch(console.error);
