import OTP from "@/models/otpModel";
import User from "@/models/userModel";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import transporter from "@/lib/transporter";
import { errorResponse, successResponse } from "@/utils/responseHelper";
import { signupValidations } from "@/utils/helper";
import { cookies } from "next/headers"; // for setting cookies in App Router
import { cookieOptions } from "@/utils/helper";

// SEND OTP
export const sendOtp = async (req) => {
    try {
        const { email, firstName, lastName, password, confirmPassword } = await req.json();

        if (!email) {
            return errorResponse({ message: "Email is required" }, 400);
        }

        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        await OTP.deleteMany({ email });

        // If signup data is provided
        if (firstName && password) {
            const validationError = await signupValidations({ email, firstName, lastName, password, confirmPassword });
            if (validationError) {
                return errorResponse({ message: validationError }, 400);
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            await OTP.create({
                email,
                otp,
                signupData: {
                    firstName,
                    lastName,
                    password: hashedPassword,
                },
            });
        } else {
            await OTP.create({ email, otp });
        }

        await transporter.sendMail({
            from: `"HireMentis" <${process.env.MAIL_USER}>`,
            to: email,
            subject: "Your OTP Code",
            text: `Your OTP code is ${otp}. It will expire in 5 minutes.`,
        });

        return successResponse({ message: "OTP sent successfully" }, 200);
    } catch (error) {
        console.error("Error sending OTP:", error);
        return errorResponse({ message: "Failed to send OTP", error: error.message }, 500);
    }
};

// VERIFY OTP
export const verifyOtp = async (req) => {
    try {
        const { email, otp } = await req.json();

        if (!email || !otp) {
            return errorResponse({ message: "Email and OTP are required" }, 400);
        }

        const otpRecord = await OTP.findOne({ email, otp });
        if (!otpRecord) {
            return errorResponse({ message: "Invalid or expired OTP" }, 400);
        }

        const signupData = otpRecord.signupData;

        // Just verification (e.g., forgot password)
        if (!signupData || !signupData.firstName || !signupData.password) {
            await OTP.deleteMany({ email });
            return successResponse({ message: "OTP Verification successful" }, 200);
        }

        const { firstName, lastName, password } = signupData;

        if (!firstName || !password) {
            return errorResponse({ message: "Signup data incomplete. Please try again." }, 400);
        }

        const newUser = await User.create({ firstName, lastName, email, password });

        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

        // Set cookie using App Router API
        cookies().set("token", token, cookieOptions);
        await OTP.deleteMany({ email });

        return successResponse({ message: "Signup successful", user: newUser }, 200);
    } catch (error) {
        console.error("Error verifying OTP:", error);
        return errorResponse({ message: "Failed to verify OTP", error: error.message }, 500);
    }
};

// RESEND OTP
export const reSendOtp = async (req) => {
    try {
        const { email } = await req.json();

        if (!email) {
            return errorResponse({ message: "Email is required" }, 400);
        }

        const otpRecord = await OTP.findOne({ email });
        if (!otpRecord) {
            return errorResponse({ message: "Session timed out. Please sign up again." }, 400);
        }

        const newOtp = Math.floor(1000 + Math.random() * 9000).toString();
        otpRecord.otp = newOtp;
        await otpRecord.save();

        await transporter.sendMail({
            from: `"HireMentis" <${process.env.MAIL_USER}>`,
            to: email,
            subject: "Your New OTP Code",
            text: `Your new OTP code is ${newOtp}. It will expire in 5 minutes.`,
        });

        return successResponse({ message: "New OTP sent successfully" }, 200);
    } catch (error) {
        console.error("Error resending OTP:", error);
        return errorResponse({ message: "Failed to resend OTP", error: error.message }, 500);
    }
};