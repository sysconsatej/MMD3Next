import api from "./interceptor";
const url = process.env.NEXT_PUBLIC_BACKEND_URL;

export const payment = async (Amount) => {
  try {
    const res = await api.get(
      `${url}api/v1/payment/pay?Amount=${Amount}&UserName=AkibGain`,
    );
    return res;
  } catch (e) {
    return { message: e };
  }
};
