// scripts/test-batch-alternative.js
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5000/api';

async function testWithManufacturerRole() {
  console.log('🧪 TESTING BATCH CREATION FOR MANUFACTURER');
  console.log('==========================================\n');

  // Different user options
  const users = [
    { username: 'manufacturer', password: 'manu123', role: 'manufacturer' },
    { username: 'admin', password: 'admin123', role: 'admin' }
  ];

  for (const user of users) {
    console.log(`\n👤 Testing as ${user.role} (${user.username})...`);
    
    try {
      // Login
      const loginRes = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      });

      if (!loginRes.ok) {
        console.log(`❌ Login failed for ${user.username}`);
        continue;
      }

      const loginData = await loginRes.json();
      const token = loginData.token;
      
      if (!token) {
        console.log(`❌ No token for ${user.username}`);
        continue;
      }

      console.log(`✅ Logged in as ${user.username}`);

      // Create batch with minimal required fields
      const batchData = {
        batchNo: `BATCH-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        name: 'Test Medicine',
        medicineName: 'Test Medicine Tablets',
        manufactureDate: new Date().toISOString().split('T')[0],
        expiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        formulation: 'Capsule',
        quantity: 500,
        manufacturer: 'Test Manufacturer Inc.',
        packSize: '5x10'
      };

      console.log(`📦 Creating batch: ${batchData.batchNo}`);

      const createRes = await fetch(`${API_BASE}/batches`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(batchData)
      });

      console.log(`📊 Status: ${createRes.status} ${createRes.statusText}`);

      try {
        const result = await createRes.json();
        console.log('📄 Response:', JSON.stringify(result, null, 2));
        
        if (createRes.ok) {
          console.log(`🎉 SUCCESS with ${user.role} role!`);
          return; // Stop at first success
        } else {
          console.log(`❌ Failed with ${user.role}:`, result.message);
        }
      } catch (parseError) {
        const text = await createRes.text();
        console.log(`⚠️ Parse error: ${parseError.message}`);
        console.log(`Raw: ${text.substring(0, 200)}`);
      }

    } catch (error) {
      console.error(`❌ Error for ${user.username}:`, error.message);
    }
  }

  console.log('\n🔧 TROUBLESHOOTING:');
  console.log('1. Check if backend is running: npm run dev');
  console.log('2. Check if users exist in database');
  console.log('3. Check console logs for errors');
}

// Also test without authentication to see error
async function testWithoutAuth() {
  console.log('\n🔓 Testing without authentication...');
  
  try {
    const batchData = {
      batchNo: `PUBLIC-${Date.now()}`,
      name: 'Public Test',
      manufactureDate: '2024-01-01',
      expiry: '2025-01-01',
      quantity: 100,
      manufacturer: 'Public Pharma'
    };

    const res = await fetch(`${API_BASE}/batches`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(batchData)
    });

    const text = await res.text();
    console.log(`Status: ${res.status}`);
    console.log(`Response: ${text.substring(0, 200)}`);
  } catch (error) {
    console.log('Error:', error.message);
  }
}

// Run tests
async function runAllTests() {
  console.log('🚀 STARTING BATCH REGISTRATION TESTS\n');
  
  await testWithManufacturerRole();
  await testWithoutAuth();
  
  console.log('\n✅ All tests completed');
}

runAllTests().catch(console.error);