// Failed attempt to refactor the dualstorage with a seperate concept i.e atomic storage
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const fetch = require('node-fetch');

dotenv.config({ path: '.env' });

console.log('🔧 Environment check:');
console.log('- MONGODB_URI:', process.env.MONGODB_URI ? '✓ Set' : '✗ Not set');
console.log('- BLOCKCHAIN_NETWORK:', process.env.BLOCKCHAIN_NETWORK ? '✓ Set' : '✗ Not set');
console.log('- CONTRACT_ADDRESS:', process.env.CONTRACT_ADDRESS ? '✓ Set' : '✗ Not set');
console.log('');

async function checkServerHealth() {
  console.log('🏥 Checking server health...');
  try {
    const response = await fetch('http://localhost:5000/api/health');
    if (response.ok) {
      const health = await response.json();
      console.log('✅ Server is running:', health);
      return true;
    } else {
      console.log('❌ Server returned:', response.status, response.statusText);
      return false;
    }
  } catch (error) {
    console.log('❌ Cannot connect to server:', error.message);
    console.log('💡 Make sure backend is running: npm run dev');
    return false;
  }
}

async function loginAndGetToken() {
  console.log('\n🔐 Getting authentication token...');
  try {
    // Try to login (use your actual credentials)
    const loginData = {
      username: 'manufacturer1',  // Change to your test user
      password: 'password123'     // Change to your test password
    };
    
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginData)
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Login successful');
      return result.token;
    } else {
      console.log('❌ Login failed:', response.status);
      return null;
    }
  } catch (error) {
    console.log('❌ Login error:', error.message);
    return null;
  }
}

async function testAtomicRegistration(token) {
  console.log('\n🧪 TESTING ATOMIC MANUFACTURER REGISTRATION');
  
  if (!token) {
    console.log('❌ No token available, skipping registration test');
    return;
  }
  
  const batchNo = `ATOMIC-TEST-${Date.now()}`;
  
  const testBatch = {
    batchNo: batchNo,
    name: 'Test Atomic Medicine',
    medicineName: 'Test Atomic Medicine',
    manufactureDate: '2024-01-15',
    expiry: '2025-01-15',
    formulation: 'Tablet',
    manufacturer: 'Atomic Test Pharma',
    pharmacy: 'To be assigned',
    quantity: 500,
    packSize: '10X10'
  };
  
  console.log('\n📦 Attempting to register batch:', batchNo);
  
  try {
    const response = await fetch('http://localhost:5000/api/batches', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(testBatch)
    });
    
    console.log('📨 Response Status:', response.status);
    
    const result = await response.json();
    console.log('📨 Response Body:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('\n🎉 REGISTRATION SUCCESSFUL!');
      console.log('Storage Status:', result.storage?.status);
      console.log('Blockchain TX:', result.blockchain?.transactionHash?.substring(0, 20) + '...');
      
      // Verify storage
      await verifyStorage(batchNo);
    } else {
      console.log('\n❌ REGISTRATION FAILED');
      console.log('Error:', result.message);
      console.log('Details:', result.errors);
    }
    
  } catch (error) {
    console.log('❌ Request failed:', error.message);
  }
}

async function verifyStorage(batchNo) {
  console.log('\n🔍 Verifying storage...');
  
  // Check in database
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const Batch = (await import('./models/Batch.js')).default;
    
    const batch = await Batch.findOne({ batchNo });
    if (batch) {
      console.log(`✅ Found in MongoDB: ${batch.batchNo}`);
      console.log(`   ID: ${batch._id}`);
      console.log(`   Blockchain Verified: ${batch.blockchainVerified}`);
      console.log(`   Created: ${batch.createdAt}`);
    } else {
      console.log(`❌ NOT found in MongoDB`);
    }
  } catch (error) {
    console.log('MongoDB check error:', error.message);
  }
  
  // Check blockchain via API
  try {
    const response = await fetch(`http://localhost:5000/api/batches/verify/${batchNo}`);
    const result = await response.json();
    
    if (result.exists) {
      console.log(`✅ Found on Blockchain: ${batchNo}`);
      console.log(`   Authentic: ${result.authentic}`);
      console.log(`   Blockchain Verified: ${result.blockchainVerified}`);
    } else {
      console.log(`❌ NOT found on Blockchain`);
    }
  } catch (error) {
    console.log('Blockchain check error:', error.message);
  }
}

async function runTests() {
  console.log('🚀 STARTING MANUFACTURER ATOMIC REGISTRATION TESTS\n');
  
  // 1. Check server
  const serverHealthy = await checkServerHealth();
  if (!serverHealthy) {
    console.log('\n💡 Please start the backend server:');
    console.log('   cd medicheck-backend');
    console.log('   npm run dev');
    return;
  }
  
  // 2. Get auth token
  const token = await loginAndGetToken();
  
  // 3. Test registration
  await testAtomicRegistration(token);
  
  console.log('\n🏁 TEST COMPLETE');
}

// Run the tests
runTests().catch(console.error);