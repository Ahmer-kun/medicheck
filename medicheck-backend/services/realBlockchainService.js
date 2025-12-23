// services/realBlockchainService.js - ENHANCED AND FIXED VERSION
import Web3 from 'web3';
import { ethers } from 'ethers';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: join(dirname(fileURLToPath(import.meta.url)), '..', '.env') });

class RealBlockchainService {
  constructor() {
    this.provider = null;
    this.web3 = null;
    this.contract = null;
    this.signer = null;
    this.network = process.env.ETHEREUM_NETWORK || 'sepolia';
    this.isAvailable = false;
    this.lastError = null;
    
    console.log('🔧 Initializing RealBlockchainService...');
    this.initializeProvider();
  }

  initializeProvider() {
    try {
      console.log(`🌐 Network: ${this.network}`);
      
      // Network configurations
      const networkConfigs = {
        sepolia: {
          rpc: process.env.SEPOLIA_RPC || 
               (process.env.INFURA_API_KEY ? `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}` : null) ||
               'https://rpc.sepolia.org',
          chainId: 11155111,
          name: 'Sepolia Testnet',
          explorer: 'https://sepolia.etherscan.io'
        },
        goerli: {
          rpc: process.env.GOERLI_RPC || 
               (process.env.INFURA_API_KEY ? `https://goerli.infura.io/v3/${process.env.INFURA_API_KEY}` : null) ||
               'https://rpc.goerli.eth.gateway.fm',
          chainId: 5,
          name: 'Goerli Testnet',
          explorer: 'https://goerli.etherscan.io'
        },
        mumbai: {
          rpc: process.env.MUMBAI_RPC || 
               (process.env.INFURA_API_KEY ? `https://polygon-mumbai.infura.io/v3/${process.env.INFURA_API_KEY}` : null) ||
               'https://rpc-mumbai.maticvigil.com',
          chainId: 80001,
          name: 'Polygon Mumbai',
          explorer: 'https://mumbai.polygonscan.com'
        },
        bnb_testnet: {
          rpc: process.env.BNB_TESTNET_RPC || 'https://data-seed-prebsc-1-s1.binance.org:8545',
          chainId: 97,
          name: 'BNB Smart Chain Testnet',
          explorer: 'https://testnet.bscscan.com'
        },
        local: {
          rpc: 'http://localhost:8545',
          chainId: 31337,
          name: 'Local Blockchain',
          explorer: null
        }
      };

      const config = networkConfigs[this.network] || networkConfigs.local;
      
      // Use configured RPC or fallback
      const rpcUrl = process.env.BLOCKCHAIN_NETWORK || config.rpc;
      
      if (!rpcUrl) {
        throw new Error(`No RPC URL configured for network: ${this.network}`);
      }

      console.log(`📡 Connecting to: ${rpcUrl.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`);
      
      // Initialize Web3 with timeout settings
      const web3Provider = new Web3.providers.HttpProvider(rpcUrl, {
        timeout: 10000,
        reconnect: {
          auto: true,
          delay: 5000,
          maxAttempts: 5
        }
      });
      
      this.web3 = new Web3(web3Provider);
      
      // Initialize Ethers provider
      this.provider = new ethers.JsonRpcProvider(rpcUrl);
      
      // Initialize signer if private key exists
      if (process.env.DEPLOYER_PRIVATE_KEY && 
          process.env.DEPLOYER_PRIVATE_KEY !== 'your_private_key_here') {
        try {
          this.signer = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, this.provider);
          console.log(`👤 Signer initialized: ${this.signer.address.substring(0, 10)}...`);
        } catch (walletError) {
          console.warn('⚠️ Could not initialize signer:', walletError.message);
        }
      }
      
      this.isAvailable = true;
      this.lastError = null;
      console.log(`✅ Connected to ${config.name} (Chain ID: ${config.chainId})`);
      
    } catch (error) {
      console.error('❌ Failed to initialize blockchain provider:', error.message);
      this.isAvailable = false;
      this.lastError = error.message;
    }
  }

  async getNetworkInfo() {
    try {
      if (!this.isAvailable || !this.provider) {
        throw new Error('Blockchain provider not available');
      }

      console.log('🔍 Getting network information...');
      
      const network = await this.provider.getNetwork();
      const blockNumber = await this.provider.getBlockNumber();
      
      // Get fee data
      let feeData = {};
      try {
        feeData = await this.provider.getFeeData();
      } catch (feeError) {
        console.warn('Fee data unavailable:', feeError.message);
      }
      
      // Get balance if we have a signer
      let balanceInfo = {};
      if (this.signer) {
        try {
          const address = await this.signer.getAddress();
          const balance = await this.provider.getBalance(address);
          balanceInfo = {
            address: address,
            balance: ethers.formatEther(balance),
            formatted: `${ethers.formatEther(balance)} ETH`,
            hasEnough: balance > ethers.parseEther('0.001'),
            wei: balance.toString()
          };
        } catch (balanceError) {
          console.warn('Balance check failed:', balanceError.message);
          balanceInfo.error = balanceError.message;
        }
      }
      
      // Get contract info if available
      let contractInfo = {};
      if (process.env.CONTRACT_ADDRESS && 
          process.env.CONTRACT_ADDRESS !== '0xYourDeployedContractAddressHere') {
        try {
          const code = await this.web3.eth.getCode(process.env.CONTRACT_ADDRESS);
          contractInfo = {
            address: process.env.CONTRACT_ADDRESS,
            exists: code !== '0x' && code !== '0x0',
            codeSize: code.length,
            isPlaceholder: process.env.CONTRACT_ADDRESS.includes('YourDeployedContract')
          };
        } catch (contractError) {
          console.warn('Contract check failed:', contractError.message);
          contractInfo.error = contractError.message;
        }
      }
      
      return {
        connected: true,
        network: {
          name: network.name,
          chainId: Number(network.chainId),
          blockNumber: blockNumber,
          isTestnet: this.network !== 'mainnet'
        },
        gas: {
          gasPrice: feeData.gasPrice ? ethers.formatUnits(feeData.gasPrice, 'gwei') + ' gwei' : 'N/A',
          maxFeePerGas: feeData.maxFeePerGas ? ethers.formatUnits(feeData.maxFeePerGas, 'gwei') + ' gwei' : 'N/A',
          maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ? ethers.formatUnits(feeData.maxPriorityFeePerGas, 'gwei') + ' gwei' : 'N/A'
        },
        wallet: balanceInfo,
        contract: contractInfo,
        isRealBlockchain: !['local', 'localhost'].includes(this.network.toLowerCase()),
        timestamp: new Date().toISOString(),
        service: 'RealBlockchainService'
      };
      
    } catch (error) {
      console.error('❌ Error getting network info:', error.message);
      return {
        connected: false,
        error: error.message,
        lastError: this.lastError,
        isAvailable: this.isAvailable,
        timestamp: new Date().toISOString(),
        service: 'RealBlockchainService'
      };
    }
  }

  async loadContractABI() {
    try {
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = dirname(__filename);
      const contractPath = join(__dirname, '../contracts/MedicineTrackerABI.json');
      
      const data = await readFile(contractPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('❌ Error loading contract ABI:', error);
      throw error;
    }
  }

  async deployContract() {
    try {
      if (!this.signer) {
        throw new Error('Deployer private key not configured');
      }

      console.log('🚀 Deploying contract to real blockchain...');
      
      // Get deployer address and balance
      const address = await this.signer.getAddress();
      const balance = await this.provider.getBalance(address);
      
      console.log(`👤 Deployer: ${address}`);
      console.log(`💰 Balance: ${ethers.formatEther(balance)} ETH`);

      // Check if we have enough gas
      if (balance < ethers.parseEther('0.01')) {
        throw new Error('Insufficient balance for deployment. Get test ETH from faucet.');
      }

      // Load contract ABI and bytecode
      const contractABI = await this.loadContractABI();
      
      // For deployment, we need the full contract including bytecode
      // You might need to compile and get the bytecode
      const contractFactory = new ethers.ContractFactory(
        contractABI,
        contractBytecode, // You need to load bytecode from compilation
        this.signer
      );

      console.log('📦 Deploying contract...');
      const contract = await contractFactory.deploy();
      await contract.waitForDeployment();

      const contractAddress = await contract.getAddress();
      
      console.log('✅ Contract deployed successfully!');
      console.log(`📝 Contract Address: ${contractAddress}`);
      console.log(`🔗 Explorer URL: ${this.getExplorerUrl(contractAddress)}`);

      // Save contract address to .env
      await this.updateEnvFile(contractAddress);

      return {
        success: true,
        contractAddress,
        transactionHash: contract.deploymentTransaction().hash,
        deployer: address,
        network: this.network
      };

    } catch (error) {
      console.error('❌ Deployment failed:', error);
      throw error;
    }
  }

  async getExplorerUrl(address) {
    const explorers = {
      sepolia: `https://sepolia.etherscan.io/address/${address}`,
      goerli: `https://goerli.etherscan.io/address/${address}`,
      mumbai: `https://mumbai.polygonscan.com/address/${address}`,
      bnb_testnet: `https://testnet.bscscan.com/address/${address}`
    };
    
    return explorers[this.network] || `#${address}`;
  }

  async updateEnvFile(contractAddress) {
    try {
      const fs = await import('fs');
      const path = await import('path');
      
      const envPath = path.join(process.cwd(), '.env');
      let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
      
      // Remove existing CONTRACT_ADDRESS
      envContent = envContent.replace(/CONTRACT_ADDRESS=.*\n/g, '');
      
      // Add new CONTRACT_ADDRESS
      envContent += `CONTRACT_ADDRESS=${contractAddress}\n`;
      
      fs.writeFileSync(envPath, envContent);
      
      console.log('✅ Updated .env file with contract address');
    } catch (error) {
      console.warn('⚠️ Could not update .env file:', error.message);
    }
  }

  async getTestETHFromFaucet(address) {
    const faucets = {
      sepolia: [
        `https://sepoliafaucet.com?address=${address}`,
        `https://faucet.quicknode.com/ethereum/sepolia?address=${address}`,
        `https://www.infura.io/faucet/sepolia?address=${address}`
      ],
      goerli: [
        `https://goerlifaucet.com?address=${address}`,
        `https://faucet.quicknode.com/ethereum/goerli?address=${address}`
      ],
      mumbai: [
        `https://faucet.polygon.technology?address=${address}`,
        `https://mumbaifaucet.com?address=${address}`
      ]
    };

    const networkFaucets = faucets[this.network] || [];
    
    console.log(`\n🎯 FAUCET LINKS for ${address}:`);
    console.log('====================================');
    
    if (networkFaucets.length > 0) {
      networkFaucets.forEach((faucet, index) => {
        console.log(`${index + 1}. ${faucet}`);
      });
    } else {
      console.log(`No known faucets for ${this.network}. Search Google for:`);
      console.log(`"${this.network} testnet faucet"`);
    }
    
    console.log('\n📝 Instructions:');
    console.log('1. Copy your address:', address);
    console.log('2. Visit a faucet link above');
    console.log('3. Paste your address and complete any verification');
    console.log('4. Wait 1-5 minutes for ETH to arrive');
    console.log('5. Check your balance');
  }

  async checkBalance(address) {
    try {
      if (!this.isAvailable || !this.provider) {
        throw new Error('Blockchain provider not available');
      }

      const balance = await this.provider.getBalance(address);
      const ethBalance = ethers.formatEther(balance);
      
      return {
        address,
        balance: ethBalance,
        balanceWei: balance.toString(),
        hasEnoughForTx: balance > ethers.parseEther('0.001'),
        message: parseFloat(ethBalance) < 0.01 ? 
          'Low balance - get test ETH from faucet' : 
          'Sufficient balance for transactions'
      };
    } catch (error) {
      console.error('Error checking balance:', error);
      return {
        address,
        error: error.message,
        hasEnoughForTx: false
      };
    }
  }

  async registerMedicine(batchData) {
    try {
      if (!this.signer) {
        throw new Error('No signer configured');
      }

      const contractAddress = process.env.CONTRACT_ADDRESS;
      if (!contractAddress) {
        throw new Error('Contract address not configured');
      }

      const contractABI = await this.loadContractABI();
      const contract = new ethers.Contract(contractAddress, contractABI, this.signer);

      // Prepare data
      const {
        batchNo,
        name,
        medicineName,
        manufactureDate,
        expiryDate,
        formulation,
        quantity,
        manufacturer,
        pharmacy,
        packaging,
        status
      } = batchData;

      console.log('📝 Registering medicine on real blockchain...');

      // Estimate gas
      const gasEstimate = await contract.registerMedicine.estimateGas(
        batchNo,
        name,
        medicineName || name,
        manufactureDate,
        expiryDate,
        formulation,
        quantity,
        manufacturer,
        pharmacy || "To be assigned",
        JSON.stringify(packaging || {}),
        status || "active"
      );

      console.log(`⛽ Estimated gas: ${gasEstimate.toString()}`);

      // Send transaction
      const tx = await contract.registerMedicine(
        batchNo,
        name,
        medicineName || name,
        manufactureDate,
        expiryDate,
        formulation,
        quantity,
        manufacturer,
        pharmacy || "To be assigned",
        JSON.stringify(packaging || {}),
        status || "active",
        {
          gasLimit: gasEstimate * 2n // Add buffer
        }
      );

      console.log('🔄 Transaction sent, waiting for confirmation...');
      const receipt = await tx.wait();

      console.log('✅ Transaction confirmed!');
      console.log(`📝 TX Hash: ${receipt.hash}`);
      console.log(`🔗 Explorer: ${this.getExplorerUrl(receipt.hash)}`);

      return {
        success: true,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        contractAddress
      };

    } catch (error) {
      console.error('❌ Error registering medicine:', error);
      
      // Check if it's a gas/balance error
      if (error.message.includes('insufficient funds') || error.code === 'INSUFFICIENT_FUNDS') {
        const address = await this.signer.getAddress();
        console.log('\n💸 INSUFFICIENT FUNDS DETECTED');
        console.log('Please get test ETH from a faucet.');
        await this.getTestETHFromFaucet(address);
      }
      
      throw error;
    }
  }

  // In services/realBlockchainService.js - Add these methods

  async getCompleteMedicineFromBlockchain(batchNo) {
    try {
      if (!this.isAvailable) {
        throw new Error('Blockchain service not available');
      }

      const contractAddress = process.env.CONTRACT_ADDRESS;
      if (!contractAddress) {
        throw new Error('Contract address not configured');
      }

      const contractABI = await this.loadContractABI();
      const contract = new ethers.Contract(contractAddress, contractABI, this.provider);

      const medicineData = await contract.getMedicine(batchNo);
      
      // Parse the data
      const medicine = {
        batchNo: medicineData[0] || batchNo,
        name: medicineData[1] || 'Unknown',
        medicineName: medicineData[2] || medicineData[1] || 'Unknown',
        manufactureDate: medicineData[3] || '',
        expiryDate: medicineData[4] || '',
        formulation: medicineData[5] || '',
        quantity: medicineData[6] ? Number(medicineData[6]) : 0,
        manufacturer: medicineData[7] || 'Unknown',
        pharmacy: medicineData[8] || '',
        packaging: medicineData[9] || '{}',
        status: medicineData[10] || 'active',
        currentOwner: medicineData[11] || '0x0',
        timestamp: medicineData[12] ? Number(medicineData[12]) : 0,
        exists: medicineData[13] || true,
        verified: medicineData[14] || false,
        verifiedBy: medicineData[15] || '0x0',
        verifiedAt: medicineData[16] ? Number(medicineData[16]) : 0
      };

      return {
        exists: true,
        ...medicine,
        completeData: true,
        network: this.network,
        retrievedAt: new Date().toISOString(),
        service: 'RealBlockchainService'
      };

    } catch (error) {
      console.error('Error getting medicine:', error.message);
      return { exists: false, error: error.message };
    }
  }

  async verifyMedicineExistence(batchNo) {
    try {
      const contractAddress = process.env.CONTRACT_ADDRESS;
      if (!contractAddress) {
        return false;
      }

      const contractABI = await this.loadContractABI();
      const contract = new ethers.Contract(contractAddress, contractABI, this.provider);

      return await contract.verifyMedicineExistence(batchNo);
    } catch (error) {
      console.error('Error verifying existence:', error.message);
      return false;
    }
  }
}

