import mongoose from 'mongoose';

// --- 1. USER SCHEMA (Fixed) ---
const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'staff', 'tourist'], default: 'tourist' },
    uniqueCode: { type: String, default: null }, 
    
    // 👇 RESTORED THIS MISSING FIELD
    activeLocation: { type: String, default: null }, 

    metadata: {
        age: { type: Number },
        country: { type: String }
    },
    createdAt: { type: Date, default: Date.now }
});
export const User = mongoose.model('User', UserSchema);

// --- 2. ATTRACTION SCHEMA ---
const AttractionSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    capacity: { type: Number, default: 1000 },
    currentVisitors: { type: Number, default: 0 },
    totalVisitsYearly: { type: Number, default: 0 }
});
export const Attraction = mongoose.model('Attraction', AttractionSchema);

// --- 3. VISIT SCHEMA ---
const VisitSchema = new mongoose.Schema({
    visitorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    attractionId: { type: String, required: true }, 
    entryTime: { type: Date, default: Date.now }
});
export const Visit = mongoose.model('Visit', VisitSchema);