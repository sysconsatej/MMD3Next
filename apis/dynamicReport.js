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

export const fetchBlDataForDO = async ({ id, clientId }) => {
  try {
    const tokenStr =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    if (!tokenStr) {
      return {
        success: false,
        data: null,
        message: "No token found in localStorage",
        error: "MISSING_TOKEN",
        status: 0,
        spName: "dbo.blDataForDO",
      };
    }

    const res = await axios.post(
      `${url}api/v1/blDataForDO`,
      { id: Number(id), clientId: Number(clientId) },
      {
        headers: { "x-access-token": JSON.parse(tokenStr) },
        validateStatus: () => true,
      }
    );

    const body = res?.data ?? {};
    return {
      success: !!body?.success,
      data: body?.data ?? null,
      message: body?.message ?? null,
      error: body?.error ?? null,
      status: res.status,
      spName: body?.spName ?? "dbo.blDataForDO",
    };
  } catch (error) {
    const body = error?.response?.data ?? null;
    return {
      success: false,
      data: body?.data ?? null,
      message: body?.message ?? error?.message ?? "Something went wrong",
      error: body?.error ?? error?.message ?? null,
      status: error?.response?.status ?? 0,
      spName: "dbo.blDataForDO",
    };
  }
};

export const generateLocalPdf = async ({
  htmlContent,
  pdfFilename = "report",
  orientation = "portrait",
}) => {
  try {
    const res = await axios.post(
      `${url}api/v1/localPDFReports`,
      { htmlContent, orientation, pdfFilename },
      { responseType: "blob", validateStatus: () => true }
    );

    if (res.status === 200) {
      return {
        success: true,
        blob: res.data,
        filename: `${pdfFilename}.pdf`,
        status: res.status,
        message: null,
        error: null,
      };
    }

    try {
      const text = await new Response(res.data).text();
      const parsed = JSON.parse(text);
      return {
        success: false,
        blob: null,
        filename: null,
        status: res.status,
        message: parsed?.message ?? "PDF generation failed",
        error: parsed?.error ?? null,
      };
    } catch {
      return {
        success: false,
        blob: null,
        filename: null,
        status: res.status,
        message: `PDF generation failed (status ${res.status})`,
        error: null,
      };
    }
  } catch (error) {
    return {
      success: false,
      blob: null,
      filename: null,
      status: error?.response?.status ?? 0,
      message: error?.message ?? "Something went wrong",
      error: error?.message ?? null,
    };
  }
};

export const printPDF = async (data) => {
  try {
    // const token = localStorage.getItem("token");
    const response = await fetch(`${url}/localPdfReports`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // "x-access-token": JSON.parse(token),
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error("Failed to fetch data from the server");
    }

    return response.blob();
  } catch (error) {
    console.error("Error fetching data:", error); // Log any errors that occur
    throw error; // Re-throw the error to handle it outside
  }
};


export const execSp = async ({ spName, jsonData = {}, paramName } = {}) => {
  try {
    const base = url?.endsWith("/") ? url : `${url}/`;
    const res = await axios.post(
      `${base}api/v1/execSpJsonUniversal`,
      { spName, jsonData, ...(paramName ? { paramName } : {}) },
      { validateStatus: () => true }
    );

    const body = res?.data ?? {};
    return {
      success: !!body?.success,
      data: body?.data ?? null,
      message: body?.message ?? null,
      error: body?.error ?? null,
      status: res.status,
      spName,
    };
  } catch (error) {
    const body = error?.response?.data ?? null;
    return {
      success: false,
      data: body?.data ?? null,
      message: body?.message ?? error?.message ?? "Something went wrong",
      error: body?.error ?? error?.message ?? null,
      status: error?.response?.status ?? 0,
      spName,
    };
  }
};

export const execSpBatch = async ({ spName, jsonArray = [], paramName } = {}) => {
  try {
    const base = url?.endsWith("/") ? url : `${url}/`;
    const res = await axios.post(
      `${base}api/v1/execSpJsonUniversal`,
      { spName, jsonData: jsonArray, ...(paramName ? { paramName } : {}) },
      { validateStatus: () => true }
    );

    const body = res?.data ?? {};
    return {
      success: !!body?.success,
      data: body?.data ?? null, // batch array from server
      message: body?.message ?? null,
      error: body?.error ?? null,
      status: res.status,
      spName,
      batch: !!body?.batch,
      count: body?.count ?? (Array.isArray(body?.data) ? body.data.length : 0),
    };
  } catch (error) {
    const body = error?.response?.data ?? null;
    return {
      success: false,
      data: body?.data ?? null,
      message: body?.message ?? error?.message ?? "Something went wrong",
      error: body?.error ?? error?.message ?? null,
      status: error?.response?.status ?? 0,
      spName,
      batch: true,
      count: 0,
    };
  }
};
