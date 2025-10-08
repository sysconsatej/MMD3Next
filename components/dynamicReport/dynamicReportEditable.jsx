"use client";

import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
  Typography,
  Pagination,
  Select,
  MenuItem,
  Checkbox,
  TableFooter,
} from "@mui/material";
import { CustomInput } from "@/components/customInput";

/* ---------- helpers (existing) ---------- */

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

const toIdName = (item) => {
  if (!item || typeof item !== "object") {
    if (typeof item === "string") return { Id: null, Name: item };
    return { Id: null, Name: "" };
  }
  if ("Id" in item || "Name" in item)
    return { Id: item.Id ?? null, Name: item.Name ?? "" };
  if ("id" in item || "name" in item)
    return { Id: item.id ?? null, Name: item.name ?? "" };
  if ("value" in item || "label" in item)
    return { Id: item.value ?? null, Name: item.label ?? "" };
  return { Id: null, Name: String(item) };
};

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
const fmtDateTimeLocal = (d) =>
  d
    ? `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
        d.getHours()
      )}:${pad(d.getMinutes())}`
    : "";
const saveDate = (d) => fmtDate(d);
const saveDateTime = (d) => fmtDateTimeLocal(d);

const displayText = (val) => {
  if (val == null) return "";
  if (
    typeof val === "string" ||
    typeof val === "number" ||
    typeof val === "boolean"
  )
    return String(val);
  if (Array.isArray(val)) {
    if (val.length === 0) return "";
    const first = val[0];
    if (
      first &&
      typeof first === "object" &&
      ("label" in first || "Name" in first)
    ) {
      return val
        .map((x) => x.label ?? x.Name ?? "")
        .filter(Boolean)
        .join(", ");
    }
    return JSON.stringify(val);
  }
  if (typeof val === "object") {
    if ("label" in val || "Name" in val)
      return String(val.label ?? val.Name ?? "");
    if ("value" in val) return String(val.value ?? "");
  }
  return JSON.stringify(val);
};
const sortKey = (v) => displayText(v).toLowerCase();

const normalizeIn = (meta, val) => {
  if (isDropdown(meta)) {
    if (Array.isArray(val)) val = val[0];
    return toIdName(val);
  }
  if (isMultiselect(meta)) {
    const arr = Array.isArray(val) ? val : val ? [val] : [];
    return arr.map(toIdName);
  }
  if (isCheckbox(meta)) {
    const v = typeof val === "string" ? val.toLowerCase() : val;
    return v === true || v === 1 || v === "1" || v === "y" || v === "true";
  }
  if (isDate(meta)) return fmtDate(toDateObj(val));
  if (isDateTime(meta)) return fmtDateTimeLocal(toDateObj(val));
  return val ?? "";
};
const denormalizeOut = (meta, val) => {
  if (isDropdown(meta)) {
    const v = toIdName(val);
    return [{ value: v.Id ?? null, label: v.Name ?? "" }];
  }
  if (isMultiselect(meta)) {
    const arr = Array.isArray(val) ? val : val ? [val] : [];
    return arr
      .map(toIdName)
      .map((x) => ({ value: x.Id ?? null, label: x.Name ?? "" }));
  }
  if (isCheckbox(meta)) return !!val;
  if (isDate(meta)) return saveDate(toDateObj(val));
  if (isDateTime(meta)) return saveDateTime(toDateObj(val));
  return val;
};

/* ---------- NEW: numeric helpers (added) ---------- */

// number parser (ignores commas)
const valueToNumber = (v) => {
  const s = displayText(v).replace(/,/g, "").trim();
  if (s === "") return NaN;
  const n = Number(s);
  return Number.isFinite(n) ? n : NaN;
};

// strict check: column is numeric only if *all* non-empty values are numeric (no mixed types)
const isStrictNumericColumn = (rows, col) => {
  for (const r of rows) {
    const raw = r?.[col];
    const txt = displayText(raw).trim();
    if (txt === "") continue; // allow blanks
    if (!Number.isFinite(valueToNumber(raw))) return false;
  }
  return true;
};

const formatNumber = (n) =>
  Number.isFinite(n)
    ? n.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      })
    : "";

/* ---------- component ---------- */

