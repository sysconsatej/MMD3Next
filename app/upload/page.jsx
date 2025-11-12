"use client";
/* eslint-disable */
import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Grid,
  Paper,
} from "@mui/material";

export default function PdfHighlightExtractor() {
  const [pdfFile, setPdfFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fields, setFields] = useState(null); // extracted fields
  const [engine, setEngine] = useState("");

  const onExtract = async () => {
    if (!pdfFile) return alert("Upload a PDF first");
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("pdf", pdfFile);

      const res = await fetch("/api/extractPdf", { method: "POST", body: fd });
      const data = await res.json();

      if (!res.ok || !data?.ok) {
        console.error("Extract error:", data);
        alert(`Failed: ${data?.error || "unknown_error"}`);
        return;
      }

      setEngine(data.engine);
      setFields(data.fields || {});

      // >>> console the JSON (pretty)
      // You’ll see this in the browser devtools console
      console.log(
        "EXTRACTED_FIELDS_JSON =",
        JSON.stringify(data.fields, null, 2)
      );
    } catch (e) {
      console.error(e);
      alert("Extraction failed");
    } finally {
      setLoading(false);
    }
  };

  const FieldBox = ({ label, value }) => (
    <Paper variant="outlined" sx={{ p: 1.5 }}>
      <Typography variant="caption" sx={{ color: "text.secondary" }}>
        {label}
      </Typography>
      <Typography variant="subtitle1" sx={{ mt: 0.5, fontWeight: 600 }}>
        {value ?? "—"}
      </Typography>
    </Paper>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Highlighted Fields
      </Typography>

      <Box sx={{ display: "flex", gap: 1.5, alignItems: "center", mb: 2 }}>
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)}
        />
        <Button
          variant="contained"
          onClick={onExtract}
          disabled={loading || !pdfFile}
        >
          {loading ? <CircularProgress size={20} color="inherit" /> : "Extract"}
        </Button>
        {engine ? (
          <Typography variant="caption" sx={{ ml: 1, color: "text.secondary" }}>
            Engine: {engine}
          </Typography>
        ) : null}
      </Box>

      <Grid container spacing={1.5}>
        <Grid item xs={12} sm={6} md={3}>
          <FieldBox label="Invoice No" value={fields?.invoiceNo} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <FieldBox label="B/L Number" value={"—"} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <FieldBox label="Booking No" value={fields?.bookingNo} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <FieldBox label="Issue date" value={fields?.issueDate} />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <FieldBox label="Due date" value={fields?.dueDate} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <FieldBox label="Vessel Name" value={fields?.vesselName} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <FieldBox label="Voyage Code" value={fields?.voyageCode} />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <FieldBox label="Customer PAN" value={fields?.customerPAN} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <FieldBox label="Customer GST" value={fields?.customerGST} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <FieldBox label="State Code" value={fields?.stateCode} />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <FieldBox label="Taxable Value (INR)" value={fields?.taxableValue} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <FieldBox label="CGST (INR)" value={fields?.cgstValue} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <FieldBox label="SGST/UGST (INR)" value={fields?.sgstValue} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <FieldBox label="IGST (INR)" value={fields?.igstValue} />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <FieldBox label="Total Invoice Value" value={fields?.totalFigure} />
        </Grid>
      </Grid>

      {/* Optional: show the JSON on page for a quick copy */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle2" sx={{ mb: 1, color: "text.secondary" }}>
          Extracted JSON
        </Typography>
        <pre
          style={{
            margin: 0,
            padding: "12px",
            border: "1px solid #ddd",
            borderRadius: 8,
            background: "#fafafa",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {JSON.stringify(fields ?? {}, null, 2)}
        </pre>
      </Box>
    </Box>
  );
}