// Create and export singleton instance
const realBlockchainService = new RealBlockchainService();
export default realBlockchainService;

// import Web3 from 'web3';
// import { ethers } from 'ethers';
// import { readFile } from 'fs/promises';
// import { fileURLToPath } from 'url';
// import { dirname, join } from 'path';
// import dotenv from 'dotenv';

// dotenv.config();

// class RealBlockchainService {
//   constructor() {
//     this.provider = null;
//     this.web3 = null;
//     this.contract = null;
//     this.signer = null;
//     this.network = process.env.ETHEREUM_NETWORK || 'sepolia';
    
//     this.initializeProvider();
//   }

//   initializeProvider() {
//     const networkConfigs = {
//       sepolia: {
//         rpc: process.env.SEPOLIA_RPC || `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`,
//         chainId: 11155111,
//         name: 'Sepolia Testnet'
//       },
//       goerli: {
//         rpc: process.env.GOERLI_RPC || `https://goerli.infura.io/v3/${process.env.INFURA_API_KEY}`,
//         chainId: 5,
//         name: 'Goerli Testnet'
//       },
//       mumbai: {
//         rpc: process.env.MUMBAI_RPC || `https://polygon-mumbai.infura.io/v3/${process.env.INFURA_API_KEY}`,
//         chainId: 80001,
//         name: 'Polygon Mumbai'
//       },
//       bnb_testnet: {
//         rpc: process.env.BNB_TESTNET_RPC,
//         chainId: 97,
//         name: 'BNB Smart Chain Testnet'
//       },
//       // Add more networks as needed
//     };

