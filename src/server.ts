import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import appRoutes from './routes/appRoutes';

// Load Config
dotenv.config();

const app = express();

// Middleware
app.use(express.json()); // Allow JSON data
app.use(cors());         // Allow Browser Requests

// Database Connection
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI as string);
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error: any) {
        console.error(`❌ DB Connection Error: ${error.message}`);
        process.exit(1);
    }
};

// Mount Routes
app.use('/api', appRoutes);

// Root Route (Test)
app.get('/', (req, res) => {
    res.send('🐫 Padharo Rajasthan API is Running...');
});

// Start Server
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Server Running on http://localhost:${PORT}`);
        console.log(`👉 Login API: http://localhost:${PORT}/api/login`);
    });
});