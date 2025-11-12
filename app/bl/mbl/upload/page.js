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
import { uploads } from "@/apis"; // no need to fetch master row anymore

/* ------------------ fixed ctx (replace with session) ------------------ */
const FIXED_CTX = Object.freeze({
  companyId: 7819,
  companyBranchId: 7239,
  clientId: 17,
  financialYearId: 31,
  userId: 279,
});

/* ------------------ URL + template file map ------------------ */
const BASE_URL =
  (process.env.NEXT_PUBLIC_BACKEND_URL || "").replace(/\/+$/, "") + "/";

/** Canonicalize text for matching */
const canon = (s = "") =>
  String(s)
    .normalize("NFKC")
    .replace(/\u200B/g, "")
    .replace(/\s*\([^)]*\)\s*/g, " ")
    .replace(/[.\-_/]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

/** Your uploaded files on Node (add/edit names if your MD names differ) */
const TEMPLATE_FILES = [
  {
    names: ["MBLMaster", "MBL Master", "Master BL", "MasterBL"],
    filename: "mblBlMasterUpload.xlsx",
    path: `${BASE_URL}uploads/mblBlMasterUpload.xlsx`,
  },
  {
    names: ["MBLContainer", "MBL Container", "Container", "BL Container"],
    filename: "mblBlContainerUpload.xlsx",
    path: `${BASE_URL}uploads/mblBlContainerUpload.xlsx`,
  },
  {
    names: ["MBLItem", "MBL Item", "Item", "BL Item"],
    filename: "mblBlItemUpload.xlsx",
    path: `${BASE_URL}uploads/mblBlItemUpload.xlsx`,
  },
];

/** Find file by matching the selected template name */
const findTemplateFile = (selectedName = "") => {
  const csel = canon(selectedName);
  // exact/alias match
  for (const f of TEMPLATE_FILES) {
    if (f.names.some((n) => canon(n) === csel)) return f;
  }
  // heuristic by keyword
  if (/\bcontainer\b/.test(csel)) return TEMPLATE_FILES[1];
  if (/\bitem\b/.test(csel)) return TEMPLATE_FILES[2];
  // default master
  return TEMPLATE_FILES[0];
};

/* ------------------ helpers ------------------ */
const isEmptyRow = (obj = {}) =>
  Object.values(obj).every(
    (v) => v === null || v === "" || typeof v === "undefined"
  );

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

const formatHeaderForSp = (obj = {}) => {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (k === "upload") continue; // don't send file
    if (v && typeof v === "object") out[k] = v.Id ?? v.id ?? v.value ?? null;
    else out[k] = v ?? null;
  }
  return out;
};

// Minimal parse: first sheet only
const parseFile = async (file) => {
  const ext = (file?.name?.split(".").pop() || "").toLowerCase();
  if (!["xlsx", "xls", "csv", "json"].includes(ext))
    throw new Error("Unsupported file type");

  if (ext === "json") {
    const text = await file.text();
    const obj = JSON.parse(text);
    const arr = Array.isArray(obj)
      ? obj
      : Array.isArray(obj?.data)
      ? obj.data
      : [];
    return arr.filter((r) => !isEmptyRow(r));
  }

  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array", cellDates: true });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rawRows = XLSX.utils.sheet_to_json(sheet, {
    defval: null,
    raw: false,
    blankrows: false,
    dateNF: "yyyy-mm-dd",
  });

  const rows = rawRows.map((r) => {
    const o = {};
    for (const [k, v] of Object.entries(r))
      o[k] = v instanceof Date ? toIsoDate(v) : v;
    return o;
  });
  return rows.filter((r) => !isEmptyRow(r));
};

/** Infer SP directly from template name */
const getSpFromTemplateName = (name = "") => {
  const c = canon(name);
  if (/\bcontainer\b/.test(c)) return "inputMblContainer";
  if (/\bitem\b/.test(c)) return "inputMblItem";
  return "inputMbl"; // default
};

