"use client";

import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";

const countStore = create(
  devtools(
    persist(
      (set) => ({
        count: 0,
        increase: () => set((state) => ({ count: state.count + 1 })),
        reset: () => set({ count: 0 }),
      }),
      {
        name: "counter-storage",
      }
    )
  )
);

export default countStore;
