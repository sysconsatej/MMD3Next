"use client";
/* eslint-disable */
import React, { useState } from "react";
import * as XLSX from "xlsx";
import CustomButton from "@/components/button/button";
import { CustomInput } from "@/components/customInput";
import { ThemeProvider } from "@emotion/react";
import { Box, FormControl, Select, MenuItem } from "@mui/material";
import { theme } from "@/styles";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import fieldData, { dataConfig } from "./uploadData";
import { uploads } from "@/apis";

/* ------------------ hard-coded session (replace later) ------------------ */
const FIXED_CTX = Object.freeze({
    companyId: 7819,
    companyBranchId: 7239,
    clientId: 17,
    financialYearId: 31,
    userId: 279,
});

/* ------------------ helpers ------------------ */
// more robust canonicalizer: trim, drop parens, punctuation, dashes, zero-width
const canon = (s = "") =>
    String(s)
        .normalize("NFKC")
        .replace(/\u200B/g, "")
        .replace(/\s*\([^)]*\)\s*/g, " ")
        .replace(/[.\-_/]/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();

const isEmptyRow = (obj = {}) =>
    Object.values(obj).every((v) => v === null || v === "" || typeof v === "undefined");

const toIsoDate = (d) => {
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

// Extract a File from the CustomInput fileupload field
const getFirstFile = (val) => {
    if (!val) return null;
    if (val instanceof File) return val;
    if (Array.isArray(val)) return val.find((x) => x instanceof File) || null;
    if (val?.file instanceof File) return val.file;
    if (val?.files?.[0] instanceof File) return val.files[0];
    if (val?.target?.files?.[0] instanceof File) return val.target.files[0];
    return null;
};

// Convert dropdown objects to Id/value for SP; ignore the file
const formatHeaderForSp = (obj = {}) => {
    const out = {};
    for (const [k, v] of Object.entries(obj)) {
        if (k === "upload") continue;
        if (v && typeof v === "object") {
            out[k] = v.Id ?? v.id ?? v.value ?? null;
        } else {
            out[k] = v ?? null;
        }
    }
    return out;
};

/** Read workbook and auto-pick the sheet whose headers best match `expectedCols`. */
const parseFile = async (file, expectedCols = []) => {
    const ext = (file?.name?.split(".").pop() || "").toLowerCase();
    if (!["xlsx", "xls", "csv", "json"].includes(ext)) {
        throw new Error("Unsupported file type");
    }

    // JSON passthrough
    if (ext === "json") {
        const text = await file.text();
        const obj = JSON.parse(text);
        const arr = Array.isArray(obj) ? obj : Array.isArray(obj?.data) ? obj.data : [];
        return arr.filter((r) => !isEmptyRow(r));
    }

    // Excel/CSV
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, { type: "array", cellDates: true });

    // Build canonical expected set
    const expectedSet = new Set(expectedCols.map(canon));

    // Score each sheet by header overlap (canon)
    let bestName = wb.SheetNames[0];
    let bestScore = -1;

    for (const name of wb.SheetNames) {
        const sh = wb.Sheets[name];
        // get first row as headers
        const headerRow = XLSX.utils.sheet_to_json(sh, { header: 1, range: 0 })?.[0] || [];
        const gotSet = new Set(headerRow.map(canon));
        let score = 0;
        for (const h of expectedSet) if (gotSet.has(h)) score++;
        if (score > bestScore) {
            bestScore = score;
            bestName = name;
        }
    }

    const sheet = wb.Sheets[bestName];
    const rawRows = XLSX.utils.sheet_to_json(sheet, {
        defval: null,
        raw: false,
        blankrows: false,
        dateNF: "yyyy-mm-dd",
    });

    const rows = rawRows.map((r) => {
        const o = {};
        for (const [k, v] of Object.entries(r)) {
            o[k] = v instanceof Date ? toIsoDate(v) : v;
        }
        return o;
    });

    // Debug which sheet got picked
    console.log("[Upload] Picked sheet:", bestName, "score:", bestScore);
    return rows.filter((r) => !isEmptyRow(r));
};

// Soft header validation (warn-only)
const validateHeaders = (rows, expected) => {
    if (!rows?.length) return { ok: false, missing: expected, extra: [] };
    const firstRowHeaders = Object.keys(rows[0]);

    const expectedSet = new Set(expected.map(canon));
    const gotSet = new Set(firstRowHeaders.map(canon));

    const missing = expected.filter((h) => !gotSet.has(canon(h)));
    const extra = firstRowHeaders.filter((h) => !expectedSet.has(canon(h)));
    return { ok: missing.length === 0, missing, extra };
};
/* --------------------------------------------- */

export default function MblUpload() {
    const [formData, setFormData] = useState({});
    const [selectedTemplate, setSelectedTemplate] = useState("");
    const [busy, setBusy] = useState(false);

    const exportTemplate = (keyParam) => {
        try {
            const key = keyParam || selectedTemplate;
            if (!key) {
                toast.info("Choose a template to download.");
                return;
            }
            const cfg = dataConfig[key];
            if (!cfg?.templateColumns?.length) throw new Error("No columns configured");
            const ws = XLSX.utils.aoa_to_sheet([cfg.templateColumns]);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Template");
            const names = {
                BL: "BL_Template.xlsx",
                Item: "Item_Template.xlsx",
                ContainerImp: "Container_Import_Template.xlsx",
            };
            XLSX.writeFile(wb, names[key] || `${key}_Template.xlsx`);
            toast.success(`${cfg.label} template downloaded`);
        } catch (e) {
            toast.error(e.message || "Failed to export template");
        }
    };

    // DO NOT auto-download on change (fix for your bug)
    const handleTemplateChange = (e) => {
        setSelectedTemplate(e.target.value);
    };

    const handleUpload = async (e) => {
        e.preventDefault();

        if (!selectedTemplate) {
            toast.warn("Please select a template first.");
            return;
        }

        const file = getFirstFile(formData.upload);
        if (!file) return toast.warn("Please choose a file in the 'Upload File' field");

        setBusy(true);
        try {
            const cfg = dataConfig[selectedTemplate];
            if (!cfg?.sp) throw new Error("Stored procedure not configured for this template");

            // Read the workbook and auto-pick the correct sheet for this template
            const rows = await parseFile(file, cfg.templateColumns || []);
            if (!rows?.length) throw new Error("No data rows found");

            if (cfg.templateColumns?.length) {
                const { ok, missing, extra } = validateHeaders(rows, cfg.templateColumns);
                if (!ok && missing?.length) {
                    toast.warn(
                        `Missing columns: ${missing.slice(0, 6).join(", ")}${missing.length > 6 ? "..." : ""}`
                    );
                }
                if (extra?.length) {
                    toast.warn(
                        `Ignoring extra columns: ${extra.slice(0, 6).join(", ")}${extra.length > 6 ? "..." : ""}`
                    );
                }
            }

            const header = {
                ...formatHeaderForSp(formData),
                ...FIXED_CTX,
            };

            // BL → inputMbl ; others use their configured SPs
            const spName = selectedTemplate === "BL" ? "inputMbl" : cfg.sp;

            console.log("Uploading via SP:", spName, { template: selectedTemplate });
            const payload = {
                spName,
                json: { template: selectedTemplate, header, data: rows },
            };

            const resp = await uploads(payload);
            if (resp?.success) {
                toast.success(resp?.message || "Uploaded successfully");
            } else {
                toast.warn(resp?.message || "No data returned from SP");
            }
        } catch (err) {
            toast.error(err.message || "Failed to upload");
        } finally {
            setBusy(false);
        }
    };

    return (
        <ThemeProvider theme={theme}>
            <form>
                <section className="py-1 px-4">
                    <Box className="flex justify-between items-end py-1">
                        <h1 className="text-left text-base flex items-end m-0">MBL Upload</h1>
                        <CustomButton text="Back" href="/bl/mbl/list" />
                    </Box>

                    <Box className="border border-solid border-black rounded-[4px]">
                        <Box className="sm:grid sm:grid-cols-4 gap-2 flex flex-col p-1 border-b border-b-solid border-b-black">
                            <CustomInput
                                fields={fieldData.mblFields}
                                formData={formData}
                                setFormData={setFormData}
                                disabled={busy}
                            />

                            {/* Template dropdown — no auto-download */}
                            <FormControl
                                size="small"
                                disabled={busy}
                                sx={{
                                    minWidth: 260,
                                    "& .MuiOutlinedInput-root": {
                                        height: 36,
                                        fontSize: "0.85rem",
                                        borderRadius: "10px",
                                        "& .MuiSelect-select": { display: "flex", alignItems: "center", padding: "6px 10px" },
                                        "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(0,0,0,0.25)", borderRadius: "10px" },
                                        "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#3d74b6" },
                                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#3d74b6", borderWidth: "1px" },
                                        "& .MuiOutlinedInput-notchedOutline legend": { display: "none" },
                                    },
                                }}
                            >
                                <Select
                                    labelId="template-select-label"
                                    value={selectedTemplate}
                                    label="Template"
                                    onChange={handleTemplateChange}
                                    displayEmpty
                                    renderValue={(v) =>
                                        v ? dataConfig[v]?.label || v : <span style={{ color: "#9aa0a6" }}>— Select File —</span>
                                    }
                                    MenuProps={{
                                        PaperProps: {
                                            sx: {
                                                borderRadius: "10px",
                                                boxShadow: "0 10px 25px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.06)",
                                                "& .MuiMenuItem-root": { fontSize: "0.9rem", py: 1 },
                                            },
                                        },
                                    }}
                                >
                                    <MenuItem value="">
                                        <em>— Select File —</em>
                                    </MenuItem>
                                    {Object.entries(dataConfig).map(([key, v]) => (
                                        <MenuItem key={key} value={key}>
                                            {v.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>
                    </Box>

                    <Box className="w-full flex mt-2 gap-2 items-center">
                        <CustomButton text="Download Template" onClick={() => exportTemplate()} disabled={busy} />
                        <CustomButton text={busy ? "Uploading…" : "Upload"} onClick={handleUpload} disabled={busy} />
                    </Box>
                </section>
            </form>
            <ToastContainer position="top-right" autoClose={3500} />
        </ThemeProvider>
    );
}
