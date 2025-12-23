require('dotenv').config();
const ethers = require('ethers');

console.log('🔍 Final Verification of Setup\n');

// 1. Check private key
const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
if (!privateKey || privateKey.includes('your_private_key')) {
  console.log('❌ Invalid DEPLOYER_PRIVATE_KEY');
  process.exit(1);
}

// 2. Generate address from private key
const wallet = new ethers.Wallet(privateKey);
console.log(`✅ Private Key Valid`);
console.log(`   Generated Address: ${wallet.address}`);
console.log(`   Expected Address:  ${process.env.DEPLOYER_ADDRESS}`);

// 3. Check if addresses match
if (wallet.address.toLowerCase() !== process.env.DEPLOYER_ADDRESS?.toLowerCase()) {
  console.log('\n⚠️ WARNING: Address mismatch!');
  console.log('   Update DEPLOYER_ADDRESS in .env to:', wallet.address);
} else {
  console.log('\n✅ Addresses match perfectly!');
}

// 4. Check network connection
console.log('\n🌐 Testing Sepolia Connection...');
const provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_NETWORK);

provider.getNetwork()
  .then(network => {
    console.log(`✅ Connected to: ${network.name} (Chain ID: ${network.chainId})`);
    
    // Check balance
    return provider.getBalance(wallet.address);
  })
  .then(balance => {
    const ethBalance = ethers.formatEther(balance);
    console.log(`💰 Balance: ${ethBalance} ETH`);
    
    if (parseFloat(ethBalance) < 0.01) {
      console.log('\n⚠️ Low balance! Get test ETH from:');
      console.log(`   https://sepoliafaucet.com/?address=${wallet.address}`);
    } else {
      console.log('\n✅ Sufficient balance for transactions');
    }
    
    console.log('\n🎉 Setup verified successfully!');
    console.log('   You should now be able to send transactions to Sepolia.');
  })
  .catch(error => {
    console.log(`❌ Network error: ${error.message}`);
    console.log('\n🔧 Check your Infura API key or try a different RPC URL');
  });