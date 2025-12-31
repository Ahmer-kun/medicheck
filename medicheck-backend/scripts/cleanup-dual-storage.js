// scripts/cleanup-dual-storage.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

async function cleanupDualStorage() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    const Batch = (await import('../models/Batch.js')).default;
    
    // Find batches where dual storage failed
    const failedBatches = await Batch.find({
      dualStorageStatus: { $in: ['failed', 'rolled_back'] },
      createdAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Older than 24 hours
    });
    
    console.log(`🔍 Found ${failedBatches.length} failed dual storage batches`);
    
    for (const batch of failedBatches) {
      console.log(`🗑️ Cleaning up batch: ${batch.batchNo} (${batch.dualStorageStatus})`);
      await batch.deleteOne();
    }
    
    console.log('✅ Cleanup completed');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    process.exit(1);
  }
}

cleanupDualStorage();