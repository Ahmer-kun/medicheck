import { ethers } from 'ethers';

async function checkContract() {
  try {
    const provider = new ethers.JsonRpcProvider('http://localhost:8545');
    const address = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
    
    console.log('Checking contract at address:', address);
    
    // Get contract code
    const code = await provider.getCode(address);
    console.log('Contract code length:', code.length);
    
    if (code === '0x' || code.length <= 2) {
      console.log('Contract NOT FOUND at this address');
      console.log('Need to deploy contract first');
    } else {
      console.log('Contract EXISTS at this address');
      console.log('Code (first 100 chars):', code.substring(0, 100));
    }
    
    // Get network info
    const network = await provider.getNetwork();
    console.log('🌐 Network:', network);
    
    // Get accounts
    const accounts = await provider.listAccounts();
    console.log('Available accounts:', accounts.length);
    console.log('First account:', accounts[0]);
    
  } catch (error) {
    console.error('Error checking contract:', error.message);
  }
}

checkContract();