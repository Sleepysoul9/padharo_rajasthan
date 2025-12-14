import { Request, Response } from 'express';
import { User, Attraction, Visit } from '../models/Schemas';
import bcrypt from 'bcryptjs';

// --- 1. ADVANCED ANALYTICS (Graphs & KPI) ---
export const getAdvancedAnalytics = async (req: Request, res: Response) => {
    try {
        const now = new Date();
        const currentYear = now.getFullYear();
        const startOfYear = new Date(currentYear, 0, 1);
        const startOfMonth = new Date(currentYear, now.getMonth(), 1);

        // A. KPI Cards
        const totalVisits = await Visit.countDocuments();
        const ytdVisits = await Visit.countDocuments({ entryTime: { $gte: startOfYear } });
        const mtdVisits = await Visit.countDocuments({ entryTime: { $gte: startOfMonth } });
        
        // B. Graph Data (Aggregation by Month)
        const getMonthlyData = async (year: number) => {
            const start = new Date(year, 0, 1);
            const end = new Date(year + 1, 0, 1);
            
            const data = await Visit.aggregate([
                { $match: { entryTime: { $gte: start, $lt: end } } },
                { $group: { _id: { $month: "$entryTime" }, count: { $sum: 1 } } },
                { $sort: { "_id": 1 } }
            ]);

            // Fill array of 12 months with 0 if no data
            const result = Array(12).fill(0);
            data.forEach(item => result[item._id - 1] = item.count);
            return result;
        };

        const thisYearData = await getMonthlyData(currentYear);
        const lastYearData = await getMonthlyData(currentYear - 1);

        // C. Live Table Data
        const attractions = await Attraction.find();

        res.json({
            kpi: { total: totalVisits, ytd: ytdVisits, mtd: mtdVisits },
            graph: { thisYear: thisYearData, lastYear: lastYearData },
            table: attractions
        });

    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// --- 2. FACTORY RESET (Clear Data) ---
export const factoryReset = async (req: Request, res: Response) => {
    try {
        console.log("⚠️ FACTORY RESET INITIATED");
        // Delete Tourists and Visits only
        await User.deleteMany({ role: 'tourist' });
        await Visit.deleteMany({});
        // Reset Counters
        await Attraction.updateMany({}, { currentVisitors: 0, totalVisitsYearly: 0 });

        res.json({ success: true, message: "✅ System Wiped. Staff & Admin accounts preserved." });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// --- 3. GET ALL STAFF ---
export const getAllStaff = async (req: Request, res: Response) => {
    try {
        const staffMembers = await User.find({ role: 'staff' }).select('-password');
        res.json(staffMembers);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// --- 4. ADD NEW STAFF ---
export const addNewStaff = async (req: Request, res: Response) => {
    try {
        const { name, email, password } = req.body;
        
        // Check if user exists
        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ error: "Email already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);
        
        const newStaff = new User({
            name,
            email,
            password: hashedPassword,
            role: 'staff',
            uniqueCode: "STAFF-ID" // Placeholder since staff don't scan in
        });

        await newStaff.save();
        res.json({ success: true, message: "Staff added successfully" });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};