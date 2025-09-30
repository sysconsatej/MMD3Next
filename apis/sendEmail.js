import axios from "axios";
const url = process.env.NEXT_PUBLIC_BACKEND_URL;

export const sendEmail = async (obj) => {
  try {
    const res = await axios.post(`${url}api/v1/reports/emailPdfReports`, obj);
    return res.data;
  } catch (error) {
    return error.response.data;
  }
};
