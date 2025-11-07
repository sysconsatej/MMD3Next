import { NextResponse } from "next/server";

export default function middleware(request) {
  const token = request.cookies.get("auth_token");
  const pathname = request.nextUrl.pathname;

  const isLoggedIn = token?.value;

  const response = NextResponse.next();

  if (!isLoggedIn && pathname !== "/login") {
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    );
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isLoggedIn && pathname === "/login") {
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    );
    return NextResponse.redirect(new URL("/home", request.url));
  }

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
    "/login",
  ],
};
