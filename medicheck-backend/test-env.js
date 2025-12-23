// test-env.js
import dotenv from "dotenv";
dotenv.config();

console.log('=== ENVIRONMENT VARIABLES TEST ===');
console.log('CONTRACT_ADDRESS:', process.env.CONTRACT_ADDRESS);
console.log('BLOCKCHAIN_NETWORK:', process.env.BLOCKCHAIN_NETWORK);
console.log('MONGODB_URI exists?', !!process.env.MONGODB_URI);
console.log('JWT_SECRET exists?', !!process.env.JWT_SECRET);
console.log('==================================');