//     const config = networkConfigs[this.network];
    
//     if (!config) {
//       throw new Error(`Unsupported network: ${this.network}`);
//     }

//     // Initialize Web3
//     this.web3 = new Web3(new Web3.providers.HttpProvider(config.rpc));
    
//     // Initialize Ethers provider
//     this.provider = new ethers.JsonRpcProvider(config.rpc);
    
//     // Initialize signer if private key is available
//     if (process.env.DEPLOYER_PRIVATE_KEY) {
//       this.signer = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, this.provider);
//     }

//     console.log(`✅ Connected to ${config.name}`);
//     console.log(`📡 RPC: ${config.rpc}`);
//     console.log(`⛓️ Chain ID: ${config.chainId}`);
//   }

//   async loadContractABI() {
//     try {
//       const __filename = fileURLToPath(import.meta.url);
//       const __dirname = dirname(__filename);
//       const contractPath = join(__dirname, '../contracts/MedicineTrackerABI.json');
      
//       const data = await readFile(contractPath, 'utf8');
//       return JSON.parse(data);
//     } catch (error) {
//       console.error('❌ Error loading contract ABI:', error);
//       throw error;
//     }
//   }

//   async deployContract() {
//     try {
//       if (!this.signer) {
//         throw new Error('Deployer private key not configured');
//       }

