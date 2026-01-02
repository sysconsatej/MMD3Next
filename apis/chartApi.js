import api from "./interceptor";

export const chartApi = async ({ apiCallName }) => {
  try {
    const res = await api.get(`charts/${apiCallName}`);
    return res.data;
  } catch (e) {
    return { message: e };
  }
};
