import express from 'express';
import CompanyDetails from '../models/CompanyDetails.js';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

// POST - Save/Update company details
router.post('/', authenticateToken, async (req, res) => {
    try {
        const {
            companyName,
            industry,
            companySize,
            website,
            country,
            phoneNumber,
            address,
            description
        } = req.body;

        // Validate required fields
        if (!companyName || !industry || !companySize || !country || !phoneNumber) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Check if company details already exist for this user
        let companyDetails = await CompanyDetails.findOne({ userId: req.user.userId });

        if (companyDetails) {
            // Update existing details
            companyDetails.companyName = companyName;
            companyDetails.industry = industry;
            companyDetails.companySize = companySize;
            companyDetails.website = website;
            companyDetails.country = country;
            companyDetails.phoneNumber = phoneNumber;
            companyDetails.address = address;
            companyDetails.description = description;

            await companyDetails.save();
        } else {
            // Create new company details
            companyDetails = new CompanyDetails({
                userId: req.user.userId,
                companyName,
                industry,
                companySize,
                website,
                country,
                phoneNumber,
                address,
                description
            });

            await companyDetails.save();
        }

        res.status(200).json({
            success: true,
            message: 'Company details saved successfully',
            data: companyDetails
        });
    } catch (error) {
        console.error('Error saving company details:', error);
        res.status(500).json({ error: 'Failed to save company details' });
    }
});

// GET - Get company details for logged-in user
router.get('/', authenticateToken, async (req, res) => {
    try {
        const companyDetails = await CompanyDetails.findOne({ userId: req.user.userId });

        if (!companyDetails) {
            return res.status(404).json({ error: 'Company details not found' });
        }

        res.status(200).json({
            success: true,
            data: companyDetails
        });
    } catch (error) {
        console.error('Error fetching company details:', error);
        res.status(500).json({ error: 'Failed to fetch company details' });
    }
});

// GET - Get all company details (Admin only - for dashboard)
router.get('/all', async (req, res) => {
    try {
        const companyDetails = await CompanyDetails.find()
            .populate('userId', 'name email provider isVerified createdAt')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: companyDetails
        });
    } catch (error) {
        console.error('Error fetching all company details:', error);
        res.status(500).json({ error: 'Failed to fetch company details' });
    }
});

export default router;
