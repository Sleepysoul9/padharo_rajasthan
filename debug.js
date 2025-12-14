// debug.js
const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGO_URI;

console.log("------------------------------------------------");
console.log("🔍 DIAGNOSTIC MODE");
console.log("------------------------------------------------");

if (!uri) {
    console.error("❌ ERROR: MONGO_URI is missing in .env file");
    process.exit(1);
}

console.log(`✅ Found URI: ${uri.substring(0, 20)}...`);
console.log("⏳ Attempting to connect to MongoDB...");

mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
    .then(() => {
        console.log("------------------------------------------------");
        console.log("🎉 SUCCESS! Connected to Database.");
        console.log("👉 The problem is NOT your network or password.");
        console.log("👉 The problem is likely your TypeScript configuration.");
        console.log("------------------------------------------------");
        process.exit(0);
    })
    .catch(err => {
        console.log("------------------------------------------------");
        console.error("❌ CONNECTION FAILED");
        console.error("Reason:", err.message);
        console.log("------------------------------------------------");
        
        if (err.message.includes('bad auth')) {
            console.log("💡 FIX: Your password in .env is wrong.");
        } else if (err.message.includes('ETIMEDOUT') || err.message.includes('buffering timed out')) {
            console.log("💡 FIX: Your IP is blocked. Connect to Mobile Hotspot.");
        }
        process.exit(1);
    });