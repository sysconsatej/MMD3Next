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
  Link, // ⬅️ added Link
} from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import CustomPagination from "@/components/pagination/pagination";
import { theme } from "@/styles/globalCss";
import { deleteRecord, fetchTableValues } from "@/apis";
import { ToastContainer, toast } from "react-toastify";
import { HoverActionIcons } from "@/components/tableHoverIcons/tableHoverIcons";
import TableExportButtons from "@/components/tableExportButtons/tableExportButtons";
import { useRouter } from "next/navigation";
import { formStore } from "@/store";
import InvoiceToolbarActions from "@/components/selectionActions/selectionActionBarInvoice";
import InvoiceMiniToggles from "@/components/selectionActions/selectionActionBarInvoiceProcess";
import AdvancedSearchBar from "@/components/advanceSearchBar/advanceSearchBar";
import { advanceSearchFields, advanceSearchFilter } from "../invoiceReleaseData";

const LIST_TABLE = "tblInvoiceRequest i";
const UPDATE_TABLE = LIST_TABLE.trim()
  .split(/\s+/)[0]
  .replace(/^dbo\./i, "");

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
  Requester
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
    Requester,
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

  const getData = useCallback(
    async (pageNo = page, pageSize = rowsPerPage) => {
      try {
        const tableObj = {
          columns:
            "i.id id, c.name liner, i.blNo blNo, m.name type, i.isFreeDays freeDays, i.isHighSealSale highSealSale, i.remarks remarks, i.createdDate date,u.name Requester",
          tableName: LIST_TABLE,
          pageNo,
          pageSize,
          advanceSearch: advanceSearchFilter(advanceSearch),
          joins: `left join tblCompany c on c.id = i.shippingLineId  
            left join tblMasterData m on m.id = i.deliveryTypeId
            left join tblUser u ON i.createdBy = u.id`,
          orderBy:
            "order by isnull(i.updatedDate, i.createdDate) desc, i.id desc",
        };

        const { data, totalPage, totalRows } = await fetchTableValues(tableObj);

        const mapped = (data || []).map((item) =>
          createData(
            item["id"],
            item["liner"],
            item["blNo"],
            item["type"],
            item["freeDays"],
            item["highSealSale"],
            item["remarks"],
            item["date"],
            item["Requester"]
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
            Invoice Release
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
        {/* <SelectionActionsBar
          selectedIds={selectedIds}
          tableName={UPDATE_TABLE}
          keyColumn="id"
          allowBulkDelete
          onView={(id) => modeHandler("view", id)}
          onEdit={(id) => modeHandler("edit", id)}
          onDelete={(ids) => handleBulkDelete(Array.isArray(ids) ? ids : [ids])}
          onUpdated={() => getData(page, rowsPerPage)}
        /> */}
        <InvoiceToolbarActions
          selectedIds={selectedIds}
          onView={(id) => modeHandler("view", id)}
          onRelease={(idsOrId) => {
            /* call API */
          }}
          onKyc={(ids) => {
            /* open KYC flow */
          }}
          onUpload={(ids) => {
            /* open upload dialog */
          }}
          onInvoiceLookup={(ids) => {
            /* navigate / fetch invoices */
          }}
          onNotify={(ids) => {
            /* send email/SMS */
          }}
          onClose={(ids) => {
            /* close requests */
          }}
          onReprocess={(ids) => {
            /* re-run process */
          }}
        />
        <InvoiceMiniToggles
          reRequest={filters.reRequest}
          reProcess={filters.reProcess}
          hblCount={filters.hblCount}
          onToggle={(name, val) => setFilters((p) => ({ ...p, [name]: val }))}
          onOpenNotifications={() => setNotificationModal(true)}
        />
        <TableContainer component={Paper} ref={tableWrapRef} className="mt-2">
          <Table size="small" sx={{ minWidth: 900 }}>
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
                <TableCell>Liner</TableCell>
                <TableCell>BL No</TableCell>
                <TableCell>Type of Delivery</TableCell>
                <TableCell>Extension</TableCell>
                <TableCell>High Sea Sales</TableCell>
                <TableCell>Remarks</TableCell>
                <TableCell>Request Date</TableCell>
                <TableCell>Requested By</TableCell>
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

                    <TableCell>{row.liner}</TableCell>

                    {/* 🔗 Make BL No a hyperlink that opens View */}
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

                    <TableCell>{row.type}</TableCell>
                    <TableCell>{toFreeDaysLabel(row.freeDays)}</TableCell>
                    <TableCell>{toYesNo(row.highSealSale)}</TableCell>
                    <TableCell>{row.remarks}</TableCell>
                    <TableCell>{row.date}</TableCell>
                    <TableCell>{row.Requester}</TableCell>
                    <TableCell
                      align="right"
                      className="table-icons opacity-0 group-hover:opacity-100"
                    >
                      <HoverActionIcons
                        onView={() => modeHandler("view", row.id)}
                        onEdit={() => modeHandler("edit", row.id)}
                        onDelete={() => modeHandler("delete", row.id)}
                        menuAccess={{}}
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} align="center">
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
      <ToastContainer />
    </ThemeProvider>
  );
}
