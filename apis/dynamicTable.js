import axios from "axios";
const url = process.env.NEXT_PUBLIC_BACKEND_URL;

export const fetchTableValues = async (obj) => {
  try {
    const res = await axios.post(`${url}api/v1/dynamicTable`, obj);
    return res.data;
  } catch (error) {
    return {
      message: error.message,
    };
  }
};

export const fetchDynamicReportData = async (obj) => {
  try {
    const res = await axios.post(`${url}api/v1/spData`, obj);

    // Handle unexpected status codes
    if (res.status !== 200) {
      return {
        success: false,
        message: `Request failed with status ${res.status}`,
        data: null,
      };
    }

    // Return API response safely
    return {
      success: true,
      data: res.data,
    };
  } catch (error) {
    // Normalize error message
    let message = "Something went wrong";

    if (error.response) {
      // Server responded with a status other than 2xx
      message = error.response.data?.message || `Server error: ${error.response.status}`;
    } else if (error.request) {
      // Request made but no response
      message = "No response from server. Please check your connection.";
    } else if (error.message) {
      // Other errors (like bad config)
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

    // Handle non-200 response
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
      // Server returned an error
      message = error.response.data?.message || `Server error: ${error.response.status}`;
    } else if (error.request) {
      // No response
      message = "No response from server. Please check your connection.";
    } else if (error.message) {
      // Other client-side error
      message = error.message;
    }

    return {
      success: false,
      message,
      data: null,
    };
  }
};