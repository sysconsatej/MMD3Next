import axios from "axios";
const url = process.env.NEXT_PUBLIC_BACKEND_URL;


export const fetchDynamicReportData = async (obj) => {
  try {
    const res = await axios.post(`${url}api/v1/spData`, obj);

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
      message = error.response.data?.message || `Server error: ${error.response.status}`;
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
      message = error.response.data?.message || `Server error: ${error.response.status}`;
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