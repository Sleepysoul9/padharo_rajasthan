import { Request, Response } from 'express';
import { User, Visit } from '../models/Schemas';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// --- DEBUGGER: Check if variables are loaded ---
console.log("------------------------------------------------");
console.log("📧 EMAIL SYSTEM DEBUG:");
console.log("User:", process.env.EMAIL_USER ? "✅ Loaded" : "❌ MISSING");
console.log("Pass:", process.env.EMAIL_PASS ? "✅ Loaded" : "❌ MISSING");
console.log("------------------------------------------------");

// --- EMAIL CONFIGURATION ---
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // Reads from .env
        pass: process.env.EMAIL_PASS  // Reads from .env
    }
});

// Helper function to send email
const sendTicketEmail = async (toEmail: string, name: string, ticketId: string) => {
    const mailOptions = {
        from: `"Padharo Rajasthan" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: `Your Ticket: ${ticketId} - Padharo Rajasthan`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #D35400; text-align: center;">🏛️ Padharo Rajasthan</h2>
                <p>Namaste <strong>${name}</strong>,</p>
                <p>Welcome to the land of kings! Here is your digital entry pass.</p>
                
                <div style="background: #f8f9fa; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
                    <p style="margin: 0; color: #7f8c8d; font-size: 0.9em;">YOUR TICKET ID</p>
                    <h1 style="margin: 10px 0; color: #2C3E50; letter-spacing: 5px; font-size: 2.5em;">${ticketId}</h1>
                </div>
                <p style="font-size: 0.8em; color: #999; text-align: center;">Department of Tourism, Rajasthan</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ SUCCESS: Email sent to ${toEmail}`);
    } catch (error: any) {
        console.error("❌ FAILURE: Email not sent.");
        console.error("Error Details:", error.message);
    }
};

// Helper: Random ID
const generateTicketId = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// --- 1. ISSUE NEW TICKET ---
export const createTourist = async (req: Request, res: Response) => {
    try {
        const { name, email, age, country } = req.body;

        const finalEmail = email || `tourist_${Date.now()}@temp.com`;
        const ticketId = generateTicketId();

        const newTourist = new User({
            name,
            email: finalEmail,
            password: ticketId,
            role: 'tourist',
            uniqueCode: ticketId,
            metadata: { age, country }
        });

        await newTourist.save();

        // Trigger Email
        if (email) {
            // We use 'await' here purely to see the error in the console if it fails
            // In production, you might remove 'await' to speed up the response
            sendTicketEmail(finalEmail, name, ticketId); 
        }
        
        res.json({ 
            success: true, 
            tourist: { 
                name: newTourist.name, 
                ticketId: ticketId, 
                email: finalEmail 
            } 
        });

    } catch (error: any) {
        if (error.code === 11000) {
            return res.status(400).json({ error: "Email already exists!" });
        }
        res.status(500).json({ error: error.message });
    }
};

// --- 2. VALIDATE / SCAN TICKET (Robust Version) ---
export const validateEntry = async (req: Request, res: Response) => {
    try {
        let { ticketId, attractionId } = req.body;

        // 1. CLEAN THE INPUT (Remove spaces, force uppercase)
        if(!ticketId) return res.status(400).json({ success: false, message: "No ID provided" });
        ticketId = ticketId.trim().toUpperCase();

        // 2. FIND TOURIST
        // We look for a user where uniqueCode matches the ticketId
        const tourist = await User.findOne({ uniqueCode: ticketId, role: 'tourist' });
        
        if (!tourist) {
            console.log(`❌ Failed validation for: ${ticketId}`);
            return res.status(404).json({ success: false, message: "Invalid Ticket ID" });
        }

        // 3. CHECK IF USED TODAY
        const startOfDay = new Date();
        startOfDay.setHours(0,0,0,0);
        
        const existingVisit = await Visit.findOne({ 
            visitorId: tourist._id, 
            entryTime: { $gte: startOfDay } 
        });

        // If this is just a "Check Status" (Kiosk mode)
        if(attractionId === 'CHECK_ONLY') {
             if(existingVisit) {
                 return res.json({ success: false, message: "used", tourist: tourist.name });
             }
             return res.json({ success: true, message: "Valid Ticket", tourist: tourist.name });
        }

        // If this is an actual Gate Entry
        if (existingVisit) {
            return res.status(400).json({ success: false, message: "Ticket already used today" });
        }

        // 4. RECORD THE VISIT
        const newVisit = new Visit({
            visitorId: tourist._id,
            attractionId: "Main Gate",
            entryTime: new Date()
        });
        await newVisit.save();

        const country = (tourist as any).metadata ? (tourist as any).metadata.country : "Unknown";

        res.json({ success: true, tourist: tourist.name, country: country });

    } catch (error: any) {
        console.error("Server Error:", error);
        res.status(500).json({ error: error.message });
    }
};