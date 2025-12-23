import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function addBlockchainAddresses() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get models
    const PharmacyCompany = (await import('../models/PharmacyCompany.js')).default;
    const ManufacturerCompany = (await import('../models/ManufacturerCompany.js')).default;

    // Add blockchain addresses to existing companies
    console.log('🔧 Adding blockchain addresses to existing companies...');

    // 1. Update Pharmacy Companies
    const pharmacyCompanies = await PharmacyCompany.find({ blockchainAddress: { $exists: false } });
    console.log(`📊 Found ${pharmacyCompanies.length} pharmacy companies without blockchain addresses`);

    for (const company of pharmacyCompanies) {
      // Generate a dummy address for testing (in production, this should be real)
      const dummyAddress = `0x${Math.random().toString(16).substring(2, 42).padStart(40, '0')}`;
      
      company.blockchainAddress = dummyAddress.toLowerCase();
      await company.save();
      
      console.log(`✅ Added blockchain address to ${company.name}: ${company.blockchainAddress}`);
    }

    // 2. Update Manufacturer Companies
    const manufacturerCompanies = await ManufacturerCompany.find({ blockchainAddress: { $exists: false } });
    console.log(`📊 Found ${manufacturerCompanies.length} manufacturer companies without blockchain addresses`);

    for (const company of manufacturerCompanies) {
      // Generate a dummy address for testing
      const dummyAddress = `0x${Math.random().toString(16).substring(2, 42).padStart(40, '0')}`;
      
      company.blockchainAddress = dummyAddress.toLowerCase();
      await company.save();
      
      console.log(`✅ Added blockchain address to ${company.companyName}: ${company.blockchainAddress}`);
    }

    console.log('🎉 Blockchain addresses added successfully!');
    console.log('\n📝 For production use:');
    console.log('1. Replace dummy addresses with real Ethereum addresses');
    console.log('2. Ensure companies have actual blockchain wallets');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addBlockchainAddresses();