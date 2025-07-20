"use client";

import React, { useContext, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { JobContext } from "@/context/JobContext";
import Loader from "@/components/common/Loader";
import ItemNotFound from "@/components/ui/ItemNotFound";
import Input from "@/components/common/Input";
import TextArea from "@/components/common/TextArea";
import MultiInput from "@/components/common/MultiInput";
import Button from "@/components/common/Button";
import Image from "next/image";
import { CloudUpload, X } from "lucide-react";

export default function EditJob() {
    const { updateJob, getJobById } = useContext(JobContext);
    const { id: jobId } = useParams();

    const [job, setJob] = useState(null);
    const [fetchingJob, setFetchingJob] = useState(true);
    const [loading, setLoading] = useState(false);
    const [logoPreview, setLogoPreview] = useState(null);

    useEffect(() => {
        if (jobId) fetchJob(jobId);
    }, [jobId]);

    const fetchJob = async (id) => {
        setFetchingJob(true);
        const res = await getJobById(id);
        setJob(res);
        setLogoPreview(res?.companyLogo || null);
        setFetchingJob(false);
    };

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === "companyLogo" && files?.[0]) {
            const file = files[0];
            setLogoPreview(URL.createObjectURL(file));
            setJob((prev) => ({ ...prev, companyLogo: file }));
        } else {
            setJob((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleListChange = (e, index, field) => {
        const updatedList = [...job[field]];
        updatedList[index] = e.target.value;
        setJob({ ...job, [field]: updatedList });
    };

    const addToList = (field) => {
        setJob({ ...job, [field]: [...job[field], ""] });
    };

    const removeFromList = (field, index) => {
        const updatedList = [...job[field]];
        updatedList.splice(index, 1);
        setJob({ ...job, [field]: updatedList });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        const fields = [
            "title",
            "company",
            "location",
            "description",
            "experience",
            "role",
            "salary",
            "postedOn",
        ];

        fields.forEach((key) => {
            formData.append(key, job[key]);
        });

        ["requirements", "responsibilities"].forEach((key) => {
            job[key]?.forEach((item) => formData.append(key, item));
        });

        if (job.companyLogo instanceof File) {
            formData.append("file", job.companyLogo);
        }

        await updateJob(jobId, formData);
        setLoading(false);
    };

    if (fetchingJob) return <Loader text="Loading job details..." />;
    if (!job) return <ItemNotFound text="Job not found" />;

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Edit Job</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Company Logo Upload */}
                    <div className="col-span-1 md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Company Logo <span className="text-red-500">*</span>
                        </label>

                        <div>
                            {!logoPreview ? (
                                <label
                                    htmlFor="logo-upload"
                                    className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition"
                                >
                                    <CloudUpload className="h-10 w-10 text-gray-400 mb-2" />
                                    <p className="text-sm text-gray-600">
                                        <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        PNG, JPG, SVG (max 5MB)
                                    </p>
                                    <input
                                        id="logo-upload"
                                        type="file"
                                        name="companyLogo"
                                        accept="image/*"
                                        onChange={handleChange}
                                        className="hidden"
                                    />
                                </label>
                            ) : (
                                <div className="relative w-48 h-48">
                                    <Image
                                        src={logoPreview}
                                        alt="Logo Preview"
                                        width={192}
                                        height={192}
                                        className="object-contain rounded border"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setLogoPreview(null);
                                            setJob({ ...job, companyLogo: null });
                                        }}
                                        className="absolute top-1 right-1 bg-white border border-gray-300 text-gray-600 p-1 shadow hover:bg-gray-100 rounded-full"
                                        title="Remove"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Other Fields */}
                    <Input label="Job Title" name="title" value={job.title} onChange={handleChange} required />
                    <Input label="Company" name="company" value={job.company} onChange={handleChange} required />
                    <Input label="Location" name="location" value={job.location} onChange={handleChange} required />
                    <Input label="Experience (e.g. 0-2 years)" name="experience" value={job.experience} onChange={handleChange} required />
                    <Input label="Role (e.g. Full-Time)" name="role" value={job.role} onChange={handleChange} required />
                    <Input label="Salary" name="salary" value={job.salary} onChange={handleChange} required />
                </div>

                {/* Description */}
                <TextArea
                    label="Job Description"
                    name="description"
                    value={job.description}
                    onChange={handleChange}
                    required
                    rows={4}
                />

                {/* Requirements */}
                <MultiInput
                    label="Requirements"
                    name="requirements"
                    values={job.requirements}
                    onChange={(e, i) => handleListChange(e, i, "requirements")}
                    onAdd={() => addToList("requirements")}
                    onRemove={(i) => removeFromList("requirements", i)}
                    placeholder="Requirement"
                    required
                />

                {/* Responsibilities */}
                <MultiInput
                    label="Responsibilities"
                    name="responsibilities"
                    values={job.responsibilities}
                    onChange={(e, i) => handleListChange(e, i, "responsibilities")}
                    onAdd={() => addToList("responsibilities")}
                    onRemove={(i) => removeFromList("responsibilities", i)}
                    placeholder="Responsibility"
                    required
                />

                {/* Submit Button */}
                <div className="flex justify-end">
                    <div className="w-fit">
                        <Button
                            type="submit"
                            loading={loading}
                            loaderText="Updating Job..."
                            className="px-4"
                        >
                            Update Job
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}
