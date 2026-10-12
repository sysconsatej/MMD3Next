import api from "./interceptor";

const base = (process.env.NEXT_PUBLIC_BACKEND_URL || "").replace(/\/+$/g, "");
const url = `${base}/api/v1/upload`;

export const uploads = async (obj) => {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(obj),
    });

    const text = await res.text();
    let data;
    data = JSON.parse(text);

    return data;
  } catch (err) {
    console.error("❌ uploads() error:", err);
    throw err;
  }
};

// invoice upload
export const invoiceUploadApi = async (obj) => {
  try {
    const res = await api.post("invoice-upload", obj);
    return res.data;
  } catch (err) {
    console.error("❌ invoice uploads() error:", err);
    throw err;
  }
};

//PDF Extractor Bulk update


export const pdfExtractorApi = async (files) => {
  try {
    if (!Array.isArray(files) || !files.length) {
      throw new Error("Please select PDF files.");
    }

    const formData = new FormData();

    files.forEach((file) => {
      formData.append("files", file, file.name);
    });

    const backendUrl = (
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      "http://localhost:4000"
    ).replace(/\/+$/, "");

    const url = `${backendUrl}/api/v1/pdf-extractor/extract`;

    console.log("PDF API URL:", url);
    console.log("Uploading PDF files:", files.map((f) => f.name));

    const response = await fetch(url, {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    const responseText = await response.text();

    console.log("PDF HTTP Status:", response.status);
    console.log("PDF Backend Response:", responseText);

    let data;

    try {
      data = JSON.parse(responseText);
    } catch {
      throw new Error(
        `Backend returned invalid JSON. HTTP status: ${response.status}`
      );
    }

    if (!response.ok || !data.success) {
      throw new Error(
        data.message || `PDF extraction failed (HTTP ${response.status})`
      );
    }

    return data;
  } catch (error) {
    console.error("PDF Extraction Error:", error);
    throw error;
  }
};
