async function main() {
  console.log("🔍 Verifying contract on Etherscan...");
  
  // You'll need ETHERSCAN_API_KEY for this
  await hre.run("verify:verify", {
    address: process.env.CONTRACT_ADDRESS,
    constructorArguments: [],
  });
  
  console.log("✅ Contract verified!");
  console.log("🔗 https://sepolia.etherscan.io/address/" + process.env.CONTRACT_ADDRESS);
}

main().catch((error) => {
  console.error("❌ Verification failed:", error.message);
});