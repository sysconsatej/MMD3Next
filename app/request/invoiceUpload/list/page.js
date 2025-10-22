"use client";
/* eslint-disable */
import { useState } from "react";
import { ThemeProvider, Box, Typography } from "@mui/material";
import { theme } from "@/styles";
import { toast, ToastContainer } from "react-toastify";
import CustomButton from "@/components/button/button";
import MultiSelectFileInput from "@/components/customInput/multiSelectFileInput";

export default function InvoicUpload() {
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleFiles = (files) => {
    const pdfs = Array.from(files || []).filter(
      (f) =>
        (f.type || "").toLowerCase() === "application/pdf" ||
        (f.name || "").toLowerCase().endsWith(".pdf")
    );
    const nonPdfCount = (files?.length || 0) - pdfs.length;
    if (nonPdfCount > 0) {
      toast.info(
        `${nonPdfCount} non-PDF file${nonPdfCount > 1 ? "s" : ""} ignored.`
      );
    }
    setSelected(pdfs);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selected.length) {
      toast.warning("Please select at least one PDF file.");
      return;
    }
    setLoading(true);
    try {
      toast.success("Invoices Uploaded successfully!");
      setSelected([]);
    } catch (err) {
      console.error("Extractor error:", err);
      const msg = err?.message || String(err);
      toast.error(`Failed to Upload Invoices. ${msg}`);
    } finally {
      setLoading(false);
      setSelected([]);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <form onSubmit={(e)  => handleSubmit(e)}>
        <section className="py-2 px-4 text-[12px]">
          <Box className="flex justify-between items-end py-1">
            <Typography
              variant="subtitle2"
              className="!text-[14px] !font-semibold !m-0"
            >
              Invoice Uploads
            </Typography>
          </Box>

          <Box className="border border-solid border-black rounded-[4px] p-2">
            <MultiSelectFileInput
              id="upload-files"
              name="files"
              label="Upload Section"
              accept="application/pdf"
              onChange={handleFiles}
              className="w-full"
            />
          </Box>

          <Box className="w-full flex mt-2 gap-2">
            <CustomButton
              text={loading ? "Submitting..." : "Submit"}
              type="submit"
              disabled={loading}
            />
          </Box>
        </section>
      </form>
      <ToastContainer />
    </ThemeProvider>
  );
}
