// test-simple.js - No external dependencies
const http = require('http');

console.log('🧪 SIMPLE ATOMIC REGISTRATION TEST\n');

// Test data
const batchNo = `TEST-ATOMIC-${Date.now()}`;
const testBatch = {
  batchNo: batchNo,
  name: 'Paracetamol 500mg',
  medicineName: 'Paracetamol 500mg',
  manufactureDate: '2024-01-15',
  expiry: '2025-01-15',
  formulation: 'Tablet',
  manufacturer: 'Test Pharma Ltd',
  pharmacy: 'To be assigned',
  quantity: 1000,
  packSize: '10X10'
};

console.log('📦 Test Batch:', batchNo);

// Make HTTP request
const postData = JSON.stringify(testBatch);

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/batches',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    // You'll need to add a valid token here
    // 'Authorization': 'Bearer YOUR_TOKEN'
  }
};

console.log('\n📤 Sending request to:', `http://${options.hostname}:${options.port}${options.path}`);

const req = http.request(options, (res) => {
  console.log(`📥 Response Status: ${res.statusCode} ${res.statusMessage}`);
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      console.log('\n📊 Response Body:', JSON.stringify(result, null, 2));
      
      if (res.statusCode === 201 || res.statusCode === 200) {
        console.log('\n✅ SUCCESS: Batch registration attempt completed');
        
        if (result.success) {
          console.log('🎉 BOTH MongoDB and Blockchain succeeded!');
          console.log('   Transaction Hash:', result.blockchain?.transactionHash || 'N/A');
        } else {
          console.log('❌ Registration failed (as expected for atomic failure)');
          console.log('   Message:', result.message);
        }
      }
    } catch (e) {
      console.error('❌ Error parsing response:', e.message);
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (e) => {
  console.error(`❌ Request error: ${e.message}`);
  console.log('\n💡 Is the backend server running?');
  console.log('   Start it with: npm run dev');
  console.log('   Or check if port 5000 is in use');
});

req.write(postData);
req.end();