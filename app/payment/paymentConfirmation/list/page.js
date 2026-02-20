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
import { getUserByCookies } from "@/utils";
import AttachFileIcon from "@mui/icons-material/AttachFile"; // 🔹 NEW
import { InvoiceModal, InvoicePaymentAssignModal } from "../utils"; // 🔹 adjust path as per your file
import { PaymentHistoryModal } from "./historyModal";

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
  blId,
  assignTo,
  invoiceRequestId
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
    assignTo,
    invoiceRequestId,
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
  const [assignModal, setAssignModal] = useState({ toggle: false });
  const userData = getUserByCookies();
  const [selectedIds, setSelectedIds] = useState([]);
  const [modal, setModal] = useState({
    toggle: false,
    value: null,
  });
  const [historyModal, setHistoryModal] = useState({
    toggle: false,
    value: null,
    mblNo: null,
  });

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

  const getData = useCallback(
    async (pageNo = page, pageSize = rowsPerPage) => {
      try {
        // 🔹 Build advanced search WHERE from UI
        const advWhere = advanceSearchFilter(advanceSearch);

        // ✅ Detect if user has selected any status filter (robust)
        const statusSelected = Array.isArray(advanceSearch?.statusId)
          ? advanceSearch.statusId.some((x) => String(x ?? "").trim() !== "")
          : String(advanceSearch?.statusId ?? "").trim() !== "";

        // ✅ Default: hide only "Payment Rejected" when NO status filter is selected
        let finalWhere = advWhere;

        if (!statusSelected) {
          const hideRejected = `(ms.name IS NULL OR ms.name <> 'Payment Rejected')`;
          finalWhere = finalWhere
            ? `${finalWhere} AND ${hideRejected}`
            : hideRejected;
        }

        const tableObj = {
          columns: `
    p.id AS id,
    p.blId AS blId,
    p.createdDate AS paymentDate,
    p.blNo AS blNo,
    r.isFreeDays AS DoExtension,
    u1.name AS PayorName,
    m.name AS paymentType,
    p.bankName AS BankName,
    p.referenceNo AS PaymentRefNo,
    p.Amount AS Amount,
    ms.name AS status,
    u3.name AS assignTo,
    p.invoiceRequestId AS invoiceRequestId,
    p.locationId AS locationId
  `,
          tableName: "tblInvoicePayment p",
          joins: `
JOIN tblUser u
    ON u.id = ${userData.userId}
   AND p.shippingLineId = u.companyId
LEFT JOIN tblUser u1
    ON u1.id = p.createdBy
LEFT JOIN tblUser u3
    ON u3.id = p.assignToId
   AND (p.assignToId = ${userData.userId} OR p.assignToId IS NULL)
LEFT JOIN tblInvoiceRequest r
    ON r.blNo = p.blNo
LEFT JOIN tblMasterData m
    ON m.id = p.paymentTypeId
LEFT JOIN tblMasterData ms
    ON ms.id = p.paymentStatusId
JOIN tblLocation l
    ON l.id = p.locationId
   AND p.locationId = ${userData.location}
  `,
          advanceSearch: finalWhere,

          orderBy: "ORDER BY p.createdDate DESC",
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
            item["blId"],
            item["assignTo"],
            item["invoiceRequestId"]
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
    if (!rejectState.value?.trim()) {
      toast.warn("Remarks are required to reject the payment");
      return;
    }
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
          // invoiceIds: null,
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

  const assignToHandler = async (id) => {
    setAssignModal((prev) => ({ ...prev, toggle: true, paymentId: id }));
  };

  const onAssignHandler = async ({ userId }, paymentId) => {
    const userData = getUserByCookies();
    const rowsPayload = [
      {
        id: paymentId,
        assignToId: userId?.Id,
        updatedBy: userData.userId,
        updatedDate: new Date(),
      },
    ];
    const res = await updateStatusRows({
      tableName: "tblInvoicePayment",
      rows: rowsPayload,
      keyColumn: "id",
    });
    const { success, message } = res || {};
    if (!success) {
      toast.error(message || "Update failed");
      setAssignModal((prev) => ({ ...prev, toggle: false, invoiceIds: null }));
      return;
    }
    toast.success("Assign updated successfully!");
    setAssignModal((prev) => ({ ...prev, toggle: false, invoiceIds: null }));
    getData();
  };

  const handleChangePage = (_e, newPage) => getData(newPage, rowsPerPage);
  const handleChangeRowsPerPage = (e) => getData(1, +e.target.value);

  useEffect(() => {
    async function fetchStatus() {
      const obj = {
        columns: "id as Id, name as Name",
        tableName: "tblMasterData",
        whereCondition: "masterListName = 'tblPaymentStatus' AND status = 1",
      };

      const { success, data } = await getDataWithCondition(obj);
      if (success) setStatusList(data);

      setMode({ mode: null, formId: null });
      getData(1, rowsPerPage);
    }
    fetchStatus();
  }, []);

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
        {/* <Box className="flex items-center gap-2 py-2">
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
        </Box> */}

        <TableContainer
          component={Paper}
          ref={tableWrapRef}
          className="!mt-2 !max-w-full !overflow-x-hidden"
        >
          <Table
            size="small"
            className="
               w-full table-fixed
               [&_th]:whitespace-normal [&_td]:whitespace-normal
               [&_th]:break-words      [&_td]:break-words
               [&_th]:px-1 [&_td]:px-1
               [&_th]:py-1 [&_td]:py-1
               [&_th]:text-[11px] [&_td]:text-[11px]
             "
          >
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
                <TableCell>Assign To</TableCell>
                {/* 🔹 NEW column header */}
                <TableCell>Attachments</TableCell>
                <TableCell sx={ACTIONS_HEAD_SX}>Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {rows.length > 0 ? (
                rows.map((row, _index) => (
                  <TableRow key={_index} hover>
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
                          formStore
                            .getState()
                            .setMode({ mode: "view", formId: row.id });
                          router.push(
                            `/invoice/invoiceRelease?invoiceRequestId=${row.invoiceRequestId}`
                          );
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
                    <TableCell>{row.assignTo}</TableCell>

                    {/* 🔹 NEW Attachments icon cell */}
                    <TableCell>
                      <AttachFileIcon
                        sx={{ cursor: "pointer", fontSize: 16 }}
                        onClick={() =>
                          setModal((prev) => ({
                            ...prev,
                            toggle: true,
                            value: row.id,
                            blNo: row.blNo, // paymentId
                          }))
                        }
                      />
                    </TableCell>

                    <TableCell sx={ACTIONS_CELL_SX}>
                      <TopActionIcons
                        show={{
                          addUser: true,
                          history: true,
                          approve: true,
                          reject: true,
                          notify: true,
                          search: true,
                        }}
                        onAddUser={() => assignToHandler(row.id)}
                        onHistory={() => {
                          setHistoryModal({
                            toggle: true,
                            value: row.id, // ✅ paymentId ONLY
                            mblNo: row.blNo, // ✅ display only
                          });
                        }}
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
                  {/* now 12 columns total */}
                  <TableCell colSpan={12} align="center">
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
      <InvoiceModal modal={modal} setModal={setModal} />
      <InvoicePaymentAssignModal
        modal={assignModal}
        setModal={setAssignModal}
        onAssignHandler={onAssignHandler}
      />
      <PaymentHistoryModal
        historyModal={historyModal}
        setHistoryModal={setHistoryModal}
      />
      <ToastContainer />
    </ThemeProvider>
  );
}
