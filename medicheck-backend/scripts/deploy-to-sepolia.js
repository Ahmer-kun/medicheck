const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

// Load environment variables from root
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

async function main() {
  console.log("🚀 SEPOLIA DEPLOYMENT SCRIPT");
  console.log("=============================\n");
  
  // Get deployer info
  const [deployer] = await hre.ethers.getSigners();
  console.log("👤 Deployer:", deployer.address);
  
  // Check if this matches your expected address
  const expectedAddress = "0xd0CCB1b2C02179fcd42BA05985057EE0fF341D27";
  if (deployer.address.toLowerCase() !== expectedAddress.toLowerCase()) {
    console.log("❌ ADDRESS MISMATCH!");
    console.log("Expected:", expectedAddress);
    console.log("Got:", deployer.address);
    console.log("\n⚠️  Check your DEPLOYER_PRIVATE_KEY in .env");
    return;
  }
  
  console.log("✅ Address matches expected");
  
  // Check balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  const ethBalance = hre.ethers.formatEther(balance);
  console.log("💰 Balance:", ethBalance, "ETH");
  
  // Minimum required for deployment
  const minRequired = hre.ethers.parseEther("0.005");
  if (balance < minRequired) {
    console.log("\n❌ INSUFFICIENT BALANCE!");
    console.log("Minimum required: 0.005 ETH");
    console.log("Current balance:", ethBalance, "ETH");
    console.log("\n💸 GET FREE ETH:");
    console.log("1. Go to: https://faucets.chain.link/sepolia");
    console.log("2. Paste:", deployer.address);
    console.log("3. Wait 1-2 minutes");
    console.log("4. Check: https://sepolia.etherscan.io/address/" + deployer.address);
    return;
  }
  
  console.log("\n✅ Sufficient balance! Deploying contract...");
  
  try {
    // Get contract factory
    const MedicineTracker = await hre.ethers.getContractFactory("MedicineTracker");
    
    console.log("📦 Deploying MedicineTracker...");
    const contract = await MedicineTracker.deploy();
    
    console.log("🔄 Waiting for deployment confirmation...");
    await contract.waitForDeployment();
    
    const contractAddress = await contract.getAddress();
    const txHash = contract.deploymentTransaction().hash;
    
    console.log("\n🎉 CONTRACT DEPLOYED SUCCESSFULLY!");
    console.log("===================================");
    console.log("📝 Contract Address:", contractAddress);
    console.log("🔗 Transaction Hash:", txHash);
    console.log("👤 Deployed by:", deployer.address);
    console.log("🌐 Explorer: https://sepolia.etherscan.io/address/" + contractAddress);
    console.log("📊 Tx Details: https://sepolia.etherscan.io/tx/" + txHash);
    
    // Update .env file
    updateEnvFile(contractAddress);
    
  } catch (error) {
    console.error("❌ Deployment failed:", error.message);
    
    if (error.message.includes("nonce too low")) {
      console.log("\n🔄 Try clearing cache:");
      console.log("npx hardhat clean");
    } else if (error.message.includes("insufficient funds")) {
      console.log("\n💸 Get more ETH from faucet");
    }
  }
}

