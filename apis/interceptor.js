import axios from "axios";
import Cookie from "js-cookie";

const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000/";

const api = axios.create({
  baseURL: `${baseURL}api/v1/`,
  withCredentials: true,
});


api.interceptors.request.use(
  (config) => {
    if (
      typeof window !== "undefined" &&
      process.env.NODE_ENV !== "production"
    ) {
      const token = Cookie.get("token");
      if (token) config.headers["Authorization"] = `Bearer ${token}`;
    }

    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
      return config;
    }

    config.headers["Content-Type"] = "application/json";

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
