import { deleteJob, getJobById, updateJob } from "@/controllers/jobController";

export const GET = async (req, { params }) => {
    return await getJobById(req, { params });
}

export const PUT = async (req, { params }) => {
    return await updateJob(req, { params });
}

export const DELETE = async (req, { params }) => {
    return await deleteJob(req, { params });
}
