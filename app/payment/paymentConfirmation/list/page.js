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
  Tooltip,
} from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import CustomPagination from "@/components/pagination/pagination";
import { theme } from "@/styles/globalCss";
import {
  deleteRecord,
  fetchTableValues,
  getDataWithCondition,
  updateStatusRows,
} from "@/apis";
import { ToastContainer, toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { formStore } from "@/store";
import AdvancedSearchBar from "@/components/advanceSearchBar/advanceSearchBar";
import {
  advanceSearchFields,
  advanceSearchFilter,
  paymentStatusColor,
  RejectModal,
} from "../paymentConfirmationData";
import TableExportButtons from "@/components/tableExportButtons/tableExportButtons";
import { TopActionIcons } from "@/components/tableHoverIcons/tableHoverIconsPayment";

const LIST_TABLE = "tblInvoicePayment p";
const UPDATE_TABLE = LIST_TABLE.trim()
  .split(/\s+/)[0]
  .replace(/^dbo\./i, "");

// Checkbox sizing
const CHECKBOX_HEAD_SX = { width: 36, minWidth: 36, maxWidth: 36 };
const CHECKBOX_CELL_SX = { width: 32, minWidth: 32, maxWidth: 32 };
const CHECKBOX_SX = { p: 0.25, "& .MuiSvgIcon-root": { fontSize: 18 } };

// ✅ Actions column (non-sticky)
const ACTIONS_W = 250;
const ACTIONS_HEAD_SX = {
  width: ACTIONS_W,
  minWidth: ACTIONS_W,
  maxWidth: ACTIONS_W,
  textAlign: "center",
};
const ACTIONS_CELL_SX = {
  width: ACTIONS_W,
  minWidth: ACTIONS_W,
  maxWidth: ACTIONS_W,
  textAlign: "center",
};

const toYesNo = (v) => (v === "Y" ? "Yes" : "No");

function createData(
  id,
  paymentDate,
  blNo,
  DoExtension,
  PayorName,
  paymentType,
  BankName,
  PaymentRefNo,
  Amount,
  status,
  blId
) {
  return {
    id,
    paymentDate,
    blNo,
    DoExtension,
    PayorName,
    paymentType,
    BankName,
    PaymentRefNo,
    Amount,
    status,
    blId,
  };
}

export default function InvoiceRequestList() {
  const router = useRouter();
  const { setMode } = formStore();

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [totalPage, setTotalPage] = useState(1);
  const [totalRows, setTotalRows] = useState(1);
  const [rows, setRows] = useState([]);
  const [advanceSearch, setAdvanceSearch] = useState({});
  const [loadingState, setLoadingState] = useState("Loading...");
  const tableWrapRef = useRef(null);
  const [filters, setFilters] = useState({
    reRequest: false,
    reProcess: false,
    hblCount: false,
  });
  const [statusList, setStatusList] = useState([]);
  const [rejectState, setRejectState] = useState({
    toggle: false,
    value: "",
    paymentId: null,
  });

  const [selectedIds, setSelectedIds] = useState([]);
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

  useEffect(() => {
    async function fetchStatus() {
      const obj = {
        columns: "id as Id, name as Name",
        tableName: "tblMasterData",
        whereCondition: "masterListName = 'tblPaymentStatus' AND status = 1",
      };

      const { success, data } = await getDataWithCondition(obj);
      if (success) setStatusList(data);
    }
    fetchStatus();
  }, []);

  const approveHandler = async (paymentId) => {
    const id = statusList.find((x) => x.Name === "Payment Confirmed")?.Id;
    if (!id) return toast.error("Payment Confirmed status missing");

    const payload = {
      tableName: "tblInvoicePayment",
      keyColumn: "id",
      rows: [{ id: paymentId, paymentStatusId: id }],
    };

    const res = await updateStatusRows(payload);

    res?.success
      ? toast.success("Payment Confirmed")
      : toast.error(res?.message);

    getData(page, rowsPerPage);
  };

  const rejectHandlerFinal = async () => {
    const id = statusList.find((x) => x.Name === "Payment Rejected")?.Id;
    if (!id) return toast.error("Payment Rejected status missing");

    const payload = {
      tableName: "tblInvoicePayment",
      keyColumn: "id",
      rows: [
        {
          id: rejectState.paymentId,
          paymentStatusId: id,
          remarks: rejectState.value,
        },
      ],
    };

    const res = await updateStatusRows(payload);

    if (res?.success) {
      toast.success("Payment Rejected");
      setRejectState({ toggle: false, value: "", paymentId: null });
      getData(page, rowsPerPage);
    } else toast.error(res?.message);
  };

  const getData = useCallback(
    async (pageNo = page, pageSize = rowsPerPage) => {
      try {
        const tableObj = {
          columns: `
            p.id id,
            p.blId blId,
            p.createdDate paymentDate,
            b.mblNo blNo,
            r.isFreeDays DoExtension,
            u.name PayorName,
            m.name paymentType,
            p.bankName BankName,
            p.referenceNo PaymentRefNo,
            p.Amount Amount,
            ms.name status
          `,
          tableName: LIST_TABLE,
          pageNo,
          pageSize,
          advanceSearch: advanceSearchFilter(advanceSearch),
          joins: `left join tblBl b on b.id=p.blId
            left join tblInvoiceRequest r on r.blNo=b.mblNo
            left join tblUser u on u.id=p.createdBy
            left join tblMasterData m on m.id=p.paymentTypeId
            left join tblMasterData ms on ms.id=p.paymentStatusId`,
          orderBy: "order by p.createdDate desc",
        };

        const { data, totalPage, totalRows } = await fetchTableValues(tableObj);

        const mapped = (data || []).map((item) =>
          createData(
            item["id"],
            item["paymentDate"],
            item["blNo"],
            item["DoExtension"],
            item["PayorName"],
            item["paymentType"],
            item["BankName"],
            item["PaymentRefNo"],
            item["Amount"],
            item["status"],
            item["blId"]
          )
        );

        setRows(mapped);
        setTotalPage(totalPage);
        setPage(pageNo);
        setRowsPerPage(pageSize);
        setTotalRows(totalRows);
        setSelectedIds([]);
      } catch (err) {
        console.error("Error fetching data:", err);
        setLoadingState("Failed to load data");
      }
    },
    [page, rowsPerPage, advanceSearch]
  );

  useEffect(() => {
    setMode({ mode: null, formId: null });
    getData(1, rowsPerPage);
  }, []);

  const handleChangePage = (_e, newPage) => getData(newPage, rowsPerPage);
  const handleChangeRowsPerPage = (e) => getData(1, +e.target.value);

  const handleDeleteRecord = async (recordId) => {
    const obj = { recordId, tableName: UPDATE_TABLE };
    const { success, message, error } = await deleteRecord(obj);
    if (success) {
      toast.success(message);
      getData(page, rowsPerPage);
    } else {
      toast.error(error || message);
    }
  };

  const modeHandler = useCallback(
    (mode, formId = null) => {
      if (mode === "delete") {
        if (formId != null) handleDeleteRecord(formId);
        return;
      }
      setMode({ mode: mode || null, formId });
      router.push("/request/invoiceRequest");
    },
    [router, setMode]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box className="sm:px-4 py-1">
        <Box className="flex flex-col sm:flex-row justify-between pb-1">
          <Typography variant="body1" className="text-left flex items-center">
            Payment Confirmation Dashboard
          </Typography>
          <Box className="flex flex-col sm:flex-row gap-6">
            <AdvancedSearchBar
              fields={advanceSearchFields.bl}
              advanceSearch={advanceSearch}
              setAdvanceSearch={setAdvanceSearch}
              getData={getData}
              rowsPerPage={rowsPerPage}
            />
          </Box>
        </Box>
        <Box className="flex items-center gap-2 py-2">
          <Tooltip title="Re - Request" arrow disableInteractive>
            <label
              className={[
                "inline-flex items-center gap-1 rounded-[3px] px-2 py-[3px] text-[12px] leading-none border font-medium",
                filters.reRequest
                  ? "bg-[#c8e6c9] border-[#81c784] text-[#2e7d32]"
                  : "bg-[#e8f5e9] border-[#c8e6c9] text-[#2e7d32]",
                "cursor-pointer select-none",
              ].join(" ")}
            >
              <Checkbox
                size="small"
                disableRipple
                checked={!!filters.reRequest}
                onChange={(e) =>
                  setFilters((p) => ({ ...p, reRequest: e.target.checked }))
                }
                sx={{
                  p: 0,
                  mr: 0.5,
                  "& .MuiSvgIcon-root": {
                    fontSize: 14,
                    verticalAlign: "middle",
                  },
                  "&.Mui-checked": {
                    color: "#2e7d32",
                  },
                }}
              />
              <span>Re - Request</span>
            </label>
          </Tooltip>
        </Box>

        <TableContainer component={Paper} ref={tableWrapRef} className="mt-2">
          <Table size="small" sx={{ width: "100%", tableLayout: "auto" }}>
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
                <TableCell>Payment Date</TableCell>
                <TableCell>BL No</TableCell>
                <TableCell>Do Extension</TableCell>
                <TableCell>Payor Name</TableCell>
                <TableCell>Payment Type</TableCell>
                <TableCell>Bank Name</TableCell>
                <TableCell>Reference No</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Status</TableCell>

                <TableCell sx={ACTIONS_HEAD_SX}>Actions</TableCell>
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

                    <TableCell>{row.paymentDate}</TableCell>

                    <TableCell>
                      <Link
                        href="#"
                        underline="hover"
                        onClick={(e) => {
                          e.preventDefault();
                          // open Invoice Release in view mode for this BL
                          formStore
                            .getState()
                            .setMode({ mode: "view", formId: row.blId });
                          // navigate with blId as query for robustness
                          window.location.href = `/request/invoiceRelease?blId=${row.blId}`;
                        }}
                        sx={{ cursor: "pointer", fontWeight: 500 }}
                      >
                        {row.blNo}
                      </Link>
                    </TableCell>

                    <TableCell>{toYesNo(row.DoExtension)}</TableCell>
                    <TableCell>{row.PayorName}</TableCell>
                    <TableCell>{row.paymentType}</TableCell>
                    <TableCell>{row.BankName}</TableCell>
                    <TableCell>{row.PaymentRefNo}</TableCell>
                    <TableCell>{row.Amount}</TableCell>
                    <TableCell sx={{ color: paymentStatusColor(row.status) }}>
                      {row.status}
                    </TableCell>
                    <TableCell sx={ACTIONS_CELL_SX}>
                      <TopActionIcons
                        show={{
                          addUser: true,
                          undo: true,
                          approve: true,
                          reject: true,
                          notify: true,
                          search: true,
                        }}
                        onAddUser={() => {}}
                        onUndo={() => {}}
                        onApprove={() => approveHandler(row.id)}
                        onReject={() =>
                          setRejectState({
                            toggle: true,
                            value: "",
                            paymentId: row.id,
                          })
                        }
                        onNotify={() => {}}
                        onSearch={() => {}}
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
            title="Invoice Request"
            fileName="invoice-request-list"
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
      <RejectModal
        rejectState={rejectState}
        setRejectState={setRejectState}
        rejectHandler={rejectHandlerFinal}
      />
      <ToastContainer />
    </ThemeProvider>
  );
}