//       console.log('🚀 Deploying contract to real blockchain...');
      
//       // Get deployer address and balance
//       const address = await this.signer.getAddress();
//       const balance = await this.provider.getBalance(address);
      
//       console.log(`👤 Deployer: ${address}`);
//       console.log(`💰 Balance: ${ethers.formatEther(balance)} ETH`);

//       // Check if we have enough gas
//       if (balance < ethers.parseEther('0.01')) {
//         throw new Error('Insufficient balance for deployment. Get test ETH from faucet.');
//       }

//       // Load contract ABI and bytecode
//       const contractABI = await this.loadContractABI();
      
//       // For deployment, we need the full contract including bytecode
//       // You might need to compile and get the bytecode
//       const contractFactory = new ethers.ContractFactory(
//         contractABI,
//         contractBytecode, // You need to load bytecode from compilation
//         this.signer
//       );

//       console.log('📦 Deploying contract...');
//       const contract = await contractFactory.deploy();
//       await contract.waitForDeployment();

//       const contractAddress = await contract.getAddress();
      
//       console.log('✅ Contract deployed successfully!');
//       console.log(`📝 Contract Address: ${contractAddress}`);
//       console.log(`🔗 Explorer URL: ${this.getExplorerUrl(contractAddress)}`);

//       // Save contract address to .env
//       await this.updateEnvFile(contractAddress);

