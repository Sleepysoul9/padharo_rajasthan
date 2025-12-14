import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { User, Attraction } from './models/Schemas';

dotenv.config();

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI as string);
        console.log("🌱 Clearing old data...");
        await User.deleteMany({});
        await Attraction.deleteMany({});

        const salt = await bcrypt.genSalt(10);
        const adminPass = await bcrypt.hash('admin123', salt); 
        const staffPass = await bcrypt.hash('staff123', salt);

        console.log("👮 Creating Admin...");
        await User.create({
            name: 'Chief Administrator',
            email: 'admin@rajasthan.gov.in',
            password: adminPass,
            role: 'admin'
        });

        console.log("👷 Creating 5 Staff Members...");
        const staffLocations = ['Hawa Mahal', 'Amber Fort', 'City Palace', 'Jantar Mantar', 'Nahargarh'];
        
        for (const loc of staffLocations) {
            // Create Staff for this location
            await User.create({
                name: `Staff - ${loc}`,
                email: `staff.${loc.replace(/\s/g, '').toLowerCase()}@rajasthan.gov.in`,
                password: staffPass,
                role: 'staff'
            });
            
            // Create the Location Entry
            await Attraction.create({ name: loc, currentVisitors: 0, totalVisitsYearly: 0 });
        }

        console.log("------------------------------------------------");
        console.log("✅ SETUP COMPLETE");
        console.log("👉 Admin Email: admin@rajasthan.gov.in (Pass: admin123)");
        console.log("👉 Staff Email: staff.hawamahal@rajasthan.gov.in (Pass: staff123)");
        console.log("------------------------------------------------");
        process.exit();
    } catch (error) {
        console.error("❌ Error:", error);
        process.exit(1);
    }
};

seedDB();