import { create } from "zustand";
import { getRoleAccessByRole } from "@/apis/menuAccess";

const useRoleStore = create((set) => ({
  data: [],
  fetchData: async (roleId) => {
    const res = await getRoleAccessByRole({ roleId });
    if (res?.data) {
      set({
        data: res?.data?.map((r) => {
          return {
            ...r,
            buttons: r.buttons?.filter((i) => i?.buttonName === "showMenu")[0]
              ?.accessFlag,
          };
        }),
      });
    } else {
      set({ data: [] });
    }
  },
}));

export default useRoleStore;
