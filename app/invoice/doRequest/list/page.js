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
import CustomButton from "@/components/button/button";
import CustomPagination from "@/components/pagination/pagination";
import { theme } from "@/styles/globalCss";
import { deleteRecord, fetchTableValues } from "@/apis";
import { toast, ToastContainer } from "react-toastify";
import { HoverActionIcons } from "@/components/tableHoverIcons/tableHoverIcons";
import { useRouter } from "next/navigation";
import { formStore } from "@/store";
import TableExportButtons from "@/components/tableExportButtons/tableExportButtons";
import ReportPickerModal from "@/components/ReportPickerModal/reportPickerModal";
import { useGetUserAccessUtils } from "@/utils/getUserAccessUtils";
import { getUserByCookies } from "@/utils";
import DoToolbarActions from "@/components/selectionActions/doToolbarActions";
import DoStatusToolbar from "@/components/selectionActions/doStatus";

const LIST_TABLE = "tblBl b";
const UPDATE_TABLE = LIST_TABLE.trim()
  .split(/\s+/)[0]
  .replace(/^dbo\./i, "");

function createData(
  mblNo,
  mblDate,
  consigneeText,
  pol,
  pod,
  fpd,
  cargoMovement,
  arrivalVessel,
  arrivalVoyage,
  line,
  id
) {
  return {
    mblNo,
    mblDate,
    consigneeText,
    pol,
    pod,
    fpd,
    cargoMovement,
    arrivalVessel,
    arrivalVoyage,
    line,
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
            "b.mblNo mblNo, b.mblDate mblDate, b.consigneeText consigneeText, concat(p.code, ' - ', p.name) pol, concat(p1.code, ' - ', p1.name) pod, concat(p2.code, ' - ', p2.name) fpd, m.name cargoMovement, v1.name arrivalVessel, v.voyageNo arrivalVoyage, b.itemNo line, b.id id, b.clientId clientId",
          tableName: LIST_TABLE,
          pageNo,
          pageSize,
          joins: `
            left join tblPort p on p.id = b.polId
            left join tblPort p1 on p1.id=b.podId
            left join tblPort p2 on p2.id=b.fpdId
            left join tblVoyage v on v.id=b.podVoyageId
            left join tblVessel v1 on v1.id=b.podVesselId
            left join tblMasterData m on m.id = b.movementTypeId
            left join tblUser u on u.id = ${userData.userId}
            left join tblUser usr1 on usr1.companyId = u.companyId
            join tblBl b1 on b1.id = b.id and b1.mblHblFlag = 'MBL' and b1.status = 1 and b1.createdBy = usr1.id
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
  useEffect(() => {
    getData(1, rowsPerPage);
    setMode({ mode: null, formId: null });
  }, []);

  const rows = blData
    ? blData.map((item) =>
        createData(
          item["mblNo"],
          item["mblDate"],
          item["consigneeText"],
          item["pol"],
          item["pod"],
          item["fpd"],
          item["cargoMovement"],
          item["arrivalVessel"],
          item["arrivalVoyage"],
          item["line"],
          item["id"],
          item["clientId"]
        )
      )
    : [];

  useEffect(() => {
    setIdsOnPage((blData || []).map((r) => r.id));
  }, [blData]);

  // ---------------- Checkbox Logic ----------------
  const toggleOne = (id) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  // --------------------------------------------
  // 🔥 Toolbar Action Handlers
  // --------------------------------------------
  const handleReleaseDO = (ids) => {
    console.log("Release DO:", ids);
  };

  const handleEditBL = (ids) => {
    const id = ids[0];
    setMode({ mode: "edit", formId: id });
    router.push("/bl/mbl");
  };

  const handleViewBL = (id) => {
    setMode({ mode: "view", formId: id });
    router.push("/bl/mbl");
  };

  const handleConfirm = (ids) => console.log("Confirm:", ids);
  const handleNotify = (ids) => console.log("Notify:", ids);
  const handleGenerateDO = (ids) => console.log("Generate DO:", ids);
  const handlePCS = (ids) => console.log("PCS:", ids);
  const handleReject = (ids) => console.log("Reject:", ids);
  const handleSecuritySlip = (ids) => console.log("Security Slip:", ids);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box className="sm:px-4 py-1">
        <Box className="flex flex-col sm:flex-row justify-between pb-1">
          <Typography variant="body1" className="text-left flex items-center">
            Do Request List
          </Typography>
          <CustomButton text ="ADD" href="/invoice/doRequest" />
        </Box>

        <TableContainer component={Paper} ref={tableWrapRef} className="mt-2">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>BL NO</TableCell>
                <TableCell>Valid Till</TableCell>
                <TableCell>Free Days</TableCell>
                <TableCell>Auto Do Req</TableCell>
                <TableCell>Pymts</TableCell>
                <TableCell>Pymt Conf Dt</TableCell>
                <TableCell>Doc Conf Dt</TableCell>
                <TableCell>Doc Status</TableCell>
                <TableCell>Bl Drop Loc</TableCell>
                <TableCell>Assigned To</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {rows.length > 0 ? (
                rows.map((row) => (
                  <TableRow
                    key={row.id}
                    hover
                    className="relative group"
                    onClick={() => toggleOne(row.id)}
                  >
                    <TableCell>{row.mblNo}</TableCell>
                    <TableCell>{row.mblDate}</TableCell>
                    <TableCell>{row.consigneeText}</TableCell>
                    <TableCell>{row.pol}</TableCell>
                    <TableCell>{row.pod}</TableCell>
                    <TableCell>{row.fpd}</TableCell>
                    <TableCell>{row.cargoMovement}</TableCell>
                    <TableCell>{row.arrivalVessel}</TableCell>
                    <TableCell>{row.arrivalVoyage}</TableCell>
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
