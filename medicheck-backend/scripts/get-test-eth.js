#!/usr/bin/env node

import dotenv from 'dotenv';
import { ethers } from 'ethers';

dotenv.config();

console.log('🎯 MEDICHECK TEST ETH GETTER');
console.log('============================\n');

const networks = {
  1: { name: 'Sepolia', faucets: [
    'https://sepoliafaucet.com',
    'https://faucet.quicknode.com/ethereum/sepolia',
    'https://www.infura.io/faucet/sepolia'
  ]},
  2: { name: 'Polygon Mumbai', faucets: [
    'https://faucet.polygon.technology',
    'https://mumbaifaucet.com'
  ]},
  3: { name: 'BNB Testnet', faucets: [
    'https://testnet.bnbchain.org/faucet-smart',
    'https://bnbchain.org/en/testnet-faucet'
  ]}
};

console.log('📋 Available Networks:');
console.log('1. Sepolia (Ethereum Testnet)');
console.log('2. Polygon Mumbai');
console.log('3. BNB Smart Chain Testnet\n');

const readline = await import('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Select network (1-3): ', async (choice) => {
  const selected = networks[choice];
  
  if (!selected) {
    console.log('❌ Invalid choice');
    rl.close();
    return;
  }
  
  console.log(`\n🎯 Selected: ${selected.name}`);
  
  rl.question('Enter your wallet address: ', (address) => {
    console.log(`\n🔗 Your Address: ${address}`);
    console.log(`\n🚰 Available Faucets for ${selected.name}:`);
    
    selected.faucets.forEach((faucet, index) => {
      console.log(`${index + 1}. ${faucet}`);
    });
    
    console.log('\n📝 Instructions:');
    console.log('1. Visit any faucet URL above');
    console.log('2. Paste your wallet address');
    console.log('3. Complete any verification/CAPTCHA');
    console.log('4. Wait 1-5 minutes for ETH to arrive');
    console.log('\n✅ Done! Check your balance in MetaMask.');
    
    rl.close();
  });
});