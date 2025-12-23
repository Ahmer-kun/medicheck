// scripts/
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

async function fixDuplicateBatches() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    const Batch = (await import('../models/Batch.js')).default;
    const PharmacyMedicine = (await import('../models/PharmacyMedicine.js')).default;
    
    console.log('🔍 Finding duplicate batches...');
    
    // Get all batches
    const allBatches = await Batch.find({});
    console.log(`Total batches: ${allBatches.length}`);
    
    // Group by batch number
    const batchGroups = {};
    allBatches.forEach(batch => {
      if (!batchGroups[batch.batchNo]) {
        batchGroups[batch.batchNo] = [];
      }
      batchGroups[batch.batchNo].push(batch);
    });
    
    // Find duplicates
    const duplicates = Object.keys(batchGroups).filter(batchNo => 
      batchGroups[batchNo].length > 1
    );
    
    console.log(`Found ${duplicates.length} duplicate batch numbers`);
    
    // Fix each duplicate
    for (const batchNo of duplicates) {
      const batches = batchGroups[batchNo];
      console.log(`\nProcessing ${batchNo}: ${batches.length} duplicates`);
      
      // Sort by creation date (oldest first)
      batches.sort((a, b) => a.createdAt - b.createdAt);
      
      // Keep the oldest one as original
      const originalBatch = batches[0];
      const duplicatesToRemove = batches.slice(1);
      
      console.log(`Keeping original: ${originalBatch._id} (created: ${originalBatch.createdAt})`);
      
      // For each duplicate, check if it's linked to a pharmacy
      for (const duplicate of duplicatesToRemove) {
        const pharmacyMedicine = await PharmacyMedicine.findOne({ 
          batchNo: batchNo,
          originalBatchId: duplicate._id 
        });
        
        if (pharmacyMedicine) {
          // Update pharmacy medicine to point to original batch
          console.log(`Updating pharmacy medicine ${pharmacyMedicine._id} to point to original batch`);
          pharmacyMedicine.originalBatchId = originalBatch._id;
          await pharmacyMedicine.save();
        }
        
        // Delete duplicate batch
        console.log(`Deleting duplicate batch: ${duplicate._id}`);
        await Batch.findByIdAndDelete(duplicate._id);
      }
    }
    
    console.log('\n✅ Duplicate cleanup completed!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixDuplicateBatches();