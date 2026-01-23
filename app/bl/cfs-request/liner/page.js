"use client";
import React, { useCallback, useEffect, useState, useRef } from "react";
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
} from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import CustomPagination from "@/components/pagination/pagination";
import { theme } from "@/styles/globalCss";
import {
  fetchTableValues,
} from "@/apis";
import { toast, ToastContainer } from "react-toastify";
import { formStore } from "@/store";
import TableExportButtons from "@/components/tableExportButtons/tableExportButtons";
import { getUserByCookies } from "@/utils";
import SearchRequestToolbarActions from "@/components/selectionActions/cfsRequestActionBar";
import {
  advanceSearchFilter,
  BlRejectModal,
  cfsStatusHandler,
  statusColor,
} from "../utils";
import { useRouter } from "next/navigation";
import HistoryIcon from "@mui/icons-material/History";
import { CfsHistoryLinerModal } from "./historyModal";
import AdvancedSearchBar from "@/components/advanceSearchBar/advanceSearchBar";
import { advanceSearchFields } from "../fieldsData";

/* ---------------- Constants ---------------- */
const LIST_TABLE = "tblCfsRequest b";

// checkbox sizing
const CHECKBOX_HEAD_SX = { width: 36, minWidth: 36, maxWidth: 36 };
const CHECKBOX_CELL_SX = { width: 32, minWidth: 32, maxWidth: 32 };
const CHECKBOX_SX = { p: 0.25, "& .MuiSvgIcon-root": { fontSize: 18 } };

