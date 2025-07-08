import axios from "axios";
const url = process.env.NEXT_PUBLIC_BACKEND_URL;

export const fetchDropDownValues = async (obj) => {
  try {
    const res = await axios.post(`${url}api/v1/dropDownValues`, obj);
    return res.data?.data;
  } catch (error) {
    return {
      message: error.message,
    };
  }
};