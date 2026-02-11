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
