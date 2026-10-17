"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import {
  Alert,
  Box,
  Button,
  Chip,
  LinearProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import {
  pdfExtractorApi,
  verifyExtractedInvoicesApi,
  uploadVerifiedInvoicesApi,
} from "@/apis/upload.js";
import PdfPreview from "./PdfPreview";
import { PDF_EXTRACTOR_CONFIG } from "@/config/pdfExtractor.config.js";
import { getDataWithCondition } from "@/apis";
import { getUserByCookies } from "@/utils";

const MAX_FILES = PDF_EXTRACTOR_CONFIG.maxFiles;

const MAX_FILE_BYTES = PDF_EXTRACTOR_CONFIG.maxFileSizeMB * 1024 * 1024;

const REQUEST_SIZE = Math.min(
  PDF_EXTRACTOR_CONFIG.filesPerRequest,
  MAX_FILES
);

function csvSafe(value) {
  // Prefix potentially executable spreadsheet formulas to prevent CSV injection.
  const raw = String(value ?? "");
  const safe = /^[\s]*[=+@\-\t\r]/.test(raw) ? `'${raw}` : raw;
  return `"${safe.replace(/"/g, '""')}"`;
}

function downloadBlob(contents, type, name) {
  const url = URL.createObjectURL(new Blob([contents], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}


function prepareInvoiceVerification(rows) {
  const seen = new Set();

  return rows.map((row) => {
    // 1. PDF extraction must have succeeded.
    if (row.status !== "SUCCESS") {
      return {
        ...row,
        verification: {
          status: "BLOCKED",
          message: row.error || "PDF extraction unsuccessful.",
        },
      };
    }

    // 2. The extracted document must be an invoice.
    if (row.documentType !== "INVOICE") {
      return {
        ...row,
        verification: {
          status: "BLOCKED",
          message: "Document is not a supported invoice.",
        },
      };
    }

    // 3. Prevent repeated invoice numbers in the same batch.
    const invoiceNo = String(
      row.invoiceData?.invoiceNo ?? ""
    ).trim().toUpperCase();

    if (invoiceNo && seen.has(invoiceNo)) {
      return {
        ...row,
        verification: {
          status: "DUPLICATE_IN_BATCH",
          message: "Repeated invoice number in this batch.",
        },
      };
    }

    if (invoiceNo) {
      seen.add(invoiceNo);
    }

    // 4. Send invoice data to the backend for verification.
    // Do not block missing invoice number or date here.
    // The backend will return the specific error message.
    return {
      ...row,
      verification: {
        status: "PENDING_VERIFICATION",
        message: "Awaiting invoice verification.",
      },
    };
  });
}



export default function PdfExtractor() {
  const fileInput = useRef(null);
  const filesRef = useRef([]);
  const [files, setFiles] = useState([]);
  const [results, setResults] = useState([]);
  const [processed, setProcessed] = useState(0);
  const [running, setRunning] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    filesRef.current = files;
  }, [files]);

  function addFiles(fileList) {
    if (running) return;
    const incoming = Array.from(fileList || []);
    if (!incoming.length) return;
    if (files.length + incoming.length > MAX_FILES) {
      setMessage(`Maximum ${MAX_FILES} PDFs per batch.`);
      return;
    }
    const invalid = incoming.find(
      (f) => !/\.pdf$/i.test(f.name) || f.size > MAX_FILE_BYTES || !f.size,
    );
    if (invalid) {
      setMessage(`Not a valid PDF or exceeds 10 MB: ${invalid.name}`);
      return;
    }
    const start = files.length ? Math.max(...files.map((f) => f.id)) + 1 : 1;
    setFiles((prev) => [
      ...prev,
      ...incoming.map((file, i) => ({ id: start + i, file })),
    ]);
    setMessage("");
    setPage(0);
  }


  async function verifyInvoices(rows, existingRows = []) {
    const userData = getUserByCookies();
    
    const newIds = new Set(rows.map((row) => row.id));

    const prepared = prepareInvoiceVerification([
      ...existingRows,
      ...rows,
    ]).filter((row) => newIds.has(row.id));

    const eligible = prepared.filter(
      (row) =>
        row.verification?.status === "PENDING_VERIFICATION"
    );


    if (!eligible.length) {
      return prepared;
    }

    try {
      const response = await verifyExtractedInvoicesApi(
        eligible.map((row) => ({
          id: row.id,
          invoiceData: row.invoiceData,
        })),
        userData?.locationId ?? userData?.location
      );

      if (!Array.isArray(response.results)) {
        throw new Error("Invalid verification response.");
      }

      const resultMap = new Map(
        response.results.map((item) => [
          String(item.id),
          item.verification,
        ])
      );

      return prepared.map((row) => {
        if (row.verification.status !== "PENDING_VERIFICATION") {
          return row;
        }

        const verification = resultMap.get(String(row.id));

        return {
          ...row,
          verification: {
            status: "VERIFICATION_UNAVAILABLE",
            message: "No verification result returned.",
            ...verification,
          },
        };
      });
    } catch (error) {
      return prepared.map((row) => {
        if (row.verification.status !== "PENDING_VERIFICATION") {
          return row;
        }

        return {
          ...row,
          verification: {
            status: "VERIFICATION_UNAVAILABLE",
            message: error.message || "Verification failed.",
          },
        };
      });
    }
  }


  function replacePendingPdf(id, newFile) {
    if (running || !newFile) return;

    const existingResult = results.find((row) => row.id === id);

    if (
      existingResult?.verification?.status === "VERIFIED" ||
      existingResult?.verification?.status === "UPLOADED"
    ) {
      setMessage("Verified or uploaded invoices cannot be replaced.");
      return;
    }

    if (
      !/\.pdf$/i.test(newFile.name) ||
      !newFile.size ||
      newFile.size > MAX_FILE_BYTES
    ) {
      setMessage(
        `Select a valid PDF up to ${PDF_EXTRACTOR_CONFIG.maxFileSizeMB} MB.`
      );
      return;
    }

    setFiles((previous) =>
      previous.map((entry) =>
        entry.id === id
          ? { ...entry, file: newFile }
          : entry
      )
    );

    // Invalidate only the replaced PDF's previous results.
    setResults((previous) =>
      previous.filter((row) => row.id !== id)
    );

    setSelectedId(null);
    setMessage("");
  }



  async function runExtraction() {
    if (running || !files.length) return;

    // Keep existing results. Process only unprocessed files.
    const existingResults = [...results];

    const processedIds = new Set(
      existingResults.map((row) => row.id)
    );

    const pendingFiles = files.filter(
      (entry) => !processedIds.has(entry.id)
    );

    if (!pendingFiles.length) {
      setMessage(
        "All selected PDFs have already been processed. Add or replace a PDF to continue."
      );
      return;
    }

    setRunning(true);
    setMessage("");

    const completed = [];

    try {
      for (
        let start = 0;
        start < pendingFiles.length;
        start += REQUEST_SIZE
      ) {
        const group = pendingFiles.slice(
          start,
          start + REQUEST_SIZE
        );

        try {
          const response = await pdfExtractorApi(
            group.map((entry) => entry.file)
          );

          if (
            !response?.success ||
            !Array.isArray(response.results)
          ) {
            throw new Error(
              response?.message || "PDF extraction failed."
            );
          }

          if (response.results.length !== group.length) {
            throw new Error(
              "Incomplete PDF extraction response."
            );
          }

          group.forEach((entry, index) => {
            const result = response.results[index];

            if (
              !result ||
              !["SUCCESS", "OCR_REQUIRED", "FAILED"].includes(
                result.status
              )
            ) {
              throw new Error(
                `Invalid extraction result for ${entry.file.name}`
              );
            }

            completed.push({
              ...result,
              id: entry.id,
              fileName: entry.file.name,
              fileSize: entry.file.size,
            });
          });
        } catch (error) {
          console.error("PDF batch failed:", error);

          group.forEach((entry) => {
            completed.push({
              id: entry.id,
              fileName: entry.file.name,
              fileSize: entry.file.size,
              text: "",
              pageCount: 0,
              characterCount: 0,
              method: "PDF_TEXT",
              status: "FAILED",
              documentType: "UNKNOWN",
              extractionStatus: "FAILED",
              invoiceData: null,
              extractionWarnings: [],
              error: error?.message || "Batch request failed.",
            });
          });
        }

        // Show extraction progress without losing earlier results.
        const combined = [
          ...existingResults,
          ...completed,
        ];

        setProcessed(combined.length);
        setResults(prepareInvoiceVerification(combined).map(
          (row) => {
            const old = existingResults.find(
              (item) => item.id === row.id
            );

            return old || row;
          }
        ));
      }

      // Verify only newly processed invoices.
      const newlyVerified = await verifyInvoices(
        completed,
        existingResults
      );

      setResults([
        ...existingResults,
        ...newlyVerified,
      ]);

      setProcessed(
        existingResults.length + newlyVerified.length
      );
    } catch (error) {
      console.error(
        "Extraction and verification error:",
        error
      );

      setMessage(
        error.message || "Processing failed."
      );
    } finally {
      setRunning(false);
    }
  }



  async function handleUploadVerified() {
    if (running) return;

    const verifiedRows = results.filter(
      (row) => row.verification?.status === "VERIFIED"
    );

    if (!verifiedRows.length) {
      setMessage("No verified invoices available.");
      return;
    }

    const userData = getUserByCookies();

    const items = verifiedRows.map((row) => ({
      file: files.find((f) => f.id === row.id)?.file,
      invoiceRequestId: row.verification.invoiceRequestId,
      invoiceData: {
        ...row.invoiceData,
      },
      userContext: {
        shippingLineId: userData?.companyId,
        branchId: userData?.branchId,
        locationId: userData?.location,
        userId: userData?.userId,
      },
    }));

    if (items.some((item) => !item.file)) {
      setMessage("One or more PDF files are missing.");
      return;
    }

    try {
      setRunning(true);
      setMessage("");

      const response = await uploadVerifiedInvoicesApi(items);

      console.log("PDF UPLOAD RESPONSE:", response);

      if (response?.success === true) {
        const successMessage =
          `${response.totalFiles} invoice PDF(s) uploaded successfully.`;

        toast.success(successMessage);
        setMessage(successMessage);

        const uploadedIds = new Set(verifiedRows.map((row) => row.id));

        setResults((prev) =>
          prev.map((row) =>
            uploadedIds.has(row.id)
              ? {
                ...row,
                verification: {
                  ...row.verification,
                  status: "UPLOADED",
                  message: "Invoice and PDF uploaded successfully.",
                },
              }
              : row
          )
        );
      } else {
        const errorMessage =
          response?.message || "Invoice PDF upload failed.";

        toast.error(errorMessage);
        setMessage(errorMessage);
      }
    } catch (error) {
      console.error("PDF Upload Error:", error);

      const errorMessage =
        error.message || "Invoice PDF upload failed.";

      toast.error(errorMessage);
      setMessage(errorMessage);
    } finally {
      setRunning(false);
    }
  }


  function reset() {
    if (running) return;
    setFiles([]);
    setResults([]);
    setProcessed(0);
    setSelectedId(null);
    setMessage("");
    setQuery("");
    setPage(0);
    if (fileInput.current) fileInput.current.value = "";
  }


  const stats = useMemo(
    () => ({
      success: results.filter(
        (r) => r.status === "SUCCESS"
      ).length,

      failed: results.filter(
        (r) => r.status === "FAILED"
      ).length,

      verified: results.filter(
        (r) => r.verification?.status === "VERIFIED"
      ).length,

      reviewRequired: results.filter(
        (r) =>
          [
            "NOT_VERIFIED",
            "REVIEW_REQUIRED",
            "DUPLICATE",
            "DUPLICATE_IN_BATCH",
            "BLOCKED",
            "VERIFICATION_UNAVAILABLE",
          ].includes(r.verification?.status)
      ).length,
    }),
    [results]
  );


  const filtered = useMemo(
    () =>
      results.filter((r) =>
        r.fileName.toLowerCase().includes(query.toLowerCase()),
      ),
    [results, query],
  );

  const visible = filtered.slice(page * pageSize, (page + 1) * pageSize);
  const selected = results.find((r) => r.id === selectedId);
  const selectedFile = files.find((f) => f.id === selectedId)?.file;

  

  const handleDownloadJson = () => {
    if (!results.length) {
      alert("No extracted PDF data available.");
      return;
    }

    const jsonData = {
      generatedAt: new Date().toISOString(),
      totalFiles: results.length,

      successful: results.filter(
        (item) => item.status === "SUCCESS"
      ).length,

      ocrRequired: results.filter(
        (item) => item.status === "OCR_REQUIRED"
      ).length,

      failed: results.filter(
        (item) => item.status === "FAILED"
      ).length,

      files: results.map((item) => ({
        fileName: item.fileName,
        fileSize: item.fileSize,
        status: item.status,
        method: item.method,
        pageCount: item.pageCount,
        characterCount: item.characterCount,

        // Existing original text
        extractedText: item.text || "",

        // New structured data
        invoiceData: item.invoiceData || null,
        extractionWarnings: item.extractionWarnings || [],

        error: item.error || null,
      })),
    };

    downloadBlob(
      JSON.stringify(jsonData, null, 2),
      "application/json;charset=utf-8",
      `pdf-extraction-${Date.now()}.json`
    );
  };


  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1600, mx: "auto" }}>
      <Typography variant="h5" fontWeight={750}>
        Invoice PDF Text Extractor
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        previews original PDFs and extracts
        selectable text. No invoices are saved.
      </Typography>
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Box
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            addFiles(e.dataTransfer.files);
          }}
          sx={{
            p: 4,
            border: "2px dashed",
            borderColor: "divider",
            borderRadius: 2,
            bgcolor: "action.hover",
            textAlign: "center",
          }}
        >
          <Typography variant="h6">Drop PDF invoices here</Typography>
          <Typography color="text.secondary" variant="body2">
            Up to {MAX_FILES.toLocaleString()} files per selection ·{" "}
            {PDF_EXTRACTOR_CONFIG.maxFileSizeMB} MB per file ·{" "}
            {REQUEST_SIZE} files per request
          </Typography>
          <input
            ref={fileInput}
            type="file"
            accept=".pdf,application/pdf"
            multiple
            hidden
            disabled={running}
            onChange={(e) => {
              addFiles(e.target.files);
              e.target.value = "";
            }}
          />
          <Button
            variant="outlined"
            disabled={running}
            sx={{ mt: 2 }}
            onClick={() => fileInput.current?.click()}
          >
            Choose PDFs
          </Button>
        </Box>
        <Stack
          direction="row"
          useFlexGap
          flexWrap="wrap"
          spacing={1.5}
          sx={{ mt: 2 }}
        >
          <Button
            variant="contained"
            disabled={
              running ||
              !files.some(
                (entry) => !results.some((r) => r.id === entry.id)
              )
            }
            onClick={runExtraction}
          >
            {running ? "Extracting & Verifying…" : "Extract & Verify"}
          </Button>

          <Button
            variant="contained"
            color="success"
            disabled={running || stats.verified === 0}
            onClick={handleUploadVerified}
            title="Test PDF transfer only. No invoice or PDF will be saved."
          >
            Upload Verified Invoices ({stats.verified})
          </Button>

          <Button variant="outlined" disabled={running} onClick={reset}>
            Clear
          </Button>
          {/* <Button
            variant="outlined"
            disabled={running || !results.length}
            onClick={exportCsv}
          >
            Export CSV
          </Button> */}
          <Button
            variant="outlined"
            onClick={handleDownloadJson}
            disabled={!results.length || running}
          >
            Download JSON
          </Button>
        </Stack>
        {message && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {message}
          </Alert>
        )}
        {!!files.length && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress
              variant="determinate"
              value={(processed / files.length) * 100}
            />
            <Typography variant="caption">
              {processed} / {files.length} processed{" "}
              {running ? "— keep this page open" : ""}
            </Typography>
          </Box>
        )}
      </Paper>

      <Stack
        direction="row"
        useFlexGap
        flexWrap="wrap"
        spacing={1}
        sx={{ mb: 2 }}
      >
        <Chip label={`Selected: ${files.length}`} />

        <Chip
          color="info"
          label={`Extracted: ${stats.success}`}
        />

        <Chip
          color="success"
          label={`Verified: ${stats.verified}`}
        />

        <Chip
          color="warning"
          label={`Review: ${stats.reviewRequired}`}
        />

        <Chip
          color="error"
          label={`Failed: ${stats.failed}`}
        />
      </Stack>

      <Paper variant="outlined" sx={{ mb: 3, p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          PDF Results
        </Typography>
        <TextField
          label="Search filename"
          size="small"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(0);
          }}
          sx={{ mb: 2, width: { xs: "100%", sm: 350 } }}
        />
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Filename</TableCell>
                <TableCell>Pages</TableCell>
                <TableCell>Characters</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Verification</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {visible.map((r) => (
                <TableRow key={r.id} hover selected={selectedId === r.id}>
                  <TableCell sx={{ maxWidth: 340, overflowWrap: "anywhere" }}>
                    {r.fileName}
                  </TableCell>
                  <TableCell>{r.pageCount}</TableCell>
                  <TableCell>{r.characterCount}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={
                        r.status === "SUCCESS"
                          ? "Text extracted"
                          : r.status === "OCR_REQUIRED"
                            ? "OCR required"
                            : "Failed"
                      }
                      color={
                        r.status === "SUCCESS"
                          ? "success"
                          : r.status === "OCR_REQUIRED"
                            ? "warning"
                            : "error"
                      }
                    />
                  </TableCell>

                  <TableCell>
                    <Chip
                      size="small"
                      label={
                        r.verification?.status?.replaceAll("_", " ") ||
                        "NOT VERIFIED"
                      }
                      color={
                        r.verification?.status === "VERIFIED"
                          ? "success"
                          : r.verification?.status === "PENDING_VERIFICATION"
                            ? "info"
                            : r.verification?.status === "DUPLICATE_IN_BATCH" ||
                              r.verification?.status === "REVIEW_REQUIRED" ||
                              r.verification?.status === "VERIFICATION_UNAVAILABLE"
                              ? "warning"
                              : "error"
                      }
                    />

                    {r.verification?.message && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "block", mt: 0.5 }}
                      >
                        {r.verification.message}
                      </Typography>
                    )}
                  </TableCell>


                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Button
                        size="small"
                        onClick={() => setSelectedId(r.id)}
                      >
                        Preview
                      </Button>

                      {r.verification?.status !== "VERIFIED" &&
                        r.verification?.status !== "UPLOADED" && (
                          <Button
                            component="label"
                            size="small"
                            variant="outlined"
                            disabled={running}
                          >
                            Replace PDF

                            <input
                              type="file"
                              accept=".pdf,application/pdf"
                              hidden
                              onChange={(event) => {
                                const file = event.target.files?.[0];

                                if (file) {
                                  replacePendingPdf(r.id, file);
                                }

                                event.target.value = "";
                              }}
                            />
                          </Button>
                        )}
                    </Stack>
                  </TableCell>

                </TableRow>
              ))}
              {!visible.length && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No results yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={filtered.length}
          page={page}
          onPageChange={(_e, next) => setPage(next)}
          rowsPerPage={pageSize}
          onRowsPerPageChange={(e) => {
            setPageSize(Number(e.target.value));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 25, 50]}
        />
      </Paper>
      {selected && (
        <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 2 }}
          >
            <Typography variant="h6">
              Invoice Preview &amp; Extracted Text
            </Typography>
            <Button onClick={() => setSelectedId(null)}>Close</Button>
          </Stack>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
              gap: 2,
            }}
          >
            <PdfPreview file={selectedFile} />
            <Paper variant="outlined" sx={{ p: 2, minWidth: 0 }}>
              <Typography variant="subtitle1" fontWeight={700}>
                Extracted Raw Text
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Status: {selected.status} · Pages: {selected.pageCount} ·
                Characters: {selected.characterCount}
              </Typography>
              {selected.error && (
                <Alert severity="error" sx={{ mt: 1 }}>
                  {selected.error}
                </Alert>
              )}
              <Stack direction="row" spacing={1} sx={{ my: 2 }}>
                <Button
                  variant="outlined"
                  size="small"
                  disabled={!selected.text}
                  onClick={() => navigator.clipboard.writeText(selected.text)}
                >
                  Copy Text
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  disabled={!selected.text}
                  onClick={() =>
                    downloadBlob(
                      selected.text,
                      "text/plain;charset=utf-8",
                      "invoice-extracted-text.txt",
                    )
                  }
                >
                  Download Text
                </Button>
              </Stack>
              <Box
                component="pre"
                sx={{
                  p: 2,
                  bgcolor: "action.hover",
                  borderRadius: 1,
                  whiteSpace: "pre-wrap",
                  overflowWrap: "anywhere",
                  fontFamily: "monospace",
                  fontSize: 12,
                  height: { xs: 400, md: 590 },
                  overflow: "auto",
                }}
              >
                {selected.text ||
                  "No selectable text found. OCR will be added in a later phase."}
              </Box>
            </Paper>
          </Box>
        </Paper>
      )}
    </Box>
  );
}
