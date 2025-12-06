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
import InvoiceHistoryModal from "../modal";
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
  status
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
    status,
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
  const [loadingState, setLoadingState] = useState("Loading...");
  const tableWrapRef = useRef(null);
  const [modal, setModal] = useState({ toggle: false, value: null });

  const [selectedIds, setSelectedIds] = useState([]);
  const [historyModal, setHistoryModal] = useState({
    open: false,
    id: null,
    invoiceNo: "",
  });

  const idsOnPage = useMemo(() => rows.map((x) => x.id), [rows]);

  const allChecked =
    selectedIds.length === idsOnPage.length && idsOnPage.length > 0;
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
        whereCondition: "masterListName = 'tblInvoiceRequest' AND status = 1",
      };

      const { success, data } = await getDataWithCondition(obj);
      if (success) setStatusList(data);
    }
    fetchStatus();
  }, []);

  const releaseHandler = async (ids) => {
    if (!ids?.length) return toast.warn("Please select at least one row");

    // Get selected row (first one only)
    const selected = rows.find((r) => r.id === ids[0]);
    if (!selected) return toast.error("Invalid selection");

    const blNo = selected.blNo;

    // Find BL Id
    const q = {
      columns: "TOP 1 id",
      tableName: "tblBl",
      whereCondition: `isnull(hblNo,mblNo) = '${blNo}' AND ISNULL(status,1)=1`,
    };

    const { success, data } = await getDataWithCondition(q);

    if (!success || !data?.length)
      return toast.error("BL not found in tblBl table");

    const blId = data[0].id;

    // Set ADD MODE for invoice creation
    setMode({ mode: "add", formId: null });

    // Redirect to InvoicePayment (NEW invoice creation)
    router.push(`/invoice/invoiceRelease/invoiceUpload?blId=${blId}`);
  };

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
            u.name AS requester,
            st.name AS status
          `,
          tableName: LIST_TABLE,
          pageNo,
          pageSize,
          advanceSearch: advanceSearchFilter(advanceSearch),

          joins: `
          LEFT JOIN tblMasterData m ON m.id = i.deliveryTypeId
          LEFT JOIN tblUser u ON u.id = ${userData.userId}
          LEFT JOIN tblCompany c ON c.id = u.companyId
          JOIN tblMasterData st ON st.id = i.invoiceRequestStatusId and i.invoiceRequestStatusId IS NOT NULL and i.shippingLineId = u.companyId
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
            item.status
          )
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
    [page, rowsPerPage, advanceSearch]
  );

  useEffect(() => {
    setMode({ mode: null, formId: null });
    getData(1, rowsPerPage);
  }, []);

  const handleChangePage = (_, newPage) => getData(newPage, rowsPerPage);
  const handleChangeRowsPerPage = (e) => getData(1, +e.target.value);

  const modeHandler = useCallback(
    (mode, formId = null) => {
      setMode({ mode, formId });
      router.push("/invoice/invoiceRequest");
    },
    [router, setMode]
  );


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
                    <TableCell>{toYesNo(row.highSeaSale)}</TableCell>

                    <TableCell sx={{ color: statusColor(row.status) }}>
                      {row.status}
                    </TableCell>

                    <TableCell>{row.remarks}</TableCell>

                    <TableCell>{row.date}</TableCell>

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
    </ThemeProvider>
  );
}
