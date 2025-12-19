import { create } from "zustand";

const useBackLinksStore = create((set) => ({
  link: {
    blStatus: "",
  },
  setBlStatus: (newBlStatus) => set({ link: { ...newBlStatus } }),
}));

export default useBackLinksStore;
