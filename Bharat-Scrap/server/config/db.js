const mongoose = require("mongoose");

const MONGO_URL = process.env.MONGO_URL;

async function connectDB() {
    try {
        await mongoose.connect(MONGO_URL);
        console.log("✅ Connected to MongoDB");
    } catch (err) {
        console.error("❌ MongoDB connection error:", err.message);
        process.exit(1); // app ko exit kara do if DB nahi chala
    }
}

module.exports = connectDB;
