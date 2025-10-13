import { create } from "zustand";
import { navItems } from "./menuData";
import { createJSONStorage, persist } from "zustand/middleware";

const menuStore = create(
  persist(
    (set) => ({
      menuArray: navItems,
      setSelectedMenu: (menu) => set({ selectedMenu: menu }),
    }),
    { name: "menu-storage", storage: createJSONStorage(() => localStorage) }
  )
);
const useMenuStore = () => {
  const { menuArray, setSelectedMenu } = menuStore();
  return { menuArray, setSelectedMenu };
};

export default useMenuStore;
