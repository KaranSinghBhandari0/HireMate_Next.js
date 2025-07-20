"use client";

import { useContext, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { JobContext } from "@/context/JobContext";
import Loader from "@/components/common/Loader";
import ItemNotFound from "@/components/ui/ItemNotFound";
import { formatToDDMMYY } from "@/utils/formatDate";
import Image from "next/image";

export default function JobDetailsPage() {
    const { getJobById } = useContext(JobContext);
    const { id } = useParams();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        const fetchJob = async () => {
            setLoading(true);
            const res = await getJobById(id);
            setJob(res);
            setLoading(false);
        };
        fetchJob();
    }, [id]);

    if (loading) {
        return <Loader text="Loading job details..." />;
    }

    if (!job) {
        return <ItemNotFound text="Job not found" />;
    }

    return (
        <div className="w-full max-w-7xl mx-auto px-4 py-10">
            <div className="flex justify-between flex-wrap items-start mb-8">
                <div className="flex items-start gap-4 mb-6">
                    <Image
                        src={job.companyLogo || "/default-logo.png"}
                        alt={`${job.company} logo`}
                        className="w-16 h-16 object-contain"
                        priority
                        height={64}
                        width={64}
                        onError={(e) => (e.target.src = "/default-logo.png")}
                    />
                    <div>
                        <h1 className="text-2xl font-semibold">{job.title}</h1>
                        <p className="text-lg">{job.company}</p>
                    </div>
                </div>
                <Link
                    href={`/interview/${job._id}`}
                    className="bg-green-500 text-sm font-medium text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
                >
                    Practice Now
                </Link>
            </div>

            <div className="space-y-6">
                <p className="text-sm text-gray-600">
                    <span className="font-medium text-lg text-gray-900">
                        Job Description:{" "}
                    </span>
                    {job.description}
                </p>
                <p className="text-sm text-gray-600">
                    <span className="font-medium text-lg text-gray-900">
                        Salary/Stipend:{" "}
                    </span>
                    {job.salary}
                </p>
                <p className="text-sm text-gray-600">
                    <span className="font-medium text-lg text-gray-900">Role: </span>
                    {job.role}
                </p>
                <p className="text-sm text-gray-600">
                    <span className="font-medium text-lg text-gray-900">
                        Location:{" "}
                    </span>
                    {job.location}
                </p>
            </div>

            <h3 className="text-lg font-medium mt-6">Requirements</h3>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-3 text-sm">
                {Array.isArray(job.requirements) &&
                    job.requirements.map((req, idx) => <li key={idx}>{req}</li>)}
            </ul>

            <h3 className="text-lg font-medium mt-6">Responsibilities</h3>
            <ul className="list-disc list-inside text-gray-600 space-y-2 mb-6 ml-3 text-sm">
                {Array.isArray(job.responsibilities) &&
                    job.responsibilities.map((res, idx) => <li key={idx}>{res}</li>)}
            </ul>

            <p className="text-sm">
                <span className="font-medium text-lg text-gray-900">Posted On: </span>
                {job.postedOn ? formatToDDMMYY(new Date(job.postedOn)) : "N/A"}
            </p>
        </div>
    );
}