//       return {
//         success: true,
//         contractAddress,
//         transactionHash: contract.deploymentTransaction().hash,
//         deployer: address,
//         network: this.network
//       };

//     } catch (error) {
//       console.error('❌ Deployment failed:', error);
//       throw error;
//     }
//   }

//   async getExplorerUrl(address) {
//     const explorers = {
//       sepolia: `https://sepolia.etherscan.io/address/${address}`,
//       goerli: `https://goerli.etherscan.io/address/${address}`,
//       mumbai: `https://mumbai.polygonscan.com/address/${address}`,
//       bnb_testnet: `https://testnet.bscscan.com/address/${address}`
//     };
    
//     return explorers[this.network] || `#${address}`;
//   }

//   async updateEnvFile(contractAddress) {
//     try {
//       const fs = await import('fs');
//       const path = await import('path');
      
//       const envPath = path.join(process.cwd(), '.env');
//       let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
      
//       // Remove existing CONTRACT_ADDRESS
//       envContent = envContent.replace(/CONTRACT_ADDRESS=.*\n/g, '');
      
//       // Add new CONTRACT_ADDRESS
//       envContent += `CONTRACT_ADDRESS=${contractAddress}\n`;
      
//       fs.writeFileSync(envPath, envContent);
      
//       console.log('✅ Updated .env file with contract address');
//     } catch (error) {
//       console.warn('⚠️ Could not update .env file:', error.message);
//     }
//   }

