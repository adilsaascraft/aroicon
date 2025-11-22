import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("accessToken")?.value || null;
  const { pathname } = req.nextUrl;

  const isLoginPage = pathname === "/";

  // -------- NOT LOGGED IN -------- //
  if (!token) {
    // allow login page
    if (isLoginPage) return NextResponse.next();

    // redirect any protected route to login
    const loginUrl = new URL("/", req.url);
    return NextResponse.redirect(loginUrl);
  }

  // -------- LOGGED IN -------- //
  if (token && isLoginPage) {
    const dashboardUrl = new URL("/dashboard", req.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

// Protect ALL dashboard/admin/checkin/faculty routes
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/checkin/:path*",
    "/admin/:path*",
    "/faculty/:path*",
  ],
};
