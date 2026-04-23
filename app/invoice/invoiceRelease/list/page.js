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
import CustomPagination from "@/components/pagination/pagination";
import { theme } from "@/styles/globalCss";
import {
  fetchTableValues,
  getDataWithCondition,
  sendInvoiceEmail,
  updateStatusRows,
} from "@/apis";
import { ToastContainer, toast } from "react-toastify";
import TableExportButtons from "@/components/tableExportButtons/tableExportButtons";
import { useRouter } from "next/navigation";
import { formStore } from "@/store";
import InvoiceToolbarActions from "@/components/selectionActions/selectionActionBarInvoice";
import AdvancedSearchBar from "@/components/advanceSearchBar/advanceSearchBar";
import {
  advanceSearchFields,
  advanceSearchFilter,
  statusColor,
} from "../invoiceReleaseData";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import { getUserByCookies } from "@/utils";
import { InvoiceModal } from "../../invoiceRequest/utils";
import InvoiceHistoryModal, { InvoiceAssignModal } from "../modal";
import HistoryIcon from "@mui/icons-material/History"; // ⬅️ NEW

const LIST_TABLE = "tblInvoiceRequest i";

const CHECKBOX_HEAD_SX = { width: 36, minWidth: 36, maxWidth: 36 };
const CHECKBOX_CELL_SX = { width: 32, minWidth: 32, maxWidth: 32 };

const CHECKBOX_SX = { p: 0.25, "& .MuiSvgIcon-root": { fontSize: 18 } };

const toFreeDaysLabel = (v) => (v === "D" ? "Yes" : "No");
const toYesNo = (v) => (v === "Y" ? "Yes" : "No");

function createData(
  id,
  liner,
  blNo,
  type,
  freeDays,
  highSealSale,
  remarks,
  date,
  requester,
  ReqCompanyName,
  status,
  assignTo,
) {
  return {
    id,
    liner,
    blNo,
    type,
    freeDays,
    highSealSale,
    remarks,
    date,
    requester,
    ReqCompanyName,
    status,
    assignTo,
  };
}