//   async getTestETHFromFaucet(address) {
//     console.log('\n🎯 GET FREE TEST ETH:');
//     console.log(`Your address: ${address}`);
    
//     const faucets = {
//       sepolia: [
//         'https://sepoliafaucet.com',
//         'https://faucet.quicknode.com/ethereum/sepolia',
//         'https://www.infura.io/faucet/sepolia'
//       ],
//       goerli: [
//         'https://goerlifaucet.com',
//         'https://faucet.quicknode.com/ethereum/goerli'
//       ],
//       mumbai: [
//         'https://faucet.polygon.technology',
//         'https://mumbaifaucet.com'
//       ],
//       bnb_testnet: [
//         'https://testnet.bnbchain.org/faucet-smart',
//         'https://bnbchain.org/en/testnet-faucet'
//       ]
//     };

//     const networkFaucets = faucets[this.network] || [];
    
//     if (networkFaucets.length > 0) {
//       console.log('\n🔗 Available faucets:');
//       networkFaucets.forEach((faucet, index) => {
//         console.log(`${index + 1}. ${faucet}`);
//       });
      
//       console.log('\n📝 Instructions:');
//       console.log('1. Visit one of the faucet URLs');
//       console.log('2. Paste your address: ' + address);
//       console.log('3. Complete any CAPTCHA/verification');
//       console.log('4. Wait for test ETH to arrive (usually 1-5 minutes)');
//       console.log('5. Check balance: https://sepolia.etherscan.io/address/' + address);
//     } else {
//       console.log('No known faucets for this network. Search Google for:');
//       console.log(`"${this.network} faucet"`);
//     }
//   }

//   async checkBalance(address) {
//     try {
//       const balance = await this.provider.getBalance(address);
//       const ethBalance = ethers.formatEther(balance);
      
//       console.log(`💰 Balance for ${address}:`);
//       console.log(`  ${ethBalance} ETH`);
//       console.log(`  ${balance.toString()} wei`);
      
