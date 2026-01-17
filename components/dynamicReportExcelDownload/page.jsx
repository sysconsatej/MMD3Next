"use client";

import React, { useMemo, useState } from "react";
import { toast } from "react-toastify";
import CustomButton from "@/components/button/button"; // ✅ adjust path if different

/* ---------- helpers (same ideas as your table) ---------- */

const normKey = (s = "") =>
    String(s)
        .replace(/[\s_]+/g, "")
        .toLowerCase();

const buildCustomFieldMap = (displayKeys, metaData = []) => {
    const normalizedMeta = (metaData || []).map((m) => ({
        ...m,
        _matchBy: { name: normKey(m?.name), label: normKey(m?.label) },
    }));
    const map = new Map();
    for (const col of displayKeys) {
        const nk = normKey(col);
        const hit = normalizedMeta.find(
            (m) => nk === m._matchBy.name || nk === m._matchBy.label
        );
        if (hit) map.set(col, hit);
    }
    return map;
};

const metaType = (m) => String(m?.type || "").toLowerCase();
const isDropdown = (m) => metaType(m) === "dropdown";
const isMultiselect = (m) => metaType(m) === "multiselect";
const isCheckbox = (m) => metaType(m) === "checkbox";
const isDate = (m) => metaType(m) === "date";
const isDateTime = (m) => metaType(m) === "datetime";

const toDateObj = (val) => {
    if (val == null || val === "") return null;
    if (val instanceof Date && !isNaN(val)) return val;
    if (typeof val === "number") return new Date(val);
    if (typeof val === "string") {
        const m = /\/Date\((\d+)\)\//.exec(val);
        if (m) return new Date(Number(m[1]));
        const d = new Date(val.replace(" ", "T"));
        return isNaN(d) ? null : d;
    }
    return null;
};

const pad = (n) => String(n).padStart(2, "0");
const fmtDate = (d) =>
    d ? `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` : "";
const fmtDateTime = (d) =>
    d
        ? `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
            d.getHours()
        )}:${pad(d.getMinutes())}`
        : "";

const displayText = (val) => {
    if (val == null) return "";
    if (
        typeof val === "string" ||
        typeof val === "number" ||
        typeof val === "boolean"
    )
        return String(val);

    if (Array.isArray(val)) {
        if (!val.length) return "";
        const first = val[0];
        if (first && typeof first === "object") {
            if ("label" in first || "Name" in first) {
                return val
                    .map((x) => x?.label ?? x?.Name ?? "")
                    .filter(Boolean)
                    .join(", ");
            }
            if ("value" in first) return val.map((x) => x?.value).join(", ");
        }
        return JSON.stringify(val);
    }

    if (typeof val === "object") {
        if ("label" in val || "Name" in val) return String(val.label ?? val.Name);
        if ("value" in val) return String(val.value ?? "");
    }

    return JSON.stringify(val);
};

const formatCell = (meta, raw) => {
    if (!meta) return displayText(raw);

    if (isCheckbox(meta)) {
        const t = displayText(raw).toLowerCase();
        const b =
            raw === true ||
            raw === 1 ||
            raw === "1" ||
            t === "true" ||
            t === "y" ||
            t === "yes";
        return b ? "Yes" : "No";
    }

    if (isDate(meta)) return fmtDate(toDateObj(raw));
    if (isDateTime(meta)) return fmtDateTime(toDateObj(raw));

    if (isDropdown(meta) || isMultiselect(meta)) return displayText(raw);

    return displayText(raw);
};

const escapeCsv = (v) => {
    const s = String(v ?? "");
    if (/[",\r\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
};

const downloadBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
};

/* ---------- component ---------- */

export default function DynamicReportDownloadCsvButton({
    rows,
    metaData = [],
    fileName = "Report.csv",
    text = "DOWNLOAD EXCEL", // button label
    buttonStyles = "custom-btn",
    disabled,
    includeColumns,
    hiddenKeys = ["__uid", "__dirty", "id", "_id", "rowid", "row_id"],
    addUtf8Bom = true, // ✅ helps Excel show UTF-8 correctly
    ...buttonProps
}) {
    const [downloading, setDownloading] = useState(false);
    const safeRows = useMemo(() => (Array.isArray(rows) ? rows : []), [rows]);

    const DISPLAY_KEYS = useMemo(() => {
        const set = new Set();
        for (const r of safeRows) {
            if (r && typeof r === "object") Object.keys(r).forEach((k) => set.add(k));
        }
        let keys = Array.from(set);

        const hidden = new Set((hiddenKeys || []).map(normKey));
        keys = keys.filter((k) => !hidden.has(normKey(k)));

        // if includeColumns provided, respect it and keep order
        if (Array.isArray(includeColumns) && includeColumns.length) {
            const allowed = new Set(includeColumns);
            keys = includeColumns.filter((k) => allowed.has(k));
        }

        return keys;
    }, [safeRows, hiddenKeys, includeColumns]);

    const metaMap = useMemo(
        () => buildCustomFieldMap(DISPLAY_KEYS, metaData),
        [DISPLAY_KEYS, metaData]
    );

    const handleDownload = async () => {
        try {
            if (!safeRows.length) {
                toast.info("No rows to export.");
                return;
            }
            if (!DISPLAY_KEYS.length) {
                toast.info("No columns to export.");
                return;
            }

            setDownloading(true);

            const header = DISPLAY_KEYS.map((k) => metaMap.get(k)?.label || k);
            const lines = [];

            lines.push(header.map(escapeCsv).join(","));

            for (const r of safeRows) {
                const rowLine = DISPLAY_KEYS.map((k) =>
                    escapeCsv(formatCell(metaMap.get(k), r?.[k]))
                ).join(",");
                lines.push(rowLine);
            }

            const csv = (addUtf8Bom ? "\uFEFF" : "") + lines.join("\r\n");
            const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
            downloadBlob(blob, fileName);
        } catch (e) {
            toast.error(e?.message || "Export failed.");
        } finally {
            setDownloading(false);
        }
    };

    return (
        <CustomButton
            text={downloading ? "Downloading..." : text}
            onClick={handleDownload}
            disabled={disabled || downloading || !safeRows.length}
            buttonStyles={buttonStyles}
            {...buttonProps}
        />
    );
}
