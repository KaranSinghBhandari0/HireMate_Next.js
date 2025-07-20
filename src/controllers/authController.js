import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "@/models/userModel";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/connectDB";
import { clean, cookieOptions, profileValidations } from "@/utils/helper";
import { errorResponse, successResponse } from "@/utils/responseHelper";
import cloudinary from "@/lib/cloudConfig";
import { sendOtp } from "./otpController";

// checkAuth
export async function checkAuth(req) {
    try {
        await connectDB();

        // user check
        const userId = req.headers.get("userId");
        const user = await User.findById(userId);
        if(!user) {
            return errorResponse(
                { message: "Unauthenticated" },
                404
            );
        }

        return successResponse(
            { message: "Authentication successful", user },
            200
        );
    } catch (error) {
        console.error("Authentication Error:", error);
        return errorResponse(
            { message: "Server error", error: error.message },
            500
        );
    }
}

// signup
export async function signup(req) {
    try {
        return sendOtp(req);
    } catch (error) { 
        console.error("Signup Error:", error);
        return errorResponse(
            { message: "Server error", error: error.message },
            500
        );
    }
}

// login
export async function login(req) {
    try {
        await connectDB();

        const body = await req.json();
        const { email, password } = body;

        const user = await User.findOne({ email });
        if (!user) {
            return errorResponse({ message: "User not found" }, 400);
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return errorResponse({ message: "Invalid password" }, 400);
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });

        const cookieStore = await cookies();
        cookieStore.set("token", token, cookieOptions);

        const { password: _, ...safeUser } = user._doc;

        return successResponse(
            { message: "Login successful", user: safeUser },
            200
        );
    } catch (error) {
        console.error("Login Error:", error);
        return errorResponse(
            { message: "Server error", error: error.message },
            500
        );
    }
}

// logout
export async function logout() {
    try {
        const cookieStore = await cookies();
        cookieStore.delete("token");
        return successResponse({ message: "Logged out successfully" }, 200);
    } catch (error) {
        console.error("Logout error:", error);
        return errorResponse(
            { message: "Server error", error: error.message },
            500
        );
    }
}

// edit profile
export async function editProfile(req) {
    try {
        await connectDB();
        const form = await req.formData();

        // user check
        const userId = req.headers.get("userId");
        const user = await User.findById(userId);
        if(!user) {
            return errorResponse(
                { message: "Unauthenticated" },
                404
            );
        }

        // Extract and clean fields
        const firstName = clean(form.get("firstName"));
        const lastName = clean(form.get("lastName"));
        const phoneNumber = clean(form.get("phoneNumber"));
        const dob = clean(form.get("dob"));
        const experienceRaw = clean(form.get("experience"));
        const role = clean(form.get("role"));
        const address = clean(form.get("address"));
        const resume = clean(form.get("resume"));
        const github = clean(form.get("github"));
        const linkedIn = clean(form.get("linkedIn"));
        const twitter = clean(form.get("twitter"));
        const leetcode = clean(form.get("leetcode"));

        const experience =
            experienceRaw !== null && experienceRaw !== ""
                ? Number(experienceRaw)
                : null;

        // Validate required fields
        const validationError = profileValidations({
            firstName,
            phoneNumber,
            dob,
            experience,
        });

        if (validationError) {
            return errorResponse({ message: validationError }, 400);
        }

        let image;
        let cloudinary_id;
        const file = form.get('image');
        if(file) {
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

            if(user.cloudinary_id) {
                await cloudinary.uploader.destroy(user.cloudinary_id);
            }

            image = result.secure_url;
            cloudinary_id = result.public_id;
        }

        const avatarUrl = form.get('avatarUrl');
        if(avatarUrl) {
            if(user.cloudinary_id) {
                await cloudinary.uploader.destroy(user.cloudinary_id);
            }
            image = avatarUrl;
        }

        // Update user document
        const updateFields = {
            firstName,
            lastName,
            phoneNumber,
            dob,
            experience,
            role,
            address,
            resume,
            socials: {
                github,
                linkedIn,
                twitter,
                leetcode,
            },
            image,
            cloudinary_id
        };

        const updatedUser = await User.findByIdAndUpdate(user._id, updateFields, {
            new: true,
        });

        return successResponse(
            { message: "Profile updated successfully", user: updatedUser },
            200
        );
    } catch (error) {
        console.error("Profile Edit Error:", error);
        return errorResponse(
            { message: "Server error", error: error.message },
            500
        );
    }
}

// reset password
export async function resetPassword(req) {
    try {
        await connectDB();

        let { email, newPassword } = await req.json();

        if (!email || !newPassword) {
            return errorResponse({ message: "Email and new password are required" }, 400);
        }

        const user = await User.findOne({ email });
        if (!user) {
            return errorResponse({ message: "No user is registered with this email" }, 404);
        }

        newPassword = newPassword.trim();
        if(newPassword.length < 6) {
            return errorResponse({ message: "Password must contains atleast 6 characters" }, 400);
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        return successResponse(
            { message: "Password changed successfully" },
            200
        );
    } catch (error) {
        console.error("Error resetting password:", error);
        return errorResponse(
            { message: "Failed to reset password", error: error.message },
            500
        );
    }
}