/** Download helper: try blob, fallback window.open */
const downloadViaUrl = async (url, filenameBase = "Template") => {
  try {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error("Download failed");
    const blob = await resp.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    const extGuess =
      url.split("?")[0].split("#")[0].split(".").pop()?.toLowerCase() || "xlsx";
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
  const [objectToRemove, setObjectsToRemove] = useState(1);

  const getSelectedTemplateName = () =>
    formData?.template?.Name ||
    formData?.template?.name ||
    formData?.template?.label ||
    formData?.template?.Code ||
    formData?.template?.code ||
    "";

  /* ------------------ Download Template (mapped to Node files) ------------------ */
  const handleDownloadTemplate = async () => {
    const selectedName = getSelectedTemplateName();
    if (!selectedName) {
      toast.info("Please select a Template first.");
      return;
    }
    try {
      setBusy(true);
      const file = findTemplateFile(selectedName);
      if (!file?.path)
        throw new Error("No template file mapped for this selection.");
      await downloadViaUrl(file.path, file.filename.replace(/\.xlsx$/i, ""));
      toast.success("Template download started.");
    } catch (err) {
      toast.error(err?.message || "Unable to download template");
    } finally {
      setBusy(false);
    }
  };

  /* ------------------ Upload (SP inferred from Template name) ------------------ */
  const handleUpload = async (e) => {
    e.preventDefault();

    const file = getFirstFile(formData.upload);
    if (!file)
      return toast.warn("Please choose a file in the 'Upload File' field");

    const selectedName = getSelectedTemplateName();
    if (!selectedName)
      return toast.warn("Please select a Template before uploading.");

    setBusy(true);
    try {
      const rows = await parseFile(file);
      if (!rows?.length) throw new Error("No data rows found");

      const header = { ...formatHeaderForSp(formData), ...FIXED_CTX };
      const spName = getSpFromTemplateName(selectedName);

      // Quote-like characters to remove from keys/values
      const QUOTE_RE = /['\u2019\u2018\u02BC\uFF07\u2032\u2035\u0060]/g;
      // '  ’  ‘  ʼ  ＇  ′  ‵  `

      // Deep sanitizer: remove quotes in strings, strip "__EMPTY*" keys, and clean key names
      const sanitizeDeep = (val) => {
        const isEmptyKey = (k) => /^__EMPTY/i.test(k);

        if (val == null) return val;

        if (typeof val === "string") {
          return val.replace(QUOTE_RE, "");
        }

        if (Array.isArray(val)) {
          return val.map(sanitizeDeep);
        }

        if (typeof val === "object") {
          const out = {};
          for (const [rawKey, rawVal] of Object.entries(val)) {
            if (isEmptyKey(rawKey)) continue;

            const newKey = rawKey.replace(QUOTE_RE, "");
            const newVal = sanitizeDeep(rawVal);

            if (Object.prototype.hasOwnProperty.call(out, newKey)) {
              const cur = out[newKey];
              const isEmpty =
                cur == null ||
                (typeof cur === "string" && cur.trim() === "") ||
                (Array.isArray(cur) && cur.length === 0);
              if (isEmpty) out[newKey] = newVal;
            } else {
              out[newKey] = newVal;
            }
          }
          return out;
        }

        return val; // numbers, booleans, etc.
      };

      // ---- Use your state here ----
      // e.g. const objectToRemove = Number(newState?.objectToRemove) ?? 0;
      const toNonNegInt = (v) => {
        const n = Number(v);
        return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
      };

      // Clean inputs
      const cleanHeader = sanitizeDeep(header);
      const cleanRows = sanitizeDeep(rows);
      const cleanName =
        typeof selectedName === "string"
          ? selectedName.replace(QUOTE_RE, "")
          : selectedName;

      // Remove the top N rows from data
      const N = toNonNegInt(objectToRemove); // <-- from your state
      const prunedRows = Array.isArray(cleanRows)
        ? cleanRows.slice(Math.min(N, cleanRows.length)) // safe clamp
        : cleanRows; // if not an array, leave as-is

      // Build payload
      const payload = {
        spName,
        json: {
          template: cleanName,
          header: cleanHeader,
          data: prunedRows,
        },
      };

      const resp = await uploads(payload);
      if (resp?.success)
        toast.success(resp?.message || "Uploaded successfully");
      else toast.warn(resp?.message || "No data returned from SP");
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
            <h1 className="text-left text-base flex items-end m-0">
              MBL Upload
            </h1>
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
            <CustomButton
              text="Download Template"
              onClick={handleDownloadTemplate}
              disabled={busy}
            />
            <CustomButton
              text={busy ? "Uploading…" : "Upload"}
              onClick={handleUpload}
              disabled={busy}
            />
          </Box>
        </section>
      </form>
      <ToastContainer position="top-right" autoClose={3500} />
    </ThemeProvider>
  );
}
