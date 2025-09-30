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

export const deleteRecord = async (obj) => {
  try {
    const res = await axios.post(`${url}api/v1/form/deleteRecord`, obj);
    return res.data;
  } catch (error) {
    return error.response.data;
  }
};

export const uploadExcel = async (obj) => {
  try {
    const res = await axios.post(`${url}api/v1/form/excelUpload`, obj);
    return res.data;
  } catch (error) {
    return error.response.data;
  }
};
