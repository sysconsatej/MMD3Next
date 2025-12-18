import { getDataWithCondition } from "@/apis";
import { getUserByCookies } from "@/utils";

const userData = getUserByCookies();

export const handleChange = ({ setFormData, formData }) => {
  return {
    getDataBasedonLinerAndBLNo: async (name, value) => {
      console.log("Change Event Triggered", name, value);
    },
  };
};

//  panNo have to do
