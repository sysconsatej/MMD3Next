import axios from "axios";
const url = process.env.NEXT_PUBLIC_BACKEND_URL;

export const fetchTableValues = async (obj) => {
  try {
    const res = await axios.post(`${url}api/v1/dynamicTable`, obj);
    return res.data;
  } catch (error) {
    return {
      message: error.message,
    };
  }
};
