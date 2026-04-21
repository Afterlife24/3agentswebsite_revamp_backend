import mongoose from "mongoose";

const waitlistSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },
        phone: {
            type: String,
            trim: true,
        },
        company: {
            type: String,
            trim: true,
        },
        message: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

const Waitlist = mongoose.model("Waitlist", waitlistSchema, "join_waitlist");

export default Waitlist;
