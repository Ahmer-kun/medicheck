// 
const { ethers } = require("ethers");
require("dotenv").config({ path: __dirname + "/../.env" });

async function getAddress() {
  if (!process.env.DEPLOYER_PRIVATE_KEY) {
    console.log("❌ No DEPLOYER_PRIVATE_KEY in .env");
    console.log("\n📝 Add this to your .env file:");
    console.log("DEPLOYER_PRIVATE_KEY=your_private_key_here");
    return;
  }
  
  const wallet = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY);
  console.log(`\n🎯 YOUR WALLET ADDRESS TO FUND:`);
  console.log(`=================================`);
  console.log(`${wallet.address}`);
  console.log(`=================================\n`);
  
  console.log(`📋 Copy this address and paste in ANY faucet above.`);
}

getAddress().catch(console.error);