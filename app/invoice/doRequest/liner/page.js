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
import { formStore } from "@/store";
import TableExportButtons from "@/components/tableExportButtons/tableExportButtons";
import { getUserByCookies } from "@/utils";
import DoToolbarActions from "@/components/selectionActions/doToolbarActions";
import { doStatusHandler, statusColor } from "../utils";
import { useRouter } from "next/navigation";
import HistoryIcon from "@mui/icons-material/History";
import { DoHistoryLinerModal } from "./historyModal";
import ReportPickerModal from "@/components/ReportPickerModal/reportPickerModal";
import { RejectModal } from "../modal";

const REPORTS = [
  { key: "Survey Letter", label: "Survey Letter" },
  { key: "Delivery Order", label: "Delivery Order" },
  { key: "EmptyOffLoadingLetter", label: "Empty Off-Loading Letter" },
  { key: "CMCLetter", label: "CMC Letter" },
  { key: "CustomsExaminationOrder", label: "Customs Examination Order" },
];
const REPORT_ROUTE = "/htmlReports/rptDoLetter";

function createData(
  location,
  submittedBy,
  blNo,
  isFreeDays,
  stuffDestuffId,
  doStatus,
  doRejectRemarks,
  id
) {
  return {
    location,
    submittedBy,
    blNo,
    isFreeDays,
    stuffDestuffId,
    doStatus,
    doRejectRemarks,
    id,
  };
}

export default function BLList() {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [totalPage, setTotalPage] = useState(1);
  const [totalRows, setTotalRows] = useState(1);
  const [blData, setBlData] = useState([]);
  const [loadingState, setLoadingState] = useState("NO DATA...");
  const { setMode } = formStore();
  const tableWrapRef = useRef(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const userData = getUserByCookies();
  const [allChecked, setAllChecked] = useState(false);
  const [someChecked, setSomeChecked] = useState(false);
  const router = useRouter();
  const [historyModal, setHistoryModal] = useState({
    toggle: false,
    value: null,
    blNo: null,
  });
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportModalForRow, setReportModalForRow] = useState(null);
  const [rejectState, setRejectState] = useState({
    toggle: false,
    value: null,
  });

  // --------------------------------------------
  // 🔥 Fetch Table Data
  // --------------------------------------------
  const getData = useCallback(
    async (pageNo = page, pageSize = rowsPerPage) => {
      try {
        const tableObj = {
          columns:
            "l.name location, u2.name submittedBy, d.blNo blNo, d.isFreeDays isFreeDays, m2.name stuffDestuffId, m.name doStatus, d.doRejectRemarks doRejectRemarks, d.id id",
          tableName: "tblDoRequest d",
          pageNo,
          pageSize,
          joins: `
            left join tblMasterData m on m.id = d.doRequestStatusId
            left join tblMasterData m2 on m2.id = d.stuffDestuffId
            left join tblLocation l on l.id = d.locationId
            left join tblUser u2 on u2.id = d.createdBy
            left join tblUser u on u.id = ${userData.userId}
            join tblDoRequest d2 on d2.id = d.id and d.doRequestStatusId is not null 
            and d.locationId = ${userData.location} and d.shippingLineId = u.companyId
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

  const rows = blData
    ? blData.map((item) =>
        createData(
          item["location"],
          item["submittedBy"],
          item["blNo"],
          item["isFreeDays"],
          item["stuffDestuffId"],
          item["doStatus"],
          item["doRejectRemarks"],
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

  const toggleOne = (id, row) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
    selectedRowClientId(row?.clientId || 1);
  };

  // --------------------------------------------
  // 🔥 Toolbar Action Handlers
  // --------------------------------------------
  const handleSecuritySlip = (ids) => console.log("Security Slip:", ids);
  const handleNotify = (ids) => console.log("Notify:", ids);
  const handlePCS = (ids) => console.log("PCS:", ids);

  useEffect(() => {
    getData(1, rowsPerPage);
    setMode({ mode: null, formId: null });
  }, []);

  const handleGenerateReports = () => {
    setReportModalOpen(false);
    setReportModalForRow(null);
  };

  return (
    <>
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
            onView={(ids) =>
              doStatusHandler(getData, router, setMode).handleView(ids)
            }
            onEdit={(ids) =>
              doStatusHandler(getData, router, setMode).handleEdit(ids)
            }
            onViewBL={(ids) =>
              doStatusHandler(getData, router, setMode).handleViewBL(ids)
            }
            onConfirm={(ids) => doStatusHandler(getData).handleConfirm(ids)}
            onReject={(ids) =>
              setRejectState((prev) => ({
                ...prev,
                toggle: true,
                ids: ids,
              }))
            }
            onGenerateDO={(ids) =>
              doStatusHandler(getData).handleGenerateDO(
                ids,
                setReportModalForRow,
                setReportModalOpen
              )
            }
            // onNotify={handleNotify}
            // onPCS={handlePCS}
            // onSecuritySlip={handleSecuritySlip}
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
                  <TableCell>BL No</TableCell>
                  <TableCell>IsFreeDays</TableCell>
                  <TableCell>Stuff Destuff</TableCell>
                  <TableCell>Doc Status</TableCell>
                  <TableCell>Reject Remark</TableCell>
                  <TableCell>Assigned To</TableCell>
                  <TableCell>History</TableCell>
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
                          onChange={() => toggleOne(row.id, row)}
                          sx={{
                            p: 0.25,
                            "& .MuiSvgIcon-root": { fontSize: 18 },
                          }}
                        />
                      </TableCell>
                      <TableCell>{row.location}</TableCell>
                      <TableCell>{row.submittedBy}</TableCell>
                      <TableCell>{row.blNo}</TableCell>
                      <TableCell>{row.isFreeDays}</TableCell>
                      <TableCell>{row.stuffDestuffId}</TableCell>
                      <TableCell
                        sx={{
                          color: statusColor(
                            row?.doStatus?.replace(/\s+/g, "")
                          ),
                        }}
                      >
                        {row.doStatus}
                      </TableCell>
                      <TableCell>{row.doRejectRemarks}</TableCell>
                      <TableCell></TableCell>
                      <TableCell>
                        <HistoryIcon
                          sx={{ cursor: "pointer", fontSize: 16 }}
                          onClick={() =>
                            setHistoryModal({
                              toggle: true,
                              value: row.id,
                              blNo: row.blNo,
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
        <DoHistoryLinerModal
          historyModal={historyModal}
          setHistoryModal={setHistoryModal}
        />

        <ToastContainer />
      </ThemeProvider>
      <ReportPickerModal
        open={reportModalOpen}
        onClose={() => {
          setReportModalOpen(false);
          setReportModalForRow(null);
        }}
        availableReports={REPORTS}
        defaultSelectedKeys={REPORTS.map((r) => r.key)}
        initialMode="combined"
        onGenerate={handleGenerateReports}
        recordId={reportModalForRow?.id}
        clientId={reportModalForRow?.clientId}
        reportRoute={REPORT_ROUTE}
        tableName={"tblBl"}
      />
      <RejectModal
        rejectState={rejectState}
        setRejectState={setRejectState}
        rejectHandler={() =>
          doStatusHandler(getData).handleReject(rejectState, setRejectState)
        }
      />
    </>
  );
}
