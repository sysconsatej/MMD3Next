import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const authStore = create(
  persist(
    (set) => ({
      userDataToken: null,
      userData: {},
      setToken: (token) => set({ userDataToken: token }),
      logout: () => set({ userDataToken: null }),
      setUserData: (userData) => set({ userData: userData }),
      clearUserData: () => set({ userData: {} }),
      
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

const auth = () => {
  const {
    userDataToken,
    setToken,
    logout,
    clearUserData,
    setUserData,
    userData,
  } = authStore();
  return {
    userDataToken,
    setToken,
    logout,
    clearUserData,
    setUserData,
    userData,
  };
};

export default auth;