//       return {
//         address,
//         balance: ethBalance,
//         balanceWei: balance.toString(),
//         hasEnoughForTx: balance > ethers.parseEther('0.001')
//       };
//     } catch (error) {
//       console.error('❌ Error checking balance:', error);
//       return null;
//     }
//   }

//   async registerMedicine(batchData) {
//     try {
//       if (!this.signer) {
//         throw new Error('No signer configured');
//       }

//       const contractAddress = process.env.CONTRACT_ADDRESS;
//       if (!contractAddress) {
//         throw new Error('Contract address not configured');
//       }

//       const contractABI = await this.loadContractABI();
//       const contract = new ethers.Contract(contractAddress, contractABI, this.signer);

//       // Prepare data
//       const {
//         batchNo,
//         name,
//         medicineName,
//         manufactureDate,
//         expiryDate,
//         formulation,
//         quantity,
//         manufacturer,
//         pharmacy,
//         packaging,
//         status
//       } = batchData;

//       console.log('📝 Registering medicine on real blockchain...');

//       // Estimate gas
//       const gasEstimate = await contract.registerMedicine.estimateGas(
//         batchNo,
//         name,
//         medicineName || name,
//         manufactureDate,
//         expiryDate,
//         formulation,
//         quantity,
//         manufacturer,
//         pharmacy || "To be assigned",
//         JSON.stringify(packaging || {}),
//         status || "active"
//       );

//       console.log(`⛽ Estimated gas: ${gasEstimate.toString()}`);

//       // Send transaction
//       const tx = await contract.registerMedicine(
//         batchNo,
//         name,
//         medicineName || name,
//         manufactureDate,
//         expiryDate,
//         formulation,
//         quantity,
//         manufacturer,
//         pharmacy || "To be assigned",
//         JSON.stringify(packaging || {}),
//         status || "active",
//         {
//           gasLimit: gasEstimate * 2n // Add buffer
//         }
//       );

//       console.log('🔄 Transaction sent, waiting for confirmation...');
//       const receipt = await tx.wait();

//       console.log('✅ Transaction confirmed!');
//       console.log(`📝 TX Hash: ${receipt.hash}`);
//       console.log(`🔗 Explorer: ${this.getExplorerUrl(receipt.hash)}`);

//       return {
//         success: true,
//         transactionHash: receipt.hash,
//         blockNumber: receipt.blockNumber,
//         gasUsed: receipt.gasUsed.toString(),
//         contractAddress
//       };

//     } catch (error) {
//       console.error('❌ Error registering medicine:', error);
      
//       // Check if it's a gas/balance error
//       if (error.message.includes('insufficient funds') || error.code === 'INSUFFICIENT_FUNDS') {
//         const address = await this.signer.getAddress();
//         console.log('\n💸 INSUFFICIENT FUNDS DETECTED');
//         console.log('Please get test ETH from a faucet.');
//         await this.getTestETHFromFaucet(address);
//       }
      
//       throw error;
//     }
//   }

//   async getNetworkInfo() {
//     try {
//       const network = await this.provider.getNetwork();
//       const blockNumber = await this.provider.getBlockNumber();
//       const gasPrice = await this.provider.getGasPrice();
//       const feeData = await this.provider.getFeeData();

//       return {
//         network: {
//           name: network.name,
//           chainId: Number(network.chainId),
//           blockNumber: blockNumber
//         },
//         gas: {
//           gasPrice: ethers.formatUnits(gasPrice, 'gwei') + ' gwei',
//           maxFeePerGas: feeData.maxFeePerGas ? ethers.formatUnits(feeData.maxFeePerGas, 'gwei') + ' gwei' : 'N/A',
//           maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ? ethers.formatUnits(feeData.maxPriorityFeePerGas, 'gwei') + ' gwei' : 'N/A'
//         },
//         timestamp: new Date().toISOString()
//       };
//     } catch (error) {
//       console.error('❌ Error getting network info:', error);
//       return {
//         error: error.message,
//         connected: false
//       };
//     }
//   }
// }

// export default new RealBlockchainService();