import { NextResponse } from "next/server";

export default function middleware(request) {
  const token = request.cookies.get("auth_token");
  const pathname = request.nextUrl.pathname;
  console.log(token , pathname , "pathname")

  const isLoggedIn = !!token?.value;

  // 1. If user is logged in and tries to access "/", redirect to /home
  if (isLoggedIn && pathname === "/") {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  // 2. If user is NOT logged in and tries to access anything other than "/", redirect to "/"
  if (!isLoggedIn && pathname !== "/") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
