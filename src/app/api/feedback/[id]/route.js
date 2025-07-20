import { getFeedbackById } from "@/controllers/feedbackController";

export async function GET(req, { params }) {
    return getFeedbackById(req, { params });
}
