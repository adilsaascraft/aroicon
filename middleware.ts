import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const accessToken = req.cookies.get("accessToken")?.value || null;
  const refreshToken = req.cookies.get("refreshToken")?.value || null;

  const isLoginPage = pathname === "/";

  // ----- 1) No accessToken → Try Refresh Token ----- //
  if (!accessToken && refreshToken) {
    try {
      const refreshUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/users/refresh-token`;

      const refreshReq = await fetch(refreshUrl, {
        method: "GET",
        credentials: "include",
        headers: {
          Cookie: `refreshToken=${refreshToken}`,
        },
      });

      if (refreshReq.ok) {
        // After refresh, repeat the request instead of redirecting
        // Needed for Safari/mobile stability
        return NextResponse.next();
      }
    } catch (err) {
      console.log("Refresh error:", err);
    }
  }

  // ----- 2) No logged-in user & trying to access a protected route ----- //
  if (!accessToken && !isLoginPage) {
    const loginUrl = new URL("/", req.url);
    return NextResponse.redirect(loginUrl);
  }

  // ----- 3) Logged-in but trying to visit login page ----- //
  if (accessToken && isLoginPage) {
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
    "/", // allow login page protection logic
  ],
};
