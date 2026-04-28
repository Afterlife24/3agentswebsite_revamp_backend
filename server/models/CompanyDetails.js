import mongoose from 'mongoose';

const companyDetailsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false, // Changed to optional since users don't need to be logged in
        unique: false // Changed to allow multiple entries without userId
    },
    companyName: {
        type: String,
        required: true
    },
    industry: {
        type: String,
        required: true
    },
    companySize: {
        type: String,
        required: true
    },
    website: {
        type: String
    },
    country: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    address: {
        type: String
    },
    description: {
        type: String
    }
}, {
    timestamps: true
});

export default mongoose.model('CompanyDetails', companyDetailsSchema);
