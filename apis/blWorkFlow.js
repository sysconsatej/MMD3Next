import api from "./interceptor";

export const blWorkFlow = async ({ blNo }) => {
  try {
    const res = await api.get(`blWorkFlow/${blNo}`);
    return res.data?.data  ||  [];
  } catch (err) {
    throw new Error(err);
  }
};
