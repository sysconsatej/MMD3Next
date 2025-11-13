import api from "./interceptor";

export const fetchDropDownValues = async (obj) => {
  try {
    const res = await api.post(`dropDownValues`, obj);
    return res.data;
  } catch (error) {
    return {
      message: error.message,
    };
  }
};

export const getDataWithCondition = async (obj) => {
  try {
    const res = await api.post(`getTableValues`, obj);
    return res.data;
  } catch (error) {
    return error.response.data;
  }
};

export const getNextPrevData = async (obj) => {
  try {
    const res = await api.post(`nextPrevData`, obj);
    return res.data;
  } catch (error) {
    return error.response.data;
  }
};
