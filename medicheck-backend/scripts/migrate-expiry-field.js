import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
 
await mongoose.connect(process.env.MONGODB_URI, { dbName: 'medicheck' });
 
const result = await mongoose.connection.collection('batches').updateMany(
  { expiry: { $exists: true } },           // only touch docs that have old field
  [
    { $set: { expiryDate: '$expiry' } },   // copy value to new field
    { $unset: 'expiry' }                   // remove old field
  ]
);
 
console.log(`Migration complete. Modified ${result.modifiedCount} batch documents.`);
await mongoose.disconnect();