function updateEnvFile(contractAddress) {
  const envPath = path.join(__dirname, "..", ".env");
  
  try {
    let envContent = fs.readFileSync(envPath, "utf8");
    
    // Update CONTRACT_ADDRESS
    envContent = envContent.replace(
      /CONTRACT_ADDRESS=.*/,
      `CONTRACT_ADDRESS=${contractAddress}`
    );
    
    // Update DEPLOYER_ADDRESS if needed
    envContent = envContent.replace(
      /DEPLOYER_ADDRESS=0xYourWalletAddressHere/,
      `DEPLOYER_ADDRESS=0xd0CCB1b2C02179fcd42BA05985057EE0fF341D27`
    );
    
    fs.writeFileSync(envPath, envContent);
    console.log("\n✅ .env file updated with contract address!");
    
  } catch (error) {
    console.warn("⚠️ Could not update .env:", error.message);
    console.log("\n📝 Manually update .env with:");
    console.log(`CONTRACT_ADDRESS=${contractAddress}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
  
//    deploy-to-sepolia.js
// require("dotenv").config();
// const { ethers } = require("hardhat");

// async function main() {
//   console.log("🚀 DEPLOYING TO REAL SEPOLIA BLOCKCHAIN\n");
  
//   // Get deployer from private key
//   const provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_NETWORK);
//   const wallet = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider);
  
//   console.log("👤 Deployer:", wallet.address);
  
//   // Check balance
//   const balance = await provider.getBalance(wallet.address);
//   const ethBalance = ethers.formatEther(balance);
//   console.log("💰 Balance:", ethBalance, "ETH");
  
//   if (balance < ethers.parseEther("0.003")) {
//     console.log("\n❌ INSUFFICIENT ETH FOR DEPLOYMENT!");
//     console.log("💸 Get free ETH from: https://faucets.chain.link/sepolia");
//     console.log("📨 Your address:", wallet.address);
//     return;
//   }
  
//   console.log("\n✅ Sufficient balance! Starting deployment...");
  
//   // Get contract factory
//   console.log("📦 Compiling MedicineTracker...");
//   const MedicineTracker = await ethers.getContractFactory("MedicineTracker");
  
//   // Estimate gas
//   console.log("⛽ Estimating gas...");
//   const gasEstimate = await MedicineTracker.getDeployTransaction().then(tx => 
//     provider.estimateGas(tx)
//   );
  
//   console.log("Estimated gas:", gasEstimate.toString());
  
//   // Deploy contract
//   console.log("🚀 Deploying contract...");
//   const contract = await MedicineTracker.deploy();
  
//   console.log("🔄 Waiting for deployment confirmation...");
//   await contract.waitForDeployment();
  
//   const contractAddress = await contract.getAddress();
//   const txHash = contract.deploymentTransaction().hash;
  
//   console.log("\n🎉 CONTRACT DEPLOYED SUCCESSFULLY!");
//   console.log("===================================");
//   console.log("📝 Contract Address:", contractAddress);
//   console.log("🔗 Transaction Hash:", txHash);
//   console.log("👤 Deployed by:", wallet.address);
//   console.log("🌐 Explorer: https://sepolia.etherscan.io/address/" + contractAddress);
//   console.log("📊 TX Details: https://sepolia.etherscan.io/tx/" + txHash);
  
//   // Update .env file
//   updateEnvFile(contractAddress);
// }

// function updateEnvFile(contractAddress) {
//   const fs = require("fs");
//   const path = require("path");
  
//   const envPath = path.join(__dirname, ".env");
  
//   try {
//     let envContent = fs.readFileSync(envPath, "utf8");
    
//     // Update CONTRACT_ADDRESS
//     envContent = envContent.replace(
//       /CONTRACT_ADDRESS=.*/,
//       `CONTRACT_ADDRESS=${contractAddress}`
//     );
    
//     // Write back
//     fs.writeFileSync(envPath, envContent);
    
//     console.log("\n✅ .env FILE UPDATED!");
//     console.log("📝 New CONTRACT_ADDRESS:", contractAddress);
//     console.log("\n🔄 Restart your server: npm start");
    
//   } catch (error) {
//     console.log("\n⚠️ Could not update .env automatically");
//     console.log("📝 Please manually update your .env file:");
//     console.log(`CONTRACT_ADDRESS=${contractAddress}`);
//   }
// }

// main()
//   .then(() => process.exit(0))
//   .catch((error) => {
//     console.error("❌ DEPLOYMENT FAILED:", error.message);
    
//     // Check common errors
//     if (error.message.includes("insufficient funds")) {
//       console.log("\n💸 GET MORE ETH FROM:");
//       console.log("🔗 https://faucets.chain.link/sepolia");
//       console.log("🔗 https://www.infura.io/faucet/sepolia");
//     } else if (error.message.includes("nonce")) {
//       console.log("\n⚠️ Nonce issue - wait 30 seconds and try again");
//     } else if (error.message.includes("network")) {
//       console.log("\n⚠️ Network connection issue - check your INFURA_API_KEY");
//     }
    
//     process.exit(1);
//   });


// deplot-sepolia.js

// const hre = require("hardhat");

// async function main() {
//   console.log("🚀 Deploying MedicineTracker to Sepolia...\n");
  
//   // Get deployer
//   const [deployer] = await ethers.getSigners();
//   console.log("👤 Deployer Address:", deployer.address);
  
//   // Check balance
//   const balance = await ethers.provider.getBalance(deployer.address);
//   const ethBalance = hre.ethers.formatEther(balance);
//   console.log("💰 Balance:", ethBalance, "ETH");
  
//   // Minimum required: ~0.005 ETH for deployment
//   if (balance < hre.ethers.parseEther("0.005")) {
//     console.log("\n❌ INSUFFICIENT ETH BALANCE!");
//     console.log("💸 Get free ETH from these faucets:");
//     console.log("1. https://faucets.chain.link/sepolia (0.1 ETH)");
//     console.log("2. https://www.infura.io/faucet/sepolia (0.5 ETH)");
//     console.log("3. https://faucet.quicknode.com/ethereum/sepolia (0.05 ETH)");
//     console.log("\n📨 Your address:", deployer.address);
//     console.log("🔗 Check balance: https://sepolia.etherscan.io/address/" + deployer.address);
//     return;
//   }
  
//   console.log("\n✅ Sufficient balance! Starting deployment...");
  
//   // Deploy contract
//   console.log("📦 Compiling and deploying MedicineTracker...");
//   const MedicineTracker = await ethers.getContractFactory("MedicineTracker");
//   const contract = await MedicineTracker.deploy();
  
//   console.log("🔄 Waiting for deployment confirmation...");
//   await contract.waitForDeployment();
  
//   const contractAddress = await contract.getAddress();
//   const txHash = contract.deploymentTransaction().hash;
  
//   console.log("\n🎉 CONTRACT DEPLOYED SUCCESSFULLY!");
//   console.log("===================================");
//   console.log("📝 Contract Address:", contractAddress);
//   console.log("🔗 Transaction:", txHash);
//   console.log("👤 Deployed by:", deployer.address);
//   console.log("🌐 Explorer: https://sepolia.etherscan.io/address/" + contractAddress);
//   console.log("📊 Tx Details: https://sepolia.etherscan.io/tx/" + txHash);
  
//   // Update .env file automatically
//   updateEnvFile(contractAddress, deployer.address);
  
//   console.log("\n✅ .env file updated!");
//   console.log("🔄 Please restart your server with: npm start");
// }

// function updateEnvFile(contractAddress, deployerAddress) {
//   const fs = require("fs");
//   const path = require("path");
  
//   const envPath = path.join(__dirname, "..", ".env");
  
//   try {
//     let envContent = "";
    
//     // Read existing .env file
//     if (fs.existsSync(envPath)) {
//       envContent = fs.readFileSync(envPath, "utf8");
//     }
    
//     // Update CONTRACT_ADDRESS
//     if (envContent.includes("CONTRACT_ADDRESS=")) {
//       envContent = envContent.replace(
//         /CONTRACT_ADDRESS=.*/,
//         `CONTRACT_ADDRESS=${contractAddress}`
//       );
//     } else {
//       envContent += `\nCONTRACT_ADDRESS=${contractAddress}`;
//     }
    
//     // Update DEPLOYER_ADDRESS if it's a placeholder
//     if (envContent.includes("DEPLOYER_ADDRESS=0xYourWalletAddressHere")) {
//       envContent = envContent.replace(
//         /DEPLOYER_ADDRESS=0xYourWalletAddressHere/,
//         `DEPLOYER_ADDRESS=${deployerAddress}`
//       );
//     }
    
//     // Write back to .env
//     fs.writeFileSync(envPath, envContent);
    
//     console.log("📝 Updated .env with:");
//     console.log(`   CONTRACT_ADDRESS=${contractAddress}`);
//     console.log(`   DEPLOYER_ADDRESS=${deployerAddress}`);
    
//   } catch (error) {
//     console.warn("⚠️ Could not update .env automatically:", error.message);
//     console.log("\n📝 Please manually update your .env file:");
//     console.log(`CONTRACT_ADDRESS=${contractAddress}`);
//     console.log(`DEPLOYER_ADDRESS=${deployerAddress}`);
//   }
// }

// main()
//   .then(() => process.exit(0))
//   .catch((error) => {
//     console.error("❌ Deployment failed:", error);
//     process.exit(1);
//   });