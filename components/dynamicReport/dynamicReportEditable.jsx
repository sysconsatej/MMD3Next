"use client";

import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import {
  Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TableSortLabel, Paper, Typography, Pagination, Select, MenuItem, Checkbox,
} from "@mui/material";
import { CustomInput } from "@/components/customInput";

/* ---------- helpers (unchanged) ---------- */

const normKey = (s = "") => String(s).replace(/[\s_]+/g, "").toLowerCase();
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
const isDropdown    = (m) => metaType(m) === "dropdown";
const isMultiselect = (m) => metaType(m) === "multiselect";
const isCheckbox    = (m) => metaType(m) === "checkbox";
const isDate        = (m) => metaType(m) === "date";
const isDateTime    = (m) => metaType(m) === "datetime";

const toIdName = (item) => {
  if (!item || typeof item !== "object") {
    if (typeof item === "string") return { Id: null, Name: item };
    return { Id: null, Name: "" };
  }
  if ("Id" in item || "Name" in item)     return { Id: item.Id ?? null, Name: item.Name ?? "" };
  if ("id" in item || "name" in item)     return { Id: item.id ?? null, Name: item.name ?? "" };
  if ("value" in item || "label" in item) return { Id: item.value ?? null, Name: item.label ?? "" };
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
const fmtDate = (d) => (d ? `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` : "");
const fmtDateTimeLocal = (d) =>
  d ? `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}` : "";
const saveDate = (d) => fmtDate(d);
const saveDateTime = (d) => fmtDateTimeLocal(d);

const displayText = (val) => {
  if (val == null) return "";
  if (typeof val === "string" || typeof val === "number" || typeof val === "boolean") return String(val);
  if (Array.isArray(val)) {
    if (val.length === 0) return "";
    const first = val[0];
    if (first && typeof first === "object" && ("label" in first || "Name" in first)) {
      return val.map((x) => x.label ?? x.Name ?? "").filter(Boolean).join(", ");
    }
    return JSON.stringify(val);
  }
  if (typeof val === "object") {
    if ("label" in val || "Name" in val) return String(val.label ?? val.Name ?? "");
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
    const arr = Array.isArray(val) ? val : (val ? [val] : []);
    return arr.map(toIdName);
  }
  if (isCheckbox(meta)) {
    const v = typeof val === "string" ? val.toLowerCase() : val;
    return v === true || v === 1 || v === "1" || v === "y" || v === "true";
  }
  if (isDate(meta))     return fmtDate(toDateObj(val));
  if (isDateTime(meta)) return fmtDateTimeLocal(toDateObj(val));
  return val ?? "";
};
const denormalizeOut = (meta, val) => {
  if (isDropdown(meta)) {
    const v = toIdName(val);
    return [{ value: v.Id ?? null, label: v.Name ?? "" }];
  }
  if (isMultiselect(meta)) {
    const arr = Array.isArray(val) ? val : (val ? [val] : []);
    return arr.map(toIdName).map((x) => ({ value: x.Id ?? null, label: x.Name ?? "" }));
  }
  if (isCheckbox(meta)) return !!val;
  if (isDate(meta))     return saveDate(toDateObj(val));
  if (isDateTime(meta)) return saveDateTime(toDateObj(val));
  return val;
};

/* ---------- component ---------- */

const DynamicReportTable = ({ data, metaData = [], onSelectedEditedChange }) => {
  const rawRows = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
  if (!rawRows.length) {
    return <Box p={2}><Typography>No data available</Typography></Box>;
  }

  const baseRows = useMemo(() => rawRows.map((r, i) => ({ ...r, __uid: i })), [rawRows]);
  const [editableRows, setEditableRows] = useState(baseRows);
  useEffect(() => setEditableRows(baseRows), [baseRows]);

  const ALL_KEYS = useMemo(
    () => Array.from(new Set(editableRows.flatMap((r) => (r && typeof r === "object" ? Object.keys(r) : [])))),
    [editableRows]
  );

  /* ⬇️ added: hide id-like columns without changing existing logic/state */
  const HIDDEN_KEYS = useMemo(
    () => new Set(["__uid", "id", "_id", "rowid", "row_id"].map(normKey)),
    []
  );

  const DISPLAY_KEYS = useMemo(
    () => ALL_KEYS.filter((k) => !HIDDEN_KEYS.has(normKey(k))),
    [ALL_KEYS, HIDDEN_KEYS]
  );
  /* ⬆️ end of addition */

  const columns = useMemo(() => ["Select", ...DISPLAY_KEYS], [DISPLAY_KEYS]);
  const customFieldMap = useMemo(() => buildCustomFieldMap(DISPLAY_KEYS, metaData), [DISPLAY_KEYS, metaData]);

  /* ---------- baseline snapshot for dirty-check ---------- */
  const editableKeys = useMemo(() => Array.from(customFieldMap.keys()), [customFieldMap]);
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

  // always send ALL selected rows; each row includes __dirty flag
  const emitSelected = useCallback(
    (rows, selected = selectedUids) => {
      if (!onSelectedEditedChange) return;
      const out = rows
        .filter((r) => selected.includes(r.__uid))
        .map(({ __uid, ...rest }) => ({
          ...rest,
          __dirty: isDirty({ ...rest, __uid }), // evaluate against current baseline
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
  const pageRows = useMemo(() => sortedRows.slice(start, start + rowsPerPage), [sortedRows, start, rowsPerPage]);

  const getRowUid = (row) => (typeof row?.__uid === "number" ? row.__uid : null);
  const uidsOnPage = useMemo(() => pageRows.map(getRowUid).filter((k) => k !== null), [pageRows]);
  const pageAllChecked = uidsOnPage.length > 0 && uidsOnPage.every((k) => selectedUids.includes(k));

  const handleToggleRow = (row) => {
    const uid = getRowUid(row);
    if (uid == null) return;
    const next = selectedUids.includes(uid) ? selectedUids.filter((k) => k !== uid) : [...selectedUids, uid];
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
        const next = prev.map((r) => (r.__uid === rowUid ? { ...r, [field]: nextVal } : r));
        // after any edit, re-emit ALL selected rows with updated __dirty flags
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
        const nextLocal = typeof updater === "function" ? updater(cellFormData) : updater;
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

  return (
    <Box p={2}>
      <Paper variant="outlined">
        <TableContainer sx={{ maxHeight: "60vh", overflow: "auto" }}>
          <Box sx={{ minWidth: 900 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow className="bg-[#95a9e8]">
                  {["Select", ...DISPLAY_KEYS].map((col) => (
                    <TableCell
                      key={col}
                      sortDirection={orderBy === col ? order : false}
                      className="!font-light !whitespace-nowrap !bg-[#95a9e8] !text-white"
                    >
                      {col === "Select" ? (
                        <Checkbox
                          size="small"
                          checked={pageAllChecked}
                          indeterminate={false}
                          onChange={(e) => handleToggleAllOnPage(e.target.checked)}
                          sx={{ color: "white" }}
                        />
                      ) : (
                        <TableSortLabel
                          active={orderBy === col}
                          direction={orderBy === col ? order : "asc"}
                          onClick={() => handleRequestSort(col)}
                          sx={{ color: "white !important" }}
                        >
                          {customFieldMap.get(col)?.label || col}
                        </TableSortLabel>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
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
                          sx={{
                            maxWidth: 360,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: customFieldMap.has(col) ? "normal" : "nowrap",
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
            onChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          >
            {[10, 25, 50, 100].map((n) => <MenuItem key={n} value={n}>{n}</MenuItem>)}
          </Select>
          <Typography variant="body2" className="text-gray-600">
            {page + 1} of {Math.max(1, Math.ceil(editableRows.length / rowsPerPage))} Pages
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default DynamicReportTable;
