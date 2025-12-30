"use client";
/* eslint-disable */
import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import CustomButton from "@/components/button/button";
import { CustomInput } from "@/components/customInput";
import { ThemeProvider } from "@emotion/react";
import { Box } from "@mui/material";
import { theme } from "@/styles";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import fieldData from "./uploadData";
import { uploads, getDataWithCondition } from "@/apis";
import { getUserByCookies } from "@/utils";
import ErrorList from "@/components/errorTable/errorList";
const BASE_URL =
  (process.env.NEXT_PUBLIC_BACKEND_URL || "").replace(/\/+$/, "") + "/";

const canon = (s = "") =>
  String(s)
    .normalize("NFKC")
    .replace(/\u200B/g, "")
    .replace(/\s*\([^)]*\)\s*/g, " ")
    .replace(/[.\-_/]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

const findTemplateFile = (selectedName = "") => {
  const csel = canon(selectedName);
  for (const f of TEMPLATE_FILES) {
    if (f.names.some((n) => canon(n) === csel)) return f;
  }
  if (/\bcontainer\b/.test(csel)) return TEMPLATE_FILES[1];
  if (/\bitem\b/.test(csel)) return TEMPLATE_FILES[2];
  return TEMPLATE_FILES[0];
};

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
    if (k === "upload") continue;
    if (v && typeof v === "object") out[k] = v.Id ?? v.id ?? v.value ?? null;
    else out[k] = v ?? null;
  }
  return out;
};

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

const getSpFromTemplateName = (name = "") => {
  const c = canon(name);
  if (/container/.test(c)) return "inputMblContainer";
  if (/item/.test(c)) return "inputMblItem";
  return "inputMbl";
};

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
  const userData = getUserByCookies();
  const [errorGrid, setErrorGrid] = useState([]);

  const getSelectedTemplateName = () =>
    formData?.template?.Name ||
    formData?.template?.name ||
    formData?.template?.label ||
    formData?.template?.Code ||
    formData?.template?.code ||
    "";
  // convert header like "Bill of Lading(Master)" -> "billOfLadingMaster"
  const toCamelKey = (s) => {
    const str = String(s ?? "")
      .trim()
      .replace(/\s+/g, " ")
      .replace(/[()]/g, " ") // remove brackets
      .replace(/[^a-zA-Z0-9 ]/g, " ") // remove special chars
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();

    if (!str) return "";

    const parts = str.split(" ");
    return parts
      .map((p, i) => (i === 0 ? p : p.charAt(0).toUpperCase() + p.slice(1)))
      .join("");
  };

  const isRowEmpty = (obj) => {
    // row empty if all values are blank/null/undefined
    return Object.values(obj).every((v) => {
      const s = String(v ?? "").trim();
      return s === "" || s.toLowerCase() === "nan";
    });
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    const file = getFirstFile(formData.upload);
    if (!file) {
      toast.warn("Please choose a file in the 'Upload File' field");
      return;
    }

    try {
      // 1) read file -> ArrayBuffer
      const buffer = await file.arrayBuffer();

      // 2) parse excel
      const wb = XLSX.read(buffer, { type: "array" });

      // 3) first sheet
      const sheetName = wb.SheetNames[0];
      const ws = wb.Sheets[sheetName];

      // 4) sheet -> JSON (use defval to avoid undefined)
      // raw:false will make Excel dates come as formatted strings in most cases
      const rows = XLSX.utils.sheet_to_json(ws, {
        defval: "",
        raw: false,
        blankrows: false,
      });

      if (!rows.length) {
        toast.warn("No rows found in the Excel sheet");
        return;
      }

      // 5) normalize keys (optional but recommended)
      const normalized = rows
        .map((r) => {
          const out = {};
          for (const [k, v] of Object.entries(r)) {
            const nk = toCamelKey(k);
            if (!nk) continue;
            out[nk] = typeof v === "string" ? v.trim() : v;
          }
          return out;
        })
        .filter((r) => !isRowEmpty(r));

      // ✅ Your final JSON
      console.log("Excel JSON:", normalized);

      // If you want to store it in state:
      // setExcelJson(normalized);

      // If you want to store inside formData (example):
      // setFormData((prev) => ({ ...prev, excelJson: normalized }));

      toast.success(`Converted ${normalized.length} rows to JSON`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to read Excel. Please check the file format.");
    }
  };

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      upload: null,
    }));
    setErrorGrid([]);
  }, [formData?.template]);
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
              text={busy ? "Uploading…" : "Upload"}
              onClick={handleUpload}
              disabled={busy}
            />
          </Box>
          <ErrorList errorGrid={errorGrid} fileName={"MBL-Upload"} />
        </section>
      </form>
      <ToastContainer position="top-right" autoClose={3500} />
    </ThemeProvider>
  );
}
