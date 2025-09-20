import axios from "axios";
const url = process.env.NEXT_PUBLIC_BACKEND_URL;

export const fetchDropDownValues = async (obj) => {
  try {
    const res = await axios.post(`${url}api/v1/dropDownValues`, obj);
    return res.data;
  } catch (error) {
    return {
      message: error.message,
    };
  }
};

export const getDataWithCondition = async (obj) => {
  try {
    const res = await axios.post(`${url}api/v1/getTableValues`, obj);
    return res.data;
  } catch (error) {
    return error.response.data;
  }
};

export const getNextPrevData = async (obj) => {
  try {
    const res = await axios.post(`${url}api/v1/nextPrevData`, obj);
    return res.data;
  } catch (error) {
    return error.response.data;
  }
};
