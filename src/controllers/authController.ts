import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User, Attraction } from '../models/Schemas';

export const loginUser = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        // 1. Find User
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: "User not found" });

        // 2. Check Password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: "Invalid Credentials" });

        // 3. If Tourist, get their location data
        let locationData = null;
        if (user.role === 'tourist') {
            const nearby = await Attraction.find({ name: { $ne: user.activeLocation } }).select('name currentVisitors');
            locationData = {
                currentLocation: user.activeLocation || "Not currently at any site",
                nearbyAttractions: nearby
            };
        }

        res.json({ 
            success: true, 
            user: { id: user._id, name: user.name, role: user.role, email: user.email },
            data: locationData
        });

    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};