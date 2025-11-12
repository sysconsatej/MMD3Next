import axios from "axios";

export const chartApi = async () => {
  try {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}api/v1/charts/`
    );
    return res.data;
  } catch (e) {
    return { message: e };
  }
};
