import { create } from "zustand";
import { blWorkFlow } from "@/apis";

const useBlWorkFlowData = create((set) => ({
  workFlowData: [],
  fetchData: async ({ blNo }) => {
    // if (!get().blNo) return "Set Bl No";
    const res = await blWorkFlow({ blNo: blNo });
    set({
      workFlowData: res,
    });
  },
  
}));

export default useBlWorkFlowData;
