import axios from "axios";
const url = process.env.NEXT_PUBLIC_BACKEND_URL;
console.log("Testing URL:", url);

export const login = async (data) => {
  try {
    const res = await axios.post(`${url}api/v1/user/login`, data, {
      withCredentials: true,
    });
    return res.data;
  } catch (e) {
    return { message: e };
  }
};
