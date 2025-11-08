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

    const userCookie = cookies.user
      ? decodeURIComponent(cookies.user)
      : null;
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
