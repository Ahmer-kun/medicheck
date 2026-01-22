import Web3 from 'web3';
import { ethers } from 'ethers';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: join(dirname(fileURLToPath(import.meta.url)), '..', '.env') });

class BlockchainService {
  constructor() {
    console.log('Initializing Blockchain Service...');
    
    this.web3 = null;
    this.ethersProvider = null;
    this.contract = null;
    this.ethersContract = null;
    this.signer = null;
    
    // Load configuration
    this.contractAddress = process.env.CONTRACT_ADDRESS;
    this.network = process.env.BLOCKCHAIN_NETWORK || 'http://localhost:8545';
    this.isRealBlockchain = this.detectRealBlockchain();
    this.isAvailable = false;
    this.contractABI = null;
    
    // Transaction tracking
    this.pendingTransactions = new Map();
    this.monitoringInterval = null;
    
    console.log('Blockchain Configuration:');
    console.log(`- Network: ${this.network}`);
    console.log(`- Contract Address: ${this.contractAddress || 'Not deployed'}`);
    console.log(`- Type: ${this.isRealBlockchain ? 'REAL BLOCKCHAIN' : 'LOCAL BLOCKCHAIN'}`);
    
    this.initializeProviders();
  }

  detectRealBlockchain() {
    const network = this.network.toLowerCase();
    
    // Real blockchain networks
    const realNetworks = [
      'infura.io',
      'alchemy.com',
      'quicknode.com',
      'sepolia',
      'goerli',
      'mainnet',
      'ethereum',
      'polygon',
      'mumbai',
      'arbitrum',
      'optimism',
      'bnb',
      'rpc.sepolia.org',
      'rpc.ankr.com',
      'cloudflare-eth.com'
    ];
    
    return realNetworks.some(net => network.includes(net));
  }

  async initializeProviders() {
  try {
    console.log('Connecting to blockchain network...');
    
    // Initialize Web3 provider
    this.web3 = new Web3(new Web3.providers.HttpProvider(this.network, {
      timeout: 30000,
      reconnect: {
        auto: true,
        delay: 5000,
        maxAttempts: 3
      }
    }));
    
    // Initialize Ethers provider
    this.ethersProvider = new ethers.JsonRpcProvider(this.network);
    
    // FIX: Initialize signer for BOTH local and real blockchain
    // We need the private key for signed transactions
    if (process.env.DEPLOYER_PRIVATE_KEY && 
        process.env.DEPLOYER_PRIVATE_KEY.trim() !== '' &&
        !process.env.DEPLOYER_PRIVATE_KEY.includes('your_private_key')) {
      
      try {
        console.log('Initializing signer from private key...');
        this.signer = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, this.ethersProvider);
        this.signerAddress = this.signer.address;
        
        console.log(`Signer address: ${this.signerAddress}`);
        console.log(`Signer initialized: ${this.signerAddress.substring(0, 10)}...`);
        
        // Verify the private key matches the expected address
        const expectedAddress = process.env.DEPLOYER_ADDRESS;
        if (expectedAddress && this.signerAddress.toLowerCase() !== expectedAddress.toLowerCase()) {
          console.warn(`Address mismatch! Expected: ${expectedAddress}, Got: ${this.signerAddress}`);
        }
        
      } catch (walletError) {
        console.error('Failed to initialize signer:', walletError.message);
        console.log('Transactions will fail without a valid signer');
      }
      
    } else {
      console.warn('⚠️ DEPLOYER_PRIVATE_KEY not configured properly in .env');
      console.log('Add to .env: DEPLOYER_PRIVATE_KEY=your_actual_private_key_here');
      
      // For local development without private key, try to get accounts
      if (!this.isRealBlockchain) {
        try {
          const accounts = await this.web3.eth.getAccounts();
          if (accounts.length > 0) {
            this.signerAddress = accounts[0];
            console.log(`Using default account: ${this.signerAddress}`);
          }
        } catch (accountsError) {
          console.warn('Could not get accounts:', accountsError.message);
        }
      }
    }
    
    // Load contract ABI
    await this.loadContractABI();
    
    // Initialize contract if address exists
    if (this.contractAddress && this.contractAddress !== '0xYourDeployedContractAddressHere') {
      await this.initializeContract();
    }
    
    // Start transaction monitoring
    this.startTransactionMonitoring();
    
    this.isAvailable = true;
    console.log('Blockchain service initialized successfully');
    
  } catch (error) {
    console.error('Failed to initialize blockchain providers:', error.message);
    this.isAvailable = false;
  }
}



  async loadContractABI() {
    try {
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = dirname(__filename);
      
      // Try multiple paths for ABI
      const possiblePaths = [
        join(__dirname, '../contracts/MedicineTrackerABI.json'),
        join(__dirname, '../../contracts/MedicineTrackerABI.json'),
        join(process.cwd(), 'contracts/MedicineTrackerABI.json')
      ];
      
      for (const path of possiblePaths) {
        try {
          const data = await readFile(path, 'utf8');
          this.contractABI = JSON.parse(data);
          console.log(`Contract ABI loaded from: ${path}`);
          break;
        } catch (pathError) {
          // Continue to next path
        }
      }
      
      if (!this.contractABI) {
        throw new Error('Could not load contract ABI from any location');
      }
      
    } catch (error) {
      console.error('Error loading contract ABI:', error);
      throw error;
    }
  }

  async initializeContract() {
    try {
      // Check if contract exists at address
      const code = await this.web3.eth.getCode(this.contractAddress);
      
      if (code === '0x' || code === '0x0') {
        console.warn(`No contract code at address: ${this.contractAddress}`);
        return;
      }
      
      console.log(`Contract found at address: ${this.contractAddress}`);
      console.log(`Contract code size: ${code.length} bytes`);
      
      // Initialize Web3 contract
      this.contract = new this.web3.eth.Contract(this.contractABI, this.contractAddress);
      
      // Initialize Ethers contract
      if (this.signer) {
        this.ethersContract = new ethers.Contract(this.contractAddress, this.contractABI, this.signer);
      } else {
        this.ethersContract = new ethers.Contract(this.contractAddress, this.contractABI, this.ethersProvider);
      }
      
      // Test contract connection
      try {
        if (this.contract.methods.owner) {
          const owner = await this.contract.methods.owner().call();
          console.log(`Contract Owner: ${owner}`);
        }
      } catch (testError) {
        console.warn('Could not get contract owner:', testError.message);
      }
      
      console.log('Contract initialized successfully');
      
    } catch (error) {
      console.error('Error initializing contract:', error);
      throw error;
    }
  }

  async getNetworkInfo() {
    try {
      if (!this.web3) {
        throw new Error('Web3 not initialized');
      }
      
      console.log('🔍 Getting network information...');
      
      const isListening = await this.web3.eth.net.isListening();
      const networkId = await this.web3.eth.net.getId();
      const blockNumber = await this.web3.eth.getBlockNumber();
      const gasPrice = await this.web3.eth.getGasPrice();
      const chainId = await this.web3.eth.getChainId();
      
      console.log(`📊 Network Info: ID=${networkId}, Chain=${chainId}, Block=${blockNumber}`);
      
      // Get accounts
      let accounts = [];
      try {
        if (this.signer) {
          accounts = [this.signer.address];
        } else {
          accounts = await this.web3.eth.getAccounts();
        }
      } catch (accountsError) {
        console.warn('⚠️ Could not get accounts:', accountsError.message);
      }
      
      // Check contract status
      let contractStatus = { exists: false };
      if (this.contractAddress && this.contractAddress !== '0xYourDeployedContractAddressHere') {
        try {
          const code = await this.web3.eth.getCode(this.contractAddress);
          contractStatus = {
            exists: code !== '0x' && code !== '0x0',
            address: this.contractAddress,
            codeSize: code.length,
            isPlaceholder: this.contractAddress.includes('YourDeployedContract')
          };
        } catch (contractError) {
          console.warn('⚠️ Contract check failed:', contractError.message);
        }
      }
      
      // Get network name
      const networkName = this.getNetworkName(Number(chainId));
      
      // Get balance if we have signer
      let balanceInfo = {};
      if (this.signer) {
        try {
          const balance = await this.web3.eth.getBalance(this.signer.address);
          const ethBalance = this.web3.utils.fromWei(balance, 'ether');
          balanceInfo = {
            address: this.signer.address,
            balance: ethBalance,
            hasEnough: parseFloat(ethBalance) > 0.001,
            wei: balance
          };
        } catch (balanceError) {
          console.warn('⚠️ Balance check failed:', balanceError.message);
        }
      }
      
      return {
        connected: true,
        healthy: isListening,
        isRealBlockchain: this.isRealBlockchain,
        details: {
          networkId: Number(networkId),
          chainId: Number(chainId),
          blockNumber: Number(blockNumber),
          networkName: networkName,
          gasPrice: `${this.web3.utils.fromWei(gasPrice, 'gwei')} gwei`,
          accounts: accounts.length,
          isListening: isListening,
          contract: contractStatus,
          networkUrl: this.network.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')
        },
        wallet: balanceInfo,
        timestamp: new Date().toISOString(),
        service: 'BlockchainService'
      };
      
    } catch (error) {
      console.error('❌ Error getting network info:', error.message);
      return {
        connected: false,
        healthy: false,
        isRealBlockchain: this.isRealBlockchain,
        error: error.message,
        details: {
          networkUrl: this.network,
          suggestion: this.getConnectionTroubleshooting(error)
        },
        timestamp: new Date().toISOString(),
        service: 'BlockchainService'
      };
    }
  }

  getNetworkName(chainId) {
    const networks = {
      1: 'Ethereum Mainnet',
      5: 'Goerli Testnet',
      11155111: 'Sepolia Testnet',
      80001: 'Polygon Mumbai',
      97: 'BNB Smart Chain Testnet',
      56: 'BNB Smart Chain Mainnet',
      137: 'Polygon Mainnet',
      42161: 'Arbitrum One',
      10: 'Optimism',
      31337: 'Hardhat Local',
      1337: 'Local Testnet',
      5777: 'Ganache Local'
    };
    return networks[chainId] || `Unknown Network (${chainId})`;
  }

  getConnectionTroubleshooting(error) {
    if (error.message.includes('connect') || error.message.includes('ECONNREFUSED')) {
      return 'Check if blockchain node is running and RPC URL is correct';
    } else if (error.message.includes('invalid response')) {
      return 'Invalid RPC response. Check your Infura/QuickNode API key';
    } else if (error.message.includes('timeout')) {
      return 'Connection timeout. Network might be busy or URL incorrect';
    } else {
      return 'Unknown connection error. Check your configuration';
    }
  }

