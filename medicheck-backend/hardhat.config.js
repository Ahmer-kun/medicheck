// hardhat.config.js - Add these paths
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({ path: __dirname + "/.env" });

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      },
      viaIR: true
    }
  },
  
  // Add these paths
  paths: {
    sources: "./contracts",      // Where your contracts are
    tests: "./test",             // Where your tests are
    cache: "./cache",            // Cache directory
    artifacts: "./artifacts"     // Compiled artifacts
  },
  
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    sepolia: {
      url: process.env.BLOCKCHAIN_NETWORK || `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [],
      chainId: 11155111,
      gasPrice: "auto"
    }
  },
  
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  }
};
// require("@nomicfoundation/hardhat-toolbox");
// require("dotenv").config({ path: __dirname + "/.env" });  // Explicit path

// /** @type import('hardhat/config').HardhatUserConfig */
// module.exports = {
//   solidity: {
//     version: "0.8.19",
//     settings: {
//       optimizer: {
//         enabled: true,
//         runs: 200
//       },
//       viaIR: true
//     }
//   },
//   networks: {
//     localhost: {
//       url: "http://127.0.0.1:8545"
//     },
//     sepolia: {
//       url: process.env.BLOCKCHAIN_NETWORK || `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`,
//       accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [],
//       chainId: 11155111,
//       gasPrice: "auto"
//     }
//   },
//   // Add this for better error messages
//   etherscan: {
//     apiKey: process.env.ETHERSCAN_API_KEY
//   }
// };