export default function SearchRequestCfsDpdIcd() {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [totalPage, setTotalPage] = useState(1);
  const [totalRows, setTotalRows] = useState(1);
  const [blData, setBlData] = useState([]);
  const [loadingState, setLoadingState] = useState("NO DATA...");
  const [selectedIds, setSelectedIds] = useState([]);
  const [modal, setModal] = useState({
    toggle: false,
    value: null,
    ids: [],
    actionType: null,
  });
  const [historyModal, setHistoryModal] = useState({
    toggle: false,
    value: null,
    mblNo: null,
  });
  const [advanceSearch, setAdvanceSearch] = useState({});

  // toolbar checkbox states
  const [amendment, setAmendment] = useState(false);
  const [history, setHistory] = useState(false);

  const tableWrapRef = useRef(null);
  const { setMode } = formStore();
  const userData = getUserByCookies();
  const router = useRouter();

  /* ---------------- Fetch Table Data ---------------- */
  const getData = useCallback(
    async (pageNo = page, pageSize = rowsPerPage) => {
      try {
        setLoadingState("Loading...");

        const tableObj = {
          columns: `
            c1.name AS CompanyName,
            b.blNo AS blNo,
            r.name AS cfsType,
            p.name AS cfs,
            c.name AS dpd,
            b.customBrokerText AS NominatedCB,
            l.name AS locationName,
            m.name AS statusName,
            c1.name AS UserName,
            u2.emailId AS LoginId,
            c1.telephoneNo AS ContactNo,
            b.cfsRejectRemarks AS remark,
            b.id AS id
          `,
          tableName: LIST_TABLE,
          pageNo,
          pageSize,
          advanceSearch: advanceSearchFilter(advanceSearch),
          joins: `
            LEFT JOIN tblUser u2 ON u2.id = b.createdBy
            LEFT JOIN tblUser u ON u.id = ${userData?.userId}
            LEFT JOIN tblCompany c1 ON c1.id = u2.companyId
            LEFT JOIN tblLocation l ON l.id = ${userData?.location}
            JOIN tblMasterData m ON m.id = b.cfsRequestStatusId
              AND b.cfsRequestStatusId IS NOT NULL
              AND b.locationId = l.id
              AND b.shippingLineId = u.companyId
            LEFT JOIN tblMasterData r ON r.id = b.cfsTypeId
            LEFT JOIN tblPort p ON p.id = b.nominatedAreaId
            LEFT JOIN tblPort c ON c.id = b.dpdId
          `,
        };

        const { data, totalPage, totalRows } = await fetchTableValues(tableObj);

        setBlData(data || []);
        setSelectedIds([]);
        setTotalPage(totalPage || 1);
        setTotalRows(totalRows || 0);
        setPage(pageNo);
        setRowsPerPage(pageSize);

        if (!data || data.length === 0) setLoadingState("NO DATA...");
      } catch (err) {
        console.error(err);
        setBlData([]);
        setSelectedIds([]);
        setLoadingState("Failed to load data");
      }
    },
    [page, rowsPerPage, advanceSearch],
  );

  const idsOnPage = blData.map((r) => r.id);
  const allChecked =
    selectedIds.length > 0 && selectedIds.length === idsOnPage.length;
  const someChecked =
    selectedIds.length > 0 && selectedIds.length < idsOnPage.length;

  const toggleAll = () => setSelectedIds(allChecked ? [] : idsOnPage);
  const toggleOne = (id) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  useEffect(() => {
    getData(1, rowsPerPage);
    setMode({ mode: null, formId: null });
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <Box className="sm:px-4 py-1 w-full">
        <Box className="flex gap-4 w-full justify-between ">
          <Typography variant="body1" className="pb-1">
            Search Request for CFS / DPD / ICD
          </Typography>
          <AdvancedSearchBar
            fields={advanceSearchFields.shipBl}
            advanceSearch={advanceSearch}
            setAdvanceSearch={setAdvanceSearch}
            getData={getData}
            rowsPerPage={rowsPerPage}
          />
        </Box>

        {/* ACTION TOOLBAR */}
        <SearchRequestToolbarActions
          selectedIds={selectedIds}
          onView={(id) =>
            cfsStatusHandler(getData, router, setMode).handleView(id)
          }
          onReject={(ids) =>
            setModal((prev) => ({
              ...prev,
              toggle: true,
              ids: ids,
              actionType: "REJECT",
            }))
          }
          onConfirm={(ids) =>
            cfsStatusHandler(getData, router, setMode).handleConfirm(ids)
          }
          onRejectAmendment={(ids) =>
            setModal((prev) => ({
              ...prev,
              toggle: true,
              ids: ids,
              actionType: "REJECT_AMEND",
            }))
          }
          onConfirmAmendment={(ids) =>
            cfsStatusHandler(getData, router, setMode).handleConfirmAmend(ids)
          }
        />

        {/* TABLE */}
        <TableContainer component={Paper} ref={tableWrapRef} className="mt-2">
          <Table size="small">
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
                <TableCell>Company Name</TableCell>
                <TableCell>BL No</TableCell>
                <TableCell>CFS Type</TableCell>
                <TableCell>CFS</TableCell>
                <TableCell>DPD</TableCell>
                <TableCell>Nominated CB</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Login Id</TableCell>
                <TableCell>User Name</TableCell>
                <TableCell>Contact No</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Remark</TableCell>
                <TableCell padding="checkbox" sx={CHECKBOX_HEAD_SX}></TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {blData.length > 0 ? (
                blData.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell padding="checkbox" sx={CHECKBOX_CELL_SX}>
                      <Checkbox
                        size="small"
                        checked={selectedIds.includes(row.id)}
                        onChange={() => toggleOne(row.id)}
                        sx={CHECKBOX_SX}
                      />
                    </TableCell>

                    <TableCell>{row.CompanyName || "-"}</TableCell>
                    <TableCell>{row.blNo || "-"}</TableCell>
                    <TableCell>{row.cfsType || "-"}</TableCell>
                    <TableCell>{row.cfs || "-"}</TableCell>
                    <TableCell>{row.dpd || "-"}</TableCell>
                    <TableCell>{row.NominatedCB || "-"}</TableCell>
                    <TableCell
                      sx={{
                        color: statusColor(row.statusName?.replace(/\s+/g, "")),
                      }}
                    >
                      {row.statusName || "-"}
                    </TableCell>
                    <TableCell>{row.LoginId || "-"}</TableCell>
                    <TableCell>{row.UserName || "-"}</TableCell>
                    <TableCell>{row.ContactNo || "-"}</TableCell>
                    <TableCell>{row.locationName || "-"}</TableCell>
                    <TableCell>{row.remark || "-"}</TableCell>
                    <TableCell padding="checkbox" sx={CHECKBOX_CELL_SX}>
                      <HistoryIcon
                        sx={{ cursor: "pointer", fontSize: "16px" }}
                        onClick={() =>
                          setHistoryModal((prev) => ({
                            ...prev,
                            toggle: true,
                            value: row.id,
                            mblNo: row.blNo,
                          }))
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={15} align="center">
                    {loadingState}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* FOOTER */}
        <Box className="flex justify-between items-center mt-1">
          <TableExportButtons
            targetRef={tableWrapRef}
            title="Search Request for CFS / DPD / ICD"
            fileName="search-request-cfs-dpd-icd"
          />

          <CustomPagination
            count={totalPage}
            totalRows={totalRows}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={(e, v) => getData(v, rowsPerPage)}
            handleChangeRowsPerPage={(e) => getData(1, Number(e.target.value))}
          />
        </Box>
      </Box>

      <ToastContainer />
      <BlRejectModal modal={modal} setModal={setModal} getData={getData} />
      <CfsHistoryLinerModal
        historyModal={historyModal}
        setHistoryModal={setHistoryModal}
      />
    </ThemeProvider>
  );
}
