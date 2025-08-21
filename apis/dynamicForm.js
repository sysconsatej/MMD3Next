import axios from "axios";
const url = process.env.NEXT_PUBLIC_BACKEND_URL;

export const insertUpdateForm = async (obj) => {
  try {
    const res = await axios.post(`${url}api/v1/form/insertUpdate`, obj);
    return res.data;
  } catch (error) {
    return error.response.data;
  }
};

export const fetchForm = async (obj) => {
  try {
    const res = await axios.post(`${url}api/v1/form/fetchForm`, obj);
    return res.data;
  } catch (error) {
    return error.response.data;
  }
};
