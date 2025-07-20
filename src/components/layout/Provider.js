"use client";

import React, { useContext, useEffect } from "react";
import Loader from "../common/Loader";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { Toaster } from "react-hot-toast";
import ScrollToTop from "@/utils/ScrollToTop";
import { AuthContext } from "@/context/AuthContext";

export default function Provider({ children }) {
    const { checkingAuth, checkAuth } = useContext(AuthContext);

    useEffect(() => {
        checkAuth();
    }, []);

    return (
        <>
            {checkingAuth ? (
                <div className="w-full min-h-screen flex justify-center items-center">
                    <Loader />
                </div>
            ) : (
                <>
                    <Navbar />
                    <ScrollToTop />
                    {children}
                    <Footer />
                    <Toaster />
                </>
            )}
        </>
    );
}
