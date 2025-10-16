import axios from "axios";
const url = process.env.NEXT_PUBLIC_BACKEND_URL;

export const getMenuButtons = async (data) => {
  try {
    const res = await axios.get(`${url}api/v1/menuButton`);
    return res.data;
  } catch (e) {
    return { message: e };
  }
};
