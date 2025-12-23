require("dotenv").config({ path: __dirname + "/../.env" });

console.log("🔍 Checking Environment Variables:");
console.log("==================================");

const requiredVars = [
  "DEPLOYER_PRIVATE_KEY",
  "INFURA_API_KEY", 
  "BLOCKCHAIN_NETWORK",
  "CONTRACT_ADDRESS",
  "DEPLOYER_ADDRESS"
];

let allGood = true;

requiredVars.forEach(varName => {
  const value = process.env[varName];
  const exists = !!value;
  const isPlaceholder = value?.includes("Your") || value?.includes("your");
  
  console.log(`\n${varName}:`);
  console.log(`  Exists: ${exists ? '✅' : '❌'}`);
  
  if (exists) {
    if (isPlaceholder) {
      console.log(`  ⚠️  WARNING: Contains placeholder text!`);
      allGood = false;
    } else if (varName.includes("PRIVATE_KEY") || varName.includes("KEY")) {
      console.log(`  Value: ${value.substring(0, 10)}...${value.substring(value.length - 10)}`);
    } else {
      console.log(`  Value: ${value}`);
    }
  } else {
    console.log(`  ❌ MISSING! Add to .env file`);
    allGood = false;
  }
});

console.log("\n" + "=".repeat(50));

if (allGood) {
  console.log("✅ All environment variables are set correctly!");
  console.log("\n🚀 Ready to deploy! Run:");
  console.log("npx hardhat run scripts/deploy-to-sepolia.js --network sepolia");
} else {
  console.log("❌ Fix the missing/incorrect variables above");
  console.log("\n📝 Your .env file should contain:");
  console.log(`
DEPLOYER_PRIVATE_KEY=0x04aeea9280c80461ef42bd0fd04618a86ec3814eddaf5821b7047c667d3238d5
DEPLOYER_ADDRESS=0xd0CCB1b2C02179fcd42BA05985057EE0fF341D27
INFURA_API_KEY=c44cf87738874ae7a25a9d9fe60ab6e9
BLOCKCHAIN_NETWORK=https://sepolia.infura.io/v3/c44cf87738874ae7a25a9d9fe60ab6e9
CONTRACT_ADDRESS=  # Leave empty, will be filled after deployment
  `);
}