import { addNewJob, getAllJobs } from "@/controllers/jobController";

export const GET = async (req) => {
    return await getAllJobs(req);
}

export const POST = async (req) => {
    return await addNewJob(req);
}