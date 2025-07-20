import mongoose from 'mongoose';

const FeedbackSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job",
    },
    rating: {
        technicalSkills: {
            type: Number,
        },
        communication: {
            type: Number,
        },
        problemSolving: {
            type: Number,
        },
        experience: {
            type: Number,
        }
    },
    summary: {
        type: [String],
    },
    recommendation: {
        type: String,
    },
    recommendationMsg: {
        type: String,
    },
    createdAt: { 
        type: Date, 
        default: Date.now,
    },
});

const Feedback = mongoose.models?.Feedback || mongoose.model("Feedback", FeedbackSchema);
module.exports = Feedback;
