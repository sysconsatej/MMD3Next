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
import CustomButton from "@/components/button/button";
import CustomPagination from "@/components/pagination/pagination";
import { theme } from "@/styles/globalCss";
import { deleteRecord, fetchTableValues } from "@/apis";
import SearchBar from "@/components/searchBar/searchBar";
import { ToastContainer, toast } from "react-toastify";
import { HoverActionIcons } from "@/components/tableHoverIcons/tableHoverIcons";
import TableExportButtons from "@/components/tableExportButtons/tableExportButtons";
import SelectionActionsBar from "@/components/selectionActions/selectionActionsBar";
import { useRouter } from "next/navigation";
import { formStore } from "@/store";
import {
  advanceSearchFields,
  advanceSearchFilter,
  statusColor,
} from "../invoiceRequestData";
import { getUserByCookies } from "@/utils";
import AdvancedSearchBar from "@/components/advanceSearchBar/advanceSearchBar";

const LIST_TABLE = "tblInvoiceRequest i";
const UPDATE_TABLE = LIST_TABLE.split(" ")[0];

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
  status,
  remarkStatus
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
    status,
    remarkStatus,
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
  const [loadingState, setLoadingState] = useState("Loading...");
  const tableWrapRef = useRef(null);
  const userData = getUserByCookies();
  const [advanceSearch, setAdvanceSearch] = useState({});

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

  /* ---------------------- DATA FETCH LOGIC ---------------------- */
  const getData = useCallback(
    async (pageNo = page, pageSize = rowsPerPage) => {
      try {
        const tableObj = {
          columns: `
            i.id id,
            c.name liner,
            i.blNo blNo,
            m.name type,
            i.isFreeDays freeDays,
            i.isHighSealSale highSealSale,
            i.remarks remarks,
            i.createdDate date,
            st.name AS status,
            i.rejectRemarks AS remarkStatus
           
          `,
          tableName: LIST_TABLE,
          pageNo,
          pageSize,
          advanceSearch: advanceSearchFilter(advanceSearch),
          joins: `
            LEFT JOIN tblCompany c ON c.id = i.shippingLineId
            LEFT JOIN tblMasterData m ON m.id = i.deliveryTypeId
            LEFT JOIN tblMasterData st ON st.id = i.invoiceRequestStatusId
            Left JOIN tblUser u on u.id = ${userData.userId}
			      JOIN tblUser u2 on u2.companyId = u.companyId and i.createdBy = u2.id
          `,
          orderBy:
            "ORDER BY isnull(i.updatedDate, i.createdDate) DESC, i.id DESC",
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
            item["status"],
            item["status"] === "Rejected" ? item["remarkStatus"] : ""
          )
        );

        setRows(mapped);
        setTotalPage(totalPage);
        setPage(pageNo);
        setRowsPerPage(pageSize);
        setTotalRows(totalRows);
        setSelectedIds([]);
      } catch (err) {
        console.error("Fetch Error:", err);
        setLoadingState("Failed to load data");
      }
    },
    [page, rowsPerPage, advanceSearch]
  );

  /* ---------------------- INITIAL LOAD ---------------------- */
  useEffect(() => {
    setMode({ mode: null, formId: null });
    getData(1, rowsPerPage);
  }, []);

  /* ---------------------- PAGINATION ---------------------- */
  const handleChangePage = (_e, newPage) => getData(newPage, rowsPerPage);
  const handleChangeRowsPerPage = (e) => getData(1, +e.target.value);

  /* ---------------------- DELETE ---------------------- */
  const handleDeleteRecord = async (recordId) => {
    const obj = { recordId, tableName: UPDATE_TABLE };
    const { success, message, error } = await deleteRecord(obj);
    if (success) {
      toast.success(message);
      getData(page, rowsPerPage);
    } else toast.error(error || message);
  };

  const handleBulkDelete = async (ids) => {
    if (!ids?.length) return;
    await Promise.all(ids.map((rid) => handleDeleteRecord(rid)));
  };

  /* ---------------------- VIEW / EDIT HANDLER ---------------------- */
  const modeHandler = useCallback(
    (mode, formId = null) => {
      if (mode === "delete") {
        handleDeleteRecord(formId);
        return;
      }
      setMode({ mode: mode || null, formId });
      router.push("/request/invoiceRequest");
    },
    [router, setMode]
  );

  /* ---------------------- RENDER ---------------------- */
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box className="sm:px-4 py-1">
        {/* HEADER */}
        <Box className="flex flex-col sm:flex-row justify-between pb-1">
          <Typography variant="body1" className="text-left">
            Invoice Request
          </Typography>

          <Box className="flex flex-col sm:flex-row gap-6">
            <AdvancedSearchBar
              fields={advanceSearchFields.bl}
              advanceSearch={advanceSearch}
              setAdvanceSearch={setAdvanceSearch}
              getData={getData}
              rowsPerPage={rowsPerPage}
            />
            <Box className="flex flex-col sm:flex-row gap-6">
              <CustomButton
                text="Add"
                onClick={() => modeHandler(null, null)}
              />
            </Box>
          </Box>
        </Box>

        {/* BULK ACTION BAR */}
        <SelectionActionsBar
          selectedIds={selectedIds}
          tableName={UPDATE_TABLE}
          keyColumn="id"
          allowBulkDelete
          onView={(id) => modeHandler("view", id)}
          onEdit={(id) => modeHandler("edit", id)}
          onDelete={(ids) => handleBulkDelete(ids)}
          onUpdated={() => getData(page, rowsPerPage)}
        />

        {/* TABLE */}
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
                <TableCell>Status</TableCell>
                <TableCell>Rejected Remark</TableCell>
                <TableCell>Request Date</TableCell>
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

                    {/* BL No Clickable */}
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

                    {/* STATUS (Colored same as HBL) */}
                    <TableCell sx={{ color: statusColor(row.status) }}>
                      {row.status}
                    </TableCell>

                    {/* REMARK */}
                    <TableCell>{row.remarkStatus}</TableCell>

                    <TableCell>{row.date}</TableCell>

                    {/* ACTION ICONS */}
                    <TableCell className="table-icons opacity-0 group-hover:opacity-100">
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
                  <TableCell colSpan={10} align="center">
                    {loadingState}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* EXPORT + PAGINATION */}
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
