import { getUserFeedbacks, saveFeedback } from "@/controllers/feedbackController";

export async function GET(req) {
    return await getUserFeedbacks(req);
}

export async function POST(req) {
    return await saveFeedback(req);
}