import { getUser } from "@/lib/auth";
import { connectDB } from "@/lib/connectDB";
import { errorResponse, successResponse } from "@/utils/responseHelper";
import Feedback from "@/models/feedbackModel";
import User from "@/models/userModel";

export async function getUserFeedbacks(req) {
    try {
        await connectDB();
        
        const user = await User.findById(req.headers.get("userId"));

        if (!user) {
            return errorResponse({ message: "Unauthorized" }, 401);
        }

        const feedbacks = await Feedback.find({ user: user._id }).sort({ createdAt: -1 }).populate('job');

        return successResponse(
            { message: "User feedbacks fetched successfully", feedbacks, },
            200
        );
    } catch (error) {
        console.error("❌ Error fetching user feedbacks:", error);
        return errorResponse({ message: "Server error", error: error.message }, 500);
    }
}

export async function getFeedbackById(req, { params }) {
    try {
        await connectDB();

        const id = await params?.id;

        if (!id) {
            return errorResponse({ message: "Feedback ID is required" }, 400);
        }

        const feedback = await Feedback.findById(id).populate('job');

        if (!feedback) {
            return errorResponse({ message: "Feedback not found" }, 404);
        }

        return successResponse(
            { message: "Feedback fetched successfully", feedback },
            200
        );
    } catch (error) {
        console.error("❌ Error fetching feedback by ID:", error);
        return errorResponse({ message: "Server error", error: error.message }, 500);
    }
}

export async function saveFeedback(req) {
    try {
        const body = await req.json();
        const { jobId, feedback } = body;

        const userRes = await getUser();

        if (!userRes.ok) {
            const errorBody = await userRes.json();
            return errorResponse(
                { message: errorBody.message || "Access Denied" },
                userRes.status
            );
        }

        const data = await userRes.json();
        const user = data.user;

        if (!jobId || !feedback) {
            return errorResponse({ message: "Job and feedback are required." }, 400);
        }

        // Update user's tokens (assuming you're not saving user via Mongoose directly here)
        const updatedUser = await User.findById(user._id);
        if (!updatedUser) {
            return errorResponse({ message: "User not found." }, 404);
        }

        updatedUser.tokens = updatedUser.tokens - 1;
        updatedUser.tokenUsedAt = new Date();
        await updatedUser.save();

        const newFeedback = new Feedback({
            user: user._id,
            job: jobId,
            rating: feedback.rating,
            summary: feedback.summary,
            recommendation: feedback.recommendation,
            recommendationMsg: feedback.recommendationMsg,
        });

        await newFeedback.save();

        return successResponse(
            {
                message: "Feedback saved successfully",
                feedback: newFeedback,
                user: updatedUser,
            },
            200
        );
    } catch (error) {
        console.error("❌ Error saving feedback:", error);
        return errorResponse({ message: "Server error", error: error.message }, 500);
    }
}
