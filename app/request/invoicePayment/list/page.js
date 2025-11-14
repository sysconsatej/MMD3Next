"use client";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  CssBaseline,
  Checkbox,
  Link,
} from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { ToastContainer, toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { theme } from "@/styles/globalCss";

import CustomButton from "@/components/button/button";
import CustomPagination from "@/components/pagination/pagination";
import SearchBar from "@/components/searchBar/searchBar";
import TableExportButtons from "@/components/tableExportButtons/tableExportButtons";
import SelectionActionsBar from "@/components/selectionActions/selectionActionPayment"; // ✅ your simplified component
import { fetchTableValues, deleteRecord, getDataWithCondition } from "@/apis";
import { formStore } from "@/store";
import { invoicePaymentSearchColumns } from "../invoicePaymentData";

const LIST_TABLE = "tblInvoice i";
const UPDATE_TABLE = LIST_TABLE.trim()
  .split(/\s+/)[0]
  .replace(/^dbo\./i, "");

const CHECKBOX_HEAD_SX = { width: 36, minWidth: 36, maxWidth: 36 };
const CHECKBOX_CELL_SX = { width: 32, minWidth: 32, maxWidth: 32 };
const CHECKBOX_SX = { p: 0.25, "& .MuiSvgIcon-root": { fontSize: 18 } };

function createData(
  id,
  blNo,
  invoiceNos,
  latestInvoiceDate,
  totalInvoiceAmount,
  beneficiary,
  category,
  remark
) {
  return {
    id,
    blNo,
    invoiceNos,
    latestInvoiceDate,
    totalInvoiceAmount,
    beneficiary,
    category,
    remark,
  };
}

export default function InvoicePaymentList() {
  const router = useRouter();
  const { setMode } = formStore();
  const tableWrapRef = useRef(null);

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [totalPage, setTotalPage] = useState(1);
  const [totalRows, setTotalRows] = useState(1);
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState({ searchColumn: "", searchValue: "" });
  const [loadingState, setLoadingState] = useState("Loading...");
  const [selectedIds, setSelectedIds] = useState([]);

  // === Checkbox logic ===
  const idsOnPage = useMemo(() => rows.map((r) => r.id), [rows]);
  const allChecked =
    selectedIds.length > 0 && selectedIds.length === idsOnPage.length;
  const someChecked =
    selectedIds.length > 0 && selectedIds.length < idsOnPage.length;

  const toggleAll = () => setSelectedIds(allChecked ? [] : idsOnPage);
  const toggleOne = (id) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  // === Fetch data ===
  const getData = useCallback(
    async (pageNo = page, pageSize = rowsPerPage) => {
      try {
        const tableObj = {
          columns: `
            MAX(i.id) AS id,
            b.mblNo AS blNo,
            STRING_AGG(i.invoiceNo, ', ') AS invoiceNos,
            CONVERT(VARCHAR, MAX(i.invoiceDate), 103) AS latestInvoiceDate,
            SUM(i.totalInvoiceAmount) AS totalInvoiceAmount,
            c.name AS beneficiary,
            cat.name AS category,
            MAX(i.remarks) AS remark
          `,
          tableName: "tblInvoice i",
          joins: `
            LEFT JOIN tblBl b ON b.id = i.blId
            LEFT JOIN tblCompany c ON c.id = b.companyId
            LEFT JOIN tblMasterData cat ON cat.id = i.invoiceCategoryId
          `,
          whereCondition: "ISNULL(i.status, 1) = 1",
          groupBy: "GROUP BY b.mblNo, c.name, cat.name",
          orderBy: "ORDER BY MAX(i.createdDate) DESC",
          pageNo,
          pageSize,
          searchColumn: search.searchColumn,
          searchValue: search.searchValue,
        };

        const { data, totalPage, totalRows } = await fetchTableValues(tableObj);

        const mapped = (data || []).map((item) =>
          createData(
            item["id"],
            item["blNo"],
            item["invoiceNos"],
            item["latestInvoiceDate"],
            item["totalInvoiceAmount"],
            item["beneficiary"],
            item["category"],
            item["remark"]
          )
        );

        setRows(mapped);
        setTotalPage(totalPage);
        setPage(pageNo);
        setRowsPerPage(pageSize);
        setTotalRows(totalRows);
        setSelectedIds([]);
      } catch (err) {
        console.error("Error fetching invoice payment list:", err);
        setLoadingState("Failed to load data");
      }
    },
    [page, rowsPerPage, search]
  );

  useEffect(() => {
    setMode({ mode: null, formId: null });
    getData(1, rowsPerPage);
  }, []);

  const handleChangePage = (_e, newPage) => getData(newPage, rowsPerPage);
  const handleChangeRowsPerPage = (e) => getData(1, +e.target.value);

  const modeHandler = useCallback(
    (mode, formId = null) => {
      setMode({ mode: mode || null, formId });
      router.push("/request/invoicePayment");
    },
    [router, setMode]
  );

  // ✅ Pay handler
  const handlePay = async (recordId) => {
    try {
      const query = {
        columns: "TOP 1 b.id AS blId",
        tableName: "tblInvoice i",
        joins: "LEFT JOIN tblBl b ON b.id = i.blId",
        whereCondition: `i.id = ${recordId}`,
      };
      const { success, data } = await getDataWithCondition(query);
      if (success && data?.length > 0) {
        const blId = data[0].blId;
        router.push(`/request/invoicePayment/payment?blId=${blId}`);
      } else {
        toast.error("BL ID not found for this invoice.");
      }
    } catch (err) {
      console.error("Error fetching BL ID:", err);
      toast.error("Unable to fetch BL ID.");
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box className="sm:px-4 py-1">
        <Box className="flex flex-col sm:flex-row justify-between pb-1">
          <Typography variant="body1" className="text-left flex items-center">
            Invoice Payment
          </Typography>
          <Box className="flex flex-col sm:flex-row gap-6">
            <SearchBar
              getData={getData}
              rowsPerPage={rowsPerPage}
              search={search}
              setSearch={setSearch}
              options={invoicePaymentSearchColumns}
            />

            <CustomButton text="Add" onClick={() => modeHandler(null, null)} />
          </Box>
        </Box>

        {/* ✅ Use simplified SelectionActionsBar */}
        <SelectionActionsBar
          selectedIds={selectedIds}
          keyColumn="id"
          isPay
          onView={(id) => modeHandler("view", id)}
          onEdit={(id) => modeHandler("edit", id)}
          onPay={(ids) => handlePay(Array.isArray(ids) ? ids[0] : ids)}
        />

        <TableContainer component={Paper} ref={tableWrapRef} className="mt-2">
          <Table size="small" sx={{ minWidth: 950 }}>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox" sx={CHECKBOX_HEAD_SX}>
                  <Checkbox
                    size="small"
                    indeterminate={someChecked}
                    checked={allChecked}
                    onChange={toggleAll}
                    sx={CHECKBOX_SX}
                  />
                </TableCell>
                <TableCell>BL No</TableCell>
                <TableCell>Invoice Nos</TableCell>
                <TableCell>Latest Invoice Date</TableCell>
                <TableCell>Total Amount</TableCell>
                <TableCell>Beneficiary</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Remarks</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {rows.length > 0 ? (
                rows.map((row) => (
                  <TableRow key={row.id} hover className="relative group">
                    <TableCell padding="checkbox" sx={CHECKBOX_CELL_SX}>
                      <Checkbox
                        size="small"
                        checked={selectedIds.includes(row.id)}
                        onChange={() => toggleOne(row.id)}
                        sx={CHECKBOX_SX}
                      />
                    </TableCell>

                    <TableCell>
                      <Link
                        href="#"
                        underline="hover"
                        onClick={(e) => {
                          e.preventDefault();
                          modeHandler("view", row.id);
                        }}
                        sx={{ cursor: "pointer", fontWeight: 500 }}
                      >
                        {row.blNo}
                      </Link>
                    </TableCell>

                    <TableCell>{row.invoiceNos}</TableCell>
                    <TableCell>{row.latestInvoiceDate}</TableCell>
                    <TableCell>{row.totalInvoiceAmount}</TableCell>
                    <TableCell>{row.beneficiary}</TableCell>
                    <TableCell>{row.category}</TableCell>
                    <TableCell>{row.remark}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={10} align="center">
                    {loadingState}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Box className="flex justify-between items-center">
          <TableExportButtons
            targetRef={tableWrapRef}
            title="Invoice Payment"
            fileName="invoice-payment-list"
          />
          <Box className="flex justify-end items-center mt-2">
            <CustomPagination
              count={totalPage}
              totalRows={totalRows}
              page={page}
              rowsPerPage={rowsPerPage}
              onPageChange={handleChangePage}
              handleChangeRowsPerPage={handleChangeRowsPerPage}
            />
          </Box>
        </Box>
      </Box>
      <ToastContainer />
    </ThemeProvider>
  );
}
