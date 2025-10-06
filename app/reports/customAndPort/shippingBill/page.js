"use client";
/* eslint-disable */
import { useState } from "react";
import { ThemeProvider, Box, Typography } from "@mui/material";
import { theme } from "@/styles";
import { toast, ToastContainer } from "react-toastify";
import CustomButton from "@/components/button/button";
import MultiSelectFileInput from "@/components/customInput/multiSelectFileInput";

export default function SEI() {
  const [selected, setSelected] = useState([]);
  const [scratch, setScratch] = useState([]);
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
    setScratch([]);
  };

  const handleGo = async (e) => {
    e.preventDefault();
    if (!selected.length) {
      toast.warning("Please select at least one PDF file.");
      return;
    }

    setLoading(true);
    try {
      // Dynamic import: ensures it only loads in the browser
      const { extractTextFromPdfs } = await import("@/helper/pdfTextExtractor");
      const extracted = await extractTextFromPdfs(selected);

      const structured = (extracted || []).map((r) => ({
        fileName: r.fileName || "",
        exporter: r.exporter || "",
        portOfDischarge: r.portOfDischarge || "",
        shippingBillNo: r.shippingBillNo || "",
        sbDate: r.sbDate || "",
        pcinNo: r.pcinNo || "",
        noOfPackages: r.noOfPackages || "",
        typeOfPackages: r.typeOfPackages || "",
        grossWeight: r.grossWeight || "",
        weightUnit: r.weightUnit || "",
        hsCode: r.hsCode || "",
      }));
      setScratch(structured);
      console.log("SCRATCH JSON:", JSON.stringify(structured, null, 2));

      toast.success("PDF text extracted successfully!");
    } catch (err) {
      console.error("Extractor error:", err);
      const msg = err?.message || String(err);
      toast.error(`Failed to extract PDF text. ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <form onSubmit={handleGo}>
        <section className="py-2 px-4 text-[12px]">
          <Box className="flex justify-between items-end py-1">
            <Typography
              variant="subtitle2"
              className="!text-[14px] !font-semibold !m-0"
            >
              Shipping Bill
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
              text={loading ? "Extracting..." : "GO"}
              type="submit"
              disabled={loading}
            />
          </Box>

          {scratch.length > 0 && (
            <Box className="mt-3 border rounded p-2 bg-white">
              <div className="overflow-auto">
                <table className="min-w-[900px] w-full text-[11px]">
                  <thead className="bg-gray-50">
                    <tr className="text-gray-700 text-left">
                      <th className="px-2 py-1 font-medium">File</th>
                      <th className="px-2 py-1 font-medium">EXPORTER'S NAME</th>
                      <th className="px-2 py-1 font-medium">
                        PORT OF DISCHARGE
                      </th>
                      <th className="px-2 py-1 font-medium">
                        Shipping Bill No
                      </th>
                      <th className="px-2 py-1 font-medium">SB Date</th>
                      <th className="px-2 py-1 font-medium">PCIN No#</th>
                      <th className="px-2 py-1 font-medium">No of Packages</th>
                      <th className="px-2 py-1 font-medium">
                        Type of Packages
                      </th>
                      <th className="px-2 py-1 font-medium">Gross Weight</th>
                      <th className="px-2 py-1 font-medium">Weight Unit</th>
                      <th className="px-2 py-1 font-medium">HS CD</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scratch.map((row, i) => (
                      <tr key={i} className="border-t">
                        <td className="px-2 py-1 text-gray-700">
                          {row.fileName}
                        </td>
                        <td className="px-2 py-1">{row.exporter}</td>
                        <td className="px-2 py-1">{row.portOfDischarge}</td>
                        <td className="px-2 py-1">{row.shippingBillNo}</td>
                        <td className="px-2 py-1 whitespace-nowrap">
                          {row.sbDate}
                        </td>
                        <td className="px-2 py-1">{row.pcinNo}</td>
                        <td className="px-2 py-1">{row.noOfPackages}</td>
                        <td className="px-2 py-1">{row.typeOfPackages}</td>
                        <td className="px-2 py-1">{row.grossWeight}</td>
                        <td className="px-2 py-1">{row.weightUnit}</td>
                        <td className="px-2 py-1">{row.hsCode}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Box>
          )}
        </section>
      </form>
      <ToastContainer />
    </ThemeProvider>
  );
}
