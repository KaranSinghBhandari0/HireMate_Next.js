import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { connectDB } from './connectDB';
import User from '../models/userModel';
import { errorResponse, successResponse } from '@/utils/responseHelper';

export async function getUser() {
    await connectDB();

    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
        return errorResponse({ message: 'Not authenticated' }, 401);
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return errorResponse({ message: 'User not found' }, 401);
        }
        
        return successResponse({ message: 'User founded', user }, 200);
    } catch (err) {
        console.error('User auth check error:', err.message);
        return errorResponse({ message: 'Invalid or expired token' }, 401);
    }
}

export async function getAdmin() {
    await connectDB();

    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
        return errorResponse({ message: 'Not authenticated' }, 401);
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.id !== process.env.ADMIN_ID) {
            return errorResponse({ message: 'Access Denied!' }, 403);
        }

        const admin = await User.findById(decoded.id).select('-password');

        if (!admin) {
            return errorResponse({ message: 'Admin not found' }, 401);
        }

        return successResponse({ message: 'Admin founded' }, 200);
    } catch (err) {
        console.error('Admin auth check error:', err.message);
        return errorResponse({ message: 'Invalid or expired token' }, 401);
    }
}
