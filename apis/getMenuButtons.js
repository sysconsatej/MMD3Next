import api from "./interceptor";

export const getMenuButtons = async () => {
  try {
    const res = await api.get(`menuButton`);
    return res.data;
  } catch (e) {
    return { message: e };
  }
};
