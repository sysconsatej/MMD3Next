import axios from "axios";
const url = process.env.NEXT_PUBLIC_BACKEND_URL;

export const login = async (data) => {
  try {
    const res = await axios.post(`${url}api/v1/user/login`, data);
    return res.data;
  } catch (e) {
    return { message: e };
  }
};

export const logoutApi = async () => {
  const res = await axios.post(
    `${url}api/v1/user/logout`,
    {},
    {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    }
  );
  return res.data;
};