//   async getDefaultAccount() {
//   try {
//     // ✅ FIXED: Return signer address if available
//     if (this.signerAddress) {
//       return this.signerAddress;
//     }
    
//     // For local blockchain or fallback
//     const accounts = await this.web3.eth.getAccounts();
//     if (accounts.length > 0) {
//       return accounts[0];
//     }
    
//     // Try to derive from private key
//     if (process.env.DEPLOYER_PRIVATE_KEY) {
//       const ethers = await import('ethers');
//       const wallet = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY);
//       return wallet.address;
//     }
    
//     throw new Error('No accounts available. Check your private key in .env');
    
//   } catch (error) {
//     console.error('❌ Error getting default account:', error);
//     throw error;
//   }
// }


    async registerCompleteMedicine(batchData) {
  try {
    console.log('🔍 Web3.js version check:', {
      version: this.web3?.version,
      utilsAvailable: !!this.web3?.utils,
      hasToBN: typeof this.web3?.utils?.toBN === 'function'
    });

    console.log('📝 Registering medicine on blockchain...');
    
    // Validate batch data
    const validation = this.validateBatchData(batchData);
    if (!validation.valid) {
      throw new Error(`Invalid batch data: ${validation.errors.join(', ')}`);
    }
    
    // Prepare data for blockchain
    const blockchainData = this.prepareBlockchainData(batchData);
    
    console.log('📦 Prepared blockchain data:', {
      batchNo: blockchainData.batchNo,
      name: blockchainData.name,
      quantity: blockchainData.quantity,
      manufacturer: blockchainData.manufacturer
    });
    
    // Check if already exists
    const exists = await this.verifyMedicineExistence(blockchainData.batchNo);
    if (exists) {
      throw new Error(`Batch ${blockchainData.batchNo} already exists on blockchain`);
    }
    
    // Get account for transaction
    const fromAccount = await this.getDefaultAccount();
    
    console.log(`👤 Sending from account: ${fromAccount}`);
    
    // Convert quantity safely
    let quantityForContract;
    try {
      quantityForContract = BigInt(parseInt(blockchainData.quantity) || 1);
    } catch (error) {
      console.warn('⚠️ Quantity conversion failed, using default:', error.message);
      quantityForContract = 1n;
    }
    
    // Prepare transaction method
    const method = this.contract.methods.registerMedicine(
      blockchainData.batchNo,
      blockchainData.name,
      blockchainData.medicineName,
      blockchainData.manufactureDate,
      blockchainData.expiryDate,
      blockchainData.formulation,
      quantityForContract,
      blockchainData.manufacturer,
      blockchainData.pharmacy,
      blockchainData.packaging,
      blockchainData.status
    );
    
    // Estimate gas
    let gasEstimate;
    try {
      gasEstimate = await method.estimateGas({ from: fromAccount });
      console.log(`⛽ Estimated gas: ${gasEstimate}`);
    } catch (estimateError) {
      console.error('⚠️ Gas estimation failed:', estimateError.message);
      gasEstimate = this.isRealBlockchain ? 1000000 : 500000;
    }
    
    // Execute transaction
    let transaction;
    if (this.isRealBlockchain) {
      transaction = await this.executeSignedTransaction(
        method, 
        fromAccount, 
        this.contractAddress, 
        blockchainData.batchNo,
        'registration'
      );
    } else {
      transaction = await this.executeLocalTransaction(method, fromAccount, blockchainData.batchNo);
    }
    
    // Track transaction
    this.trackTransaction(transaction.transactionHash, blockchainData.batchNo);
    
    // Return result
    const result = {
      success: true,
      transactionHash: transaction.transactionHash,
      blockNumber: transaction.blockNumber,
      from: fromAccount,
      batchNo: blockchainData.batchNo,
      network: this.isRealBlockchain ? 'real' : 'local'
    };
    
    if (this.isRealBlockchain) {
      result.explorerUrl = this.getExplorerUrl(transaction.transactionHash);
      console.log(`🔗 Explorer URL: ${result.explorerUrl}`);
    }
    
    console.log('🎉 Medicine registered successfully on blockchain!');
    return result;
    
  } catch (error) {
    console.error('❌ Blockchain registration failed:', {
      message: error.message,
      batchNo: batchData?.batchNo,
      isRealBlockchain: this.isRealBlockchain
    });
    
    // Enhanced error messages for dual storage
    if (error.message.includes('insufficient funds')) {
      throw new Error('Blockchain: Insufficient ETH for gas. Transaction aborted.');
    } else if (error.message.includes('nonce')) {
      throw new Error('Blockchain: Transaction nonce error. Please try again.');
    } else if (error.message.includes('revert')) {
      throw new Error(`Blockchain: Transaction reverted - ${error.reason || 'Check contract requirements'}`);
    } else if (error.message.includes('already exists')) {
      throw new Error(`Blockchain: Batch ${batchData.batchNo} already exists`);
    } else if (error.message.includes('BigInt')) {
      throw new Error(`Blockchain: Type conversion error - ${error.message}`);
    }
    
    throw new Error(`Blockchain registration failed: ${error.message}`);
  }
}


//   async registerCompleteMedicine(batchData) {
//   try {
//     console.log('🔍 Web3.js version check:', {
//       version: this.web3?.version,
//       utilsAvailable: !!this.web3?.utils,
//       hasToBN: typeof this.web3?.utils?.toBN === 'function',
//       hasToBigInt: typeof this.web3?.utils?.toBigInt === 'function'
//     });

//     console.log('📝 Registering medicine on blockchain...');
    
//     // Validate batch data
//     const validation = this.validateBatchData(batchData);
//     if (!validation.valid) {
//       throw new Error(`Invalid batch data: ${validation.errors.join(', ')}`);
//     }
    
//     // Prepare data for blockchain
//     const blockchainData = this.prepareBlockchainData(batchData);
    
//     console.log('📦 Prepared blockchain data:', {
//       batchNo: blockchainData.batchNo,
//       name: blockchainData.name,
//       quantity: blockchainData.quantity,
//       manufacturer: blockchainData.manufacturer,
//       manufactureDate: blockchainData.manufactureDate,
//       expiryDate: blockchainData.expiryDate
//     });
    
//     // Check if already exists
//     const exists = await this.verifyMedicineExistence(blockchainData.batchNo);
//     if (exists) {
//       throw new Error(`Batch ${blockchainData.batchNo} already exists on blockchain`);
//     }
    
//     // Get account for transaction
//     const fromAccount = await this.getDefaultAccount();
    
//     console.log(`👤 Sending from account: ${fromAccount}`);
    
//     // ✅ FIXED: Convert quantity safely for Web3.js v1.10.4
//     let quantityForContract;
//     try {
//       // Use parseInt to ensure it's a number, then convert to string for BigInt
//       quantityForContract = BigInt(parseInt(blockchainData.quantity) || 1);
//     } catch (error) {
//       console.warn('⚠️ Quantity conversion failed, using default:', error.message);
//       quantityForContract = 1n; // Default to 1
//     }
    
//     console.log('🔢 Quantity conversion for contract:', {
//       original: blockchainData.quantity,
//       type: typeof blockchainData.quantity,
//       converted: quantityForContract.toString(),
//       convertedType: typeof quantityForContract
//     });

//     // Prepare transaction method
//     const method = this.contract.methods.registerMedicine(
//       blockchainData.batchNo,
//       blockchainData.name,
//       blockchainData.medicineName,
//       blockchainData.manufactureDate,
//       blockchainData.expiryDate,
//       blockchainData.formulation,
//       quantityForContract,
//       blockchainData.manufacturer,
//       blockchainData.pharmacy,
//       blockchainData.packaging,
//       blockchainData.status
//     );
    
//     // Estimate gas
//     let gasEstimate;
//     try {
//       gasEstimate = await method.estimateGas({ from: fromAccount });
//       console.log(`⛽ Estimated gas: ${gasEstimate}`);
//     } catch (estimateError) {
//       console.error('⚠️ Gas estimation failed:', estimateError.message);
//       gasEstimate = this.isRealBlockchain ? 1000000 : 500000;
//     }
    
//     // ============ TRANSACTION EXECUTION ============
    
//     let transaction;
    
//     if (this.isRealBlockchain) {
//       // ============ FOR REAL BLOCKCHAIN (SEPOLIA) ============
//       transaction = await this.executeSignedTransaction(
//     method, 
//     fromAccount, 
//     this.contractAddress, 
//     blockchainData.batchNo,
//     'registration'
//   );
//     } else {
//       // ============ FOR LOCAL BLOCKCHAIN ============
//       transaction = await this.executeLocalTransaction(method, fromAccount, blockchainData.batchNo);
//       }
//   //     else {
//   // // ============ FOR LOCAL BLOCKCHAIN ============
//   // transaction = await method.send({
//   //   from: fromAccount,
//   //   gas: Math.floor(gasEstimate * 1.2)
//   // });
//   // }
    
    
//     // ============ END OF TRANSACTION SECTION ============
    
