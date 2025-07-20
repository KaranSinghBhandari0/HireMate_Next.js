import { editProfile } from '@/controllers/authController';

export async function PUT(req) {
    return await editProfile(req);
}
