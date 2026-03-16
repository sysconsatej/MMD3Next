let inFlight = false;

const pad = (n) => String(n).padStart(2, "0");
const timestamp = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(
    d.getHours(),
  )}-${pad(d.getMinutes())}-${pad(d.getSeconds())}`;
};

const download = (filename, contents, mime = "application/octet-stream") => {
  const blob =
    typeof contents === "string"
      ? new Blob([contents], { type: mime })
      : new Blob([JSON.stringify(contents, null, 2)], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

const stripCols = (obj) => {
  if (!obj || typeof obj !== "object") return { value: obj };
  const { index, status, ID, Id, id, ...rest } = obj;
  return rest;
};

const flattenResults = (results) => {
  const ok = [];
  const failed = [];
  for (const r of results || []) {
    if (r?.ok) {
      const src =
        r.data ??
        (Array.isArray(r?.recordsets?.[0]) ? r.recordsets[0] : r?.recordsets) ??
        null;
      if (Array.isArray(src)) ok.push(...src.map(stripCols));
      else if (src && typeof src === "object") ok.push(stripCols(src));
      else ok.push({});
    } else {
      failed.push({ error: r?.error || "Failed" });
    }
  }
  return { ok, failed };
};

const defaultMapRow = ({ ID, id } = {}) => ({ id: ID ?? id });

export async function runUpdate({
  tableFormData,
  buildBody,
  updateFn,
  toast,
  setLoading,
  filterDirty = true,
  mapRow = defaultMapRow,
}) {
  const source = Array.isArray(tableFormData) ? tableFormData : [];
  const rows = (filterDirty ? source.filter((r) => r?.__dirty) : source).map(
    mapRow,
  );

  if (!rows.length) {
    toast?.info?.(
      filterDirty ? "No edited rows to update." : "Select rows to update.",
    );
    return null;
  }

  if (inFlight) return null;
  inFlight = true;
  setLoading?.(true);

  try {
    const body = buildBody(rows);
    const resp = await updateFn(body);
    if (!resp?.success) {
      toast?.error?.(resp?.message || "Update failed.");
      return null;
    }
    return flattenResults(resp?.data?.results || []);
  } catch (e) {
    toast?.error?.(e?.message || "Update failed.");
    return null;
  } finally {
    setLoading?.(false);
    inFlight = false;
  }
}

// export async function jsonExport({
//   filenamePrefix = "Export",
//   jsonPayload,
//   ...runnerArgs
// }) {
//   const res = await runUpdate(runnerArgs);
//   if (!res) return;
//   const { ok, failed } = res;

//   if (!ok.length && !failed.length) {
//     runnerArgs.toast?.info?.("Nothing to export.");
//     return;
//   }

//   const payload =
//     typeof jsonPayload === "function"
//       ? jsonPayload({ ok, failed })
//       : { results: ok, failed, generatedAt: new Date().toISOString() };

//   download(
//     `${filenamePrefix} ${timestamp()}.json`,
//     payload,
//     "application/json"
//   );
//   runnerArgs.toast?.success?.("JSON file downloaded.");
// }
export async function jsonExport({
  filenamePrefix = "Export",
  jsonPayload,
  ...runnerArgs
}) {
  const res = await runUpdate(runnerArgs);
  if (!res) return;

  const { ok, failed } = res;

  if (!ok.length && !failed.length) {
    runnerArgs.toast?.info?.("Nothing to export.");
    return;
  }
  const fileNameFromSP = ok?.[0]?.generatedFileName || filenamePrefix;
  const cleanOk = ok.map(({ generatedFileName, ...actualJson }) => actualJson);
  const payload =
    typeof jsonPayload === "function"
      ? jsonPayload({ ok: cleanOk, failed })
      : cleanOk;
  download(`${fileNameFromSP}.json`, payload, "application/json");

  runnerArgs.toast?.success?.("JSON file downloaded.");
}

const defaultExtractLine = (row) => {
  if (row == null) return "";
  if (typeof row === "string") return row;
  if (typeof row === "number") return String(row);
  if (typeof row === "object") {
    if (typeof row.igmedi === "string") return row.igmedi;
    if (typeof row.line === "string") return row.line;
    for (const v of Object.values(row)) {
      if (typeof v === "string") return v;
      if (typeof v === "number") return String(v);
    }
  }
  return "";
};

export async function exportText({
  filenamePrefix = "IAL",
  fileExt = "TXT",
  join = "\n",
  mime = "text/plain",
  extractLine = defaultExtractLine,
  fileMeta = {},
  ...runnerArgs
}) {
  const res = await runUpdate(runnerArgs);
  if (!res) return;

  const { ok } = res;

  const lines = ok
    .map(extractLine)
    .filter((s) => s !== null && s !== undefined && s !== "");

  if (!lines.length) {
    runnerArgs.toast?.info?.("No data to export.");
    return;
  }

  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  const time = now.toTimeString().slice(0, 8).replace(/:/g, "-");

  const clean = (v) => String(v || "").replace(/\s+/g, "_");

  const terminal = clean(fileMeta.terminal);
  const vessel = clean(fileMeta.vessel);
  const voyage = clean(fileMeta.voyage);

  const filename = `${filenamePrefix}_${terminal}_${vessel}_${voyage}_${date}_${time}.${fileExt}`;

  download(filename, lines.join(join), mime);

  runnerArgs.toast?.success?.("Text file downloaded.");
}

export async function exportExcel({
  filenamePrefix = "IAL",
  toast,
  setLoading,
  autoSize = true,
  fileMeta = {},
  ...runnerArgs
}) {
  const res = await runUpdate(runnerArgs);
  if (!res) return;

  const { ok } = res;

  if (!ok.length) {
    toast?.info?.("Nothing to export.");
    return;
  }

  const XLSX = await import("xlsx");
  const wb = XLSX.utils.book_new();

  const ws = XLSX.utils.json_to_sheet(ok ?? []);

  if (autoSize && ws["!ref"]) {
    const range = XLSX.utils.decode_range(ws["!ref"]);
    const cols = [];

    for (let C = range.s.c; C <= range.e.c; ++C) {
      let maxLen = 6;

      for (let R = range.s.r; R <= range.e.r; ++R) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        const cell = ws[cellAddress];
        if (!cell) continue;

        const v = cell.w || cell.v;
        const len = v == null ? 0 : String(v).length;

        if (len > maxLen) maxLen = len;
      }

      cols.push({ wch: Math.min(Math.max(maxLen + 2, 8), 60) });
    }

    ws["!cols"] = cols;
  }

  XLSX.utils.book_append_sheet(wb, ws, "Data");

  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  const time = now.toTimeString().slice(0, 8).replace(/:/g, "-");

  const clean = (v) => String(v || "").replace(/\s+/g, "_");

  const terminal = clean(fileMeta.terminal);
  const vessel = clean(fileMeta.vessel);
  const voyage = clean(fileMeta.voyage);

  const filename = `${filenamePrefix}_${terminal}_${vessel}_${voyage}_${date}_${time}.xlsx`;

  XLSX.writeFile(wb, filename);

  toast?.success?.("Excel downloaded.");
}

const toCSV = (
  rows = [],
  { delimiter = ",", eol = "\r\n", includeHeader = true, headerOrder } = {},
) => {
  if (!Array.isArray(rows) || rows.length === 0) return "";

  const keys =
    headerOrder && headerOrder.length
      ? headerOrder
      : Array.from(
          rows.reduce((set, r) => {
            Object.keys(r || {}).forEach((k) => set.add(k));
            return set;
          }, new Set()),
        );

  const esc = (v) => {
    if (v === null || v === undefined) return "";
    const s = String(v);
    const needsQuotes = /["\r\n,]/.test(s);
    const q = s.replace(/"/g, '""');
    return needsQuotes ? `"${q}"` : q;
  };

  const header = includeHeader ? keys.map(esc).join(delimiter) : null;
  const lines = rows.map((r) => keys.map((k) => esc(r?.[k])).join(delimiter));
  return [header, ...lines].filter(Boolean).join(eol);
};

export async function exportCSV({
  filenamePrefix = "IAL",
  // fileOkSuffix = "Results",
  fileFailedSuffix = "Failed",
  delimiter = ",",
  eol = "\r\n",
  includeHeader = true,
  headerOrder,
  toast,
  setLoading,
  fileMeta = {},
  ...runnerArgs
}) {
  const res = await runUpdate(runnerArgs);
  if (!res) return;

  const { ok, failed } = res;
  if (!ok.length && !failed.length) {
    toast?.info?.("Nothing to export.");
    return;
  }

  // Format timestamp
  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  const time = now.toTimeString().slice(0, 8).replace(/:/g, "-");

  const terminal = fileMeta.terminal || "Terminal";
  const vessel = fileMeta.vessel || "Vessel";
  const voyage = fileMeta.voyage || "Voyage";

  const baseName = `${filenamePrefix}_${terminal}_${vessel}_${voyage}_${date}_${time}`;

  if (ok.length) {
    const csvOk = toCSV(ok, { delimiter, eol, includeHeader, headerOrder });

    download(`${baseName}.CSV`, csvOk, "text/csv");
  }

  if (failed.length) {
    const csvFailed = toCSV(failed, {
      delimiter,
      eol,
      includeHeader,
      headerOrder,
    });

    download(`${baseName}_${fileFailedSuffix}.CSV`, csvFailed, "text/csv");
  }

  toast?.success?.(
    ok.length && failed.length ? "CSV files downloaded." : "CSV downloaded.",
  );
}