const DynamicReportTable = ({
  data,
  metaData = [],
  onSelectedEditedChange,
  showTotalsRow = false, // ⬅️ NEW prop (default off)
}) => {
  const rawRows = Array.isArray(data)
    ? data
    : Array.isArray(data?.data)
    ? data.data
    : [];
  if (!rawRows.length) {
    return (
      <Box p={2}>
        <Typography>No data available</Typography>
      </Box>
    );
  }

  const baseRows = useMemo(
    () => rawRows.map((r, i) => ({ ...r, __uid: i })),
    [rawRows]
  );
  const [editableRows, setEditableRows] = useState(baseRows);
  useEffect(() => setEditableRows(baseRows), [baseRows]);

  const ALL_KEYS = useMemo(
    () =>
      Array.from(
        new Set(
          editableRows.flatMap((r) =>
            r && typeof r === "object" ? Object.keys(r) : []
          )
        )
      ),
    [editableRows]
  );

  const HIDDEN_KEYS = useMemo(
    () => new Set(["__uid", "id", "_id", "rowid", "row_id"].map(normKey)),
    []
  );

  const DISPLAY_KEYS = useMemo(
    () => ALL_KEYS.filter((k) => !HIDDEN_KEYS.has(normKey(k))),
    [ALL_KEYS, HIDDEN_KEYS]
  );

  const columns = useMemo(() => ["Select", ...DISPLAY_KEYS], [DISPLAY_KEYS]);
  const customFieldMap = useMemo(
    () => buildCustomFieldMap(DISPLAY_KEYS, metaData),
    [DISPLAY_KEYS, metaData]
  );

  /* ---------- NEW: detect strictly-numeric columns (only once over all rows) ---------- */
  const numericCols = useMemo(() => {
    const set = new Set();
    for (const col of DISPLAY_KEYS) {
      if (isStrictNumericColumn(editableRows, col)) set.add(col);
    }
    return set;
  }, [DISPLAY_KEYS, editableRows]);

  /* ---------- baseline snapshot for dirty-check ---------- */
  const editableKeys = useMemo(
    () => Array.from(customFieldMap.keys()),
    [customFieldMap]
  );
  const baselineByUidRef = useRef(new Map());
  useEffect(() => {
    const m = new Map();
    for (const r of baseRows) {
      const s = {};
      editableKeys.forEach((k) => (s[k] = r[k]));
      m.set(r.__uid, JSON.stringify(s));
    }
    baselineByUidRef.current = m;
  }, [baseRows, editableKeys]);

  const pickEditable = useCallback(
    (row) => {
      const o = {};
      editableKeys.forEach((k) => (o[k] = row[k]));
      return o;
    },
    [editableKeys]
  );
  const isDirty = useCallback(
    (row) => {
      const baseline = baselineByUidRef.current.get(row.__uid);
      return JSON.stringify(pickEditable(row)) !== baseline;
    },
    [pickEditable]
  );

  /* ---------- selection ---------- */
  const [selectedUids, setSelectedUids] = useState([]);

  const emitSelected = useCallback(
    (rows, selected = selectedUids) => {
      if (!onSelectedEditedChange) return;
      const out = rows
        .filter((r) => selected.includes(r.__uid))
        .map(({ __uid, ...rest }) => ({
          ...rest,
          __dirty: isDirty({ ...rest, __uid }),
        }));
      onSelectedEditedChange(out);
    },
    [isDirty, onSelectedEditedChange, selectedUids]
  );

  /* ---------- sorting / pagination ---------- */
  const defaultSortKey = DISPLAY_KEYS[0] ?? "";
  const [orderBy, setOrderBy] = useState(defaultSortKey);
  const [order, setOrder] = useState("asc");
  const handleRequestSort = (col) => {
    if (col === "Select" || !col) return;
    const isAsc = orderBy === col && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(col);
  };
  const sortedRows = useMemo(() => {
    if (!orderBy) return editableRows;
    const arr = [...editableRows];
    arr.sort((a, b) => {
      const A = sortKey(a?.[orderBy]);
      const B = sortKey(b?.[orderBy]);
      if (A < B) return order === "asc" ? -1 : 1;
      if (A > B) return order === "asc" ? 1 : -1;
      return 0;
    });
    return arr;
  }, [editableRows, orderBy, order]);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const start = page * rowsPerPage;
  const pageRows = useMemo(
    () => sortedRows.slice(start, start + rowsPerPage),
    [sortedRows, start, rowsPerPage]
  );

  const getRowUid = (row) =>
    typeof row?.__uid === "number" ? row.__uid : null;
  const uidsOnPage = useMemo(
    () => pageRows.map(getRowUid).filter((k) => k !== null),
    [pageRows]
  );
  const pageAllChecked =
    uidsOnPage.length > 0 && uidsOnPage.every((k) => selectedUids.includes(k));

  const handleToggleRow = (row) => {
    const uid = getRowUid(row);
    if (uid == null) return;
    const next = selectedUids.includes(uid)
      ? selectedUids.filter((k) => k !== uid)
      : [...selectedUids, uid];
    setSelectedUids(next);
    emitSelected(editableRows, next);
  };

  const handleToggleAllOnPage = (checked) => {
    if (checked) {
      const next = Array.from(new Set([...selectedUids, ...uidsOnPage]));
      setSelectedUids(next);
      emitSelected(editableRows, next);
    } else {
      const next = selectedUids.filter((k) => !uidsOnPage.includes(k));
      setSelectedUids(next);
      emitSelected(editableRows, next);
    }
  };

  const updateCell = useCallback(
    (rowUid, field, nextVal) => {
      setEditableRows((prev) => {
        const next = prev.map((r) =>
          r.__uid === rowUid ? { ...r, [field]: nextVal } : r
        );
        emitSelected(next);
        return next;
      });
    },
    [emitSelected]
  );

  const renderCellContent = (row, colKey) => {
    const meta = customFieldMap.get(colKey);
    if (meta) {
      const fieldDef = {
        label: "",
        name: colKey,
        type: meta.type || "text",
        required: !!meta.required,
        isEdit: meta.isEdit !== false,
        disabled: meta.disabled ?? false,
        labelType: meta.labelType,
        foreignTable: meta.foreignTable,
        selectedCondition: meta.selectedCondition ?? null,
        options: meta.options,
      };
      const cellFormData = { [colKey]: normalizeIn(meta, row?.[colKey]) };
      const setCellFormData = (updater) => {
        const nextLocal =
          typeof updater === "function" ? updater(cellFormData) : updater;
        const chosen = nextLocal?.[colKey];
        const valueToStore = denormalizeOut(meta, chosen);
        updateCell(row.__uid, colKey, valueToStore);
      };
      return (
        <div style={{ minWidth: 200, maxWidth: 360 }}>
          <CustomInput
            fields={[fieldDef]}
            formData={cellFormData}
            setFormData={setCellFormData}
            fieldsMode={fieldDef.isEdit ? "edit" : "view"}
            errorState={{}}
            popUp={false}
          />
        </div>
      );
    }
    const val = row?.[colKey];
    const text = displayText(val);
    return text || "-";
  };

  /* ---------- NEW: totals for current page (only when showTotalsRow) ---------- */
  const pageTotals = useMemo(() => {
    if (!showTotalsRow) return {};
    const acc = {};
    for (const col of DISPLAY_KEYS) {
      if (!numericCols.has(col)) continue;
      let sum = 0;
      for (const r of pageRows) {
        const n = valueToNumber(r?.[col]);
        if (Number.isFinite(n)) sum += n;
      }
      acc[col] = sum;
    }
    return acc;
  }, [showTotalsRow, DISPLAY_KEYS, numericCols, pageRows]);

  return (
    <Box p={2}>
      <Paper variant="outlined">
        <TableContainer
          className="max-h-[60vh] overflow-auto 
             [&::-webkit-scrollbar]:w-2 
             [&::-webkit-scrollbar]:h-2  
             [&::-webkit-scrollbar-track]:bg-gray-100 
             [&::-webkit-scrollbar-thumb]:!bg-[#bfcbf1] 
             [&::-webkit-scrollbar-thumb]:rounded-full 
             hover:[&::-webkit-scrollbar-thumb]:!bg-[#a0b2ea]"
        >
          <Box sx={{ minWidth: 900 }}>
            <Table size="small" stickyHeader>
              <TableHead
                className="[&_.MuiTableCell-root]:border-r [&_.MuiTableCell-root]:border-gray-300
               [&_.MuiTableCell-root:last-child]:border-r-0"
              >
                <TableRow className="bg-[#95a9e8]">
                  <TableCell
                    padding="checkbox" 
                    align="left"
                    className="!bg-[#95a9e8] !text-white !font-light"
                  >
                    <Checkbox
                      size="small"
                      checked={pageAllChecked}
                      indeterminate={false}
                      onChange={(e) => handleToggleAllOnPage(e.target.checked)}
                      sx={{ color: "white", p: 0 }} 
                    />
                  </TableCell>

                  {/* other headers */}
                  {DISPLAY_KEYS.map((col) => (
                    <TableCell
                      key={col}
                      align="center"
                      sortDirection={orderBy === col ? order : false}
                      className="!px-1 !py-1 !font-light !whitespace-nowrap !bg-[#95a9e8] !text-white"
                    >
                      <TableSortLabel
                        active={orderBy === col}
                        direction={orderBy === col ? order : "asc"}
                        onClick={() => handleRequestSort(col)}
                        sx={{ color: "white !important" }}
                      >
                        {customFieldMap.get(col)?.label || col}
                      </TableSortLabel>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody
                className="[&_.MuiTableCell-root]:border-r [&_.MuiTableCell-root]:border-gray-200
               [&_.MuiTableCell-root:last-child]:border-r-0"
              >
                {pageRows.map((row) => {
                  const uid = row.__uid;
                  const isChecked = selectedUids.includes(uid);
                  return (
                    <TableRow key={uid} hover>
                      <TableCell padding="checkbox">
                        <Checkbox
                          size="small"
                          checked={!!isChecked}
                          onChange={() => handleToggleRow(row)}
                          disabled={uid == null}
                        />
                      </TableCell>
                      {DISPLAY_KEYS.map((col) => (
                        <TableCell
                          key={col}
                          align="center" // right-align numeric cols
                          sx={{
                            maxWidth: 360,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: customFieldMap.has(col)
                              ? "normal"
                              : "nowrap",
                          }}
                          title={
                            customFieldMap.has(col)
                              ? undefined
                              : (() => {
                                  const t = displayText(row?.[col]);
                                  return t && t.length <= 200 ? t : undefined;
                                })()
                          }
                        >
                          {renderCellContent(row, col)}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })}
              </TableBody>
              {showTotalsRow && (
                <TableFooter
                  className="[&_.MuiTableCell-root]:border-r [&_.MuiTableCell-root]:border-gray-200
               [&_.MuiTableCell-root:last-child]:border-r-0"
                >
                  <TableRow className="bg-[#dbdbdb]">
                    <TableCell sx={{ fontWeight: 700 }}>Total</TableCell>
                    {DISPLAY_KEYS.map((col) => (
                      <TableCell
                        key={col}
                        align="center"
                        sx={{ fontWeight: 700 }}
                      >
                        {numericCols.has(col)
                          ? formatNumber(pageTotals[col] || 0)
                          : ""}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableFooter>
              )}
            </Table>
          </Box>
        </TableContainer>

        {/* footer */}
        <Box className="flex flex-wrap items-center justify-end gap-3 px-4 py-2">
          <Pagination
            count={Math.max(1, Math.ceil(editableRows.length / rowsPerPage))}
            page={page + 1}
            onChange={(_e, p1) => setPage(p1 - 1)}
            variant="outlined"
            shape="rounded"
            size="medium"
            siblingCount={1}
            boundaryCount={1}
            showFirstButton
            showLastButton
          />
          <Select
            size="small"
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            className="!min-w-[50px] !h-8 !text-xs [&_.MuiSelect-select]:!py-1"
          >
            {[10, 25, 50, 100].map((n) => (
              <MenuItem key={n} value={n}>
                {n}
              </MenuItem>
            ))}
          </Select>
          <Typography variant="body2" className="text-gray-600">
            {page + 1} of{" "}
            {Math.max(1, Math.ceil(editableRows.length / rowsPerPage))} Pages
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default DynamicReportTable;
