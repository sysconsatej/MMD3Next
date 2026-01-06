import api from "./interceptor";

export const fetchHistoryBl = async ({ tableName, recordId }) => {
  try {
    const res = await api.get("history", {
      params: {
        tableName: tableName,
        id: recordId,
      },
    });

    return res.data; // { success, message, data }
  } catch (error) {
    console.error("fetchHistory error:", error);

    return {
      success: false,
      message:
        error?.response?.data?.message ||
        error.message ||
        "Failed to fetch history",
      data: [],
    };
  }
};
export const fetchInvoiceHistory = async ({ recordId }) => {
  try {
    const res = await api.get("history/invoice", {
      params: {
        recordId, // ✅ correct param
      },
    });

    return res.data;
  } catch (error) {
    console.error("fetchInvoiceHistory error:", error);

    return {
      success: false,
      message:
        error?.response?.data?.message ||
        error.message ||
        "Failed to fetch Invoice history",
      data: [],
    };
  }
};

export const fetchInvoiceReleaseHistory = async ({ recordId }) => {
  try {
    const res = await api.get("history/invoiceRelease", {
      params: {
        recordId,
      },
    });

    return res.data; // { success, message, data }
  } catch (error) {
    console.error("fetchInvoiceReleaseHistory error:", error);

    return {
      success: false,
      message:
        error?.response?.data?.message ||
        error.message ||
        "Failed to fetch Invoice Release History",
      data: [],
    };
  }
};
export const fetchHblColumnsChanges = async ({ ids }) => {
  try {
    const res = await api.post("getHblColumnChanges", {
      ids: ids,
    });

    return res.data;
  } catch (error) {
    console.error("getHblColumnChanges error:", error);

    return {
      success: false,
      message:
        error?.response?.data?.message ||
        error.message ||
        "Failed to fetch history",
      data: [],
    };
  }
};
export const fetchHistory = async ({ recordId, spName }) => {
  try {
    const res = await api.get("historyData", {
      params: { recordId, spName },
    });
    return res.data;
  } catch (error) {
    return {
      success: false,
      message:
        error?.response?.data?.message || "Failed to fetch history",
      data: [],
    };
  }
};

