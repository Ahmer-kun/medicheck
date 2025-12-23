// Test script - save as test-all.js
const { Web3 } = require('web3');

async function testAll() {
  console.log('🔍 Testing complete blockchain setup...\n');
  
  const web3 = new Web3('http://localhost:8545');
  
  // 1. Test connection
  console.log('1. Testing connection...');
  const version = await web3.eth.getNodeInfo();
  console.log('   ✅ Connected to:', version.split('/')[0]);
  
  // 2. Test contract deployment
  console.log('\n2. Checking contract deployment...');
  const fs = require('fs');
  if (fs.existsSync('./contract-info.json')) {
    const contractInfo = JSON.parse(fs.readFileSync('./contract-info.json', 'utf8'));
    console.log('   ✅ Contract deployed at:', contractInfo.address);
    console.log('   ✅ Deployer:', contractInfo.deployer);
  } else {
    console.log('   ❌ No contract deployed. Run: npx hardhat run scripts/deploy.js');
  }
  
  // 3. Test .env configuration
  console.log('\n3. Checking .env configuration...');
  require('dotenv').config();
  if (process.env.CONTRACT_ADDRESS) {
    console.log('   ✅ CONTRACT_ADDRESS in .env:', process.env.CONTRACT_ADDRESS);
  } else {
    console.log('   ❌ CONTRACT_ADDRESS missing from .env');
  }
  
  // 4. Test backend API
  console.log('\n4. Testing backend API...');
  const fetch = require('node-fetch');
  try {
    const response = await fetch('http://localhost:5000/api/health');
    const data = await response.json();
    console.log('   ✅ Backend running:', data.status);
  } catch {
    console.log('   ❌ Backend not running on port 5000');
  }
  
  console.log('\n🎉 Test complete!');
}

testAll().catch(console.error);