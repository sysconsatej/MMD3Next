import api from "./interceptor";
export const fetchHistory = async ({ tableName, recordId }) => {
  try {
    const res = await api.get("history", {
      params: {
        tableName,
        id: recordId,
      },
    });

    return res.data;
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
