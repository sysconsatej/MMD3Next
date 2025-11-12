import api from "./interceptor";

export const logoutApi = async () => {
  const res = await api.post(`user/logout`);
  return res.data;
};
