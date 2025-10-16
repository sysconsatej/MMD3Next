import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const useAuthStore = create(
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

const useAuth = () => {
  const {
    userDataToken,
    setToken,
    logout,
    clearUserData,
    setUserData,
    userData,
  } = useAuthStore();
  return {
    userDataToken,
    setToken,
    logout,
    clearUserData,
    setUserData,
    userData,
  };
};

export default useAuth;
