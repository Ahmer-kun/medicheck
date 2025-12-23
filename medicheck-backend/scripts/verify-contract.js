// verify-contract.js
const hre = require("hardhat");

async function main() {
  console.log("🔍 Verifying contract on Etherscan...");
  
  const contractAddress = "0x0d89AA32097a0DB5Bc2a5E97A434Bdda9f7783d7";
  
  await hre.run("verify:verify", {
    address: contractAddress,
    constructorArguments: [],
  });
  
  console.log("✅ Contract verified!");
  console.log("🔗 https://sepolia.etherscan.io/address/" + contractAddress);
}

main().catch((error) => {
  console.error("❌ Verification failed:", error.message);
  
  // Common errors and solutions
  if (error.message.includes("already verified")) {
    console.log("ℹ️ Contract is already verified");
  } else if (error.message.includes("ETHERSCAN_API_KEY")) {
    console.log("🔑 Add ETHERSCAN_API_KEY to .env file");
  } else if (error.message.includes("rate limit")) {
    console.log("⏰ Wait a minute and try again");
  }
});