//     // Track transaction
//     this.trackTransaction(transaction.transactionHash, blockchainData.batchNo);
    
//     // Return result
//     const result = {
//       success: true,
//       transactionHash: transaction.transactionHash,
//       blockNumber: transaction.blockNumber,
//       from: fromAccount,
//       batchNo: blockchainData.batchNo,
//       network: this.isRealBlockchain ? 'real' : 'local',
//       signed: this.isRealBlockchain
//     };
    
//     if (this.isRealBlockchain) {
//       result.explorerUrl = this.getExplorerUrl(transaction.transactionHash);
//       console.log(`🔗 Explorer URL: ${result.explorerUrl}`);
//     }
    
//     console.log('🎉 Medicine registered successfully!');
    
//     return result;
    
//   } catch (error) {
//     console.error('❌ Error registering medicine:', {
//       message: error.message,
//       batchNo: batchData?.batchNo,
//       isRealBlockchain: this.isRealBlockchain
//     });
    
//     // Enhanced error messages
//     if (error.message.includes('eth_sendTransaction does not exist')) {
//       throw new Error('Public RPC nodes require signed transactions.');
//     } else if (error.message.includes('insufficient funds')) {
//       throw new Error('Insufficient ETH for gas. Please add funds to your wallet.');
//     } else if (error.message.includes('nonce')) {
//       throw new Error('Transaction nonce error. Please try again.');
//     } else if (error.message.includes('revert')) {
//       throw new Error(`Transaction reverted: ${error.reason || 'Check contract requirements'}`);
//     } else if (error.message.includes('already exists')) {
//       throw new Error(`Batch ${batchData.batchNo} already exists on blockchain`);
//     } else if (error.message.includes('BigInt')) {
//       throw new Error(`Type conversion error: ${error.message}. Please check quantity format.`);
//     } else if (error.message.includes('Invalid character')) {
//       throw new Error('Transaction signing failed. Check private key format.');
//     } else if (error.message.includes('formatJson')) {
//       throw new Error('Web3.js version compatibility issue. Please update the signing method.');
//     }
    
//     throw new Error(`Blockchain registration failed: ${error.message}`);
//   }
// }

// ============ HELPER METHODS ============

async executeLocalBlockchainTransaction(method, fromAccount, gasEstimate) {
  console.log('📤 Using direct transaction for local blockchain...');
  
  // Prepare transaction config
  const txConfig = {
    from: fromAccount,
    gas: Math.floor(gasEstimate * 1.2)
  };
  
  console.log('📤 Transaction config:', {
    from: txConfig.from.substring(0, 10) + '...',
    gas: txConfig.gas,
    gasPrice: txConfig.gasPrice ? `${parseInt(txConfig.gasPrice) / 1e9} gwei` : 'auto'
  });
  
  // Send direct transaction (works for local/test networks)
  const transaction = await method.send(txConfig);
  console.log(`✅ Transaction sent: ${transaction.transactionHash}`);
  
  return transaction;
}




// async realBLOCKCHAIN update 1
async executeRealBlockchainTransaction(method, fromAccount, gasEstimate, blockchainData) {
  console.log('🔐 Using signed transaction for real blockchain...');
  
  if (!process.env.DEPLOYER_PRIVATE_KEY) {
    throw new Error('DEPLOYER_PRIVATE_KEY is required for real blockchain transactions');
  }

  // Clean the private key (remove any whitespace or quotes)
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY.trim();
  
  console.log('🔑 Private key check:', {
    length: privateKey.length,
    startsWith0x: privateKey.startsWith('0x'),
    first10Chars: '***'  // Don't log private key parts
    // first10Chars: privateKey.substring(0, 10) + '...'
  });

  // Validate private key format
  if (privateKey.length !== 66) {
    throw new Error(`Private key must be 66 characters (64 hex + 0x). Got ${privateKey.length}`);
  }

  if (!privateKey.startsWith('0x')) {
    throw new Error('Private key must start with 0x');
  }

  // Check for invalid characters
  const cleanHex = privateKey.substring(2);
  if (!/^[0-9a-fA-F]+$/.test(cleanHex)) {
    throw new Error('Private key contains invalid characters. Must be hex only.');
  }

  // 1. Get nonce
  const nonce = await this.web3.eth.getTransactionCount(fromAccount, 'pending');
  console.log(`📝 Nonce: ${nonce}`);

  // 2. Chain ID
  const chainId = 11155111; // Sepolia
  
  // 3. Gas price - use Sepolia minimum
  const gasPrice = this.web3.utils.toWei('35', 'gwei');
  
  // 4. Encode ABI data
  const data = method.encodeABI();
  
  // 5. Gas limit
  const gasLimit = Math.max(Math.floor(gasEstimate * 1.5), 1000000);

  // 6. Build transaction object with proper hex formatting
  const txObject = {
    from: fromAccount,
    to: this.contractAddress,
    nonce: this.web3.utils.toHex(nonce),
    gas: this.web3.utils.toHex(gasLimit),
    gasPrice: this.web3.utils.toHex(gasPrice),
    value: '0x0',
    data: data,
    chainId: chainId
  };

  console.log('📄 Transaction object prepared for signing');

  try {
    // ============ SIMPLIFIED SIGNING APPROACH ============
    console.log('✍️ Signing with direct method...');
    
    // Import the account using web3's account module
    const account = this.web3.eth.accounts.privateKeyToAccount(privateKey);
    
    console.log(`✅ Account loaded: ${account.address}`);
    
    // Sign the transaction
    const signedTx = await account.signTransaction(txObject);
    
    console.log(`✅ Signed successfully. Raw TX: ${signedTx.rawTransaction.substring(0, 50)}...`);
    
    // Send the signed transaction
    console.log('📤 Broadcasting transaction...');
    const receipt = await this.web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    
    console.log('🎉 Transaction confirmed!');
    console.log(`📝 Hash: ${receipt.transactionHash}`);
    console.log(`📦 Block: ${receipt.blockNumber}`);
    
    return {
      transactionHash: receipt.transactionHash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
      status: receipt.status
    };
    
  } catch (signError) {
    console.error('❌ Signing failed:', {
      message: signError.message,
      code: signError.code,
      stack: signError.stack
    });
    
    // Try alternative signing method using ethers.js
    console.log('🔄 Trying alternative signing with ethers.js...');
    
    try {
      const ethers = await import('ethers');
      
      // Create wallet from private key
      const wallet = new ethers.Wallet(privateKey);
      
      // Convert transaction for ethers
      const ethersTx = {
        to: this.contractAddress,
        data: data,
        nonce: nonce,
        gasLimit: gasLimit,
        gasPrice: gasPrice,
        chainId: chainId
      };
      
      // Sign with ethers
      const signedTxEthers = await wallet.signTransaction(ethersTx);
      
      // Send with web3
      const receiptEthers = await this.web3.eth.sendSignedTransaction(signedTxEthers);
      
      console.log('✅ Ethers signing successful!');
      
      return {
        transactionHash: receiptEthers.transactionHash,
        blockNumber: receiptEthers.blockNumber,
        gasUsed: receiptEthers.gasUsed.toString(),
        status: receiptEthers.status
      };
      
    } catch (ethersError) {
      console.error('❌ Ethers signing also failed:', ethersError.message);
      throw new Error(`Both signing methods failed. Original error: ${signError.message}`);
    }
  }
}
    async checkAccountBalance(address = null) {
  try {
    const checkAddress = address || await this.getDefaultAccount();
    const balance = await this.web3.eth.getBalance(checkAddress);
    const ethBalance = this.web3.utils.fromWei(balance, 'ether');
    
    return {
      address: checkAddress,
      balance: ethBalance,
      balanceWei: balance.toString(),
      hasEnoughForTx: parseFloat(ethBalance) > 0.01, // Need at least 0.01 ETH
      formatted: `${ethBalance} ETH`,
      warning: parseFloat(ethBalance) < 0.01 ? 'Low balance - get test ETH from faucet' : null
    };
  } catch (error) {
    console.error('Error checking balance:', error);
    throw error;
  }
}

