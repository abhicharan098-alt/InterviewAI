import { NextResponse } from "next/server";
import type { NextRequest, NextFetchEvent } from "next/server";
import { getToken } from "next-auth/jwt";

export default async function proxy(request: NextRequest, event: NextFetchEvent) {
  if (request.nextUrl.pathname.toLowerCase() === "/interviewai") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET });
  const isAuthPage = request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/register";

  if (isAuthPage) {
    if (token) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return null;
  }

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/InterviewAI",
    "/interviewai",
    "/login",
    "/register",
    "/dashboard/:path*",
    "/interviews/:path*",
    "/practice/:path*",
    "/settings/:path*",
    "/profile/:path*",
    "/resume/:path*",
    "/progress/:path*",
    "/recommendations/:path*",
    "/focus-areas/:path*",
    "/focus-practice/:path*",
    "/interview/:path*",
    "/preparation/:path*",
    "/coach/:path*",
    "/notifications/:path*",
  ],
};