export default function InvoiceReleaseList() {
  const router = useRouter();
  const { setMode } = formStore();
  const userData = getUserByCookies();

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [totalPage, setTotalPage] = useState(1);
  const [totalRows, setTotalRows] = useState(1);
  const [statusList, setStatusList] = useState([]);
  const [rows, setRows] = useState([]);
  const [advanceSearch, setAdvanceSearch] = useState({});
  const [loadingState, setLoadingState] = useState("Data not found!");
  const tableWrapRef = useRef(null);
  const [modal, setModal] = useState({ toggle: false, value: null });
  const [emailLoading, setEmailLoading] = useState(false);

  const [selectedIds, setSelectedIds] = useState([]);
  const [historyModal, setHistoryModal] = useState({
    open: false,
    id: null,
    invoiceNo: "",
  });
  const [assignModal, setAssignModal] = useState({ toggle: false });
  // const [searchCondition, setSearchCondition] = useState(
  //   `u.id = ${userData?.userId}`,
  // );

  const idsOnPage = useMemo(() => rows.map((x) => x.id), [rows]);

  const allChecked =
    selectedIds.length === idsOnPage.length && idsOnPage.length > 0;
  const someChecked =
    selectedIds.length > 0 && selectedIds.length < idsOnPage.length;

  const toggleAll = () => setSelectedIds(allChecked ? [] : idsOnPage);
  const toggleOne = (id) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const getData = useCallback(
    async (pageNo = page, pageSize = rowsPerPage) => {
      try {
        const tableObj = {
          columns: `
            i.id,
            c.name AS liner,
            i.blNo,
            m.name AS type,
            i.isFreeDays AS freeDays,
            i.isHighSealSale AS highSealSale,
            i.remarks,
            i.createdDate AS date,
            u3.name AS requester,
            c1.name As ReqCompanyName,
            st.name AS status,
            u2.name as assignTo
          `,
          tableName: LIST_TABLE,
          pageNo,
          pageSize,
          advanceSearch: advanceSearchFilter(advanceSearch),

          joins: `
                  LEFT JOIN tblMasterData m ON m.id = i.deliveryTypeId
                  LEFT JOIN tblUser u2 ON u2.id = i.assignToId
                  LEFT JOIN tblUser u3 ON u3.id = i.createdBy
                  LEFT JOIN tblCompany c1 ON c1.id = i.companyId
                  LEFT JOIN tblCompany c ON c.id = i.shippingLineId
                  JOIN tblMasterData st 
                    ON st.id = i.invoiceRequestStatusId
                  AND i.invoiceRequestStatusId IS NOT NULL
                  AND i.locationId = ${userData.location}
                  ${
                    userData?.roleCode === "admin"
                      ? ""
                      : `AND i.shippingLineId = ${userData.companyId}
                          AND (i.assignToId IS NULL OR i.assignToId = ${userData.userId})`
                  }
                `,
          orderBy: `
            ORDER BY 
              CASE 
                WHEN st.name = 'Requested' THEN 1
                WHEN st.name = 'Released' THEN 2
                WHEN st.name = 'Rejected' THEN 3
                ELSE 4
              END,
              ISNULL(i.updatedDate, i.createdDate) DESC
          `,
        };

        const { data, totalPage, totalRows } = await fetchTableValues(tableObj);

        const mapped = (data || []).map((item) =>
          createData(
            item.id,
            item.liner,
            item.blNo,
            item.type,
            item.freeDays,
            item.highSealSale,
            item.remarks,
            item.date,
            item.requester,
            item.ReqCompanyName,
            item.status,
            item.assignTo,
          ),
        );

        setRows(mapped);
        setTotalPage(totalPage);
        setTotalRows(totalRows);
        setPage(pageNo);
        setRowsPerPage(pageSize);
        setSelectedIds([]);
      } catch (err) {
        console.error("Error fetching:", err);
        setLoadingState("Failed to load data");
      }
    },
    [page, rowsPerPage, advanceSearch],
  );
  const handleNotify = async (ids) => {
    try {
      if (!ids?.length) {
        toast.warn("Please select at least one row");
        return;
      }

      const invoiceRequestId = ids[0];

      const selectedRow = rows.find((r) => r.id === invoiceRequestId);
      const blNo = selectedRow?.blNo || "";

      setEmailLoading(true);

      // 1️⃣ get email
      const emailObj = {
        columns:
          "ir.billingPartyEmailId as emailId,ir.billingPartyName as name",
        tableName: "tblInvoiceRequest ir",
        whereCondition: `ir.id = ${invoiceRequestId}`,
      };

      const emailRes = await getDataWithCondition(emailObj);

      if (!emailRes?.success) {
        toast.error("Failed to fetch email id.");
        return;
      }

      const to = emailRes?.data?.[0]?.emailId || "";

      if (!to) {
        toast.error("Recipient email id not found.");
        return;
      }

      // 2️⃣ get attachment paths
      const attachmentObj = {
        columns: "path",
        tableName: "tblAttachment a",
        joins: `left join tblInvoice i on i.invoiceRequestId=${invoiceRequestId}`,
        whereCondition: `a.invoiceId=i.id AND a.status=1`,
      };

      const attachRes = await getDataWithCondition(attachmentObj);

      if (!attachRes?.success) {
        toast.error("Failed to fetch attachments.");
        return;
      }

      const attachmentPaths = (attachRes?.data || [])
        .map((x) => x.path)
        .filter((x) => typeof x === "string" && x.trim());

      if (!attachmentPaths.length) {
        toast.error("No invoice attachment found.");
        return;
      }

      // 3️⃣ send email
      const payload = {
        to,
        subject: `Invoice / ${blNo}`,
        emailHtml: `
        <div>
          <p>Dear ${emailRes?.data?.[0]?.name || "Sir/ Madam"},</p>
          <p>Please find attached invoice(s) for BL No: <b>${blNo}</b>.</p>
          <p>Regards,</p>
        </div>
      `,
        emailText: `Please find attached invoice(s) for BL No: ${blNo}.`,
        attachmentPaths,
      };

      const resp = await sendInvoiceEmail(payload);

      if (resp?.success) {
        toast.success("Invoice email sent successfully!");
      } else {
        toast.error(resp?.message || "Failed to send invoice email.");
      }
    } catch (error) {
      toast.error(error?.message || "Failed to send invoice email.");
    } finally {
      setEmailLoading(false);
    }
  };
  const releaseHandler = async (ids) => {
    if (!ids?.length) {
      toast.warn("Please select at least one row");
      return;
    }

    const selected = rows.find((r) => r.id === ids[0]);
    if (!selected) {
      toast.error("Invalid selection");
      return;
    }

    const invoiceRequestId = selected.id;
    const blNo = selected.blNo?.trim();

    setMode({ mode: "add", formId: null });

    // 🔹 TRY BL FLOW FIRST (if blNo exists)
    if (blNo) {
      const q = {
        columns: "TOP 1 id",
        tableName: "tblBl",
        whereCondition: `
        ISNULL(hblNo, mblNo) = '${blNo}'
        AND ISNULL(status,1) = 1
      `,
      };

      const { success, data } = await getDataWithCondition(q);

      // ✅ BL FOUND → OLD FLOW
      if (success && data?.length) {
        const blId = data[0].id;

        router.push(
          `/invoice/invoiceRelease/invoiceUpload?blId=${blId}&invoiceRequestId=${invoiceRequestId}`,
        );
        return;
      }

      // ⚠️ BL NOT FOUND → FALLBACK (IMPORTANT)
      console.warn(
        `BL No ${blNo} not found in tblBl, falling back to invoiceRequestId`,
      );
    }

    // 🔹 FINAL FALLBACK → NEW FLOW
    router.push(
      `/invoice/invoiceRelease/invoiceUpload?invoiceRequestId=${invoiceRequestId}`,
    );
  };

  const assignHandler = async (ids) => {
    setAssignModal((prev) => ({ ...prev, toggle: true, invoiceIds: ids }));
  };

  const onAssignHandler = async ({ userId }, invoiceIds) => {
    const userData = getUserByCookies();
    const rowsPayload = invoiceIds.map((id) => {
      return {
        id: id,
        assignToId: userId?.Id,
        updatedBy: userData.userId,
        updatedDate: new Date(),
      };
    });
    const res = await updateStatusRows({
      tableName: "tblInvoiceRequest",
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

  const handleChangePage = (_, newPage) => getData(newPage, rowsPerPage);
  const handleChangeRowsPerPage = (e) => getData(1, +e.target.value);

  const modeHandler = useCallback(
    (mode, formId = null) => {
      setMode({ mode, formId, admin: "/invoice/invoiceRelease/list" });
      router.push("/invoice/invoiceRequest");
    },
    [router, setMode],
  );

  useEffect(() => {
    setMode({ mode: null, formId: null });
    getData(1, rowsPerPage);
    // if (userData?.roleCode === "admin") {
    //   setSearchCondition("u.roleCodeId = u4.id");
    //   getData(1, rowsPerPage, "u.roleCodeId = u4.id");
    // }
  }, []);

  useEffect(() => {
    async function fetchStatus() {
      const obj = {
        columns: "id as Id, name as Name",
        tableName: "tblMasterData",
        whereCondition: "masterListName = 'tblInvoiceRequest' AND status = 1",
      };

      const { success, data } = await getDataWithCondition(obj);
      if (success) setStatusList(data);
    }
    fetchStatus();
  }, []);

  const disableRelease = useMemo(() => {
    const selectedRows = rows.filter((r) => selectedIds.includes(r.id));

    if (!selectedRows.length) return true;

    return selectedRows.some((r) => {
      const status = String(r.status || "")
        .trim()
        .toLowerCase();
      return status !== "requested";
    });
  }, [selectedIds, rows]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <Box className="sm:px-4 py-1">
        <Box className="flex justify-between pb-1">
          <Typography variant="body1">Invoice Release</Typography>

          <AdvancedSearchBar
            fields={advanceSearchFields.bl}
            advanceSearch={advanceSearch}
            setAdvanceSearch={setAdvanceSearch}
            getData={getData}
            rowsPerPage={rowsPerPage}
          />
        </Box>

        <InvoiceToolbarActions
          selectedIds={selectedIds}
          onView={(id) => modeHandler("view", id)}
          onRelease={(ids) => releaseHandler(ids)}
          onAssign={(ids) => assignHandler(ids)}
          onNotify={(ids) => handleNotify(ids)} // ✅ ADD THIS
          hideReject={true}
          disableRelease={disableRelease}
        />

        <TableContainer component={Paper} ref={tableWrapRef} className="mt-2">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox" sx={CHECKBOX_HEAD_SX}>
                  <Checkbox
                    checked={allChecked}
                    indeterminate={someChecked}
                    onChange={toggleAll}
                    sx={CHECKBOX_SX}
                  />
                </TableCell>

                <TableCell>Liner</TableCell>
                <TableCell>BL No</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Extension</TableCell>
                <TableCell>High Sea Sale</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Remarks</TableCell>
                <TableCell>Request Date</TableCell>
                <TableCell>Requester Name</TableCell>
                <TableCell>Requester Company Name</TableCell>
                <TableCell>Assign To</TableCell>
                <TableCell>Attachment</TableCell>
                <TableCell>History</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {rows.length ? (
                rows.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell padding="checkbox" sx={CHECKBOX_CELL_SX}>
                      <Checkbox
                        checked={selectedIds.includes(row.id)}
                        onChange={() => toggleOne(row.id)}
                        sx={CHECKBOX_SX}
                      />
                    </TableCell>
                    <TableCell>{row.liner}</TableCell>
                    <TableCell>
                      <Link
                        href="#"
                        underline="hover"
                        onClick={(e) => {
                          e.preventDefault();
                          modeHandler("view", row.id);
                        }}
                      >
                        {row.blNo}
                      </Link>
                    </TableCell>
                    <TableCell>{row.type}</TableCell>
                    <TableCell>{toFreeDaysLabel(row.freeDays)}</TableCell>
                    <TableCell>{toYesNo(row.highSealSale)}</TableCell>
                    <TableCell sx={{ color: statusColor(row.status) }}>
                      {row.status}
                    </TableCell>
                    <TableCell>{row.remarks}</TableCell>
                    <TableCell>{row.date}</TableCell>
                    <TableCell>{row.requester}</TableCell>
                    <TableCell>{row.ReqCompanyName}</TableCell>
                    <TableCell>{row.assignTo}</TableCell>
                    <TableCell>
                      <AttachFileIcon
                        sx={{ cursor: "pointer", fontSize: "18px" }}
                        onClick={() =>
                          setModal((prev) => ({
                            ...prev,
                            toggle: true,
                            value: row.id,
                          }))
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <HistoryIcon
                        sx={{
                          cursor: "pointer",
                          fontSize: "20px",
                          color: "#1976d2",
                        }}
                        onClick={() =>
                          setHistoryModal({
                            open: true,
                            id: row.id,
                            invoiceNo: row.blNo,
                          })
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={12} align="center">
                    {loadingState}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Box className="flex justify-between items-center mt-2">
          <TableExportButtons
            targetRef={tableWrapRef}
            title="Invoice Release"
            fileName="invoice-release-list"
          />

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

      <ToastContainer />
      <InvoiceModal modal={modal} setModal={setModal} />
      <InvoiceHistoryModal
        open={historyModal.open}
        onClose={() =>
          setHistoryModal({ open: false, id: null, invoiceNo: "" })
        }
        invoiceId={historyModal.id}
        invoiceNo={historyModal.invoiceNo}
      />
      <InvoiceAssignModal
        modal={assignModal}
        setModal={setAssignModal}
        onAssignHandler={onAssignHandler}
      />
    </ThemeProvider>
  );
}
