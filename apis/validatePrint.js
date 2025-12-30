import api from "./interceptor";

export const validatePrint = async (obj) => {
  try {
    const res = await api.post(`validatePrint`, obj, {
      headers: localStorage.getItem("token"),
    });
    return res.data;
  } catch (error) {
    return {
      message: error.message,
    };
  }
};
