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

export default function xlUpload() {
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
  const toCamelKey = (s) => {
    const str = String(s ?? "")
      .trim()
      .replace(/\s+/g, " ")
      .replace(/[()]/g, " ")
      .replace(/[^a-zA-Z0-9 ]/g, " ")
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
    return Object.values(obj).every((v) => {
      const s = String(v ?? "").trim();
      return s === "" || s.toLowerCase() === "nan";
    });
  };

  const handleUpload = async (e) => {
  e.preventDefault();

  const shippingLineId =
    formData?.shippingLineId?.Id ?? formData?.shippingLineId?.id ?? null;

  if (!shippingLineId) {
    toast.error("Please select Shipping Line first.");
    return;
  }

  const file = getFirstFile(formData.upload);
  if (!file) {
    toast.warn("Please choose a file in the 'Upload File' field");
    return;
  }

  setBusy(true);
  try {
    const buffer = await file.arrayBuffer();
    const wb = XLSX.read(buffer, { type: "array" });
    const sheetName = wb.SheetNames[0];
    const ws = wb.Sheets[sheetName];

    const excelRows = XLSX.utils.sheet_to_json(ws, {
      defval: "",
      raw: false,
      blankrows: false,
    });

    if (!excelRows.length) {
      toast.warn("No rows found in the Excel sheet");
      return;
    }

    // 1) normalize excel headers -> camel keys (your existing logic)
    const normalized = excelRows
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

    if (!normalized.length) {
      toast.warn("No valid rows found after cleaning.");
      return;
    }

    // 2) map to EXACT keys your SP expects in OPENJSON WITH(...)
    const dataForSp = normalized
      .map((r, idx) => ({
        srNo: String(r?.srNo ?? idx + 1),

        dpdImporterName: String(
          r?.dpdImporterName ?? r?.dpdImporter ?? r?.name ?? ""
        ).trim(),

        iecNumber: String(r?.iecNumber ?? r?.iecCode ?? "").trim(),

        shippingLineName: String(r?.shippingLineName ?? "").trim(),
        vesselName: String(r?.vesselName ?? "").trim(),
        etaOfVessel: String(r?.etaOfVessel ?? "").trim(),
        dateOfRequest: String(r?.dateOfRequest ?? "").trim(),
        cfsName: String(r?.cfsName ?? "").trim(),

        billOfLadingMaster: String(
          r?.billOfLadingMaster ?? r?.mblNo ?? r?.mbl ?? ""
        ).trim(),
        dateMaster: String(r?.dateMaster ?? "").trim(),

        billOfLadingHouse: String(
          r?.billOfLadingHouse ?? r?.hblNo ?? r?.hbl ?? ""
        ).trim(),
        dateHouse: String(r?.dateHouse ?? "").trim(),

        reasonOfChange: String(r?.reasonOfChange ?? "").trim(),
        mobile: String(r?.mobile ?? "").trim(),
        email: String(r?.email ?? "").trim(),
        cfsreasonid: String(r?.cfsreasonid ?? r?.cfsReasonId ?? "").trim(),
      }))
      // optional: remove completely empty rows (except srNo)
      .filter((x) =>
        Object.entries(x).some(([k, v]) =>
          k === "srNo" ? false : String(v ?? "").trim() !== ""
        )
      );

    if (!dataForSp.length) {
      toast.warn("No valid rows to upload.");
      return;
    }

    // 3) bind SP call (like your UploadDPDParties example)
    const obj = {
      spName: "Upload72Hours",
      json: {
        shippingLineId,
        data: dataForSp, // must be $.data
      },
    };

    const resp = await uploads(obj);

    if (resp?.success) {
      toast.success(resp?.message || "Uploaded successfully");
      // optional: clear file
      setFormData((prev) => ({ ...prev, upload: null }));
    } else {
      toast.error(resp?.message || "Upload failed");
    }
  } catch (err) {
    toast.error(err?.message || "Failed to read/upload file.");
  } finally {
    setBusy(false);
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
              Upload 72 Hours Data
            </h1>
            {/* <CustomButton text="Back" href="/bl/mbl/list" /> */}
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
