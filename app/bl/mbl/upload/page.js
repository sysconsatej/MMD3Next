"use client";
/* eslint-disable */
import React, { useState } from "react";
import * as XLSX from "xlsx";
import CustomButton from "@/components/button/button";
import { CustomInput } from "@/components/customInput";
import { ThemeProvider } from "@emotion/react";
import { Box } from "@mui/material";
import { theme } from "@/styles";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import fieldData from "./uploadData";
import { uploads } from "@/apis"; // ← functional now

/* ------------------ fixed ctx (replace with session) ------------------ */
const CTX = Object.freeze({
    companyId: 7819,
    companyBranchId: 7239,
    clientId: 17,
    financialYearId: 31,
    userId: 279,
});

/* ------------------ URL helpers ------------------ */
const BASE_URL = ((process.env.NEXT_PUBLIC_BACKEND_URL || "").replace(/\/+$/, "")) + "/";
const joinUrl = (base, path) =>
    `${String(base).replace(/\/+$/, "")}/${String(path).replace(/^\/+/, "")}`;

/* =======================================================================
   STRICT mapping (no heuristics)
   - Accept ONLY:
     Code: MBLMaster | MBLContainer | MBLItem
     Name: MBL Master | MBL Container | MBL Item
   ======================================================================= */
function mapTemplateToConfig(tpl) {
    const code = (tpl?.Code ?? tpl?.code ?? "").trim();
    const name = (tpl?.Name ?? tpl?.name ?? tpl?.label ?? "").trim();
    const key = code || name; // prefer Code; else Name

    switch (key) {
        case "MBLMaster":
        case "MBL Master":
            return {
                spName: "inputMbl",
                downloadPath: "uploads/mblBlMasterUpload.xlsx",
            };
        case "MBLContainer":
        case "MBL Container":
            return {
                spName: "inputMblContainer",
                downloadPath: "uploads/mblBlContainerUpload.xlsx",
            };
        case "MBLItem":
        case "MBL Item":
            return {
                spName: "inputMblItem",
                downloadPath: "uploads/mblBlItemUpload.xlsx",
            };
        default:
            throw new Error(
                `Unknown Template. Expected Code [MBLMaster|MBLContainer|MBLItem] or Name [MBL Master|MBL Container|MBL Item]. Got Code='${code}' Name='${name}'.`
            );
    }
}

/* ------------------ helpers ------------------ */
const isEmptyRow = (obj = {}) =>
    Object.values(obj).every((v) => v === null || v === "" || typeof v === "undefined");

const toIsoDate = (d) => {
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const getFirstFile = (val) => {
    if (!val) return null;
    if (val instanceof File) return val;
    if (Array.isArray(val)) return val.find((x) => x instanceof File) || null;
    if (val?.file instanceof File) return val.file;
    if (val?.files?.[0] instanceof File) return val.files[0];
    if (val?.target?.files?.[0] instanceof File) return val.target.files[0];
    return null;
};

const formatCriteria = (obj = {}) => {
    const out = {};
    for (const [k, v] of Object.entries(obj)) {
        if (k === "upload" || k === "template" || k === "templatedropdown") continue;
        if (v && typeof v === "object") out[k] = v.Id ?? v.id ?? v.value ?? null;
        else out[k] = v ?? null;
    }
    return out;
};

// Replace your current parseFile with this:
const parseFile = async (file) => {
    const ext = (file?.name?.split(".").pop() || "").toLowerCase();
    if (!["xlsx", "xls", "csv", "json"].includes(ext)) throw new Error("Unsupported file type");

    // JSON passthrough (no row skipping needed)
    if (ext === "json") {
        const text = await file.text();
        const obj = JSON.parse(text);
        const arr = Array.isArray(obj) ? obj : Array.isArray(obj?.data) ? obj.data : [];
        return arr.filter((r) => !isEmptyRow(r));
    }

    // Excel / CSV path
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, { type: "array", cellDates: true });
    const ws = wb.Sheets[wb.SheetNames[0]];

    const headerRow = (XLSX.utils.sheet_to_json(ws, {
        header: 1,
        range: 0,
        raw: true,
        blankrows: false,
        defval: null,
    })[0]) || [];

    const objects = XLSX.utils.sheet_to_json(ws, {
        range: 2,
        header: headerRow,
        raw: true,
        blankrows: false,
        defval: null,
    });

    const rows = objects.map((r) => {
        const o = {};
        for (const [k, v] of Object.entries(r)) o[k] = v instanceof Date ? toIsoDate(v) : v;
        return o;
    }).filter((r) => !isEmptyRow(r));

    return rows;
};

