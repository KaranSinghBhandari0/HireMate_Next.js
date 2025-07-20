import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

// Pages and API accessible only by authenticated users
const protectedRoutes = [
  "/auth/profile",
  "/auth/profile/edit",
  "/auth/subscription",
  "/interview",
];

// Pages not accessible by authenticated users
const authPages = [
    "/auth/login", 
    "/auth/signup", 
    "/auth/resetPassword"
];

// Middleware function
export async function middleware(req) {
    const token = req.cookies.get("token")?.value;
    const { pathname } = req.nextUrl;

    let user = null;

    if(token) {
        try {
            const { payload } = await jwtVerify(token, secret);
            user = payload;
        } catch (error) {
            console.error("JWT verification failed:", error.message);
        }
    }

    // Redirect unauthenticated users to login page if they try to visit protectedRoutes
    if (!user && protectedRoutes.some((route) => pathname.startsWith(route))) {
        return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    // Redirect authenticated users to home page if they try to visit authPages
    if (user && authPages.includes(pathname)) {
        return NextResponse.redirect(new URL("/", req.url));
    }

    const requestHeaders = new Headers(req.headers);

    if(user) {
        requestHeaders.set("userId", user.id);
    }

    return NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    });
}
