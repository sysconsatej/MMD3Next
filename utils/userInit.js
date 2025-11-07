"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { auth } from "../store";

export const  useInitUser  = ()  => {
  const searchParams = useSearchParams();
  const {setUserData} = auth();

  useEffect(() => {
    const encodedUser = searchParams.get("user");
    if (encodedUser) {
      try {
        const decoded = decodeURIComponent(encodedUser);
        const parsedUser = JSON.parse(decoded);

        // ✅ Save into Zustand
        setUserData({ data: parsedUser });

        // ✅ (Optional) Also persist to localStorage
        localStorage.setItem("user", JSON.stringify(parsedUser));

        console.log("✅ User set in Zustand:", parsedUser);
      } catch (err) {
        console.error("Error decoding user data:", err);
      }
    } else {
      // Optional: If URL doesn't have user, try restoring from localStorage
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUserData(JSON.parse(storedUser));
      }
    }
  }, [searchParams, setUserData]);
}
