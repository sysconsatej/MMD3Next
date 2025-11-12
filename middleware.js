import { NextResponse } from "next/server";

export default function middleware(request) {
  const token = request.cookies.get("token"); 
  const pathname = request.nextUrl.pathname;  

  const isLoggedIn = Boolean(token?.value);  

  const LOGIN_URL = process.env.LOGIN_PAGE_URL;  
  const APP_URL = process.env.APP_URL;  

  // Redirect to login page if not logged in and trying to access the app
  if (!isLoggedIn && !pathname.startsWith(LOGIN_URL)) {
    const loginRedirect = new URL(LOGIN_URL);
    loginRedirect.searchParams.set('redirect', request.url); // Store the original URL to redirect after login

    const response = NextResponse.redirect(loginRedirect);
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    return response;
  }

  // Redirect to app dashboard if logged in and trying to access the login page
  if (isLoggedIn && pathname.startsWith(LOGIN_URL)) {
    const appRedirect = new URL(APP_URL);
    const response = NextResponse.redirect(appRedirect);
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    return response;
  }

  // Continue normally if the user is already in the correct state
  const response = NextResponse.next();
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
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
  ],
};
