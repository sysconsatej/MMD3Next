"use client";

import { create } from "zustand";
import { persist, devtools, createJSONStorage } from "zustand/middleware";

const formStore = create(
  devtools(
    persist(
      (set) => ({
        mode: { formId: null, mode: null },
        setMode: () => set((val) => ({ formId: val.formId, mode: val.mode })),
      }),
      {
        name: "form-storage",
        storage: createJSONStorage(() => sessionStorage),
      }
    )
  )
);

export default formStore;
