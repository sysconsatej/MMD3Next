import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const useAuthStore = create(
  persist(
    (set) => ({
      userDataToken: null,
      setToken: (token) => set({ userDataToken: token }),
      logout: () => set({ userDataToken: null }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);

const useAuth = () => {
  const { userDataToken, setToken, logout } = useAuthStore();
  return { userDataToken, setToken, logout };
};

export default useAuth;
