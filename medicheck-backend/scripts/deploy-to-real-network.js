import { ethers } from 'ethers';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function deployToRealNetwork() {
  console.log('🚀 DEPLOYING TO REAL BLOCKCHAIN');
  console.log('===============================\n');
  
  // Validate environment
  const required = ['DEPLOYER_PRIVATE_KEY', 'BLOCKCHAIN_NETWORK'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(key => console.log(`  - ${key}`));
    process.exit(1);
  }
  
  // Setup provider
  const provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_NETWORK);
  const wallet = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider);
  
  console.log(`👤 Deployer: ${wallet.address}`);
  
  // Check balance
  const balance = await provider.getBalance(wallet.address);
  console.log(`💰 Balance: ${ethers.formatEther(balance)} ETH`);
  
  if (balance < ethers.parseEther('0.01')) {
    console.error('\n❌ INSUFFICIENT BALANCE');
    console.log('Minimum required: ~0.01 ETH for contract deployment');
    console.log('\n💸 GET TEST ETH FROM:');
    console.log('1. Sepolia: https://sepoliafaucet.com');
    console.log('2. QuickNode: https://faucet.quicknode.com/ethereum/sepolia');
    console.log(`3. Infura: https://www.infura.io/faucet/sepolia`);
    console.log(`\n📋 Address to fund: ${wallet.address}`);
    process.exit(1);
  }
  
  // Load contract ABI and bytecode
  console.log('\n📦 Loading contract...');
  
  const contractPath = join(__dirname, '../artifacts/contracts/MedicineTracker.sol/MedicineTracker.json');
  
  try {
    const contractData = JSON.parse(readFileSync(contractPath, 'utf8'));
    const { abi, bytecode } = contractData;
    
    console.log(`✅ Contract loaded (${abi.length} functions)`);
    
    // Deploy
    console.log('\n🚀 Deploying contract...');
    const factory = new ethers.ContractFactory(abi, bytecode, wallet);
    const contract = await factory.deploy();
    
    console.log('🔄 Waiting for deployment confirmation...');
    const receipt = await contract.deploymentTransaction().wait();
    
    console.log('\n🎉 CONTRACT DEPLOYED!');
    console.log('=====================');
    console.log(`📝 Contract Address: ${await contract.getAddress()}`);
    console.log(`🔗 Transaction Hash: ${receipt.hash}`);
    console.log(`📦 Block Number: ${receipt.blockNumber}`);
    console.log(`⛽ Gas Used: ${receipt.gasUsed.toString()}`);
    
    // Update .env
    updateEnvFile(await contract.getAddress());
    
    console.log('\n✅ Ready to use real blockchain!');
    
  } catch (error) {
    console.error('\n❌ Deployment failed:', error.message);
    
    if (error.message.includes('nonce')) {
      console.log('\n🔄 Try again in 30 seconds');
    } else if (error.message.includes('revert')) {
      console.log('\n🔍 Check contract for errors');
    }
    
    process.exit(1);
  }
}

function updateEnvFile(contractAddress) {
  try {
    const envPath = join(__dirname, '../.env');
    let envContent = readFileSync(envPath, 'utf8');
    
    // Update contract address
    envContent = envContent.replace(
      /CONTRACT_ADDRESS=.*/,
      `CONTRACT_ADDRESS=${contractAddress}`
    );
    
    // Add network info
    if (!envContent.includes('ETHEREUM_NETWORK=')) {
      envContent += `\nETHEREUM_NETWORK=sepolia\n`;
    }
    
    // Write back
    require('fs').writeFileSync(envPath, envContent);
    
    console.log(`✅ Updated .env with contract address`);
    
  } catch (error) {
    console.warn('⚠️ Could not update .env:', error.message);
    console.log(`\n📝 Manual update required:`);
    console.log(`CONTRACT_ADDRESS=${contractAddress}`);
  }
}

deployToRealNetwork().catch(console.error);