import api from "./interceptor";

const url = process.env.NEXT_PUBLIC_BACKEND_URL;

export const sendInvoiceEmail = async (obj) => {
  try {
    const res = await api.post(
      `${url}api/v1/sendInvoiceEmail`,
      obj
    );
    return res.data;
  } catch (error) {
    return (
      error?.response?.data || {
        success: false,
        message: error?.message || "Failed to send invoice email",
      }
    );
  }
};