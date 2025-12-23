// test-private-key.js
const Web3 = require('web3');

async function testPrivateKey() {
  const web3 = new Web3();
  
  // Your private key with potential hidden characters
  const privateKey = '0x04aeea9280c80461ef42bd0fd04618a86ec3814eddaf5821b7047c667d3238d5';
  
  console.log('Testing private key:', privateKey);
  console.log('Length:', privateKey.length);
  console.log('Should be 66 chars (with 0x) or 64 chars (without 0x)');
  
  // Check each character
  console.log('\nCharacter analysis:');
  for (let i = 0; i < privateKey.length; i++) {
    const char = privateKey[i];
    const code = privateKey.charCodeAt(i);
    console.log(`Position ${i}: '${char}' (ASCII: ${code}) - ${isHexChar(char) ? 'Valid' : 'INVALID!'}`);
  }
  
  // Try to create account
  try {
    const account = web3.eth.accounts.privateKeyToAccount(privateKey);
    console.log('\n✅ Account created successfully!');
    console.log('Address:', account.address);
    console.log('Expected: 0xd0CCB1b2C02179fcd42BA05985057EE0fF341D27');
    
    // Verify matches expected
    if (account.address.toLowerCase() === '0xd0ccb1b2c02179fcd42ba05985057ee0ff341d27'.toLowerCase()) {
      console.log('✅ Address MATCHES expected!');
    } else {
      console.log('❌ Address MISMATCH!');
      console.log('Expected: 0xd0CCB1b2C02179fcd42BA05985057EE0fF341D27');
      console.log('Got:', account.address);
    }
  } catch (error) {
    console.log('\n❌ Failed to create account:', error.message);
  }
}

function isHexChar(char) {
  return /^[0-9a-fA-Fx]$/.test(char);
}

testPrivateKey();