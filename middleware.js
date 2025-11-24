import { NextResponse } from "next/server";
const roleAccessPaths = {
  "/menu-access": ["admin"],
  "/master": ["admin"],
  "/reports": ["admin", "shipping" , "customer", "cfs"],
  "/bl-status": ["admin", "shipping" , "customer", "cfs"],
  "/bl": ["admin", "shipping" , "customer", "cfs"],
  "/request": ["admin", "shipping" , "customer", "cfs"],
  "/htmlReports/igmReports": ["admin", "shipping", "customer", "cfs"],
  "/upload" : ["admin", "shipping" , "customer", "cfs"],
  "/blPartyHold": ["admin", "shipping" , "customer", "cfs"],
  "/home": ["admin", "shipping", "customer", "cfs"],
  "/request/doRequest/list": ["shipping" , "customer"],
  "/master/berthAgent/list": ["admin"],
};

export default function middleware(request) {
  const token = request.cookies.get("token");
  const pathname = request.nextUrl.pathname;

  const isLoggedIn = Boolean(token?.value);

  const LOGIN_URL = process.env.LOGIN_PAGE_URL;
  const APP_URL = process.env.APP_URL;

  // Redirect to login page if not logged in and trying to access the app
  if (!isLoggedIn && !pathname.startsWith(LOGIN_URL)) {
    const loginRedirect = new URL(LOGIN_URL);
    loginRedirect.searchParams.set("redirect", request.url); // Store the original URL to redirect after login

    const response = NextResponse.redirect(loginRedirect);
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    );
    return response;
  }

  // Redirect to app dashboard if logged in and trying to access the login page
  if (isLoggedIn && pathname.startsWith(LOGIN_URL)) {
    const appRedirect = new URL(APP_URL);
    const response = NextResponse.redirect(appRedirect);
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    );
    return response;
  }

  // Role-based access control
  if (isLoggedIn) {
    const userCookie = request.cookies.get("user")?.value;
    let user = null;

    try {
      user = userCookie ? JSON.parse(userCookie) : null; // parse safely if stored as JSON
    } catch {
      user = null;
    }

    for (const [path, roles] of Object.entries(roleAccessPaths)) {
      if (pathname.startsWith(path)) {
        if (!user || !roles.includes(user.roleCode)) {
          // ❌ Instead of redirecting to home, show 404
          const notFoundUrl = new URL("/404", request.url); // rewrite to 404
          const response = NextResponse.rewrite(notFoundUrl);
          response.headers.set(
            "Cache-Control",
            "no-store, no-cache, must-revalidate, proxy-revalidate"
          );
          return response;
        }
      }
    }
  }

  // Continue normally if the user is already in the correct state
  const response = NextResponse.next();
  response.headers.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );
  return response;
}

export const config = {
  matcher: [
    "/",
    "/home",
    "/bl/:path*",
    "/master/:path*",
    "/reports/:path*",
    "/request/:path*",
    "/menu-access/:path*",
    "/role-access/:path*",
    "/bl-status/:path*",
    "/htmlReports/igmReports/:path*",
    "/blPartyHold/:path*",
    "/upload/:path*",
  ],
};
