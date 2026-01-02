import { create } from "zustand";
import { persist } from "zustand/middleware"; // Persist middleware

const useChartVisible = create(
  persist(
    (set) => ({
      chartStatus: {}, // Empty initially
      loading: true, // Flag to indicate if the state is still loading from storage
      setChartVisible: (spCallName, visible) =>
        set((state) => ({
          chartStatus: {
            ...state.chartStatus,
            [spCallName]: { visible },
          },
        })),
      setLoading: (loading) => set({ loading }),
    }),
    {
      name: "chart-status-storage", // The name for localStorage
      getStorage: () => localStorage, // Store it in localStorage
      onRehydrateStorage: () => (state) => {
        // Once it's rehydrated, mark the loading as false
        state.setLoading(false);
      },
    }
  )
);

export default useChartVisible;
