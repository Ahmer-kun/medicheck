const Web3 = require('web3');

const INFURA_URL = 'https://sepolia.infura.io/v3/c44cf87738874ae7a25a9d9fe60ab6e9';
const web3 = new Web3(INFURA_URL);

async function testConnection() {
  try {
    console.log('Testing Infura connection...');
    
    // Test 1: Get network ID
    const networkId = await web3.eth.net.getId();
    console.log(`Network ID: ${networkId}`);
    
    // Test 2: Get latest block
    const blockNumber = await web3.eth.getBlockNumber();
    console.log(`Latest block: ${blockNumber}`);
    
    // Test 3: Get gas price
    const gasPrice = await web3.eth.getGasPrice();
    console.log(`Gas price: ${web3.utils.fromWei(gasPrice, 'gwei')} gwei`);
    
    // Test 4: Get chain ID
    const chainId = await web3.eth.getChainId();
    console.log(`Chain ID: ${chainId}`);
    
    console.log('✅ Infura connection successful!');
    
  } catch (error) {
    console.error('❌ Infura connection failed:', error.message);
    
    // Check specific error
    if (error.message.includes('429')) {
      console.log('⚠️  Rate limited - wait a few minutes');
    } else if (error.message.includes('403')) {
      console.log('❌ API key may be invalid or blocked');
    } else if (error.message.includes('timeout')) {
      console.log('⏱️  Connection timeout - check network');
    }
  }
}

testConnection();