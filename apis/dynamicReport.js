import axios from "axios";
const url = process.env.NEXT_PUBLIC_BACKEND_URL;

export const fetchDynamicReportData = async (obj) => {
  try {
    const res = await axios.post(`${url}api/v1/spData`, obj, {
      validateStatus: () => true,
    });

    const body = res?.data ?? {};
    return {
      success: !!body?.success,
      data: body?.data ?? null,
      message: body?.message ?? null,
      error: body?.error ?? null,
      status: res.status,
    };
  } catch (error) {
    const body = error?.response?.data ?? null;
    return {
      success: false,
      data: body?.data ?? null,
      message: body?.message ?? error?.message ?? "Something went wrong",
      error: body?.error ?? error?.message ?? null,
      status: error?.response?.status ?? 0,
    };
  }
};

export const updateDynamicReportData = async (obj) => {
  try {
    const res = await axios.post(`${url}api/v1/dynamicReport`, obj);

    if (res.status !== 200) {
      return {
        success: false,
        message: `Request failed with status ${res.status}`,
        data: null,
      };
    }

    return {
      success: true,
      data: res.data,
    };
  } catch (error) {
    let message = "Something went wrong";

    if (error.response) {
      message =
        error.response.data?.message ||
        `Server error: ${error.response.status}`;
    } else if (error.request) {
      message = "No response from server. Please check your connection.";
    } else if (error.message) {
      message = error.message;
    }

    return {
      success: false,
      message,
      data: null,
    };
  }
};
export const getIgmBlData = async (input) => {
  let jsonData;

  if (Array.isArray(input)) {
    jsonData = input.map(String).join(",");
  } else if (typeof input === "string") {
    jsonData = input;
  } else if (input && typeof input === "object") {
    jsonData = input.json
      ? input.json
      : Array.isArray(input.ids)
      ? input.ids.map(String).join(",")
      : input;
  } else {
    jsonData = "";
  }

  try {
    const res = await axios.post(`${url}api/v1/igmData`, { jsonData });

    const body = res?.data ?? {};
    return {
      success: !!body?.success,
      data: body?.data ?? null,
      message: body?.message ?? null,
      error: body?.error ?? null,
      status: res.status,
      spName: body?.spName ?? "igmBldata",
    };
  } catch (error) {
    const body = error?.response?.data ?? null;
    return {
      success: false,
      data: body?.data ?? null,
      message: body?.message ?? error?.message ?? "Something went wrong",
      error: body?.error ?? error?.message ?? null,
      status: error?.response?.status ?? 0,
      spName: "igmBldata",
    };
  }
};
