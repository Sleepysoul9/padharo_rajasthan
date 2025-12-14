import express from 'express';
import { loginUser } from '../controllers/authController';
import { createTourist, validateEntry } from '../controllers/staffController';
import { 
    getAdvancedAnalytics, 
    factoryReset, 
    getAllStaff, 
    addNewStaff 
} from '../controllers/adminController';

const router = express.Router();

// --- Public Routes ---
router.post('/login', loginUser);

// --- Staff Routes ---
router.post('/staff/create', createTourist);
router.post('/staff/validate', validateEntry);

// --- Admin Routes ---
router.get('/admin/analytics', getAdvancedAnalytics); // Get Dashboard Data
router.post('/admin/reset', factoryReset);            // Factory Reset
router.get('/admin/staff', getAllStaff);              // Get List of Staff
router.post('/admin/staff/add', addNewStaff);         // Add New Staff

export default router;