// ✅ NEW: Simplified signing method compatible with Web3.js v1.x
// UPPPPPPPPPPPPPPPPPPPPPPPHHHHHHHHHH
async signAndSendTransactionCompat(txParams) {
  console.log('✍️ Signing transaction (compatible mode)...');
  
  try {
    // Get private key from environment
    const privateKey = process.env.DEPLOYER_PRIVATE_KEY.trim();
    
    console.log('🔍 Private key analysis:', {
      length: privateKey.length,
      startsWith0x: privateKey.startsWith('0x'),
      hexPartValid: /^[0-9a-fA-F]{64}$/.test(privateKey.substring(2))
    });
    
    if (!privateKey || privateKey.includes('your_private_key')) {
      throw new Error('DEPLOYER_PRIVATE_KEY not properly configured in .env file');
    }
    
    // Validate private key format
    if (privateKey.length !== 66) {
      throw new Error(`Private key must be 66 characters (64 hex + 0x). Got ${privateKey.length}`);
    }
    
    if (!privateKey.startsWith('0x')) {
      throw new Error('Private key must start with 0x');
    }
    
    // ============ SIMPLIFIED APPROACH: Use ethers.js only ============
    console.log('🔧 Using Ethers.js for signing...');
    
    // Import ethers
    const ethers = await import('ethers');
    
    // Create wallet from private key
    const wallet = new ethers.Wallet(privateKey);
    console.log(`✅ Ethers wallet created: ${wallet.address}`);
    
    // Convert transaction parameters to proper types for ethers
    const ethersTx = {
      to: txParams.to,
      data: txParams.data,
      nonce: txParams.nonce, // Should be a number
      gasLimit: BigInt(txParams.gasLimit), // Convert to BigInt
      gasPrice: BigInt(txParams.gasPrice), // Convert to BigInt
      value: 0n, // Zero value for contract calls
      chainId: txParams.chainId // Should be a number
    };
    
    console.log('📄 Ethers transaction object:', {
      to: ethersTx.to,
      nonce: ethersTx.nonce,
      gasLimit: ethersTx.gasLimit.toString(),
      gasPrice: ethers.formatUnits(ethersTx.gasPrice, 'gwei') + ' gwei',
      chainId: ethersTx.chainId,
      dataLength: ethersTx.data.length
    });
    
    // Sign the transaction with ethers
    console.log('✍️ Signing with Ethers.js...');
    const signedTx = await wallet.signTransaction(ethersTx);
    
    console.log(`✅ Signed successfully`);
    console.log(`📄 Raw transaction length: ${signedTx.length} characters`);
    
    // ============ Send the signed transaction using Web3.js ============
    console.log('📤 Broadcasting signed transaction...');
    
    // IMPORTANT: Use a timeout for sending
    const sendPromise = this.web3.eth.sendSignedTransaction(signedTx);
    
    // Add timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Transaction send timeout after 30 seconds')), 30000);
    });
    
    // Race between send and timeout
    const receipt = await Promise.race([sendPromise, timeoutPromise]);
    
    console.log(`🎉 Transaction confirmed: ${receipt.transactionHash}`);
    console.log(`📦 Block: ${receipt.blockNumber}, Gas used: ${receipt.gasUsed}`);
    
    return {
      transactionHash: receipt.transactionHash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
      status: receipt.status,
      ...receipt
    };
    
  } catch (error) {
    console.error('❌ Transaction signing/execution failed:', {
      message: error.message,
      code: error.code,
      reason: error.reason
    });
    
    // Provide specific error messages and debugging info
    if (error.message.includes('Invalid character')) {
      // Debug the exact issue
      console.error('🔍 DEBUG - Checking transaction parameters:');
      console.error('- Nonce type:', typeof txParams.nonce, 'value:', txParams.nonce);
      console.error('- Gas price type:', typeof txParams.gasPrice, 'value:', txParams.gasPrice);
      console.error('- Gas limit type:', typeof txParams.gasLimit, 'value:', txParams.gasLimit);
      console.error('- Chain ID type:', typeof txParams.chainId, 'value:', txParams.chainId);
      
      throw new Error(`Signing failed: ${error.message}. Check parameter types.`);
      
    } else if (error.message.includes('insufficient funds')) {
      // Check balance
      try {
        const balance = await this.web3.eth.getBalance(txParams.from);
        const ethBalance = this.web3.utils.fromWei(balance, 'ether');
        throw new Error(`Insufficient ETH for gas. Balance: ${ethBalance} ETH. Get test ETH from faucet.`);
      } catch (balanceError) {
        throw new Error('Insufficient funds for transaction');
      }
      
    } else if (error.message.includes('nonce too low')) {
      // Get current nonce and suggest correct value
      const currentNonce = await this.web3.eth.getTransactionCount(txParams.from, 'pending');
      throw new Error(`Nonce ${txParams.nonce} is too low. Try with nonce: ${currentNonce}`);
      
    } else if (error.message.includes('replacement transaction underpriced')) {
      // Suggest higher gas price
      const suggestedGasPrice = BigInt(txParams.gasPrice) * 2n;
      throw new Error(`Gas price too low. Try with at least ${this.web3.utils.fromWei(suggestedGasPrice.toString(), 'gwei')} gwei`);
      
    } else if (error.message.includes('intrinsic gas too low')) {
      // Suggest higher gas limit
      const suggestedGasLimit = Math.floor(txParams.gasLimit * 1.5);
      throw new Error(`Gas limit too low. Try with at least ${suggestedGasLimit} gas`);
      
    } else if (error.message.includes('timeout')) {
      throw new Error('Transaction timed out. It may still be processing. Check later on Etherscan.');
      
    } else if (error.message.includes('already known')) {
      throw new Error('Transaction already submitted to network. Check Etherscan for status.');
      
    } else if (error.message.includes('revert')) {
      throw new Error(`Transaction reverted: ${error.reason || 'Contract execution failed'}`);
    }
    
    // Generic error
    throw new Error(`Transaction failed: ${error.message}`);
  }
}
// async signAndSendTransactionCompat(txParams) {
//   console.log('✍️ Signing transaction (compatible mode)...');
  
//   try {
//     // Build transaction object for Web3.js v1.x
//     const txObject = {
//       from: txParams.from,
//       to: txParams.to,
//       nonce: this.web3.utils.toHex(txParams.nonce),
//       gas: this.web3.utils.toHex(txParams.gasLimit),
//       gasPrice: this.web3.utils.toHex(txParams.gasPrice),
//       value: '0x0',
//       data: txParams.data,
//       chainId: this.web3.utils.toHex(txParams.chainId)
//     };
    
//     console.log('📄 Transaction object:', {
//       from: txObject.from.substring(0, 10) + '...',
//       to: txObject.to,
//       nonce: txParams.nonce,
//       gas: txParams.gasLimit,
//       gasPrice: `${this.web3.utils.fromWei(txParams.gasPrice, 'gwei')} gwei`,
//       chainId: txParams.chainId,
//       dataLength: txParams.data.length
//     });
    
//     // Get private key from environment
//     const privateKey = process.env.DEPLOYER_PRIVATE_KEY.trim();
    
//     console.log('🔍 Private key analysis:', {
//       length: privateKey.length,
//       startsWith0x: privateKey.startsWith('0x'),
//       fullKey: privateKey,
//       first10: privateKey.substring(0, 12) + '...'
//     });
    
//     if (!privateKey || privateKey.includes('your_private_key')) {
//       throw new Error('DEPLOYER_PRIVATE_KEY not properly configured in .env file');
//     }
    
//     // Validate private key format
//     if (privateKey.length !== 66) {
//       throw new Error(`Private key must be 66 characters (64 hex + 0x). Got ${privateKey.length}`);
//     }
    
//     if (!privateKey.startsWith('0x')) {
//       throw new Error('Private key must start with 0x');
//     }
    
//     // Extract hex part and validate
//     const hexPart = privateKey.substring(2);
//     const hexRegex = /^[0-9a-fA-F]{64}$/;
//     if (!hexRegex.test(hexPart)) {
//       throw new Error('Private key contains invalid hex characters');
//     }
    
//     console.log('✅ Private key format is valid');
    
//     // Try different signing approaches
//     console.log('🔄 Attempting to sign with Web3.js...');
    
//     // APPROACH 1: Direct web3.eth.accounts.signTransaction
//     try {
//       console.log('🔧 Approach 1: web3.eth.accounts.signTransaction');
//       const signedTx = await this.web3.eth.accounts.signTransaction(txObject, privateKey);
      
//       if (signedTx.rawTransaction) {
//         console.log('✅ Signing successful (Approach 1)');
//         console.log(`📤 Raw transaction length: ${signedTx.rawTransaction.length}`);
        
//         // Send signed transaction
//         console.log('📤 Broadcasting signed transaction...');
//         const receipt = await this.web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        
//         console.log(`✅ Transaction confirmed: ${receipt.transactionHash}`);
//         console.log(`📦 Block: ${receipt.blockNumber}, Gas used: ${receipt.gasUsed}`);
        
//         return {
//           transactionHash: receipt.transactionHash,
//           blockNumber: receipt.blockNumber,
//           gasUsed: receipt.gasUsed.toString(),
//           status: receipt.status,
//           ...receipt
//         };
//       }
//     } catch (signError1) {
//       console.log('❌ Approach 1 failed:', signError1.message);
//     }
    
//     // APPROACH 2: Create account object first
//     try {
//       console.log('🔧 Approach 2: Create account object first');
//       const account = this.web3.eth.accounts.privateKeyToAccount(privateKey);
//       console.log(`✅ Account created: ${account.address}`);
      
//       // Sign with account object
//       const signedTx = await account.signTransaction(txObject);
      
//       if (signedTx.rawTransaction) {
//         console.log('✅ Signing successful (Approach 2)');
        
//         // Send signed transaction
//         const receipt = await this.web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        
//         console.log(`✅ Transaction confirmed: ${receipt.transactionHash}`);
        
//         return {
//           transactionHash: receipt.transactionHash,
//           blockNumber: receipt.blockNumber,
//           gasUsed: receipt.gasUsed.toString(),
//           status: receipt.status
//         };
//       }
//     } catch (signError2) {
//       console.log('❌ Approach 2 failed:', signError2.message);
//     }
    
//     // APPROACH 3: Manual signing (fallback)
//     try {
//       console.log('🔧 Approach 3: Manual signing fallback');
      
//       // Import ethers for manual signing
//       const ethers = await import('ethers');
      
//       // Create wallet from private key
//       const wallet = new ethers.Wallet(privateKey);
//       console.log(`✅ Ethers wallet created: ${wallet.address}`);
      
//       // Build ethers transaction
//       const ethersTx = {
//         to: txObject.to,
//         data: txObject.data,
//         nonce: txObject.nonce,
//         gasLimit: txObject.gas,
//         gasPrice: txObject.gasPrice,
//         value: txObject.value,
//         chainId: parseInt(txObject.chainId, 16)
//       };
      
