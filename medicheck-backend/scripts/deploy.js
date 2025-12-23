// scripts/deploy.js
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Deploying MedicineTracker contract...");
  
  try {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);
    
    // Get balance using the new method
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("Account balance:", ethers.formatEther(balance), "ETH");

    console.log("Compiling contract...");
    const MedicineTracker = await ethers.getContractFactory("MedicineTracker");
    
    console.log("Deploying contract...");
    const medicineTracker = await MedicineTracker.deploy();
    
    // Wait for deployment to complete
    await medicineTracker.waitForDeployment();
    
    const contractAddress = await medicineTracker.getAddress();
    
    console.log("✅ MedicineTracker deployed to:", contractAddress);
    console.log("📝 Transaction hash:", medicineTracker.deploymentTransaction().hash);

    // Save contract info to file
    const contractInfo = {
      address: contractAddress,
      deployer: deployer.address,
      network: 'localhost',
      deploymentTime: new Date().toISOString(),
      transactionHash: medicineTracker.deploymentTransaction().hash
    };
    
    fs.writeFileSync(
      path.join(__dirname, '../contract-info.json'), 
      JSON.stringify(contractInfo, null, 2)
    );

    // Update .env file automatically
    updateEnvFile(contractAddress);

    console.log("\n🎉 Deployment completed successfully!");
    console.log("📄 Contract info saved to: contract-info.json");
    console.log("🔧 .env file updated with new contract address");

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }
}

function updateEnvFile(contractAddress) {
  const envPath = path.join(__dirname, '../.env');
  
  try {
    let envContent = '';
    
    // Read existing .env file
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }
    
    // Remove existing CONTRACT_ADDRESS line
    envContent = envContent.replace(/CONTRACT_ADDRESS=.*\n/g, '');
    
    // Add new CONTRACT_ADDRESS
    envContent += `CONTRACT_ADDRESS=${contractAddress}\n`;
    
    // Write back to .env
    fs.writeFileSync(envPath, envContent);
    console.log("✅ .env file updated with CONTRACT_ADDRESS=" + contractAddress);
    
  } catch (error) {
    console.warn("⚠️ Could not update .env file automatically:");
    console.log("   Please manually update your .env file with:");
    console.log(`   CONTRACT_ADDRESS=${contractAddress}`);
  }
}

main();


// // scripts/deploy.js
// const { ethers } = require("hardhat");

// async function main() {
//   console.log("🚀 Deploying MedicineTracker contract...");
  
//   const MedicineTracker = await ethers.getContractFactory("MedicineTracker");
//   const medicineTracker = await MedicineTracker.deploy();
  
//   await medicineTracker.waitForDeployment();
//   const address = await medicineTracker.getAddress();
  
//   console.log("✅ MedicineTracker deployed to:", address);
//   console.log("📝 Update your .env file with:");
//   console.log(`CONTRACT_ADDRESS=${address}`);
// }

// main().catch((error) => {
//   console.error("❌ Deployment failed:", error);
//   process.exit(1);
// });
