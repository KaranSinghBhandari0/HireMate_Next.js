import { Geist, Geist_Mono } from "next/font/google";
import { Outfit } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

import { AuthProvider } from "@/context/AuthContext";
import { JobProvider } from "@/context/JobContext";
import { FeedbackProvider } from "@/context/FeedbackContext";
import Provider from "@/components/layout/Provider";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

const outfit = Outfit({
    subsets: ["latin"],
    variable: "--font-outfit",
});

export const metadata = {
    title: "HireMate",
    description: "AI Mock Interview Preparation",
    icons: {
        icon: "/logo.png",
    },
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body
                suppressHydrationWarning={true}
                className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable} antialiased`}
            >
                <AuthProvider>
                    <JobProvider>
                        <FeedbackProvider>
                            <Provider>
                                {children}
                            </Provider>
                            <Toaster />
                        </FeedbackProvider>
                    </JobProvider>
                </AuthProvider>
            </body>
        </html>
    );
}
