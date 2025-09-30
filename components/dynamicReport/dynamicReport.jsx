import { useState } from "react";
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
} from "@mui/material";

const DynamicReportTable = ({ data }) => {
  // Normalize input
  const rows = Array.isArray(data)
    ? data
    : Array.isArray(data?.data)
    ? data.data
    : [];

  if (!rows.length) {
    return (
      <Box p={2}>
        <Typography>No data available</Typography>
      </Box>
    );
  }

  // Build union of all keys (column headers)
  const columns = (() => {
    const set = new Set();
    for (const row of rows) {
      if (row && typeof row === "object") {
        Object.keys(row).forEach((k) => set.add(k));
      }
    }
    return Array.from(set);
  })();

  // Sorting state
  const [orderBy, setOrderBy] = useState(columns[0]);
  const [order, setOrder] = useState("asc");

  // Pagination state (0-based for slicing)
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50); // default 50 to match screenshot

  const handleRowsPerPageChange = (e) => {
    const next = parseInt(e.target.value, 10);
    setRowsPerPage(next);
    setPage(0);
  };

  const handleNumberedPageChange = (_e, newPage1Based) => {
    setPage(newPage1Based - 1); // convert 1-based -> 0-based
  };

  // Sorting
  const handleRequestSort = (col) => {
    const isAsc = orderBy === col && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(col);
  };

  const sortedRows = [...rows].sort((a, b) => {
    const aVal = a?.[orderBy] ?? "";
    const bVal = b?.[orderBy] ?? "";
    if (aVal < bVal) return order === "asc" ? -1 : 1;
    if (aVal > bVal) return order === "asc" ? 1 : -1;
    return 0;
  });

  // Slice rows for current page
  const start = page * rowsPerPage;
  const end = start + rowsPerPage;
  const pageRows = sortedRows.slice(start, end);

  const formatValue = (val) => {
    if (val === null || val === undefined) return "-";
    if (typeof val === "object") {
      try { return JSON.stringify(val); } catch { return String(val); }
    }
    return String(val);
  };

  const totalPages = Math.max(1, Math.ceil(rows.length / rowsPerPage));

  return (
    <Box p={2}>
      <Paper variant="outlined">
        <TableContainer sx={{ maxHeight: "60vh", overflow: "auto" }}>
          <Box sx={{ minWidth: 900 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow className="bg-[#95a9e8]">
                  {columns.map((col) => (
                    <TableCell
                      key={col}
                      sortDirection={orderBy === col ? order : false}
                      className="!font-light !whitespace-nowrap !bg-[#95a9e8] !text-white"
                    >
                      <TableSortLabel
                        active={orderBy === col}
                        direction={orderBy === col ? order : "asc"}
                        onClick={() => handleRequestSort(col)}
                        sx={{ color: "white !important" }}
                      >
                        {col}
                      </TableSortLabel>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {pageRows.map((row, rowIndex) => (
                  <TableRow key={`${page}-${rowIndex}`} hover>
                    {columns.map((col) => (
                      <TableCell
                        key={col}
                        sx={{
                          maxWidth: 300,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                        title={formatValue(row?.[col])}
                      >
                        {formatValue(row?.[col])}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </TableContainer>

        {/* ✅ Footer: numbered pagination + rows-per-page dropdown + "X of Y Pages" */}
        <Box className="flex flex-wrap items-center justify-end gap-3 px-4 py-2">
          <Pagination
            count={totalPages}
            page={page + 1}                   // 0-based -> 1-based
            onChange={handleNumberedPageChange}
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
            onChange={handleRowsPerPageChange}
            sx={{ padding:0}}
          >
            {[10, 25, 50, 100].map((n) => (
              <MenuItem key={n} value={n}>{n}</MenuItem>
            ))}
          </Select>

          <Typography variant="body2" className="text-gray-600">
            {page + 1} of {totalPages} Pages
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default DynamicReportTable;
