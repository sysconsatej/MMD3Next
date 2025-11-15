import api from "./interceptor";

export const insertUpdateForm = async (obj) => {
  try {
    const res = await api.post(`form/insertUpdate`, obj);
    return res.data;
  } catch (error) {
    return error.response.data;
  }
};

export const fetchForm = async (obj) => {
  try {
    const res = await api.post(`form/fetchForm`, obj);
    return res.data;
  } catch (error) {
    return error.response.data;
  }
};

export const deleteRecord = async (obj) => {
  try {
    const res = await api.post(`form/deleteRecord`, obj);
    return res.data;
  } catch (error) {
    return error.response.data;
  }
};

export const uploadExcel = async (obj) => {
  try {
    const res = await api.post(`form/excelUpload`, obj);
    return res.data;
  } catch (error) {
    return error.response.data;
  }
};
