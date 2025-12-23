// scripts/check-balance.js
import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  console.log("💰 CHECKING BLOCKCHAIN BALANCE");
  console.log("==============================\n");
  
  // Check environment
  if (!process.env.DEPLOYER_PRIVATE_KEY) {
    console.log("❌ DEPLOYER_PRIVATE_KEY not found in .env");
    console.log("\n📝 Add to .env:");
    console.log("DEPLOYER_PRIVATE_KEY=your_private_key_here");
    return;
  }
  
  if (!process.env.BLOCKCHAIN_NETWORK) {
    console.log("❌ BLOCKCHAIN_NETWORK not found in .env");
    console.log("\n📝 Add to .env:");
    console.log("BLOCKCHAIN_NETWORK=https://sepolia.infura.io/v3/YOUR_KEY");
    return;
  }
  
  try {
    // Setup provider
    const provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_NETWORK);
    
    // Create wallet from private key
    const wallet = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider);
    
    console.log("👤 Your Address:", wallet.address);
    console.log("📡 Network:", process.env.BLOCKCHAIN_NETWORK.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));
    
    // Get balance
    const balance = await provider.getBalance(wallet.address);
    const ethBalance = ethers.formatEther(balance);
    
    console.log("\n💰 Current Balance:", ethBalance, "ETH");
    console.log("\n🔗 Etherscan: https://sepolia.etherscan.io/address/" + wallet.address);
    
    // Check if sufficient for deployment
    const minRequired = ethers.parseEther("0.01");
    
    console.log("\n" + "=".repeat(50));
    
    if (balance < minRequired) {
      console.log("❌ INSUFFICIENT BALANCE FOR DEPLOYMENT");
      console.log("Minimum required: ~0.01 ETH");
      console.log("Current balance:", ethBalance, "ETH");
      
      console.log("\n💸 GET FREE ETH FROM:");
      console.log("1. Chainlink Faucet: https://faucets.chain.link/sepolia");
      console.log("2. Infura Faucet: https://www.infura.io/faucet/sepolia");
      console.log("3. QuickNode: https://faucet.quicknode.com/ethereum/sepolia");
      console.log("\n📋 Steps:");
      console.log("  - Visit any faucet above");
      console.log("  - Paste your address:", wallet.address);
      console.log("  - Complete CAPTCHA if required");
      console.log("  - Wait 1-5 minutes for ETH");
    } else {
      console.log("✅ SUFFICIENT BALANCE!");
      console.log("\n🚀 Ready to deploy! Run:");
      console.log("npm run deploy-sepolia");
    }
    
  } catch (error) {
    console.error("❌ Error:", error.message);
    
    if (error.message.includes("invalid response")) {
      console.log("\n🔧 Network connection failed. Check your RPC URL:");
      console.log("Current RPC:", process.env.BLOCKCHAIN_NETWORK);
      console.log("\nTry a public RPC: https://rpc.sepolia.org");
    }
  }
}

main().catch(console.error);