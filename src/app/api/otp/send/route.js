import { sendOtp } from "@/controllers/otpController"

export const POST = async (req) => {
    return await sendOtp(req);
}