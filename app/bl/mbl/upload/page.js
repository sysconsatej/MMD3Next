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
import { uploads } from "@/apis";
import { getUserByCookies } from "@/utils";

const FIXED_CTX = Object.freeze({
    companyId: 7819,
    companyBranchId: 7239,
    clientId: 17,
    financialYearId: 31,
    userId: 279,
});

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
    console.log("userData", userData);

    const getSelectedTemplateName = () =>
        formData?.template?.Name ||
        formData?.template?.name ||
        formData?.template?.label ||
        formData?.template?.Code ||
        formData?.template?.code ||
        "";

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

    const handleUpload = async (e) => {
        e.preventDefault();

        const file = getFirstFile(formData.upload);
        if (!file) {
            toast.warn("Please choose a file in the 'Upload File' field");
            return;
        }

        const selectedName = getSelectedTemplateName();
        if (!selectedName) {
            toast.warn("Please select a Template before uploading.");
            return;
        }

        setBusy(true);
        try {
            const rows = await parseFile(file);
            if (!rows?.length) throw new Error("No data rows found");

            const header = { ...formatHeaderForSp(formData), ...userData };
            const spName = getSpFromTemplateName(selectedName);

            const QUOTE_RE = /['\u2019\u2018\u02BC\uFF07\u2032\u2035\u0060]/g;

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

                return val;
            };

            const toNonNegInt = (v) => {
                const n = Number(v);
                return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
            };

            const cleanHeader = sanitizeDeep(header);
            const cleanRows = sanitizeDeep(rows);
            const cleanName =
                typeof selectedName === "string"
                    ? selectedName.replace(QUOTE_RE, "")
                    : selectedName;

            const N = toNonNegInt(objectToRemove);
            const prunedRows = Array.isArray(cleanRows)
                ? cleanRows.slice(Math.min(N, cleanRows.length))
                : cleanRows;

            const mapUserToHeader = (u = {}) => ({
                userId: u.userId,
                userName: u.userName,
                emailId: u.emailId,
                roleId: u.roleId,
                roleName: u.roleName,
                roleCode: u.roleCode,
                companyId: u.companyId,
                companyName: u.companyName,
                companyBranchId: u.branchId,
                companyBranchName: u.branchName,
                shippingLineId: u.companyName,
            });

            const mergeUserIntoHeader = (headerObj = {}, user = {}) => {
                const mapped = mapUserToHeader(user);
                const out = { ...headerObj };
                for (const [k, v] of Object.entries(mapped)) {
                    const has = out[k] != null && String(out[k]).trim() !== "";
                    if (!has && v != null) out[k] = v;
                }
                return out;
            };

            const payload = {
                spName,
                json: {
                    template: cleanName,
                    header: mergeUserIntoHeader(cleanHeader, userData),
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
