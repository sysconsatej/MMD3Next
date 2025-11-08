// import { NextResponse } from "next/server";

// export default function middleware(request) {
//   const token = request.cookies.get("token");
//   const pathname = request.nextUrl.pathname;

//   const isLoggedIn = Boolean(token?.value);

//   // Define your base URLs
//   const LOGIN_URL = "https://mmd3.mastergroups.com/";
//   const APP_URL = "http://localhost:8000/home";
//   //   const APP_URL =
//   //     process.env.NODE_ENV === "development"
//   //       ? "http://localhost:8000/home"
//   //       : "https://dashboard.mastergroups.com/home"; // production app domain

//   // If NOT logged in → redirect to login domain
//   if (!isLoggedIn && request.url !== LOGIN_URL) {
//     const loginRedirect = new URL(LOGIN_URL);
//     const response = NextResponse.redirect(loginRedirect);
//     response.headers.set(
//       "Cache-Control",
//       "no-store, no-cache, must-revalidate, proxy-revalidate"
//     );
//     return response;
//   }

//   // If logged in → redirect from login domain to correct app domain
//   if (isLoggedIn && request.url.startsWith(LOGIN_URL)) {
//     const appRedirect = new URL(APP_URL);
//     const response = NextResponse.redirect(appRedirect);
//     response.headers.set(
//       "Cache-Control",
//       "no-store, no-cache, must-revalidate, proxy-revalidate"
//     );
//     return response;
//   }

//   // Otherwise, continue normally
//   const response = NextResponse.next();
//   response.headers.set(
//     "Cache-Control",
//     "no-store, no-cache, must-revalidate, proxy-revalidate"
//   );
//   return response;
// }

// export const config = {
//   matcher: [
//     "/",
//     "/home",
//     "/bl/:path*",
//     "/master/:path*",
//     "/reports/:path*",
//     "/request/:path*",
//     "/menu-access/:path*",
//     "/role-access/:path*",
//     "/bl-status/:path*",
//   ],
// };
