import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('📁 Current directory:', __dirname);
console.log('🚀 Starting endpoint tests...\n');

const BASE_URL = 'http://localhost:5000/api';

async function testEndpoint(endpoint, name) {
  try {
    console.log(`🔍 Testing ${name} (${endpoint})...`);
    
    // Add a small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const response = await fetch(`${BASE_URL}${endpoint}`);
    
    console.log(`📊 HTTP Status: ${response.status} ${response.statusText}`);
    
    const text = await response.text();
    let data;
    
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      console.log(`⚠️ Response is not JSON: ${text.substring(0, 100)}...`);
      return { 
        success: false, 
        status: response.status,
        error: 'Response not JSON'
      };
    }
    
    if (data.success !== undefined) {
      console.log(`✅ Success: ${data.success}`);
    }
    
    if (data.error) {
      console.log(`❌ Error: ${data.error}`);
    }
    
    if (data.message) {
      console.log(`💬 Message: ${data.message}`);
    }
    
    // Check for common status fields
    if (data.status) {
      if (typeof data.status === 'object') {
        console.log(`📈 Overall Status: ${data.status.overall || data.status}`);
      } else {
        console.log(`📈 Status: ${data.status}`);
      }
    }
    
    if (data.systemStatus) {
      console.log(`🏢 System Status: ${data.systemStatus}`);
    }
    
    console.log(`---`);
    
    return { 
      success: data.success || response.status === 200, 
      status: response.status,
      data: data
    };
    
  } catch (error) {
    console.log(`❌ Failed to test ${name}: ${error.message}`);
    console.log(`📌 Endpoint: ${BASE_URL}${endpoint}`);
    console.log(`---`);
    return { 
      success: false, 
      error: error.message,
      endpoint: `${BASE_URL}${endpoint}`
    };
  }
}

async function testBasicConnectivity() {
  console.log('🌐 Testing basic connectivity...');
  
  try {
    // First test if server is running
    const healthResponse = await fetch('http://localhost:5000/');
    if (healthResponse.ok) {
      console.log('✅ Server is running on port 5000');
      return true;
    }
  } catch (error) {
    console.log('❌ Server not running. Please start the server first:');
    console.log('   npm run dev');
    return false;
  }
}

async function runAllTests() {
  console.log('🧪 RUNNING MEDICHECK ENDPOINT TESTS');
  console.log('===================================\n');
  
  // Check if server is running first
  const serverRunning = await testBasicConnectivity();
  if (!serverRunning) {
    console.log('\n🛑 Please start the server first:');
    console.log('   cd medicheck-backend');
    console.log('   npm run dev');
    return;
  }
  
  console.log('\n📡 Starting API endpoint tests...\n');
  
  const tests = [
    { endpoint: '/system/health', name: 'System Health Check' },
    { endpoint: '/health', name: 'Basic Health Check' },
    { endpoint: '/system/health/detailed', name: 'Detailed Health Check' },
    { endpoint: '/blockchain/status', name: 'Blockchain Status' },
    { endpoint: '/blockchain/real/status', name: 'Real Blockchain Status' },
    { endpoint: '/debug/mongodb', name: 'MongoDB Debug' },
    { endpoint: '/batches', name: 'Get All Batches' }
  ];
  
  const results = [];
  
  for (const test of tests) {
    const result = await testEndpoint(test.endpoint, test.name);
    results.push({ ...test, ...result });
  }
  
  console.log('\n📋 TEST SUMMARY');
  console.log('===============');
  
  let passed = 0;
  let failed = 0;
  
  results.forEach(result => {
    if (result.success) {
      console.log(`✅ ${result.name}: PASSED (Status: ${result.status})`);
      passed++;
    } else {
      console.log(`❌ ${result.name}: FAILED (Status: ${result.status || 'N/A'})`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
      failed++;
    }
  });
  
  console.log(`\n🎯 Results: ${passed} passed, ${failed} failed`);
  
  if (failed > 0) {
    console.log('\n🔧 Troubleshooting Guide:');
    console.log('========================');
    console.log('1. Check server logs for errors');
    console.log('2. Verify MongoDB is running: mongod');
    console.log('3. Check blockchain connection:');
    console.log('   - Local: npx hardhat node');
    console.log('   - Real: Check .env configuration');
    console.log('4. Verify .env file has correct values');
    console.log('5. Check if ports are free:');
    console.log('   - Backend: port 5000');
    console.log('   - MongoDB: port 27017');
    console.log('   - Blockchain: port 8545 (local)');
  } else {
    console.log('\n🎉 All tests passed! System is operational.');
  }
  
  console.log('\n🔗 Quick Access URLs:');
  console.log('   Health: http://localhost:5000/api/system/health');
  console.log('   Blockchain: http://localhost:5000/api/blockchain/status');
  console.log('   MongoDB Debug: http://localhost:5000/api/debug/mongodb');
}

// Run the tests
runAllTests().catch(console.error);
