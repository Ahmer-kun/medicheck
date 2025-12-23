// get-eth-simple.js
import fetch from 'node-fetch';

async function getSepoliaETH() {
  const address = "0xd0CCB1b2C02179fcd42BA05985057EE0fF341D27";
  
  console.log("🚰 Getting Sepolia ETH...");
  console.log(`📝 Address: ${address}`);
  
  const faucets = [
    {
      name: "QuickNode",
      url: `https://faucet.quicknode.com/drip`,
      method: "POST",
      body: {
        network: "ethereum-sepolia",
        address: address,
        amount: "0.1"
      }
    },
    {
      name: "SepoliaFaucet",
      url: `https://sepoliafaucet.com/faucet`,
      method: "POST",
      body: {
        address: address
      }
    }
  ];
  
  for (const faucet of faucets) {
    console.log(`\nTrying ${faucet.name}...`);
    try {
      const response = await fetch(faucet.url, {
        method: faucet.method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(faucet.body)
      });
      
      const data = await response.json();
      console.log(`✅ ${faucet.name}: ${data.message || 'Success'}`);
      
      if (data.transactionHash) {
        console.log(`🔗 TX: https://sepolia.etherscan.io/tx/${data.transactionHash}`);
      }
      
      // Wait a bit between faucets
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.log(`❌ ${faucet.name} failed: ${error.message}`);
    }
  }
  
  console.log("\n✅ Check your balance in 1-2 minutes:");
  console.log(`https://sepolia.etherscan.io/address/${address}`);
}

getSepoliaETH();