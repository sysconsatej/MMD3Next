import api from "./interceptor";

export const chartApi = async () => {
  try {
    const res = await api.get(`charts`);
    return res.data;
  } catch (e) {
    return { message: e };
  }
};
