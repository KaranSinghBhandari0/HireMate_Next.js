"use client";

import React, { createContext, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Feedback } from '../utils/Feedback';
import OpenAI from "openai/index.js";
import { useEffect } from 'react';
import { AuthContext } from './AuthContext';
import { useContext } from 'react';

export const FeedbackContext = createContext();

export const FeedbackProvider = ({ children }) => {
    const { setUser } = useContext(AuthContext);
    const router = useRouter();
    const [feedbacks, setFeedbacks] = useState([]);
    const [generatingFeedback, setGeneratingFeedback] = useState(false);
    
    // Auto-fetch feedbacks
    useEffect(() => {
        getFeedbacks();
    }, []);

    // Generate Interview feedback using OpenAI
    const generateFeedback = async (conversation, jobId) => {
        try {
            setGeneratingFeedback(true);

            const finalPrompt = Feedback.replace(
                "{{conversation}}",
                JSON.stringify(conversation, null, 2)
            );

            const openai = new OpenAI({
                baseURL: "https://openrouter.ai/api/v1",
                apiKey: process.env.NEXT_PUBLIC_OPENROUTER_API_KEY,
                dangerouslyAllowBrowser: true,
            });

            const response = await openai.chat.completions.create({
                model: "google/gemini-flash-1.5",
                messages: [{ role: "user", content: finalPrompt }],
                temperature: 0.7,
            });

            const feedbackText = response.choices?.[0]?.message?.content;
            const rawFeedback = feedbackText.replace("```json", "").replace("```", "").trim();

            const parsed = JSON.parse(rawFeedback);
            const cleanedFeedback = parsed.feedback;

            await saveFeedback(cleanedFeedback, jobId);
        } catch (error) {
            console.error("❌ Error generating feedback:", error);
            toast.error("Failed to generate interview feedback");
        } finally {
            setGeneratingFeedback(false);
        }
    };

    // Save Interview Feedback
    const saveFeedback = async (feedback, jobId) => {
        try {
            const data = { feedback, jobId };
            const res = await axios.post("/api/feedback", data);
            setUser(res.data.user);
            router.push(`/interview/feedback/${res.data.feedback._id}`);
        } catch (error) {
            console.error("❌ Save feedback error:", error);
            toast.error(error.response?.data?.message || "Server Error");
        }
    };

    // get all feedbacks of user
    const getFeedbacks = async () => {
        try {
            const res = await axios.get(`/api/feedback`);
            setFeedbacks(res.data.feedbacks);
        } catch (error) {
            console.log(error);
        }
    }

    // get feedback by id
    const getFeedbackById = async (id) => {
        try {
            const res = await axios.get(`/api/feedback/${id}`);
            return res.data.feedback;
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || "Server Error");
        }
    }

    return (
        <FeedbackContext.Provider value={{
            generateFeedback, generatingFeedback,
            getFeedbacks, feedbacks,
            getFeedbackById,
        }}>
            {children}
        </FeedbackContext.Provider>
    );
};