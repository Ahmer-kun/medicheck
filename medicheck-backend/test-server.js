const http = require('http');

console.log('🔍 Checking if backend server is running...\n');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/health',
  method: 'GET',
  timeout: 5000
};

const req = http.request(options, (res) => {
  console.log(`✅ Server is responding! Status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => data += chunk);
  
  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      console.log('📊 Health check response:');
      console.log(JSON.stringify(result, null, 2));
      
      // Check blockchain status
      if (result.blockchain) {
        console.log('\n🔗 Blockchain status:', result.blockchain.connected ? '✅ Connected' : '❌ Disconnected');
      }
    } catch (e) {
      console.log('Response:', data);
    }
  });
});

req.on('error', (e) => {
  console.error(`❌ Cannot connect to server: ${e.message}`);
  console.log('\n💡 Please start the backend server:');
  console.log('   cd medicheck-backend');
  console.log('   npm run dev');
});

req.on('timeout', () => {
  console.error('❌ Connection timeout');
  req.destroy();
});

req.end();