//       // Sign with ethers
//       const signedTx = await wallet.signTransaction(ethersTx);
      
//       // Send with web3
//       const receipt = await this.web3.eth.sendSignedTransaction(signedTx);
      
//       console.log(`✅ Transaction confirmed (Approach 3): ${receipt.transactionHash}`);
      
//       return {
//         transactionHash: receipt.transactionHash,
//         blockNumber: receipt.blockNumber,
//         gasUsed: receipt.gasUsed.toString(),
//         status: receipt.status
//       };
      
//     } catch (signError3) {
//       console.log('❌ Approach 3 failed:', signError3.message);
//     }
    
//     // If all approaches fail
//     throw new Error('All signing approaches failed. Check private key format.');
    
//   } catch (error) {
//     console.error('❌ Transaction signing/execution failed:', error.message);
    
//     // Provide helpful error messages
//     if (error.message.includes('Invalid character')) {
//       console.error('🔍 DEBUG: Your private key:', process.env.DEPLOYER_PRIVATE_KEY);
//       console.error('🔍 DEBUG: Key length:', process.env.DEPLOYER_PRIVATE_KEY?.length);
//       console.error('🔍 DEBUG: First 20 chars:', process.env.DEPLOYER_PRIVATE_KEY?.substring(0, 20));
//       console.error('🔍 DEBUG: Contains spaces:', process.env.DEPLOYER_PRIVATE_KEY?.includes(' '));
//       console.error('🔍 DEBUG: Contains newlines:', process.env.DEPLOYER_PRIVATE_KEY?.includes('\n'));
      
//       // Check for common issues
//       const pk = process.env.DEPLOYER_PRIVATE_KEY || '';
//       if (pk.includes(' ')) {
//         throw new Error('Private key contains spaces. Remove all spaces from the key.');
//       }
//       if (pk.includes('\n')) {
//         throw new Error('Private key contains newline characters. Ensure it\'s on one line.');
//       }
//       if (pk.length !== 66) {
//         throw new Error(`Private key should be 66 characters (0x + 64 hex). Got ${pk.length} characters.`);
//       }
      
//       throw new Error('Invalid private key character. Ensure it only contains hex characters (0-9, a-f).');
//     } else if (error.message.includes('insufficient funds')) {
//       const balance = await this.web3.eth.getBalance(txParams.from);
//       const ethBalance = this.web3.utils.fromWei(balance, 'ether');
//       throw new Error(`Insufficient ETH for gas. Balance: ${ethBalance} ETH. Get test ETH from faucet.`);
//     } else if (error.message.includes('nonce too low')) {
//       throw new Error('Nonce error. The transaction with this nonce was already processed.');
//     }
    
//     throw error;
//   }
// }

// Also update the getDefaultAccount method to ensure it works:
async getDefaultAccount() {
  try {
    // ✅ FIXED: Return signer address if available
    if (this.signerAddress) {
      return this.signerAddress;
    }
    
    // If no signer address but we have private key, derive it
    if (process.env.DEPLOYER_PRIVATE_KEY) {
      const privateKey = process.env.DEPLOYER_PRIVATE_KEY.trim();
      
      try {
        // Use web3's account module
        const account = this.web3.eth.accounts.privateKeyToAccount(privateKey);
        this.signerAddress = account.address;
        console.log(`✅ Derived account from private key: ${this.signerAddress}`);
        return this.signerAddress;
      } catch (derivationError) {
        console.error('❌ Failed to derive account from private key:', derivationError.message);
      }
    }
    
    // For local blockchain or fallback
    const accounts = await this.web3.eth.getAccounts();
    if (accounts.length > 0) {
      this.signerAddress = accounts[0];
      return this.signerAddress;
    }
    
    throw new Error('No accounts available. Check your private key in .env');
    
  } catch (error) {
    console.error('❌ Error getting default account:', error);
    throw error;
  }
}

//  Transaction tracking methods Error Currently Underway
// O N G U A R D

  validateBatchData(batchData) {
    const errors = [];
    
    if (!batchData.batchNo || batchData.batchNo.trim() === '') {
      errors.push('Batch number is required');
    }
    
    if (!batchData.name || batchData.name.trim() === '') {
      errors.push('Medicine name is required');
    }
    
    if (!batchData.quantity || batchData.quantity <= 0) {
      errors.push('Valid quantity is required');
    }
    
    if (!batchData.manufacturer || batchData.manufacturer.trim() === '') {
      errors.push('Manufacturer is required');
    }
    
    return {
      valid: errors.length === 0,
      errors: errors
    };
  }

    async checkInitialization() {
  try {
    if (!this.isAvailable) {
      console.log('🔄 Blockchain service not available, attempting to initialize...');
      await this.initializeProviders();
      await this.loadContractABI();
      if (this.contractAddress && this.contractAddress !== '0xYourDeployedContractAddressHere') {
        await this.initializeContract();
      }
      return this.isAvailable;
    }
    return true;
  } catch (error) {
    console.error('❌ Initialization check failed:', error);
    return false;
  }
}
  // In prepareBlockchainData function

  // FURKKKKKKKKKKKKK
  prepareBlockchainData(batchData) {
  // Parse quantity as integer
  const quantity = parseInt(batchData.quantity) || 1;
  
  console.log('🔢 Quantity conversion:', {
    original: batchData.quantity,
    parsed: quantity,
    type: typeof quantity,
    isNaN: isNaN(quantity),
    isInteger: Number.isInteger(quantity)
  });
  
  return {
    batchNo: String(batchData.batchNo).trim(),
    name: String(batchData.name).trim(),
    medicineName: String(batchData.medicineName || batchData.name).trim(),
    manufactureDate: this.formatDateForBlockchain(batchData.manufactureDate || new Date()),
    expiryDate: this.formatDateForBlockchain(batchData.expiryDate || batchData.expiry || this.getDefaultExpiryDate()),
    formulation: String(batchData.formulation || 'Tablet').trim(),
    quantity: quantity, // ✅ Plain number (will be converted to BigInt)
    manufacturer: String(batchData.manufacturer || 'Unknown Manufacturer').trim(),
    pharmacy: String(batchData.pharmacy || "To be assigned").trim(),
    packaging: batchData.packaging ? JSON.stringify(batchData.packaging) : '{}',
    status: String(batchData.status || 'active').trim()
  };
}


  // prepareBlockchainData(batchData) {
//   // Parse quantity as integer
//   const quantity = parseInt(batchData.quantity) || 1;
  
//   console.log('🔢 Quantity conversion:', {
//     original: batchData.quantity,
//     parsed: quantity,
//     type: typeof quantity,
//     isNaN: isNaN(quantity),
//     isInteger: Number.isInteger(quantity)
//   });
  
//   return {
//     batchNo: String(batchData.batchNo).trim(),
//     name: String(batchData.name).trim(),
//     medicineName: String(batchData.medicineName || batchData.name).trim(),
//     manufactureDate: this.formatDateForBlockchain(batchData.manufactureDate || new Date()),
//     expiryDate: this.formatDateForBlockchain(batchData.expiryDate || batchData.expiry || this.getDefaultExpiryDate()),
//     formulation: String(batchData.formulation || 'Tablet').trim(),
//     quantity: quantity, // ✅ Plain number
//     manufacturer: String(batchData.manufacturer || 'Unknown Manufacturer').trim(),
//     pharmacy: String(batchData.pharmacy || "To be assigned").trim(),
//     packaging: batchData.packaging ? JSON.stringify(batchData.packaging) : '{}',
//     status: String(batchData.status || 'active').trim()
//   };
// }

