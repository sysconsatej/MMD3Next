"use client";

import React, { useMemo, useState } from "react";
import { toast } from "react-toastify";
import CustomButton from "@/components/button/button";
import * as XLSX from "xlsx";

/* ---------- helpers ---------- */

const normKey = (s = "") =>
  String(s).replace(/[\s_]+/g, "").toLowerCase();

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

const displayText = (val) => {
  if (val == null) return "";

  if (
    typeof val === "string" ||
    typeof val === "number" ||
    typeof val === "boolean"
  )
    return String(val);

  if (Array.isArray(val)) {
    return val
      .map((x) => x?.label ?? x?.Name ?? x)
      .filter(Boolean)
      .join(", ");
  }

  if (typeof val === "object") {
    return val.label ?? val.Name ?? val.value ?? JSON.stringify(val);
  }

  return String(val);
};

/* ---------- Excel Component ---------- */

export default function DynamicReportDownloadExcelButton({
  rows,
  metaData = [],
  fileName = "Report.xlsx",
  text = "DOWNLOAD EXCEL",
  buttonStyles = "custom-btn",
  disabled,
  hiddenKeys = ["__uid", "__dirty", "id", "_id", "rowid", "row_id"],
  includeColumns,
  ...buttonProps
}) {
  const [downloading, setDownloading] = useState(false);

  const safeRows = useMemo(() => (Array.isArray(rows) ? rows : []), [rows]);

  const DISPLAY_KEYS = useMemo(() => {
    const set = new Set();

    for (const r of safeRows) {
      if (r && typeof r === "object") {
        Object.keys(r).forEach((k) => set.add(k));
      }
    }

    let keys = Array.from(set);

    // Remove hidden keys
    const hidden = new Set((hiddenKeys || []).map(normKey));
    keys = keys.filter((k) => !hidden.has(normKey(k)));

    // Apply includeColumns order if given
    if (Array.isArray(includeColumns) && includeColumns.length) {
      keys = includeColumns.filter((k) => keys.includes(k));
    }

    return keys;
  }, [safeRows, hiddenKeys, includeColumns]);

  const metaMap = useMemo(
    () => buildCustomFieldMap(DISPLAY_KEYS, metaData),
    [DISPLAY_KEYS, metaData]
  );

  const handleDownload = () => {
    try {
      if (!safeRows.length) {
        toast.info("No rows to export.");
        return;
      }

      setDownloading(true);

      /* ✅ Prepare Excel Data */
      const excelData = safeRows.map((row) => {
        const obj = {};
        DISPLAY_KEYS.forEach((key) => {
          const label = metaMap.get(key)?.label || key;
          obj[label] = displayText(row[key]);
        });
        return obj;
      });

      /* ✅ Create Worksheet + Workbook */
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(workbook, worksheet, "Report");

      /* ✅ Download Excel File */
      XLSX.writeFile(workbook, fileName);

      toast.success("Excel Downloaded Successfully.");
    } catch (err) {
      toast.error("Excel Export Failed.");
      console.log(err);
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
