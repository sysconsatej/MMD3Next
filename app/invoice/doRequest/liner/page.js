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
import { fetchTableValues } from "@/apis";
import { ToastContainer } from "react-toastify";
import { useRouter } from "next/navigation";
import { formStore } from "@/store";
import TableExportButtons from "@/components/tableExportButtons/tableExportButtons";
import { useGetUserAccessUtils } from "@/utils/getUserAccessUtils";
import { getUserByCookies } from "@/utils";
import DoToolbarActions from "@/components/selectionActions/doToolbarActions";
import DoStatusToolbar from "@/components/selectionActions/doStatus";
import { doStatusHandler, statusColor } from "../utils";

const LIST_TABLE = "tblBl b";
const UPDATE_TABLE = LIST_TABLE.trim()
  .split(/\s+/)[0]
  .replace(/^dbo\./i, "");

function createData(
  location,
  submittedBy,
  mblNo,
  validTill,
  isFreeDays,
  stuffDestuffId,
  doStatus,
  id
) {
  return {
    location,
    submittedBy,
    mblNo,
    validTill,
    isFreeDays,
    stuffDestuffId,
    doStatus,
    id,
  };
}

export default function BLList() {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [totalPage, setTotalPage] = useState(1);
  const [totalRows, setTotalRows] = useState(1);
  const [blData, setBlData] = useState([]);
  const [advanceSearch, setAdvanceSearch] = useState({});
  const [loadingState, setLoadingState] = useState("NO DATA...");
  const { setMode } = formStore();
  const router = useRouter();
  const tableWrapRef = useRef(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [idsOnPage, setIdsOnPage] = useState([]);
  const userData = getUserByCookies();
  const [allChecked, setAllChecked] = useState(false);
  const [someChecked, setSomeChecked] = useState(false);
  const { data } = useGetUserAccessUtils("HBL Request");
  const [statusValues, setStatusValues] = useState({
    advanceBL: false,
    notificationHistory: false,
    remarksHold: false,
    reRequest: false,
    seawayBL: false,
    attachments: false,
    autoDoRequest: false,
  });

  // --------------------------------------------
  // 🔥 Fetch Table Data
  // --------------------------------------------
  const getData = useCallback(
    async (pageNo = page, pageSize = rowsPerPage) => {
      try {
        const tableObj = {
          columns:
            "l.name location, u2.name submittedBy, b.mblNo mblNo, b.validTill validTill, b.isFreeDays isFreeDays, m2.name stuffDestuffId, m.name doStatus, b.id id",
          tableName: LIST_TABLE,
          pageNo,
          pageSize,
          joins: `
            left join tblMasterData m on m.id = b.dostatusId
            left join tblMasterData m2 on m2.id = b.stuffDestuffId
            left join tblLocation l on l.id = b.locationId
            left join tblUser u2 on u2.id = b.updatedBy
            left join tblUser u on u.id = ${userData.userId}
            join tblBl b2 on b2.id = b.id and b.dostatusId is not null and m.name <> 'Pending for DO' 
            and b.locationId = ${userData.location} and b.shippingLineId = u.companyId
          `,
        };

        const { data, totalPage, totalRows } = await fetchTableValues(tableObj);

        setBlData(data);
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
    [page, rowsPerPage]
  );

  const updateStatus = (key, value) => {
    setStatusValues((prev) => ({ ...prev, [key]: value }));
  };

  const rows = blData
    ? blData.map((item) =>
        createData(
          item["location"],
          item["submittedBy"],
          item["mblNo"],
          item["validTill"],
          item["isFreeDays"],
          item["stuffDestuffId"],
          item["doStatus"],
          item["id"]
        )
      )
    : [];

  // ---------------- Checkbox Logic ----------------
  const toggleAll = () => {
    if (selectedIds.length > 0) {
      setSelectedIds([]);
      setAllChecked(false);
    } else {
      setSelectedIds(rows.map((item) => item.id));
      setAllChecked(true);
    }
  };

  const toggleOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // --------------------------------------------
  // 🔥 Toolbar Action Handlers
  // --------------------------------------------
  const handleEditBL = (ids) => {
    const id = ids[0];
    setMode({ mode: "edit", formId: id });
    router.push("/bl/mbl");
  };

  const handleViewBL = (id) => {
    setMode({ mode: "view", formId: id });
    router.push("/bl/mbl");
  };

  const handleSecuritySlip = (ids) => console.log("Security Slip:", ids);
  const handleNotify = (ids) => console.log("Notify:", ids);
  const handleGenerateDO = (ids) => console.log("Generate DO:", ids);
  const handlePCS = (ids) => console.log("PCS:", ids);

  useEffect(() => {
    getData(1, rowsPerPage);
    setMode({ mode: null, formId: null });
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box className="sm:px-4 py-1">
        <Box className="flex flex-col sm:flex-row justify-between pb-1">
          <Typography variant="body1" className="text-left flex items-center">
            Do Request List
          </Typography>
        </Box>

        {/* 🔥 TOOLBAR ADDED HERE */}
        <DoToolbarActions
          selectedIds={selectedIds}
          onEditBL={handleEditBL}
          onViewBL={handleViewBL}
          onConfirm={(ids) => doStatusHandler(getData).handleConfirm(ids)}
          onNotify={handleNotify}
          onGenerateDO={handleGenerateDO}
          onPCS={handlePCS}
          onReject={(ids) => doStatusHandler(getData).handleReject(ids)}
          onSecuritySlip={handleSecuritySlip}
        />
        <DoStatusToolbar
          values={statusValues}
          onAdvanceBL={(v) => updateStatus("advanceBL", v)}
          onNotificationHistory={(v) => updateStatus("notificationHistory", v)}
          onRemarksHold={(v) => updateStatus("remarksHold", v)}
          onReRequest={(v) => updateStatus("reRequest", v)}
          onSeawayBL={(v) => updateStatus("seawayBL", v)}
          onAttachments={(v) => updateStatus("attachments", v)}
          onAutoDoRequest={(v) => updateStatus("autoDoRequest", v)}
        />
        <TableContainer component={Paper} ref={tableWrapRef} className="mt-2">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell
                  padding="checkbox"
                  sx={{ width: 36, minWidth: 36, maxWidth: 36 }}
                >
                  <Checkbox
                    size="small"
                    indeterminate={someChecked}
                    checked={allChecked}
                    onChange={toggleAll}
                    sx={{ p: 0.25, "& .MuiSvgIcon-root": { fontSize: 18 } }}
                  />
                </TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Submitted By</TableCell>
                <TableCell>mblNo</TableCell>
                <TableCell>Valid Till</TableCell>
                <TableCell>IsFreeDays</TableCell>
                <TableCell>Stuff Destuff</TableCell>
                <TableCell>Doc Status</TableCell>
                <TableCell>Assigned To</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {rows.length > 0 ? (
                rows.map((row) => (
                  <TableRow key={row.id} hover className="relative group">
                    <TableCell
                      padding="checkbox"
                      sx={{ width: 32, minWidth: 32, maxWidth: 32 }}
                    >
                      <Checkbox
                        size="small"
                        checked={selectedIds.includes(row.id)}
                        onChange={() => toggleOne(row.id)}
                        sx={{ p: 0.25, "& .MuiSvgIcon-root": { fontSize: 18 } }}
                      />
                    </TableCell>
                    <TableCell>{row.location}</TableCell>
                    <TableCell>{row.submittedBy}</TableCell>
                    <TableCell>{row.mblNo}</TableCell>
                    <TableCell>{row.validTill}</TableCell>
                    <TableCell>{row.isFreeDays}</TableCell>
                    <TableCell>{row.stuffDestuffId}</TableCell>
                    <TableCell
                      sx={{
                        color: statusColor(row.doStatus.replace(/\s+/g, "")),
                      }}
                    >
                      {row.doStatus}
                    </TableCell>
                    <TableCell></TableCell>
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
            title="MBL Request"
            fileName="mbl-list"
          />

          <CustomPagination
            count={totalPage}
            totalRows={totalRows}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={(e, v) => getData(v, rowsPerPage)}
            handleChangeRowsPerPage={(e) => getData(1, +e.target.value)}
          />
        </Box>
      </Box>

      <ToastContainer />
    </ThemeProvider>
  );
}
