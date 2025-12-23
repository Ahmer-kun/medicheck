import Web3 from 'web3';
import dotenv from 'dotenv';

dotenv.config();

async function testSignedTransaction() {
  try {
    const web3 = new Web3(process.env.BLOCKCHAIN_NETWORK);
    const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
    
    console.log('🔑 Testing signed transaction...');
    
    // 1. Create account from private key
    const account = web3.eth.accounts.privateKeyToAccount(privateKey);
    console.log('Account address:', account.address);
    
    // 2. Get nonce
    const nonce = await web3.eth.getTransactionCount(account.address, 'pending');
    console.log('Nonce:', nonce);
    
    // 3. Get gas price
    const gasPrice = await web3.eth.getGasPrice();
    const minGas = web3.utils.toWei('35', 'gwei');
    const adjustedGasPrice = BigInt(gasPrice) > BigInt(minGas) ? gasPrice : minGas;
    console.log('Gas price:', web3.utils.fromWei(adjustedGasPrice, 'gwei'), 'gwei');
    
    // 4. Create simple transaction
    const txObject = {
      from: account.address,
      to: account.address, // Send to self for testing
      value: '0',
      nonce: web3.utils.toHex(nonce),
      gas: web3.utils.toHex(21000),
      gasPrice: web3.utils.toHex(adjustedGasPrice),
      chainId: 11155111
    };
    
    console.log('Transaction object:', txObject);
    
    // 5. Sign transaction
    const signedTx = await web3.eth.accounts.signTransaction(txObject, privateKey);
    console.log('Signed transaction:', signedTx.transactionHash ? 'SUCCESS' : 'FAILED');
    
    if (signedTx.rawTransaction) {
      // 6. Send signed transaction
      console.log('Sending signed transaction...');
      const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
      console.log('✅ Transaction successful!');
      console.log('Hash:', receipt.transactionHash);
      console.log('Block:', receipt.blockNumber);
      console.log('Explorer:', `https://sepolia.etherscan.io/tx/${receipt.transactionHash}`);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testSignedTransaction();