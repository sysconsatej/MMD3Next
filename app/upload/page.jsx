// app/your-page/PdfInvoiceExtractor.jsx
"use client";
/* eslint-disable */
import React, { useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Paper,
  Divider,
  Stack,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";

import SaveAltIcon from "@mui/icons-material/SaveAlt";
import CleaningServicesIcon from "@mui/icons-material/CleaningServices";
import FileDownloadIcon from "@mui/icons-material/FileDownload";

import MultiSelectFileInput from "@/components/customInput/multiSelectFileInput";
import { extractTextFromPdfs } from "@/helper/pdfTextExtractor";

export default function PdfInvoiceExtractor() {
  const [files, setFiles] = useState([]); // selected PDFs from uploader
  const [rows, setRows] = useState([]); // extracted rows
  const [loading, setLoading] = useState(false);
  const [uikey, setUikey] = useState(0); // to hard-reset uploader

  // keep only PDFs even if user bypasses accept attribute
  const handleUploaderChange = (list) => {
    const pdfs = (Array.isArray(list) ? list : []).filter(
      (f) =>
        (f.type || "").toLowerCase() === "application/pdf" ||
        (f.name || "").toLowerCase().endsWith(".pdf")
    );
    setFiles(pdfs);
    setRows([]); // clear old results when new files chosen
  };

  const onExtract = async () => {
    if (!files?.length) return alert("Please select one or more PDF files.");
    setLoading(true);
    try {
      const data = await extractTextFromPdfs(files);
      const normalized = (Array.isArray(data) ? data : []).map((r, i) => ({
        id: i + 1,
        fileName: r.fileName || files[i]?.name || `File ${i + 1}`,
        invoiceNo: r.invoiceNo || "",
        bookingNo: r.bookingNo || "",
        issueDate: r.issueDate || "",
        dueDate: r.dueDate || "",
        vesselName: r.vesselName || "",
        voyageCode: r.voyageCode || "",
        customerMerged: r.customerMerged || "",
        blNumber: r.blNumber || "",
        totalFigure: r.totalFigure || "",
        freight: r.freight || "No",
      }));
      setRows(normalized);
      console.log("EXTRACTED_ROWS =", JSON.stringify(normalized, null, 2));
    } catch (err) {
      console.error(err);
      alert(`Extraction failed: ${err?.message || "unknown_error"}`);
    } finally {
      setLoading(false);
    }
  };

  const onReset = () => {
    setFiles([]);
    setRows([]);
    setUikey((k) => k + 1); // remounts uploader, clearing its internal state
  };

  const csvHref = useMemo(() => {
    if (!rows.length) return "";
    const headers = [
      "File Name",
      "Invoice No",
      "Booking No",
      "Issue date",
      "Due date",
      "Vessel Name",
      "Voyage Code",
      "Customer (Name, Address & PoS)",
      "B/L Number",
      "Total Invoice Value (in figure)",
      "Freight",
    ];
    const lines = [headers.join(",")];
    for (const r of rows) {
      const vals = [
        r.fileName,
        r.invoiceNo,
        r.bookingNo,
        r.issueDate,
        r.dueDate,
        r.vesselName,
        r.voyageCode,
        r.customerMerged,
        r.blNumber,
        r.totalFigure,
        r.freight,
      ].map((v) => {
        const s = String(v ?? "");
        return /[,"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
      });
      lines.push(vals.join(","));
    }
    const blob = new Blob([lines.join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    return URL.createObjectURL(blob);
  }, [rows]);

  return (
    <Box sx={{ p: 3, maxWidth: 1280, mx: "auto" }}>
      <Typography
        variant="subtitle2"
        className="!text-[14px] !font-semibold !m-0"
      >
        Invoice Upload
      </Typography>

      {/* Uploader (Tailwind-based component renders the two cards exactly like your mock) */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <MultiSelectFileInput
          key={uikey}
          id="pdfs"
          name="pdfs"
          label="Upload Section"
          accept="application/pdf,.pdf"
          multiple
          maxTotalSizeBytes={100 * 1024 * 1024}
          onChange={handleUploaderChange}
          className="!text-[12px]"
        />

        {/* Actions row – same buttons as before */}
        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          <Button
            variant="contained"
            onClick={onExtract}
            disabled={loading || !files.length}
            startIcon={
              loading ? (
                <CircularProgress size={12} color="inherit" />
              ) : (
                <SaveAltIcon />
              )
            }
            sx={{ textTransform: "none" }}
          >
            {loading ? "Extracting…" : "Extract"}
          </Button>
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<CleaningServicesIcon />}
            onClick={onReset}
            disabled={loading || (!files.length && !rows.length)}
            sx={{ textTransform: "none" }}
          >
            Reset
          </Button>
        </Stack>
      </Paper>

      {/* Results table stays as-is */}
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
          Results {rows.length ? `(${rows.length})` : ""}
        </Typography>
        <Divider sx={{ mb: 1 }} />

        <Box
          sx={{
            overflow: "auto",
            "&::-webkit-scrollbar": { height: 8 },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "divider",
              borderRadius: 8,
            },
          }}
        >
          <Table className="text-xs" stickyHeader aria-label="extracted table">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, fontSize: 10, padding: 0 }}>
                  #
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    minWidth: 240,
                    fontSize: 11,
                    padding: 0,
                  }}
                >
                  File Name
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    minWidth: 160,
                    fontSize: 11,
                    padding: 0,
                  }}
                >
                  Invoice No
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    minWidth: 160,
                    fontSize: 11,
                    padding: 0,
                  }}
                >
                  Booking No
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    minWidth: 140,
                    fontSize: 11,
                    padding: 0,
                  }}
                >
                  Issue date
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    minWidth: 140,
                    fontSize: 11,
                    padding: 0,
                  }}
                >
                  Due date
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    minWidth: 220,
                    fontSize: 11,
                    padding: 0,
                  }}
                >
                  Vessel Name
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    minWidth: 140,
                    fontSize: 11,
                    padding: 0,
                  }}
                >
                  Voyage Code
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    minWidth: 420,
                    fontSize: 11,
                    padding: 0,
                  }}
                >
                  Customer (Name, Address &amp; PoS)
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    minWidth: 160,
                    fontSize: 11,
                    padding: 0,
                  }}
                >
                  B/L Number
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    minWidth: 200,
                    fontSize: 11,
                    padding: 0,
                  }}
                >
                  Total Invoice Value (in figure)
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    minWidth: 120,
                    fontSize: 11,
                    padding: 0,
                  }}
                >
                  Freight
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length ? (
                rows.map((r, idx) => (
                  <TableRow sx={{ fontSize: 11 }} key={r.id ?? idx}>
                    <TableCell sx={{ fontSize: 11 }}>{idx + 1}</TableCell>
                    <TableCell sx={{ fontSize: 11 }}>
                      {r.fileName || "—"}
                    </TableCell>
                    <TableCell sx={{ fontSize: 11 }}>
                      {r.invoiceNo || "—"}
                    </TableCell>
                    <TableCell sx={{ fontSize: 11 }}>
                      {r.bookingNo || "—"}
                    </TableCell>
                    <TableCell sx={{ fontSize: 11 }}>
                      {r.issueDate || "—"}
                    </TableCell>
                    <TableCell sx={{ fontSize: 11 }}>
                      {r.dueDate || "—"}
                    </TableCell>
                    <TableCell sx={{ fontSize: 11 }}>
                      {r.vesselName || "—"}
                    </TableCell>
                    <TableCell sx={{ fontSize: 11 }}>
                      {r.voyageCode || "—"}
                    </TableCell>
                    <TableCell sx={{ fontSize: 11 }}>
                      {r.customerMerged || "—"}
                    </TableCell>
                    <TableCell sx={{ fontSize: 11 }}>
                      {r.blNumber || "—"}
                    </TableCell>
                    <TableCell sx={{ fontSize: 11 }}>
                      {r.totalFigure || "—"}
                    </TableCell>
                    <TableCell sx={{ fontSize: 11 }}>
                      {r.freight || "—"}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={11} align="center" sx={{ py: 5 }}>
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary" }}
                    >
                      No data yet. Select PDFs and click <b>Extract</b>.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Box>
      </Paper>
    </Box>
  );
}
