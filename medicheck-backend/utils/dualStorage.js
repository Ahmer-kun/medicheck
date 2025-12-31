// utils/dualStorage.js
import Batch from '../models/Batch.js';
import PharmacyMedicine from '../models/PharmacyMedicine.js';

/**
 * Execute strict dual storage operation
 * Rolls back MongoDB if blockchain fails
 * @param {Object} options
 * @returns {Promise<Object>} Result object
 */
export const executeDualStorage = async (options) => {
  const {
    mongoModel, // 'Batch' or 'PharmacyMedicine'
    mongoData,  // Data for MongoDB
    blockchainData, // Data for blockchain
    operation = 'create' // 'create' or 'update'
  } = options;

  let mongoResult = null;
  
  try {
    console.log('🔄 Executing strict dual storage...');
    
    // Step 1: Save to MongoDB
    console.log('📝 Step 1: Storing in MongoDB...');
    
    if (mongoModel === 'Batch') {
      const newBatch = new Batch({
        ...mongoData,
        blockchainVerified: false,
        dualStorageStatus: 'pending'
      });
      mongoResult = await newBatch.save();
    } else if (mongoModel === 'PharmacyMedicine') {
      const newMedicine = new PharmacyMedicine({
        ...mongoData,
        blockchainVerified: false,
        dualStorageStatus: 'pending'
      });
      mongoResult = await newMedicine.save();
    } else {
      throw new Error(`Invalid mongoModel: ${mongoModel}`);
    }
    
    console.log('✅ MongoDB storage successful');
    
    // Step 2: Save to Blockchain
    console.log('🔗 Step 2: Storing on Blockchain...');
    const BlockchainService = (await import('../services/blockchainService.js')).default;
    const blockchainResult = await BlockchainService.registerCompleteMedicine(blockchainData);
    console.log('✅ Blockchain storage successful');
    
    // Step 3: Update MongoDB with blockchain verification
    mongoResult.blockchainVerified = true;
    mongoResult.blockchainTransactionHash = blockchainResult.transactionHash;
    mongoResult.blockchainBlockNumber = blockchainResult.blockNumber;
    mongoResult.dualStorageStatus = 'completed';
    await mongoResult.save();
    
    console.log(`🎉 DUAL STORAGE SUCCESSFUL for ${mongoData.batchNo}`);
    
    return {
      success: true,
      mongo: mongoResult,
      blockchain: blockchainResult,
      status: 'fully_synced'
    };
    
  } catch (error) {
    console.error('❌ Dual storage failed:', error.message);
    
    // If MongoDB succeeded but blockchain failed, ROLLBACK
    if (mongoResult && mongoResult._id) {
      console.log('🔄 Rolling back MongoDB entry due to blockchain failure...');
      try {
        if (mongoModel === 'Batch') {
          await Batch.findByIdAndDelete(mongoResult._id);
        } else if (mongoModel === 'PharmacyMedicine') {
          await PharmacyMedicine.findByIdAndDelete(mongoResult._id);
        }
        console.log('✅ MongoDB entry rolled back successfully');
      } catch (rollbackError) {
        console.error('❌ Failed to rollback MongoDB entry:', rollbackError.message);
      }
    }
    
    throw new Error(`Dual storage failed: ${error.message}`);
  }
};

/**
 * Verify dual storage is working
 * @param {string} batchNo
 * @returns {Promise<Object>} Verification result
 */
export const verifyDualStorage = async (batchNo) => {
  try {
    console.log(`🔍 Verifying dual storage for ${batchNo}...`);
    
    const BlockchainService = (await import('../services/blockchainService.js')).default;
    
    // Check MongoDB
    const mongoBatch = await Batch.findOne({ batchNo });
    const mongoPharmacy = await PharmacyMedicine.findOne({ batchNo });
    
    // Check blockchain
    const blockchainExists = await BlockchainService.verifyMedicineExistence(batchNo);
    
    const result = {
      batchNo,
      mongoExists: !!(mongoBatch || mongoPharmacy),
      blockchainExists,
      dualStorageComplete: (mongoBatch || mongoPharmacy) && blockchainExists,
      details: {
        mongoBatch: mongoBatch ? {
          id: mongoBatch._id,
          blockchainVerified: mongoBatch.blockchainVerified,
          dualStorageStatus: mongoBatch.dualStorageStatus
        } : null,
        mongoPharmacy: mongoPharmacy ? {
          id: mongoPharmacy._id,
          blockchainVerified: mongoPharmacy.blockchainVerified,
          dualStorageStatus: mongoPharmacy.dualStorageStatus
        } : null,
        blockchainStatus: blockchainExists ? 'exists' : 'not_found'
      }
    };
    
    return result;
    
  } catch (error) {
    console.error('❌ Dual storage verification failed:', error);
    throw error;
  }
};