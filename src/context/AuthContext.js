"use client";

import React, { createContext, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [checkingAuth, setCheckingAuth] = useState(true);
    const [otpModal, setOtpModal] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [tempEmail, setTempEmail] = useState('');

    // Check authentication
    const checkAuth = async () => {
        try {
            const res = await axios.get('/api/auth/check');
            setUser(res.data.user);
        } catch (error) {
            console.error('Authentication check failed', error);
        } finally {
            setCheckingAuth(false);
        }
    };

    // signup
    const signup = async (formData) => {
        try {
            const res = await axios.post('/api/auth/signup', formData);
            toast.success(res.data.message);
            setOtpModal(true);
            setTempEmail(formData.email);
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || "Server Error");
        }
    }

    // login
    const login = async (formData) => {
        try {
            const res = await axios.post('/api/auth/login', formData);
            setUser(res.data.user);
            toast.success(res.data.message);
            router.push('/');
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || "Server Error");
        }
    }

    // logout
    const logout = async () => {
        try {
            const res = await axios.get('/api/auth/logout');
            toast.success(res.data.message);
            router.push('/auth/login');
            setUser(null);
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || "Server Error");
        }
    }

    // update profile
    const updateProfile = async (formData) => {
        try {
            const res = await axios.put('/api/auth/profile/edit', formData);
            toast.success(res.data.message);
            setUser(res.data.user);
            router.push('/auth/profile');
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || "Server Error");
        }
    }

    const verifyOtp = async (otp) => {
        try {
            const res = await axios.post('/api/otp/verify', { email: tempEmail, otp });
            toast.success(res.data.message);
            setOtpModal(false);
            setOtpVerified(true);
            if(res.data.user) {
                setUser(res.data.user);
                router.push('/auth/profile');
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || "Server Error");
        }
    }

    const reSendOtp = async () => {
        try {
            const res = await axios.post('/api/otp/resend', { email: tempEmail});
            toast.success(res.data.message);
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || "Server Error");
        }
    }

    const resetPassword = async ({ email, newPassword }) => {
        try {
            const res = await axios.put('/api/auth/resetPassword', { email, newPassword });
            toast.success(res.data.message);
            setOtpVerified(false);
            router.push('/auth/login');
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || "Server Error");
        }
    };

    return (
        <AuthContext.Provider value={{
            user, setUser, checkingAuth,
            signup, login, logout, checkAuth, updateProfile,
            otpModal, setOtpModal, verifyOtp, reSendOtp,
            resetPassword, otpVerified, setOtpVerified
        }}>
            {children}
        </AuthContext.Provider>
    );
};