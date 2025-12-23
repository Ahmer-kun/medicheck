import RealBlockchainService from './services/realBlockchainService.js';
import { ethers } from 'ethers';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

async function main() {
  console.log('🚀 MEDICHECK REAL BLOCKCHAIN DEPLOYMENT');
  console.log('=======================================\n');

  try {
    const service = RealBlockchainService;
    
    // Check deployer balance first
    if (process.env.DEPLOYER_PRIVATE_KEY) {
      const signer = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, service.provider);
      const address = await signer.getAddress();
      
      console.log(`👤 Deployer Address: ${address}`);
      
      const balance = await service.checkBalance(address);
      
      if (!balance.hasEnoughForTx) {
        console.log('\n❌ INSUFFICIENT BALANCE FOR DEPLOYMENT');
        console.log('Minimum required: ~0.01 ETH for contract deployment');
        console.log(`Current balance: ${balance.balance} ETH`);
        
        await service.getTestETHFromFaucet(address);
        
        console.log('\n🔄 Please wait for faucet to send ETH, then run this script again.');
        return;
      }
    } else {
      console.log('❌ DEPLOYER_PRIVATE_KEY not found in .env');
      console.log('\n📝 Please add your private key to .env:');
      console.log('DEPLOYER_PRIVATE_KEY=your_private_key_here');
      console.log('\n⚠️  WARNING: Never commit private keys to version control!');
      return;
    }

    console.log('\n📦 Loading contract...');
    
    // You need to compile the contract first and get bytecode
    // This is a placeholder - you need to implement contract compilation
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    
    try {
      // Try to load pre-compiled bytecode
      const bytecodePath = join(__dirname, '../contracts/MedicineTracker.bin');
      const bytecode = await readFile(bytecodePath, 'utf8');
      
      console.log('✅ Contract bytecode loaded');
      
      // For now, we'll use a simpler approach
      console.log('\n⚠️  Full deployment requires compiled bytecode.');
      console.log('For now, let me help you set up the deployment manually:\n');
      
      console.log('📝 Manual Deployment Steps:');
      console.log('1. Compile your contract with: npx hardhat compile');
      console.log('2. Get the bytecode from artifacts/contracts/MedicineTracker.sol/MedicineTracker.json');
      console.log('3. Update the deployment script with the actual bytecode');
      console.log('4. Run: node scripts/deploy-real.js');
      
    } catch (error) {
      console.log('❌ Could not load bytecode:', error.message);
      console.log('\n🛠️  Setting up manual deployment guide...');
      
      await setupDeploymentGuide();
    }

  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    process.exit(1);
  }
}

async function setupDeploymentGuide() {
  console.log('\n🎯 QUICK START GUIDE FOR REAL BLOCKCHAIN');
  console.log('========================================\n');
  
  console.log('1. 📝 UPDATE YOUR .ENV FILE:');
  console.log(`
# Real Blockchain Configuration
ETHEREUM_NETWORK=sepolia
INFURA_API_KEY=your_infura_key_here
DEPLOYER_PRIVATE_KEY=your_private_key_here

# Free RPC alternatives (no API key needed)
SEPOLIA_RPC=https://rpc.sepolia.org
  `);
  
  console.log('\n2. 🔑 GET A PRIVATE KEY:');
  console.log('   - Create a new wallet with MetaMask');
  console.log('   - Export private key (never share!)');
  console.log('   - Add to .env as DEPLOYER_PRIVATE_KEY');
  
  console.log('\n3. 🎯 GET FREE TEST ETH:');
  console.log('   Sepolia Faucets:');
  console.log('   - https://sepoliafaucet.com');
  console.log('   - https://faucet.quicknode.com/ethereum/sepolia');
  console.log('   - https://www.infura.io/faucet/sepolia');
  
  console.log('\n4. 🛠️  COMPILE CONTRACT:');
  console.log('   npx hardhat compile');
  
  console.log('\n5. 🚀 DEPLOY:');
  console.log('   node scripts/deploy-real.js');
  
  console.log('\n6. 🔄 UPDATE FRONTEND:');
  console.log('   - Update CONTRACT_ADDRESS in .env');
  console.log('   - Restart your frontend');
}

main();