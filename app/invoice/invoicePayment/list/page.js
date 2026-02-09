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
import SearchBar from "@/components/searchBar/searchBar"; // ok even if unused
import TableExportButtons from "@/components/tableExportButtons/tableExportButtons";
import SelectionActionsBar from "@/components/selectionActions/selectionActionPayment";
import { fetchTableValues, getDataWithCondition } from "@/apis";
import { formStore } from "@/store";
import {
  paymentStatusColor,
  advanceSearchFieldsPayment,
  advanceSearchFilterPayment,
} from "../invoicePaymentData";
import AdvancedSearchBar from "@/components/advanceSearchBar/advanceSearchBar";
import { getUserByCookies } from "@/utils";
import HistoryIcon from "@mui/icons-material/History";
import { PaymentHistoryModal } from "./historyModal";

const LIST_TABLE = "tblInvoice i";
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
  remark,
  status,
  invoicePaymentId,
  isEdit,
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
    status,
    invoicePaymentId,
    isEdit,
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
  const [advanceSearch, setAdvanceSearch] = useState({});
  const [loadingState, setLoadingState] = useState("Data not found!");
  const [selectedIds, setSelectedIds] = useState([]);
  const [historyModal, setHistoryModal] = useState({
    toggle: false,
    value: null,
    mblNo: null,
  });
  const userData = getUserByCookies();

  // === CHECKBOX ===
  const idsOnPage = useMemo(() => rows.map((r) => r.id), [rows]);
  const allChecked =
    selectedIds.length > 0 && selectedIds.length === idsOnPage.length;
  const someChecked =
    selectedIds.length > 0 && selectedIds.length < idsOnPage.length;

  const toggleAll = () => setSelectedIds(allChecked ? [] : idsOnPage);
  const toggleOne = (id) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  // === FETCH DATA ===
  const getData = useCallback(
    async (pageNo = page, pageSize = rowsPerPage) => {
      try {
        const tableObj = {
          columns: `
    MAX(i.id) AS id,
    ir.blNo AS blNo,
    STRING_AGG(i.invoiceNo, ', ') AS invoiceNos,
    CONVERT(VARCHAR, MAX(i.invoiceDate), 103) AS latestInvoiceDate,
    SUM(i.totalInvoiceAmount) AS totalInvoiceAmount,
    c.name AS beneficiary,
    MAX(cat.name) AS category,
    MAX(ipAgg.remarks) AS remark,
    iif(min(i.invoicePaymentId) = max(i.invoicePaymentId), max(ipAgg.statusName), null) AS status,
    MAX(i.invoicePaymentId) AS invoicePaymentId,
   case when max(u3.roleCode) = 'shipping' then cast(0 as bit) else cast(1 as bit) end as isEdit
  `,
          tableName: "tblInvoice i",
          joins: `
    LEFT JOIN tblBl b ON b.id = i.blId
    LEFT JOIN tblCompany c ON c.id = i.shippingLineId
    LEFT JOIN tblMasterData cat ON cat.id = i.invoiceCategoryId
    LEFT JOIN tblUser u ON u.id = ${userData.userId}
    JOIN tblInvoiceRequest ir on  ir.id = i.invoiceRequestId and ir.companyId = u.companyId and ir.companyBranchId = u.branchId and i.locationId = ${userData.location}
    left join tblUser u2 on u2.id = i.createdBy
	  left join tblUserRoleMapping ur on ur.userId = u.id
	  left join tblUser u3 on u3.id = ur.roleId
    LEFT JOIN (
      SELECT *
      FROM (
        SELECT
          ip.invoiceIds,
          ip.remarks,
          m.name AS statusName,
          ip.paymentStatusId AS statusId,
          ip.id AS ids,
          ROW_NUMBER() OVER (
            PARTITION BY ip.invoiceIds
            ORDER BY ip.id DESC          -- or ip.createdDate DESC
          ) AS rn
        FROM tblInvoicePayment ip
        LEFT JOIN tblMasterData m ON m.id = ip.paymentStatusId
      ) x
      WHERE x.rn = 1                     -- latest payment per BL
    ) AS ipAgg ON i.id in (select try_cast(value as int) from string_split(ipAgg.invoiceIds, ','))
  `,
          groupBy: "GROUP BY ir.blNo, c.name, i.invoicePaymentId",
          orderBy: "ORDER BY MAX(i.createdDate) DESC",
          pageNo,
          pageSize,
          advanceSearch: advanceSearchFilterPayment(advanceSearch),
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
            item["remark"],
            item["status"],
            item["invoicePaymentId"],
            item["isEdit"],
          ),
        );

        setRows(mapped);
        setTotalPage(totalPage);
        setTotalRows(totalRows);
        setPage(pageNo);
        setRowsPerPage(pageSize);
        setSelectedIds([]);
      } catch (err) {
        console.error("Error fetching Invoice Payment list:", err);
        setLoadingState("Failed to load data");
      }
    },
    [page, rowsPerPage, advanceSearch],
  );

  useEffect(() => {
    setMode({ mode: null, formId: null });
    getData(1, rowsPerPage);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChangePage = (_e, newPage) => getData(newPage, rowsPerPage);
  const handleChangeRowsPerPage = (e) => getData(1, +e.target.value);

  const modeHandler = useCallback(
    (mode, formId = null) => {
      const filterRow = rows.filter((item) => item.id === formId);
      if (!filterRow?.[0]?.isEdit && mode === "edit") {
        toast.error("You can't edit shipping liner created invoices!");
        return;
      }
      setMode({ mode: mode || null, formId });
      router.push("/invoice/invoicePayment");
    },
    [router, setMode, rows],
  );

  // === PAY DISABLE LOGIC ===
  const isSingleSelect = selectedIds.length === 1;
  let disablePay = false;

  if (!isSingleSelect) {
    disablePay = true;
  } else {
    const row = rows.find((r) => r.id === selectedIds[0]);
    const st = row?.status?.toLowerCase()?.trim();

    if (st === "payment confirmed" || st === "payment confirmation requested") {
      disablePay = true;
    }
  }

  // === PAY HANDLER ===
  // const handlePay = async (recordId) => {
  //   try {
  //     const query = {
  //       columns: "TOP 1 b.id AS blId",
  //       tableName: "tblInvoice i",
  //       joins: "LEFT JOIN tblBl b ON b.id = i.blId",
  //       whereCondition: `i.id = ${recordId}`,
  //     };
  //     const { success, data } = await getDataWithCondition(query);
  //     if (success && data?.length > 0) {
  //       const blId = data[0].blId;
  //       router.push(`/invoice/invoicePayment/payment?blId=${blId}`);
  //     } else {
  //       toast.error("BL ID not found for this invoice.");
  //     }
  //   } catch (err) {
  //     console.error("Error fetching BL ID:", err);
  //     toast.error("Unable to fetch BL ID.");
  //   }
  // };
  const handlePay = async (recordId) => {
    try {
      const query = {
        columns: "blNo",
        tableName: "tblInvoice",
        whereCondition: `id = ${recordId}`,
      };

      const { success, data } = await getDataWithCondition(query);

      if (!success || !data?.length || !data[0].blNo) {
        toast.error("BL No not found for this invoice.");
        return;
      }

      const blNo = data[0].blNo;

      // ✅ SINGLE SOURCE OF TRUTH
      router.push(
        `/invoice/invoicePayment/payment?blNo=${encodeURIComponent(blNo)}`,
      );
    } catch (err) {
      console.error("Error opening payment page:", err);
      toast.error("Unable to open payment page.");
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box className="sm:px-4 py-1">
        <Box className="flex flex-col sm:flex-row justify-between pb-1">
          <Typography variant="body1">Invoice Payment</Typography>

          <Box className="flex flex-col sm:flex-row gap-6">
            <AdvancedSearchBar
              fields={advanceSearchFieldsPayment.bl}
              advanceSearch={advanceSearch}
              setAdvanceSearch={setAdvanceSearch}
              getData={getData}
              rowsPerPage={rowsPerPage}
            />
            <CustomButton text="Add" onClick={() => modeHandler(null, null)} />
          </Box>
        </Box>

        <SelectionActionsBar
          selectedIds={selectedIds}
          keyColumn="id"
          isPay
          disablePay={disablePay}
          disableEdit={disablePay}
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
                <TableCell>Status</TableCell>
                <TableCell>History</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {rows.length > 0 ? (
                rows.map((row) => (
                  <TableRow key={row.id} hover>
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
                    <TableCell sx={{ color: paymentStatusColor(row.status) }}>
                      {row.status}
                    </TableCell>
                    <TableCell>
                      <HistoryIcon
                        sx={{ cursor: "pointer", fontSize: 16 }}
                        onClick={() =>
                          setHistoryModal({
                            toggle: true,
                            value: row.invoicePaymentId,
                            mblNo: row.blNo,
                          })
                        }
                      />
                    </TableCell>
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
      <PaymentHistoryModal
        historyModal={historyModal}
        setHistoryModal={setHistoryModal}
      />
      <ToastContainer />
    </ThemeProvider>
  );
}