//   convertQuantityForBlockchain(quantity) {
//   try {
//     // Try different methods based on Web3 version
//     if (typeof this.web3?.utils?.toBigInt === 'function') {
//       // Web3.js v4.x
//       return this.web3.utils.toBigInt(quantity);
//     } else if (typeof this.web3?.utils?.toBN === 'function') {
//       // Web3.js v3.x
//       return this.web3.utils.toBN(quantity);
//     } else if (typeof BigInt === 'function') {
//       // Modern JavaScript
//       return BigInt(quantity);
//     } else {
//       // Fallback to string
//       return quantity.toString();
//     }
//   } catch (error) {
//     console.error('Error converting quantity:', error);
//     return quantity.toString(); // Always safe
//   }
// }

  formatDateForBlockchain(dateValue) {
    try {
      if (!dateValue) {
        return new Date().toISOString().split('T')[0];
      }
      
      if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
        return dateValue;
      }
      
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date');
      }
      
      return date.toISOString().split('T')[0];
    } catch (error) {
      console.warn('⚠️ Date formatting failed, using default:', error.message);
      return new Date().toISOString().split('T')[0];
    }
  }

  getDefaultExpiryDate() {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 1); // 1 year from now
    return date;
  }

  async verifyMedicineExistence(batchNo) {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }
      
      console.log(`🔍 Verifying medicine existence: ${batchNo}`);
      
      // Try different methods to check existence
      let exists = false;
      
      // Method 1: Direct verification
      try {
        if (this.contract.methods.verifyMedicineExistence) {
          exists = await this.contract.methods.verifyMedicineExistence(batchNo).call();
          if (exists) {
            console.log(`✅ Batch ${batchNo} exists on blockchain (direct verification)`);
            return true;
          }
        }
      } catch (error) {
        // Method failed, try next
      }
      
      // Method 2: Check in all batches
      try {
        if (this.contract.methods.getAllBatchNumbers) {
          const allBatches = await this.contract.methods.getAllBatchNumbers().call();
          exists = allBatches.includes(batchNo);
          if (exists) {
            console.log(`✅ Batch ${batchNo} exists on blockchain (in batch list)`);
            return true;
          }
        }
      } catch (error) {
        // Method failed
      }
      
      // Method 3: Try to get medicine data
      try {
        if (this.contract.methods.getMedicine) {
          const medicineData = await this.contract.methods.getMedicine(batchNo).call();
          if (medicineData && medicineData[0] && medicineData[0] !== '') {
            console.log(`✅ Batch ${batchNo} exists on blockchain (data retrieval)`);
            return true;
          }
        }
      } catch (error) {
        // Method failed - batch doesn't exist
      }
      
      console.log(`❌ Batch ${batchNo} not found on blockchain`);
      return false;
      
    } catch (error) {
      console.error('❌ Error verifying medicine existence:', error.message);
      return false;
    }
  }

  async getMedicineFromBlockchain(batchNo) {
    try {
      console.log(`🔎 Fetching medicine data: ${batchNo}`);
      
      // First check if exists
      const exists = await this.verifyMedicineExistence(batchNo);
      if (!exists) {
        return { exists: false, batchNo: batchNo };
      }
      
      // Get complete medicine data
      const medicineData = await this.contract.methods.getMedicine(batchNo).call();
      
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
      
      // Parse packaging JSON
      let packaging = {};
      if (medicine.packaging && medicine.packaging !== '{}') {
        try {
          packaging = JSON.parse(medicine.packaging);
        } catch (parseError) {
          packaging = { raw: medicine.packaging };
        }
      }
      
      return {
        exists: true,
        ...medicine,
        packaging: packaging,
        blockchainVerified: medicine.verified,
        source: this.isRealBlockchain ? 'real_blockchain' : 'local_blockchain',
        network: this.getNetworkName(await this.web3.eth.getChainId()),
        retrievedAt: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('❌ Error getting medicine from blockchain:', error.message);
      return { exists: false, error: error.message, batchNo: batchNo };
    }
  }

  // In blockchainService.js - update getCompleteMedicineFromBlockchain method
async getCompleteMedicineFromBlockchain(batchNo) {
  try {
    console.log(`🔎 Fetching COMPLETE medicine data: ${batchNo}`);
    
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }
    
    // Get complete medicine data (all 16 return values)
    const medicineData = await this.contract.methods.getMedicine(batchNo).call();
    
    // Parse all fields
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
    
    // Parse packaging JSON
    let packaging = {};
    if (medicine.packaging && medicine.packaging !== '{}') {
      try {
        packaging = JSON.parse(medicine.packaging);
      } catch (parseError) {
        packaging = { raw: medicine.packaging };
      }
    }
    
    return {
      exists: true,
      ...medicine,
      packaging: packaging,
      blockchainVerified: medicine.verified,
      retrievedAt: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ Error getting complete medicine data:', error.message);
    return { 
      exists: false, 
      error: error.message, 
      batchNo: batchNo 
    };
  }
}


// Add this new method for signed transactions
// async executeSignedTransaction(method, fromAccount, batchNo) {
//   try {
//     console.log('✍️ Preparing signed transaction...');
    
//     // 1. Get nonce
//     const nonce = await this.web3.eth.getTransactionCount(fromAccount, 'pending');
    
//     // 2. Encode ABI data
//     const data = method.encodeABI();
    
//     // 3. Get gas estimate
//     let gasEstimate;
//     try {
//       gasEstimate = await method.estimateGas({ from: fromAccount });
//     } catch (estimateError) {
//       console.warn('⚠️ Gas estimation failed:', estimateError.message);
//       gasEstimate = 200000; // Default for transfers
//     }
    
//     // 4. Get gas price (Sepolia requires higher gas)
//     const gasPrice = await this.web3.eth.getGasPrice();
//     const sepoliaMinGas = this.web3.utils.toWei('35', 'gwei'); // Sepolia minimum
//     const adjustedGasPrice = BigInt(gasPrice) > BigInt(sepoliaMinGas) ? 
//       gasPrice : sepoliaMinGas;
    
//     // 5. Build transaction object
//     const txObject = {
//       from: fromAccount,
//       to: this.contractAddress,
//       nonce: this.web3.utils.toHex(nonce),
//       gas: this.web3.utils.toHex(Math.floor(gasEstimate * 1.5)),
//       gasPrice: this.web3.utils.toHex(adjustedGasPrice),
//       data: data,
//       chainId: 11155111 // Sepolia chain ID
//     };
    
//     console.log('📄 Transaction object:', {
//       from: txObject.from.substring(0, 10) + '...',
//       to: txObject.to.substring(0, 10) + '...',
//       nonce: txObject.nonce,
//       gas: txObject.gas,
//       gasPrice: `${this.web3.utils.fromWei(adjustedGasPrice, 'gwei')} gwei`,
//       chainId: txObject.chainId
//     });
    
//     // 6. Sign transaction
//     console.log('🔑 Signing transaction...');
//     const signedTx = await this.web3.eth.accounts.signTransaction(
//       txObject, 
//       process.env.DEPLOYER_PRIVATE_KEY
//     );
    
//     if (!signedTx.rawTransaction) {
//       throw new Error('Failed to sign transaction');
//     }
    
//     console.log('✅ Transaction signed successfully');
    
//     // 7. Send signed transaction
//     console.log('📤 Sending signed transaction...');
//     const receipt = await this.web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    
//     console.log(`✅ Transfer successful: ${receipt.transactionHash}`);
    
//     // Track transaction
//     this.trackTransaction(receipt.transactionHash, batchNo);
    
//     return {
//       success: true,
//       transactionHash: receipt.transactionHash,
//       blockNumber: receipt.blockNumber,
//       from: fromAccount,
//       to: toAddress,
//       batchNo: batchNo,
//       explorerUrl: `https://sepolia.etherscan.io/tx/${receipt.transactionHash}`
//     };
    
//   } catch (error) {
//     console.error('❌ Signed transaction failed:', error.message);
//     throw error;
//   }
// }

  // pharmameds
  async getMedicineOwner(batchNo) {
  try {
    console.log(`🔍 Getting owner for batch: ${batchNo}`);
    
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }
    
    // Get complete medicine data
    const medicineData = await this.getMedicineFromBlockchain(batchNo);
    
    if (!medicineData.exists) {
      throw new Error(`Batch ${batchNo} does not exist on blockchain`);
    }
    
    // Return the current owner from blockchain
    return {
      success: true,
      owner: medicineData.currentOwner,
      batchNo: batchNo,
      exists: true
    };
    
  } catch (error) {
    console.error(`❌ Error getting medicine owner for ${batchNo}:`, error.message);
    return {
      success: false,
      error: error.message,
      batchNo: batchNo
    };
  }
}
// TOTALLY FIXED START
  async transferMedicine(batchNo, toAddress, transactionType = 'Transfer', metadata = {}) {
  try {
    console.log(`🔗 Transferring medicine ${batchNo} to ${toAddress}`);
    
    // Verify medicine exists
    const exists = await this.verifyMedicineExistence(batchNo);
    if (!exists) {
      throw new Error(`Medicine ${batchNo} does not exist on blockchain`);
    }
    
    // Get sender account
    const fromAccount = await this.getDefaultAccount();
    

     const metadataString = typeof metadata === 'string' 
      ? metadata  // Already a string
      : JSON.stringify(metadata);

    
    // Prepare transaction
    const method = this.contract.methods.transferMedicine(
      batchNo,
      toAddress,
      transactionType,
      metadataString  // Pass as string, not object
    );
    
    console.log('📦 Preparing transfer transaction...');
    
    // ALWAYS use signed transactions for real blockchain
    if (this.isRealBlockchain || true) { // Force signed for now
      console.log('🔐 Using signed transaction...');
      return await this.executeSignedTransaction(
        method, 
        fromAccount, 
        toAddress, 
        batchNo,
        'transfer'
      );
    } else {
      // For local blockchain only
      return await this.executeLocalTransaction(method, fromAccount, batchNo);
    }
    
  } catch (error) {
    console.error('❌ Transfer failed:', error.message);
    throw error;
  }
}

async getPharmacyBlockchainAddress(pharmacyCompanyId) {
  try {
    // Import PharmacyCompany model
    const PharmacyCompany = (await import('../models/PharmacyCompany.js')).default;
    
    const pharmacy = await PharmacyCompany.findById(pharmacyCompanyId)
      .select('blockchainAddress name');
    
    if (!pharmacy) {
      throw new Error('Pharmacy company not found');
    }
    
    // If pharmacy has blockchain address, use it
    if (pharmacy.blockchainAddress && pharmacy.blockchainAddress.trim() !== '') {
      return pharmacy.blockchainAddress;
    }
    
    // Otherwise, use the deployer/signer address (for testing)
    console.warn(`⚠️ Pharmacy "${pharmacy.name}" has no blockchain address, using default account`);
    return await this.getDefaultAccount();
    
  } catch (error) {
    console.error('Error getting pharmacy blockchain address:', error);
    return await this.getDefaultAccount(); // Fallback
  }
}


