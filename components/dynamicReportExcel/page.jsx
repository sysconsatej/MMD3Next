"use client";

import React, { useMemo, useState } from "react";
import { toast } from "react-toastify";
import CustomButton from "@/components/button/button";
import * as XLSX from "xlsx";

/* ---------- helpers ---------- */

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
      (m) => nk === m._matchBy.name || nk === m._matchBy.label,
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
    [DISPLAY_KEYS, metaData],
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

// SECOND COMPONENT = named export only

export function DynamicReportDownloadExcelCFSButton({
  rows,
  metaData = [],
  reportConfig = null,
  fileName = "Report.xlsx",
  text = "DOWNLOAD EXCEL",
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

    const hidden = new Set((hiddenKeys || []).map(normKey));
    keys = keys.filter((k) => !hidden.has(normKey(k)));

    if (Array.isArray(includeColumns) && includeColumns.length) {
      keys = includeColumns.filter((k) => keys.includes(k));
    }

    return keys;
  }, [safeRows, hiddenKeys, includeColumns]);

  const metaMap = useMemo(
    () => buildCustomFieldMap(DISPLAY_KEYS, metaData),
    [DISPLAY_KEYS, metaData],
  );

  const getHeadingRowKeys = (cfg) => {
    if (!cfg || typeof cfg !== "object") return [];

    return Object.keys(cfg)
      .filter((key) => /^headingRow\d+$/i.test(key))
      .sort((a, b) => {
        const aNum = Number(String(a).replace(/[^\d]/g, "")) || 0;
        const bNum = Number(String(b).replace(/[^\d]/g, "")) || 0;
        return aNum - bNum;
      });
  };

  const getHeadingPairs = (headingRow) => {
    if (!Array.isArray(headingRow)) return [];

    const pairs = [];

    headingRow.forEach((item) => {
      if (item && typeof item === "object" && !Array.isArray(item)) {
        Object.entries(item).forEach(([key, value]) => {
          pairs.push([key, displayText(value)]);
        });
      }
    });

    return pairs;
  };

  const addReportHeaderRows = (sheetData, cfg) => {
    if (!cfg || typeof cfg !== "object") return;

    const headerFlag = String(cfg?.header ?? "N")
      .trim()
      .toUpperCase();
    const orientation = String(cfg?.orientation ?? "H")
      .trim()
      .toUpperCase();
    const heading = cfg?.heading;

    // main heading/title only
    if (
      headerFlag === "Y" &&
      heading !== null &&
      heading !== undefined &&
      String(heading).trim() !== ""
    ) {
      sheetData.push([displayText(heading)]);
      sheetData.push([]);
    }

    // headingRow1, headingRow2, ... independent
    const headingRowKeys = getHeadingRowKeys(cfg);

    headingRowKeys.forEach((rowKey) => {
      const pairs = getHeadingPairs(cfg[rowKey]);
      if (!pairs.length) return;

      if (orientation === "V") {
        // your SS1:
        // row 1 => keys
        // row 2 => values
        sheetData.push(pairs.map(([k]) => k));
        sheetData.push(pairs.map(([, v]) => v));
      } else {
        // your SS2:
        // single row => key, value, key, value...
        const row = [];
        pairs.forEach(([k, v]) => {
          row.push(k, v);
        });
        sheetData.push(row);
      }

      sheetData.push([]);
    });
  };

  const autoFitColumns = (worksheet, sheetData) => {
    const colWidths = [];

    sheetData.forEach((row) => {
      (row || []).forEach((cell, colIndex) => {
        const len = String(cell ?? "").length;
        colWidths[colIndex] = Math.max(
          colWidths[colIndex] || 10,
          Math.min(len + 2, 60),
        );
      });
    });

    worksheet["!cols"] = colWidths.map((w) => ({ wch: w }));
  };

  const handleDownload = () => {
    try {
      if (!safeRows.length) {
        toast.info("No rows to export.");
        return;
      }

      setDownloading(true);

      const sheetData = [];

      // heading + headingRow blocks
      addReportHeaderRows(sheetData, reportConfig);

      // table headers
      const headers = DISPLAY_KEYS.map((key) => metaMap.get(key)?.label || key);
      sheetData.push(headers);

      // table rows
      safeRows.forEach((row) => {
        sheetData.push(DISPLAY_KEYS.map((key) => displayText(row?.[key])));
      });

      const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
      autoFitColumns(worksheet, sheetData);

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Report");

      XLSX.writeFile(workbook, fileName);

      toast.success("Excel Downloaded Successfully.");
    } catch (err) {
      console.error(err);
      toast.error("Excel Export Failed.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <CustomButton
      text={downloading ? "Downloading..." : text}
      onClick={handleDownload}
      disabled={disabled || downloading || !safeRows.length}
      {...buttonProps}
    />
  );
}
