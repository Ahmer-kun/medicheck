// diagnose-endpoints.js
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔧 DIAGNOSTIC TEST FOR SPECIFIC ENDPOINTS');
console.log('==========================================\n');

const BASE_URL = 'http://localhost:5000';

// Test specific endpoints with detailed output
const endpoints = [
  { 
    path: '/api/system/health/detailed', 
    name: 'Detailed Health Check',
    expected: 'Detailed system health information'
  },
  { 
    path: '/api/blockchain/real/status', 
    name: 'Real Blockchain Status',
    expected: 'Real blockchain connection status'
  },
  { 
    path: '/api/system/health', 
    name: 'Basic System Health',
    expected: 'Basic health check response'
  },
  { 
    path: '/api/blockchain/status', 
    name: 'General Blockchain Status',
    expected: 'Blockchain status information'
  }
];

async function testEndpointWithDetails(endpoint) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🔍 TESTING: ${endpoint.name}`);
  console.log(`📡 URL: ${BASE_URL}${endpoint.path}`);
  console.log(`${'-'.repeat(60)}`);
  
  try {
    // Make request with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const startTime = Date.now();
    const response = await fetch(`${BASE_URL}${endpoint.path}`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    
    const responseTime = Date.now() - startTime;
    
    console.log(`⏱️ Response Time: ${responseTime}ms`);
    console.log(`📊 HTTP Status: ${response.status} ${response.statusText}`);
    console.log(`📦 Content-Type: ${response.headers.get('content-type') || 'Not specified'}`);
    
    // Try to parse as JSON
    const text = await response.text();
    
    try {
      const data = JSON.parse(text);
      
      console.log(`✅ JSON Parsed Successfully`);
      
      // Show key fields
      console.log(`\n📋 RESPONSE DATA:`);
      console.log(`   Success: ${data.success !== undefined ? data.success : 'Not specified'}`);
      console.log(`   Message: ${data.message || 'No message'}`);
      console.log(`   Timestamp: ${data.timestamp || 'No timestamp'}`);
      
      if (data.error) {
        console.log(`❌ Error: ${data.error}`);
      }
      
      // Show specific data based on endpoint
      if (endpoint.path.includes('health/detailed')) {
        console.log(`\n🏥 HEALTH DETAILS:`);
        if (data.status) {
          console.log(`   Overall Status: ${data.status.overall || data.status}`);
          if (data.status.mongodb) {
            console.log(`   MongoDB: ${data.status.mongodb.healthy ? '✅' : '❌'} ${data.status.mongodb.stateName || 'Unknown'}`);
          }
          if (data.status.blockchain) {
            console.log(`   Blockchain: ${data.status.blockchain.healthy ? '✅' : '❌'} ${data.status.blockchain.connected ? 'Connected' : 'Disconnected'}`);
          }
        }
      }
      
      if (endpoint.path.includes('blockchain/real')) {
        console.log(`\n🔗 BLOCKCHAIN DETAILS:`);
        if (data.blockchain) {
          console.log(`   Available: ${data.blockchain.available ? '✅' : '❌'}`);
          console.log(`   Connected: ${data.blockchain.details?.connected ? '✅' : '❌'}`);
          console.log(`   Network: ${data.blockchain.details?.network?.name || 'Unknown'}`);
        }
        if (data.systemStatus) {
          console.log(`   System Status: ${data.systemStatus}`);
        }
      }
      
      console.log(`\n📄 FULL RESPONSE (first 500 chars):`);
      console.log(text.substring(0, 500) + (text.length > 500 ? '...' : ''));
      
    } catch (jsonError) {
      console.log(`❌ JSON Parse Error: ${jsonError.message}`);
      console.log(`📄 RAW RESPONSE (first 500 chars):`);
      console.log(text.substring(0, 500));
    }
    
    return {
      success: response.ok,
      status: response.status,
      responseTime
    };
    
  } catch (error) {
    console.log(`❌ REQUEST FAILED: ${error.message}`);
    
    if (error.name === 'AbortError') {
      console.log(`💡 Timeout after 10 seconds. The endpoint might be hanging.`);
    }
    
    return {
      success: false,
      error: error.message,
      status: 'N/A'
    };
  }
}

async function runDiagnostics() {
  console.log('🚀 Starting endpoint diagnostics...\n');
  
  // First check if server is running
  try {
    const serverCheck = await fetch(`${BASE_URL}/api/health`);
    if (serverCheck.ok) {
      console.log('✅ Server is running and accessible');
    } else {
      console.log(`❌ Server responded with status: ${serverCheck.status}`);
    }
  } catch (serverError) {
    console.log(`❌ Cannot connect to server: ${serverError.message}`);
    console.log(`\n💡 Please start the server first:`);
    console.log(`   1. cd medicheck-backend`);
    console.log(`   2. npm run dev`);
    return;
  }
  
  console.log(`\n📡 Testing ${endpoints.length} specific endpoints...\n`);
  
  const results = [];
  
  for (const endpoint of endpoints) {
    const result = await testEndpointWithDetails(endpoint);
    results.push({
      ...endpoint,
      ...result
    });
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log(`\n${'='.repeat(60)}`);
  console.log('📋 DIAGNOSTIC SUMMARY');
  console.log(`${'='.repeat(60)}`);
  
  results.forEach((result, index) => {
    console.log(`\n${index + 1}. ${result.name}`);
    console.log(`   URL: ${BASE_URL}${result.path}`);
    console.log(`   Status: ${result.success ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`   HTTP: ${result.status}`);
    console.log(`   Time: ${result.responseTime || 'N/A'}ms`);
    
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });
  
  // Check if the problematic endpoints are working
  const detailedHealth = results.find(r => r.path === '/api/system/health/detailed');
  const realBlockchain = results.find(r => r.path === '/api/blockchain/real/status');
  
  console.log(`\n${'='.repeat(60)}`);
  console.log('🎯 SPECIFIC ISSUES CHECK');
  console.log(`${'='.repeat(60)}`);
  
  if (detailedHealth && detailedHealth.success) {
    console.log('✅ /api/system/health/detailed - WORKING');
  } else {
    console.log('❌ /api/system/health/detailed - NOT WORKING');
    console.log('   Possible issues:');
    console.log('   1. Missing healthHelper.js file');
    console.log('   2. Error in the route handler');
    console.log('   3. MongoDB connection issue');
  }
  
  if (realBlockchain && realBlockchain.success) {
    console.log('✅ /api/blockchain/real/status - WORKING');
  } else {
    console.log('❌ /api/blockchain/real/status - NOT WORKING');
    console.log('   Possible issues:');
    console.log('   1. Missing realBlockchainService.js');
    console.log('   2. Blockchain network configuration error');
    console.log('   3. RPC URL not accessible');
  }
  
  console.log(`\n${'='.repeat(60)}`);
  console.log('🔧 NEXT STEPS');
  console.log(`${'='.repeat(60)}`);
  
  if (!detailedHealth?.success || !realBlockchain?.success) {
    console.log('\nTo fix the issues:');
    console.log('1. Check server logs for specific errors');
    console.log('2. Verify the required files exist:');
    console.log('   - utils/healthHelper.js');
    console.log('   - services/realBlockchainService.js');
    console.log('3. Check .env file configuration');
    console.log('4. Run simple tests:');
    console.log(`   curl ${BASE_URL}/api/system/health`);
    console.log(`   curl ${BASE_URL}/api/blockchain/status`);
  } else {
    console.log('\n🎉 All endpoints are working correctly!');
    console.log('The previous issues have been resolved.');
  }
}

// Handle fetch if not available (Node.js < 18)
if (typeof fetch === 'undefined') {
  console.log('⚠️ Fetch API not available, importing node-fetch...');
  const fetchModule = await import('node-fetch');
  globalThis.fetch = fetchModule.default;
}

// Run diagnostics
runDiagnostics().catch(error => {
  console.error('❌ Diagnostic script failed:', error);
  process.exit(1);
});