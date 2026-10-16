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

const pdfBackendUrl = (
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://localhost:4000"
).replace(/\/+$/, "");

// Extract PDF files
export const pdfExtractorApi = async (files) => {
  try {
    if (!Array.isArray(files) || !files.length) {
      throw new Error("Please select PDF files.");
    }

    const formData = new FormData();

    files.forEach((file) => {
      formData.append("files", file, file.name);
    });

    const response = await fetch(
      `${pdfBackendUrl}/api/v1/pdf-extractor/extract`,
      {
        method: "POST",
        body: formData,
        credentials: "include",
      }
    );

    const responseText = await response.text();

    let data;

    try {
      data = JSON.parse(responseText);
    } catch {
      throw new Error(
        `Backend returned invalid JSON (HTTP ${response.status}).`
      );
    }

    if (!response.ok || !data.success) {
      throw new Error(
        data.message ||
        `PDF extraction failed (HTTP ${response.status}).`
      );
    }

    return data;
  } catch (error) {
    console.error("PDF Extraction Error:", error);
    throw error;
  }
};

// Verify extracted invoice data
export const verifyExtractedInvoicesApi = async (invoices, locationId) => {
  try {
    if (!Array.isArray(invoices) || !invoices.length) {
      throw new Error("No invoices available for verification.");
    }

    const response = await fetch(
      `${pdfBackendUrl}/api/v1/pdf-extractor/verify`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          invoices,
          locationId,
        }),
      }
    );

    const responseText = await response.text();

    let data;

    try {
      data = JSON.parse(responseText);
    } catch {
      throw new Error(
        `Backend returned invalid JSON (HTTP ${response.status}).`
      );
    }

    if (!response.ok || !data.success) {
      throw new Error(
        data.message ||
        `Invoice verification failed (HTTP ${response.status}).`
      );
    }

    return data;
  } catch (error) {
    console.error("Invoice Verification Error:", error);
    throw error;
  }
};

//


export const uploadVerifiedInvoicesApi = async (items) => {
  if (!Array.isArray(items) || !items.length) {
    throw new Error("No verified invoices available for upload.");
  }

  const formData = new FormData();

  items.forEach((item, index) => {
    if (!(item.file instanceof File)) {
      throw new Error(`PDF file missing for item ${index + 1}.`);
    }

    if (!item.invoiceData || !item.invoiceRequestId) {
      throw new Error(
        `Verified invoice data missing for ${item.file.name}.`
      );
    }

    formData.append("files", item.file, item.file.name);
  });

  formData.append(
    "items",
    JSON.stringify(
      items.map((item, index) => ({
        index,
        fileName: item.file.name,
        invoiceRequestId: item.invoiceRequestId,
        invoiceData: item.invoiceData,
        userContext: item.userContext,
      }))
    )
  );

  const response = await fetch(
    `${pdfBackendUrl}/api/v1/pdf-extractor/upload-verified`,
    {
      method: "POST",
      credentials: "include",
      body: formData,
    }
  );

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Invoice upload failed.");
  }

  return data;
};

