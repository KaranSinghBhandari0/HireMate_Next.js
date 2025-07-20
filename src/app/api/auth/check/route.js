import { checkAuth } from '@/controllers/authController';

export async function GET(req) {
    return await checkAuth(req);
}
