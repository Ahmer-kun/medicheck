import { ethers } from 'ethers';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

class TransactionMonitor {
  constructor() {
    this.provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_NETWORK);
    this.pendingTransactions = new Map();
    this.isMonitoring = false;
  }
  
  async startMonitoring() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    console.log('🔍 Starting blockchain transaction monitor...');
    
    // Check every 15 seconds
    setInterval(async () => {
      await this.checkPendingTransactions();
    }, 15000);
  }
  
  async addPendingTransaction(txHash, batchNo, batchId) {
    this.pendingTransactions.set(txHash, { batchNo, batchId, addedAt: new Date() });
    console.log(`📝 Tracking transaction ${txHash} for batch ${batchNo}`);
    
    // Start monitoring if not already
    await this.startMonitoring();
  }
  
  async checkPendingTransactions() {
    if (this.pendingTransactions.size === 0) return;
    
    console.log(`🔍 Checking ${this.pendingTransactions.size} pending transactions...`);
    
    for (const [txHash, data] of this.pendingTransactions.entries()) {
      try {
        const receipt = await this.provider.getTransactionReceipt(txHash);
        
        if (receipt) {
          const isConfirmed = receipt.confirmations >= 1;
          
          if (isConfirmed) {
            console.log(`✅ Transaction ${txHash} confirmed for batch ${data.batchNo}`);
            
            // Update database
            await this.updateDatabase(data.batchId, {
              blockchainVerified: true,
              transactionHash: txHash,
              blockNumber: receipt.blockNumber,
              confirmations: receipt.confirmations,
              gasUsed: receipt.gasUsed.toString(),
              verifiedAt: new Date()
            });
            
            // Remove from tracking
            this.pendingTransactions.delete(txHash);
          } else {
            console.log(`⏳ Transaction ${txHash} pending (${receipt.confirmations} confirmations)`);
          }
        } else {
          console.log(`⏳ Transaction ${txHash} still in mempool`);
        }
      } catch (error) {
        console.error(`❌ Error checking transaction ${txHash}:`, error.message);
      }
    }
  }
  
  async updateDatabase(batchId, updateData) {
    try {
      const Batch = (await import('../models/Batch.js')).default;
      await Batch.findByIdAndUpdate(batchId, updateData);
      console.log(`✅ Updated batch ${batchId} with blockchain verification`);
    } catch (error) {
      console.error('❌ Error updating database:', error);
    }
  }
}

export default new TransactionMonitor();