// Add this new method for ALL signed transactions
async executeSignedTransaction(method, fromAccount, toAddress, batchNo, action = 'generic') {
  try {
    console.log('✍️ Creating signed transaction...');
    
    // 1. Get nonce
    const nonce = await this.web3.eth.getTransactionCount(fromAccount, 'pending');
    console.log(`📝 Nonce: ${nonce}`);
    
    // 2. Encode ABI data
    const data = method.encodeABI();
    console.log(`📄 Data encoded: ${data.substring(0, 50)}...`);
    
    // 3. Estimate gas (optional, can use fixed amount)
    let gasLimit = 200000; // Default for transfers
    try {
      const gasEstimate = await method.estimateGas({ from: fromAccount });
      gasLimit = Math.floor(gasEstimate * 1.5);
      console.log(`⛽ Estimated gas: ${gasEstimate}, Using: ${gasLimit}`);
    } catch (estimateError) {
      console.warn('⚠️ Gas estimation failed, using default:', estimateError.message);
    }
    
    // 4. Get gas price - Sepolia requires minimum 35 gwei
    const networkGasPrice = await this.web3.eth.getGasPrice();
    const sepoliaMinGas = this.web3.utils.toWei('35', 'gwei'); // 35 gwei minimum for Sepolia
    
    // Use whichever is higher
    let gasPrice;
    if (BigInt(networkGasPrice) > BigInt(sepoliaMinGas)) {
      gasPrice = networkGasPrice;
    } else {
      gasPrice = sepoliaMinGas;
      console.log(`⚠️ Network gas too low (${this.web3.utils.fromWei(networkGasPrice, 'gwei')} gwei), using Sepolia minimum: 35 gwei`);
    }
    
    console.log(`💰 Gas price: ${this.web3.utils.fromWei(gasPrice, 'gwei')} gwei`);
    
    // 5. Build transaction object
    const txObject = {
      from: fromAccount,
      to: this.contractAddress,
      nonce: this.web3.utils.toHex(nonce),
      gas: this.web3.utils.toHex(gasLimit),
      gasPrice: this.web3.utils.toHex(gasPrice),
      data: data,
      chainId: 11155111, // Sepolia chain ID
      value: '0x0'
    };
    
    console.log('📦 Transaction object ready for signing');
    
    // 6. Sign the transaction
    console.log('🔑 Signing with private key...');
    
    // Get private key from environment
    const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
    if (!privateKey) {
      throw new Error('DEPLOYER_PRIVATE_KEY not found in environment');
    }
    
    // Clean the private key
    const cleanPrivateKey = privateKey.trim();
    
    // Sign using web3
    const signedTx = await this.web3.eth.accounts.signTransaction(txObject, cleanPrivateKey);
    
    if (!signedTx.rawTransaction) {
      throw new Error('Failed to sign transaction');
    }
    
    console.log(`✅ Transaction signed successfully`);
    console.log(`📄 Raw transaction length: ${signedTx.rawTransaction.length}`);
    
    // 7. Send the signed transaction
    console.log('📤 Sending to blockchain...');
    const receipt = await this.web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    
    console.log(`🎉 Transaction confirmed!`);
    console.log(`📝 Hash: ${receipt.transactionHash}`);
    console.log(`📦 Block: ${receipt.blockNumber}`);
    console.log(`⛽ Gas used: ${receipt.gasUsed}`);
    
    // Track transaction
    this.trackTransaction(receipt.transactionHash, batchNo);
    
    return {
      success: true,
      transactionHash: receipt.transactionHash,
      blockNumber: receipt.blockNumber,
      from: fromAccount,
      to: toAddress,
      batchNo: batchNo,
      gasUsed: receipt.gasUsed.toString(),
      explorerUrl: `https://sepolia.etherscan.io/tx/${receipt.transactionHash}`,
      action: action
    };
    
  } catch (error) {
    console.error('❌ Signed transaction execution failed:', {
      message: error.message,
      code: error.code,
      reason: error.reason
    });
    
    // Provide helpful error messages
    if (error.message.includes('insufficient funds')) {
      // Check balance
      const balance = await this.web3.eth.getBalance(fromAccount);
      const ethBalance = this.web3.utils.fromWei(balance, 'ether');
      throw new Error(`Insufficient ETH for gas. Balance: ${ethBalance} ETH. Get test ETH from faucet.`);
    }
    
    if (error.message.includes('nonce too low')) {
      const currentNonce = await this.web3.eth.getTransactionCount(fromAccount, 'pending');
      throw new Error(`Nonce error. Current nonce: ${currentNonce}`);
    }
    
    if (error.message.includes('revert')) {
      throw new Error(`Transaction reverted: ${error.reason || 'Check contract requirements'}`);
    }
    
    throw error;
  }
}


// async updateMedicineOnBlockchain(batchNo, status, pharmacy, quantity) {
//   try {
//     console.log(`🔄 Updating medicine ${batchNo} on blockchain...`);
    
//     // Get sender account
//     const fromAccount = await this.getDefaultAccount();
    
//     // Prepare transaction
//     const method = this.contract.methods.updateMedicine(
//       batchNo,
//       status,
//       pharmacy,
//       BigInt(quantity || 1)
//     );
    
//     console.log('📝 Update data:', { batchNo, status, pharmacy, quantity });
    
//     // Use signed transaction
//     return await this.executeSignedTransaction(
//       method, 
//       fromAccount, 
//       this.contractAddress, 
//       batchNo,
//       'update_medicine'
//     );
    
//   } catch (error) {
//     console.error('❌ Update medicine failed:', error.message);
//     throw error;
//   }
// }
async updateMedicineOnBlockchain(batchNo, status, pharmacy, quantity) {
  try {
    console.log(`🔄 Updating medicine ${batchNo} on blockchain...`);
    
    // Validate inputs
    if (!batchNo || !status || !pharmacy) {
      throw new Error("Missing required update parameters");
    }
    
    console.log('📝 Update parameters:', {
      batchNo,
      status,
      pharmacy,
      quantity: quantity || 'Not provided'
    });
    
    // First verify medicine exists
    const exists = await this.verifyMedicineExistence(batchNo);
    if (!exists) {
      throw new Error(`Medicine ${batchNo} does not exist on blockchain`);
    }
    
    // Get current medicine data to compare
    const currentData = await this.getMedicineFromBlockchain(batchNo);
    console.log('📋 Current medicine data:', {
      currentPharmacy: currentData.pharmacy,
      currentStatus: currentData.status,
      currentQuantity: currentData.quantity
    });
    
    // Get sender account
    const fromAccount = await this.getDefaultAccount();
    
    // Convert quantity safely - use current quantity if not provided
    let quantityForContract;
    try {
      quantityForContract = BigInt(quantity || currentData.quantity || 1);
    } catch (conversionError) {
      console.warn('⚠️ Quantity conversion failed, using default:', conversionError.message);
      quantityForContract = 1n;
    }
    
    console.log('🔢 Quantity for contract:', {
      provided: quantity,
      current: currentData.quantity,
      using: quantityForContract.toString()
    });
    
    // Prepare transaction - updateMedicine(batchNo, status, pharmacy, quantity)
    const method = this.contract.methods.updateMedicine(
      batchNo,
      status,
      pharmacy,
      quantityForContract
    );
    
    console.log('📋 Calling updateMedicine on contract...');
    
    // Use signed transaction
    const result = await this.executeSignedTransaction(
      method, 
      fromAccount, 
      this.contractAddress, 
      batchNo,
      'update_medicine'
    );
    
    // Verify the update was successful
    console.log('🔍 Verifying update was successful...');
    try {
      const updatedData = await this.getMedicineFromBlockchain(batchNo);
      console.log('✅ Verified updated data:', {
        pharmacy: updatedData.pharmacy,
        status: updatedData.status,
        quantity: updatedData.quantity
      });
    } catch (verifyError) {
      console.warn('⚠️ Could not verify update:', verifyError.message);
    }
    
    return result;
    
  } catch (error) {
    console.error('❌ Update medicine failed:', {
      message: error.message,
      batchNo: batchNo,
      stack: error.stack
    });
    
    // Provide helpful error messages
    if (error.message.includes('Not the current owner')) {
      throw new Error('You are not the current owner of this medicine');
    } else if (error.message.includes('revert')) {
      throw new Error(`Transaction reverted: ${error.reason || 'Update failed'}`);
    } else if (error.message.includes('Medicine does not exist')) {
      throw new Error(`Medicine ${batchNo} does not exist on blockchain`);
    }
    
    throw new Error(`Failed to update medicine: ${error.message}`);
  }
}



// Update the verifyMedicine method to also use signed transactions
async verifyMedicine(batchNo) {
  try {
    console.log(`✅ Verifying medicine ${batchNo} on blockchain`);
    
    // Verify medicine exists
    const exists = await this.verifyMedicineExistence(batchNo);
    if (!exists) {
      throw new Error(`Medicine ${batchNo} does not exist on blockchain`);
    }
    
    // Get verifier account
    const verifierAccount = await this.getDefaultAccount();
    
    // Prepare transaction
    const method = this.contract.methods.verifyMedicine(batchNo);
    
    console.log('📦 Preparing verification transaction...');
    
    // Use signed transaction
    return await this.executeSignedTransaction(
      method, 
      verifierAccount, 
      this.contractAddress, 
      batchNo,
      'verification'
    );
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    throw error;
  }
}

// Keep local transaction method for testing
async executeLocalTransaction(method, fromAccount, batchNo) {
  console.log('📤 Using direct transaction for local blockchain...');
  
  const gasEstimate = await method.estimateGas({ from: fromAccount });
  
  const txConfig = {
    from: fromAccount,
    gas: Math.floor(gasEstimate * 1.2)
  };
  
  const transaction = await method.send(txConfig);
  
  console.log(`✅ Transfer successful: ${transaction.transactionHash}`);
  
  this.trackTransaction(transaction.transactionHash, batchNo);
  
  return {
    success: true,
    transactionHash: transaction.transactionHash,
    from: fromAccount,
    batchNo: batchNo,
    blockNumber: transaction.blockNumber
  };
}

