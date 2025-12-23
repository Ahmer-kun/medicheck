// Create new file: services/syncWorker.js
import BlockchainSyncQueue from "../models/BlockchainSyncQueue.js";
import TemporaryBatch from "../models/TemporaryBatch.js";
import Batch from "../models/Batch.js";
import PharmacyMedicine from "../models/PharmacyMedicine.js";
import BlockchainService from "./blockchainService.js";

class SyncWorker {
  constructor() {
    this.isRunning = false;
    this.syncInterval = 30000; // 30 seconds
  }

  async start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log("🔄 Starting background sync worker...");
    
    // Initial sync
    await this.performSync();
    
    // Set up interval
    this.interval = setInterval(async () => {
      await this.performSync();
    }, this.syncInterval);
  }

  async stop() {
    if (this.interval) {
      clearInterval(this.interval);
    }
    this.isRunning = false;
    console.log("🛑 Stopped background sync worker");
  }

  async performSync() {
    try {
      console.log("🔄 Running background sync...");
      
      // Sync blockchain queue (MongoDB → Blockchain)
      await this.syncBlockchainQueue();
      
      // Sync temporary batches (Blockchain → MongoDB)
      await this.syncTemporaryBatches();
      
      console.log("✅ Background sync completed");
    } catch (error) {
      console.error("❌ Background sync failed:", error);
    }
  }

  async syncBlockchainQueue() {
    try {
      const pendingItems = await BlockchainSyncQueue.find({
        status: 'pending',
        $or: [
          { nextRetry: { $lte: new Date() } },
          { nextRetry: { $exists: false } }
        ],
        retryCount: { $lt: 5 }
      }).limit(10);

      for (const item of pendingItems) {
        try {
          console.log(`🔄 Syncing ${item.batchNo} to blockchain...`);
          
          item.status = 'processing';
          item.lastAttempt = new Date();
          await item.save();

          const result = await BlockchainService.registerCompleteMedicine(item.data);
          
          item.status = 'completed';
          item.successData = {
            transactionHash: result.transactionHash,
            blockNumber: result.blockNumber
          };
          await item.save();

          console.log(`✅ Synced ${item.batchNo} to blockchain`);
          
        } catch (error) {
          console.error(`❌ Failed to sync ${item.batchNo}:`, error.message);
          
          item.status = 'failed';
          item.retryCount += 1;
          item.error = error.message;
          await item.save();
        }
      }
    } catch (error) {
      console.error("Error in blockchain sync queue:", error);
    }
  }

  async syncTemporaryBatches() {
    try {
      const temporaryBatches = await TemporaryBatch.find({
        syncedToMongo: false,
        syncAttempts: { $lt: 5 }
      }).limit(10);

      for (const tempBatch of temporaryBatches) {
        try {
          console.log(`🔄 Syncing ${tempBatch.batchNo} to MongoDB...`);
          
          tempBatch.syncAttempts += 1;
          tempBatch.lastSyncAttempt = new Date();
          
          // Check which collection to save to
          if (tempBatch.pharmacyCompany) {
            // Save to PharmacyMedicine
            await PharmacyMedicine.create({
              ...tempBatch.toObject(),
              _id: undefined, // Let MongoDB generate new ID
              syncedToMongo: true
            });
          } else {
            // Save to Batch
            await Batch.create({
              ...tempBatch.toObject(),
              _id: undefined, // Let MongoDB generate new ID
              syncedToMongo: true
            });
          }
          
          tempBatch.syncedToMongo = true;
          await tempBatch.save();
          
          console.log(`✅ Synced ${tempBatch.batchNo} to MongoDB`);
          
        } catch (error) {
          console.error(`❌ Failed to sync ${tempBatch.batchNo} to MongoDB:`, error.message);
          tempBatch.syncError = error.message;
          await tempBatch.save();
        }
      }
    } catch (error) {
      console.error("Error in temporary batch sync:", error);
    }
  }
}

// Export singleton
export default new SyncWorker();