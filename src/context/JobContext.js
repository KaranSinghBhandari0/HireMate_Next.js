"use client";

import React, { createContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";

export const JobContext = createContext();

export const JobProvider = ({ children }) => {
    const router = useRouter();

    const [jobs, setJobs] = useState([]);
    const [gettingJobs, setGettingJobs] = useState(false);

    // Auto-fetch jobs
    useEffect(() => {
        getAllJobs();
    }, []);

    // GET ALL JOBS
    const getAllJobs = async () => {
        try {
            setGettingJobs(true);
            const res = await axios.get("/api/job");
            setJobs(res.data.jobs);
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to fetch jobs");
        } finally {
            setGettingJobs(false);
        }
    };

    // GET JOB BY ID
    const getJobById = async (id) => {
        try {
            const res = await axios.get(`/api/job/${id}`);
            return res.data.job;
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to fetch job data");
        }
    };

    // ADD JOB
    const addJob = async (jobData) => {
        try {
            const res = await axios.post("/api/job", jobData);
            toast.success(res.data.message || "Job added successfully");
            await getAllJobs();
            router.push(`/job/${res.data.job._id}`);
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to add job");
        }
    };

    // UPDATE JOB
    const updateJob = async (id, jobData) => {
        try {
            const res = await axios.put(`/api/job/${id}`, jobData);
            toast.success(res.data.message || "Job updated");
            await getAllJobs();
            router.push(`/job/${id}`);
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || "Server Error");
        }
    };

    // DELETE JOB
    const deleteJob = async (id) => {
        try {
            const res = await axios.delete(`/api/job/${id}`);
            toast.success(res.data.message || "Job deleted");
            await getAllJobs();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Delete failed");
        }
    };

    return (
        <JobContext.Provider
            value={{
                getAllJobs,
                jobs,
                gettingJobs,
                getJobById,
                addJob,
                updateJob,
                deleteJob,
            }}
        >
            {children}
        </JobContext.Provider>
    );
};
