"use client";

import { useEffect } from "react";
import { auth } from "@/store";

export const useInitUser = () => {
  const { setToken, setUserData } = auth();

  useEffect(() => {
    // Read cookies client-side
    const cookies = Object.fromEntries(
      document.cookie.split("; ").map((c) => c.split("="))
    );

    const userCookie = cookies.user ? decodeURIComponent(cookies.user) : null;
    const tokenCookie = cookies.token ? cookies.token : null;

    if (userCookie) {
      try {
        const parsedUser = JSON.parse(userCookie);
        setUserData({ data: parsedUser });
        setToken(tokenCookie);
      } catch (err) {
        console.error("Error parsing user cookie:", err);
      }
    }

    if (tokenCookie) setToken(tokenCookie);
  }, [setUserData, setToken]);
};

export function getUserByCookies() {
  if (typeof window !== "undefined") {
    const cookies = Object.fromEntries(
      document.cookie.split("; ").map((c) => c.split("="))
    );

    const userCookie = cookies.user ? decodeURIComponent(cookies.user) : null;

    if (!userCookie) return null;

    try {
      return JSON.parse(userCookie);
    } catch (err) {
      console.error("Invalid JSON in user cookie", err);
      return null;
    }
  }
}

