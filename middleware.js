import { NextResponse } from "next/server";

export default function middleware(request) {
  const token = request.cookies.get("auth_token");
  const pathname = request.nextUrl.pathname;

  const isLoggedIn = token?.value;

  if (!isLoggedIn && pathname !== "/login") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isLoggedIn && pathname === "/login") {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/home",
    // "/bl/:path*",
    // "/master/:path*",
    // "/reports/:path*",
    // "/home",
    // "/request/:path*",
    // "/menu-access/:path*",
    {
      source:
        "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