async executeSignedVerification(method, verifierAccount, batchNo) {
  try {
    console.log('✍️ Preparing signed verification transaction...');
    
    // 1. Get nonce
    const nonce = await this.web3.eth.getTransactionCount(verifierAccount, 'pending');
    
    // 2. Encode ABI data
    const data = method.encodeABI();
    
    // 3. Get gas price
    const gasPrice = await this.web3.eth.getGasPrice();
    const sepoliaMinGas = this.web3.utils.toWei('35', 'gwei');
    const adjustedGasPrice = BigInt(gasPrice) > BigInt(sepoliaMinGas) ? 
      gasPrice : sepoliaMinGas;
    
    // 4. Build transaction object
    const txObject = {
      from: verifierAccount,
      to: this.contractAddress,
      nonce: this.web3.utils.toHex(nonce),
      gas: this.web3.utils.toHex(150000), // Fixed gas for verification
      gasPrice: this.web3.utils.toHex(adjustedGasPrice),
      data: data,
      chainId: 11155111
    };
    
    // 5. Sign transaction
    const signedTx = await this.web3.eth.accounts.signTransaction(
      txObject, 
      process.env.DEPLOYER_PRIVATE_KEY
    );
    
    if (!signedTx.rawTransaction) {
      throw new Error('Failed to sign verification transaction');
    }
    
    // 6. Send signed transaction
    const receipt = await this.web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    
    console.log(`✅ Verification successful: ${receipt.transactionHash}`);
    
    this.trackTransaction(receipt.transactionHash, batchNo);
    
    return {
      success: true,
      transactionHash: receipt.transactionHash,
      verifiedBy: verifierAccount,
      batchNo: batchNo,
      verifiedAt: new Date().toISOString(),
      blockNumber: receipt.blockNumber,
      explorerUrl: `https://sepolia.etherscan.io/tx/${receipt.transactionHash}`
    };
    
  } catch (error) {
    console.error('❌ Signed verification failed:', error.message);
    throw error;
  }
}

  getExplorerUrl(txHashOrAddress) {
    if (!this.isRealBlockchain) {
      return null;
    }
    
    const network = this.network.toLowerCase();
    
    if (network.includes('sepolia')) {
      return `https://sepolia.etherscan.io/tx/${txHashOrAddress}`;
    } else if (network.includes('goerli')) {
      return `https://goerli.etherscan.io/tx/${txHashOrAddress}`;
    } else if (network.includes('mainnet') || network.includes('ethereum')) {
      return `https://etherscan.io/tx/${txHashOrAddress}`;
    } else if (network.includes('mumbai')) {
      return `https://mumbai.polygonscan.com/tx/${txHashOrAddress}`;
    } else if (network.includes('polygon')) {
      return `https://polygonscan.com/tx/${txHashOrAddress}`;
    } else if (network.includes('bnb')) {
      return `https://bscscan.com/tx/${txHashOrAddress}`;
    }
    
    return null;
  }

  trackTransaction(txHash, batchNo) {
    this.pendingTransactions.set(txHash, {
      batchNo: batchNo,
      addedAt: new Date(),
      status: 'pending'
    });
    
    console.log(`📝 Tracking transaction ${txHash} for batch ${batchNo}`);
  }

  startTransactionMonitoring() {
    if (this.monitoringInterval) {
      return;
    }
    
    // Check transaction status every 10 seconds
    this.monitoringInterval = setInterval(async () => {
      await this.checkPendingTransactions();
    }, 10000);
    
    console.log('🔍 Started transaction monitoring');
  }

  async checkPendingTransactions() {
    if (this.pendingTransactions.size === 0) {
      return;
    }
    
    console.log(`🔍 Checking ${this.pendingTransactions.size} pending transactions...`);
    
    for (const [txHash, data] of this.pendingTransactions.entries()) {
      try {
        const receipt = await this.web3.eth.getTransactionReceipt(txHash);
        
        if (receipt) {
          // Transaction confirmed
          const confirmations = (await this.web3.eth.getBlockNumber()) - receipt.blockNumber;
          const isConfirmed = confirmations >= 1;
          
          if (isConfirmed) {
            console.log(`✅ Transaction ${txHash} confirmed for batch ${data.batchNo}`);
            console.log(`   Block: ${receipt.blockNumber}, Confirmations: ${confirmations}`);
            
            // Update transaction status
            this.pendingTransactions.set(txHash, {
              ...data,
              status: 'confirmed',
              blockNumber: receipt.blockNumber,
              confirmations: confirmations,
              confirmedAt: new Date()
            });
            
            // You could emit an event or callback here to notify other parts of the system
          } else {
            console.log(`⏳ Transaction ${txHash} pending (${confirmations} confirmations)`);
          }
        } else {
          console.log(`⏳ Transaction ${txHash} still in mempool`);
        }
      } catch (error) {
        console.error(`❌ Error checking transaction ${txHash}:`, error.message);
      }
    }
    
    // Clean up old confirmed transactions (older than 1 hour)
    const oneHourAgo = new Date(Date.now() - 3600000);
    for (const [txHash, data] of this.pendingTransactions.entries()) {
      if (data.status === 'confirmed' && data.confirmedAt < oneHourAgo) {
        this.pendingTransactions.delete(txHash);
        console.log(`🗑️ Removed old transaction ${txHash} from tracking`);
      }
    }
  }

  async getTransactionStatus(txHash) {
    try {
      const receipt = await this.web3.eth.getTransactionReceipt(txHash);
      
      if (!receipt) {
        return {
          exists: false,
          status: 'pending',
          message: 'Transaction not yet mined'
        };
      }
      
      const confirmations = (await this.web3.eth.getBlockNumber()) - receipt.blockNumber;
      
      return {
        exists: true,
        status: receipt.status ? 'success' : 'failed',
        blockNumber: receipt.blockNumber,
        confirmations: confirmations,
        gasUsed: receipt.gasUsed.toString(),
        logs: receipt.logs.length,
        explorerUrl: this.getExplorerUrl(txHash)
      };
      
    } catch (error) {
      console.error('❌ Error getting transaction status:', error);
      return {
        exists: false,
        status: 'error',
        error: error.message
      };
    }
  }

  async getAllBatchesOnBlockchain() {
    try {
      if (!this.contract || !this.contract.methods.getAllBatchNumbers) {
        throw new Error('Contract not initialized or method not available');
      }
      
      console.log('📋 Getting all batches from blockchain...');
      
      const batchNumbers = await this.contract.methods.getAllBatchNumbers().call();
      
      console.log(`✅ Found ${batchNumbers.length} batches on blockchain`);
      
      // Get details for each batch
      const batches = [];
      for (const batchNo of batchNumbers.slice(0, 50)) { // Limit to 50 for performance
        try {
          const medicine = await this.getMedicineFromBlockchain(batchNo);
          if (medicine.exists) {
            batches.push(medicine);
          }
        } catch (error) {
          console.warn(`⚠️ Could not get details for batch ${batchNo}:`, error.message);
        }
      }
      
      return {
        total: batchNumbers.length,
        batches: batches,
        batchNumbers: batchNumbers
      };
      
    } catch (error) {
      console.error('❌ Error getting all batches:', error);
      throw error;
    }
  }

  async checkBalance(address) {
    try {
      const balance = await this.web3.eth.getBalance(address);
      const ethBalance = this.web3.utils.fromWei(balance, 'ether');
      
      return {
        address: address,
        balance: ethBalance,
        balanceWei: balance.toString(),
        hasEnough: parseFloat(ethBalance) > 0.001,
        formatted: `${ethBalance} ETH`
      };
    } catch (error) {
      console.error('❌ Error checking balance:', error);
      throw error;
    }
  }

  async getFaucetLinks(address) {
    if (!this.isRealBlockchain) {
      return [];
    }
    
    const network = this.network.toLowerCase();
    const faucets = [];
    
    if (network.includes('sepolia')) {
      faucets.push({
        name: 'Sepolia Faucet',
        url: `https://sepoliafaucet.com?address=${address}`,
        description: 'Chainlink faucet for Sepolia ETH'
      });
      faucets.push({
        name: 'QuickNode Faucet',
        url: `https://faucet.quicknode.com/ethereum/sepolia?address=${address}`,
        description: 'QuickNode faucet (requires account)'
      });
    } else if (network.includes('goerli')) {
      faucets.push({
        name: 'Goerli Faucet',
        url: `https://goerlifaucet.com?address=${address}`,
        description: 'Alchemy faucet for Goerli ETH'
      });
    } else if (network.includes('mumbai')) {
      faucets.push({
        name: 'Polygon Faucet',
        url: `https://faucet.polygon.technology?address=${address}`,
        description: 'Official Polygon faucet'
      });
    }
    
    return faucets;
  }

  // Health check method
  async healthCheck() {
    try {
      const networkInfo = await this.getNetworkInfo();
      const isHealthy = networkInfo.connected && networkInfo.healthy;
      
      return {
        service: 'BlockchainService',
        healthy: isHealthy,
        isRealBlockchain: this.isRealBlockchain,
        contractInitialized: !!this.contract,
        pendingTransactions: this.pendingTransactions.size,
        network: networkInfo.details?.networkName || 'Unknown',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        service: 'BlockchainService',
        healthy: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Cleanup method
  async cleanup() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    
    this.pendingTransactions.clear();
    console.log('🧹 Blockchain service cleaned up');
  }
}

// Create and export singleton instance
const blockchainService = new BlockchainService();
export default blockchainService;

// Auto-initialize
setTimeout(() => {
  if (!blockchainService.isAvailable) {
    console.warn('⚠️ Blockchain service auto-initialization failed');
  }
}, 5000);
