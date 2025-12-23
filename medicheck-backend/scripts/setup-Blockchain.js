// scripts/setup-blockchain.js
import { exec } from 'child_process';
import { promisify } from 'util';
import dotenv from 'dotenv';

dotenv.config();

const execAsync = promisify(exec);

async function setupBlockchain() {
  console.log('🚀 Setting up local blockchain environment...');
  
  try {
    // Start Ganache in background
    console.log('📦 Starting local Ethereum node...');
    const ganacheProcess = exec('npx ganache-cli -d -p 8545 -a 10 -e 1000');
    
    // Wait for Ganache to start
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Deploy contract
    console.log('📝 Deploying smart contract...');
    const { stdout: deployOutput } = await execAsync('npx hardhat run scripts/deploy.js --network localhost');
    console.log(deployOutput);
    
    console.log('✅ Blockchain setup completed!');
    console.log('🌐 Local Ethereum node: http://localhost:8545');
    console.log('📊 Use /api/blockchain/health to check status');
    
  } catch (error) {
    console.error('❌ Blockchain setup failed:', error);
  }
}

setupBlockchain();

// // scripts/setupBlockchain.js
// import { readFileSync, writeFileSync } from 'fs';
// import { fileURLToPath } from 'url';
// import { dirname, join } from 'path';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// // Create a simple contract address file for development
// const setupBlockchain = () => {
//   const envPath = join(__dirname, '../.env');
//   let envContent = '';
  
//   try {
//     envContent = readFileSync(envPath, 'utf8');
//   } catch (error) {
//     console.log('❌ .env file not found, creating one...');
//   }

//   // Add blockchain configuration if not present
//   if (!envContent.includes('CONTRACT_ADDRESS')) {
//     envContent += '\n# Blockchain Configuration\n';
//     envContent += 'CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3\n';
//     envContent += 'BLOCKCHAIN_NETWORK=http://localhost:8545\n';
    
//     writeFileSync(envPath, envContent);
//     console.log('✅ Added blockchain configuration to .env');
//   }

//   console.log('✅ Blockchain setup completed');
//   console.log('📝 Next steps:');
//   console.log('   1. Run a local Ethereum node (ganache-cli)');
//   console.log('   2. Deploy the smart contract');
//   console.log('   3. Update CONTRACT_ADDRESS in .env');
// };

// setupBlockchain();