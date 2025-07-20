import { connectDB } from "@/lib/connectDB";
import Job from "@/models/jobModel";
import mongoose from "mongoose";
import { errorResponse, successResponse } from "@/utils/responseHelper";
import cloudinary from "@/lib/cloudConfig";

export const getAllJobs = async (req) => {
    try {
        await connectDB();
        const jobs = await Job.find().sort({ postedOn: -1 });

        return successResponse({ message: "Jobs fetched successfully", jobs }, 200);
    } catch (error) {
        console.error("Get all jobs error:", error);
        return errorResponse({ message: "Server error", error: error.message }, 500);
    }
};

export const addNewJob = async (req) => {
    try {
        await connectDB();
        const form = await req.formData();

        // Admin check
        const userId = req.headers.get("userId");
        if(userId !== process.env.ADMIN_ID) {
            return errorResponse({ message: "Access Denied" }, 403 );
        }

        // Extract fields from formData
        const fields = [
            "title", "company", "location", "description",
            "experience", "role", "salary", "postedOn"
        ];
        const jobData = {};

        for (const field of fields) {
            const value = form.get(field);
            jobData[field] = value?.toString().trim();
        }

        const requirements = form.getAll("requirements");
        const responsibilities = form.getAll("responsibilities");

        jobData.requirements = requirements.filter(Boolean);
        jobData.responsibilities = responsibilities.filter(Boolean);

        // logo upload
        const file = form.get('file');
        if (file) {
            const buffer = Buffer.from(await file.arrayBuffer());

            const result = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream((error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result);
                    }
                });
                stream.end(buffer);
            });

            jobData.companyLogo = result.secure_url;
            jobData.cloudinary_id = result.public_id;
        }

        // Save to DB
        const job = new Job(jobData);
        await job.save();

        return successResponse(
            { message: "Job created successfully", job },
            200
        );
    } catch (error) {
        console.error("Add job error:", error);
        return errorResponse({ message: "Server error", error: error.message }, 500);
    }
};

export const getJobById = async (req, { params }) => {
    try {
        await connectDB();
        const { id } = await params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return errorResponse({ message: "Invalid job ID" }, 400);
        }

        const job = await Job.findById(id);
        if (!job) {
            return errorResponse({ message: "Job not found" }, 404);
        }

        return successResponse({ message: "Job fetched successfully", job }, 200);
    } catch (error) {
        console.error("Get job by ID error:", error);
        return errorResponse({ message: "Server error", error: error.message }, 500);
    }
};

export const updateJob = async (req, { params }) => {
    try {
        await connectDB();
        const { id } = await params;

        // Admin check
        const userId = req.headers.get("userId");
        if(userId !== process.env.ADMIN_ID) {
            return errorResponse({ message: "Access Denied" }, 403 );
        }

        // Get existing job
        const existingJob = await Job.findById(id);
        if (!existingJob) {
            return errorResponse({ message: "Job not found" }, 404);
        }

        const form = await req.formData();
        const fields = [
            "title", "company", "location", "description",
            "experience", "role", "salary", "postedOn"
        ];

        const updatedData = {};

        for (const field of fields) {
            const value = form.get(field);
            if (value !== null) {
                updatedData[field] = value.toString().trim();
            }
        }

        updatedData.requirements = form.getAll("requirements").filter(Boolean);
        updatedData.responsibilities = form.getAll("responsibilities").filter(Boolean);

        const file = form.get("file");

        if (file && typeof file === "object") {
            // Delete old logo if it exists
            if (existingJob.cloudinary_id) {
                await cloudinary.uploader.destroy(existingJob.cloudinary_id);
            }

            const buffer = Buffer.from(await file.arrayBuffer());
            const result = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream((error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                });
                stream.end(buffer);
            });

            updatedData.companyLogo = result.secure_url;
            updatedData.cloudinary_id = result.public_id;
        }

        const updatedJob = await Job.findByIdAndUpdate(id, updatedData, { new: true });

        return successResponse({ message: "Job updated successfully", job: updatedJob }, 200);

    } catch (error) {
        console.error("Update job error:", error);
        return errorResponse({ message: "Server error", error: error.message }, 500);
    }
};

export const deleteJob = async (req, { params }) => {
    try {
        await connectDB();
        const { id } = await params;

        // Admin check
        const userId = req.headers.get("userId");
        if(userId !== process.env.ADMIN_ID) {
            return errorResponse({ message: "Access Denied" }, 403 );
        }

        const job = await Job.findById(id);
        if (!job) {
            return errorResponse({ message: "Job not found" }, 404);
        }

        if(job.cloudinary_id) {
            await cloudinary.uploader.destroy(job.cloudinary_id);
        }
        await Job.findByIdAndDelete(id);

        return successResponse({ message: "Job deleted successfully" }, 200);
    } catch (error) {
        console.error("Delete job error:", error);
        return errorResponse({ message: "Server error", error: error.message }, 500);
    }
};