const downloadViaUrl = async (url, filenameBase = "Template") => {
    try {
        const resp = await fetch(url);
        if (!resp.ok) throw new Error("Download failed");
        const blob = await resp.blob();
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        const extGuess = url.split("?")[0].split("#")[0].split(".").pop()?.toLowerCase() || "xlsx";
        a.download = `${filenameBase}.${extGuess.replace(/[^a-z0-9]/gi, "")}`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(a.href);
    } catch {
        window.open(url, "_blank");
    }
};

export default function MblUpload() {
    const [formData, setFormData] = useState({});
    const [busy, setBusy] = useState(false);

    const selectedTemplate = () =>
        formData?.template ?? formData?.templatedropdown ?? null;

    const selectedTemplateLabel = (tpl) =>
        tpl?.Name || tpl?.name || tpl?.label || tpl?.Code || tpl?.code || "";

    const handleDownloadTemplate = async () => {
        const tpl = selectedTemplate();
        if (!tpl) return toast.error("Select a Template first.");

        let cfg;
        try {
            cfg = mapTemplateToConfig(tpl);
        } catch (e) {
            toast.error(e.message);
            console.warn("[Template] mapping failed:", { tpl });
            return;
        }

        try {
            setBusy(true);
            const url = joinUrl(BASE_URL, cfg.downloadPath);
            console.log("[Template] download", {
                template: selectedTemplateLabel(tpl),
                sp: cfg.spName,
                url,
            });
            await downloadViaUrl(url, cfg.spName);
            toast.success("Template download started.");
        } catch (err) {
            toast.error(err?.message || "Unable to download template");
        } finally {
            setBusy(false);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();

        const file = getFirstFile(formData.upload);
        if (!file) return toast.warn("Choose a file in the 'Upload File' field");

        const tpl = selectedTemplate();
        if (!tpl) return toast.error("Select a Template before uploading.");

        let cfg;
        try {
            cfg = mapTemplateToConfig(tpl);
        } catch (e) {
            toast.error(e.message);
            console.warn("[Upload] mapping failed:", { tpl });
            return;
        }

        setBusy(true);
        try {
            const rows = await parseFile(file);
            if (!rows?.length) throw new Error("No data rows found");

            const json = {
                template: selectedTemplateLabel(tpl),
                header: {
                    clientId: CTX.clientId,
                    userId: CTX.userId,
                    createdBy: CTX.userId,
                    companyId: CTX.companyId,
                    companyBranchId: CTX.companyBranchId,
                },
                criteria: formatCriteria(formData),
                data: rows,
            };

            const payload = { spName: cfg.spName, json };
            if (cfg.spName === "inputMbl") {
                payload.createdBy = CTX.userId;
                payload.clientId = CTX.clientId;
                payload.companyId = CTX.companyId;
                payload.companyBranchId = CTX.companyBranchId;
            }

            console.log("[Upload] calling", cfg.spName, payload);

            const resp = await uploads(payload);
            if (resp?.success) {
                toast.success(resp?.message || "Uploaded successfully");
            } else {
                toast.warn(resp?.message || "Upload completed, but no success flag returned");
            }
        } catch (err) {
            toast.error(err?.message || "Failed to upload");
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
                        </Box>
                    </Box>

                    <Box className="w-full flex mt-2 gap-2 items-center">
                        <CustomButton text="Download Template" onClick={handleDownloadTemplate} disabled={busy} />
                        <CustomButton text={busy ? "Uploading…" : "Upload"} onClick={handleUpload} disabled={busy} />
                    </Box>
                </section>
            </form>
            <ToastContainer position="top-right" autoClose={3500} />
        </ThemeProvider>
    );
}
