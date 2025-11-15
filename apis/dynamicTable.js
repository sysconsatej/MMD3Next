import api from "./interceptor";

export const fetchTableValues = async (obj) => {
  try {
    const res = await api.post(`dynamicTable`, obj);
    return res.data;
  } catch (error) {
    return {
      message: error.message,
    };
  }
};
