const mongoose = require('mongoose');
const Web3 = require('web3');

async function testConnection() {
  console.log('🧪 Testing connections...\n');
  
  // Test MongoDB
  try {
    await mongoose.connect('mongodb://localhost:27017/medicheck');
    console.log('✅ MongoDB: Connected');
  } catch (error) {
    console.log('❌ MongoDB:', error.message);
  }
  
  // Test Blockchain
  try {
    const web3 = new Web3('http://localhost:8545');
    const block = await web3.eth.getBlock('latest');
    console.log('✅ Blockchain: Connected (Block #' + block.number + ')');
  } catch (error) {
    console.log('❌ Blockchain:', error.message);
  }
  
  console.log('\n🎯 NEXT STEPS:');
  console.log('1. Ensure MongoDB is running: mongod');
  console.log('2. Ensure blockchain is running: npx hardhat node');
  console.log('3. Start backend: npm run dev');
  console.log('4. Start frontend: npm start');
}

testConnection();
// test-endpoints.js

// import { api } from './utils/api';

// async function testEndpoints() {
//   console.log('🔍 Testing API endpoints...\n');
  
//   const endpoints = [
//     '/health',
//     '/blockchain/health',
//     '/blockchain/real/health',
//     '/blockchain/status'
//   ];
  
//   for (const endpoint of endpoints) {
//     try {
//       console.log(`Testing: ${endpoint}`);
//       const response = await api.get(endpoint);
//       console.log(`✅ ${endpoint}: SUCCESS`);
//       console.log('Response:', response.data ? 'Has data' : 'No data');
//       console.log('---\n');
//     } catch (error) {
//       console.log(`❌ ${endpoint}: FAILED - ${error.message}`);
//       console.log('---\n');
//     }
//   }
// }

// // Run test
// testEndpoints();