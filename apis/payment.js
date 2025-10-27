import axios from "axios";
const url = process.env.NEXT_PUBLIC_BACKEND_URL;

export const payment = async () => {
  try {
    const res = await axios.get(`${url}api/v1/payment/pay?Amount=1&UserName=AkibGain`);
    return res;
  } catch (e) {
    return { message: e };
  }
};
