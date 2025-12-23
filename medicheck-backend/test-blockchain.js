const { Web3 } = require('web3');

async function testBlockchain() {
  console.log('🔍 Testing blockchain connection...');
  
  // Test 1: Basic connection
  const web3 = new Web3('http://localhost:8545');
  
  try {
    // Test client version
    const clientVersion = await web3.eth.getNodeInfo();
    console.log('✅ Blockchain node connected:', clientVersion);
    
    // Test accounts
    const accounts = await web3.eth.getAccounts();
    console.log(`✅ Accounts available: ${accounts.length}`);
    console.log('✅ First account:', accounts[0]);
    
    // Test chain ID
    const chainId = await web3.eth.getChainId();
    console.log(`✅ Chain ID: ${chainId}`);
    
    // Test block number
    const blockNumber = await web3.eth.getBlockNumber();
    console.log(`✅ Current block: ${blockNumber}`);
    
    return true;
  } catch (error) {
    console.error('❌ Blockchain test failed:', error.message);
    return false;
  }
}

testBlockchain().then(success => {
  if (success) {
    console.log('\n🎉 Blockchain is WORKING!');
    console.log('\nNext steps:');
    console.log('1. Run: npm run deploy');
    console.log('2. Check .env has CONTRACT_ADDRESS');
  } else {
    console.log('\n⚠️  Blockchain NOT working. Try:');
    console.log('1. npx hardhat node --hostname localhost');
    console.log('2. Wait for "Listening on 127.0.0.1:8545"');
  }
});