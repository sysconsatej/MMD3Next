import axios from "axios";
const url = process.env.NEXT_PUBLIC_BACKEND_URL;

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
