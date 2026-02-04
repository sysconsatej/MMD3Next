import { create } from "zustand";
import { getRoleAccessByRole } from "@/apis/menuAccess";

const useRoleStore = create((set) => ({
  data: [],
  roleIdData: null,
  fetchData: async (roleId) => {
    const res = await getRoleAccessByRole({ roleId });

    if (res?.data) {
      set({
        data: res.data.map((r) => {
          const showMenuBtn = r.buttons?.find(
            (i) => i?.buttonName === "showMenu" || i?.buttonName === "ShowMenu",
          );

          return {
            ...r,
            buttons: showMenuBtn?.accessFlag,
            roleId: showMenuBtn?.roleId,
          };
        }),
      });
    } else {
      set({ data: [] });
    }
  },
}));

export default useRoleStore;
