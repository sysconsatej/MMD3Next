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
  Link,
} from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import CustomButton from "@/components/button/button";
import CustomPagination from "@/components/pagination/pagination";
import { theme } from "@/styles/globalCss";
import { deleteRecord, fetchTableValues } from "@/apis";
import AdvancedSearchBar from "@/components/advanceSearchBar/advanceSearchBar";
import { toast, ToastContainer } from "react-toastify";
import { HoverActionIcons } from "@/components/tableHoverIcons/tableHoverIcons";
import { useRouter } from "next/navigation";
import { formStore } from "@/store";
import { advanceSearchFields } from "../mblData";
import { advanceSearchFilter } from "../utils";
import TableExportButtons from "@/components/tableExportButtons/tableExportButtons";
import ReportPickerModal from "@/components/ReportPickerModal/reportPickerModal";
import { useGetUserAccessUtils } from "@/utils/getUserAccessUtils";
import { getUserByCookies } from "@/utils";
import HistoryIcon from "@mui/icons-material/History"; // ⬅️ NEW
import HistoryModal from "@/components/customModal/historyModal"; // ⬅️ NEW

const LIST_TABLE = "tblBl b";
const UPDATE_TABLE = LIST_TABLE.trim()
  .split(/\s+/)[0]
  .replace(/^dbo\./i, "");

const REPORTS = [
  { key: "Survey Letter", label: "Survey Letter" },
  { key: "Delivery Order", label: "Delivery Order" },
  { key: "EmptyOffLoadingLetter", label: "Empty Off-Loading Letter" },
];
const REPORT_ROUTE = "/htmlReports/rptDoLetter";

function createData(
  blNo,
  hblNo,
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
  clientId,
  mblHblFlag
) {
  return {
    blNo,
    hblNo,
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
    clientId,
    mblHblFlag,
  };
}

export default function BLList() {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [totalPage, setTotalPage] = useState(1);
  const [totalRows, setTotalRows] = useState(1);
  const [blData, setBlData] = useState([]);
  const [advanceSearch, setAdvanceSearch] = useState({});
  const [loadingState, setLoadingState] = useState("Loading...");
  const { setMode } = formStore();
  const router = useRouter();
  const tableWrapRef = useRef(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [idsOnPage, setIdsOnPage] = useState([]);
  const [allChecked, setAllChecked] = useState(false);
  const [someChecked, setSomeChecked] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportModalForRow, setReportModalForRow] = useState(null);
  const { data } = useGetUserAccessUtils("MBL");
  const userData = getUserByCookies();

  // ⬇️ NEW: history modal state
  const [historyModal, setHistoryModal] = useState({
    open: false,
    recordId: null,
  });

  const getData = useCallback(
    async (pageNo = page, pageSize = rowsPerPage) => {
      try {
        const tableObj = {
          columns:
            "coalesce(b.hblNo, b.mblNo)  blNo, iif(b.hblNo is null, (select id, hblNo from tblBl where mblNo =  b.mblNo and status = 1 and mblHblFlag = 'HBL' and shippingLineId = u.companyId for json path), null) hblNo, b.mblDate mblDate, b.consigneeText consigneeText, concat(p.code, ' - ', p.name) pol, concat(p1.code, ' - ', p1.name) pod, concat(p2.code, ' - ', p2.name) fpd, m.name cargoMovement, v1.name arrivalVessel, v.voyageNo arrivalVoyage, b.itemNo line, b.id id, b.clientId clientId, b.mblHblFlag mblHblFlag",
          tableName: LIST_TABLE,
          pageNo,
          pageSize,
          joins: `left join tblPort p on p.id = b.polId left join tblPort p1 on p1.id=b.podId left join tblPort p2 on p2.id=b.fpdId left join tblVoyage v on v.id=b.podVoyageId left join tblVessel v1 on v1.id=b.podVesselId left join tblMasterData m on m.id = b.movementTypeId left join tblUser u on u.id = ${userData.userId} left join tblUser usr1 on usr1.companyId = u.companyId join tblBl b1 on (b1.id = b.id and b1.status = 1 and  b1.mblHblFlag = 'MBL' and b1.createdBy = usr1.id) or (b1.id = b.id and b1.shippingLineId = u.companyId and b1.status = 1 and b1.mblHblFlag = 'HBL')`,
          advanceSearch: advanceSearchFilter(advanceSearch),
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
    [page, rowsPerPage, advanceSearch]
  );

  useEffect(() => {
    getData(1, rowsPerPage);
    setMode({ mode: null, formId: null });
  }, []);

  const rows = blData
    ? blData.map((item) =>
        createData(
          item["blNo"],
          item["hblNo"],
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
          item["clientId"],
          item["mblHblFlag"]
        )
      )
    : [];

  useEffect(() => {
    setIdsOnPage((blData || []).map((r) => r.id));
  }, [blData]);

  useEffect(() => {
    const all =
      selectedIds.length > 0 &&
      idsOnPage.length > 0 &&
      selectedIds.length === idsOnPage.length;
    const some =
      selectedIds.length > 0 && selectedIds.length < idsOnPage.length;
    setAllChecked(all);
    setSomeChecked(some);
  }, [selectedIds, idsOnPage]);

  const toggleAll = () => setSelectedIds(allChecked ? [] : idsOnPage);
  const toggleOne = (id) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const handleChangePage = (_e, newPage) => {
    getData(newPage, rowsPerPage);
  };
  const handleChangeRowsPerPage = (e) => {
    getData(1, +e.target.value);
  };

  const handleDeleteRecord = async (formId) => {
    const obj = { recordId: formId, tableName: UPDATE_TABLE };
    const { success, message, error } = await deleteRecord(obj);
    if (success) {
      toast.success(message);
      getData(page, rowsPerPage);
    } else {
      toast.error(error || message);
    }
  };

  const modeHandler = (mode, formId = null, flag) => {
    if (mode === "delete") {
      handleDeleteRecord(formId);
      return;
    }
    if (flag === "MBL") {
      setMode({ mode, formId });
      router.push("/bl/mbl");
    } else if (flag === "HBL") {
      setMode({ mode, formId: `${formId}` });
      router.push("/bl/hbl");
    }
  };

  const handlePrint = (id, clientId) => {
    setReportModalForRow({ id, clientId });
    setReportModalOpen(true);
  };

  const handleGenerateReports = () => {
    setReportModalOpen(false);
    setReportModalForRow(null);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box className="sm:px-4 py-1">
        <Box className="flex flex-col sm:flex-row justify-between pb-1">
          <Typography variant="body1" className="text-left flex items-center">
            MBL
          </Typography>
          <Box className="flex flex-col sm:flex-row gap-6">
            <AdvancedSearchBar
              fields={advanceSearchFields.bl}
              advanceSearch={advanceSearch}
              setAdvanceSearch={setAdvanceSearch}
              getData={getData}
              rowsPerPage={rowsPerPage}
            />
            <CustomButton text="Add" href="/bl/mbl" />
          </Box>
        </Box>

        {/* <SelectionActionsBar
          selectedIds={selectedIds}
          tableName={UPDATE_TABLE}
          keyColumn="id"
          onView={(id) => modeHandler("view", id)}
          onEdit={(id) => modeHandler("edit", id)}
          onDelete={(id) => handleDeleteRecord(id)}
          onUpdated={() => getData(page, rowsPerPage)}
        /> */}

        <TableContainer component={Paper} ref={tableWrapRef} className="mt-2">
          <Table size="small" sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                {/* <TableCell padding="checkbox" sx={CHECKBOX_HEAD_SX}>
                  <Checkbox
                    size="small"
                    indeterminate={someChecked}
                    checked={allChecked}
                    onChange={toggleAll}
                    sx={CHECKBOX_SX}
                  />
                </TableCell> */}
                <TableCell>BL NO</TableCell>
                <TableCell>Reference BL NO</TableCell>
                <TableCell>MBL date</TableCell>
                <TableCell>Consignee Name</TableCell>
                <TableCell>POL</TableCell>
                <TableCell>POD</TableCell>
                <TableCell>FPD</TableCell>
                <TableCell>Cargo Movement</TableCell>
                <TableCell>Arrival Vessel</TableCell>
                <TableCell>Arrival Voyage</TableCell>
                <TableCell>History</TableCell> {/* ⬅️ NEW */}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length > 0 ? (
                rows.map((row) => (
                  <TableRow key={row.id} hover className="relative group ">
                    <TableCell>{row.blNo}</TableCell>
                    <TableCell>
                      {row?.hblNo &&
                        JSON.parse(row?.hblNo)?.map((item, idx) => (
                          <Link
                            key={idx}
                            href="#"
                            underline="hover"
                            onClick={() => modeHandler("view", item?.id, "HBL")}
                          >
                            {item?.hblNo}
                            {idx < JSON.parse(row?.hblNo).length - 1 && ", "}
                          </Link>
                        ))}
                    </TableCell>
                    <TableCell>{row.mblDate}</TableCell>
                    <TableCell>{row.consigneeText}</TableCell>
                    <TableCell>{row.pol}</TableCell>
                    <TableCell>{row.pod}</TableCell>
                    <TableCell>{row.fpd}</TableCell>
                    <TableCell>{row.cargoMovement}</TableCell>
                    <TableCell>{row.arrivalVessel}</TableCell>
                    <TableCell>
                      <Box className="flex items-center justify-between gap-1">
                        <span>{row.arrivalVoyage}</span>
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <HoverActionIcons
                            onView={() =>
                              modeHandler("view", row.id, row.mblHblFlag)
                            }
                            onEdit={() =>
                              modeHandler("edit", row.id, row.mblHblFlag)
                            }
                            onDelete={() => modeHandler("delete", row.id)}
                            onPrint={() => handlePrint(row.id, row.clientId)}
                            menuAccess={data ?? {}}
                          />
                        </span>
                      </Box>
                    </TableCell>

                    {/* ⬇️ NEW History cell */}
                    <TableCell>
                      <HistoryIcon
                        sx={{ cursor: "pointer", fontSize: "16px" }}
                        onClick={() => {
                          console.log("MBL History clicked, row.id =", row.id);
                          setHistoryModal({
                            open: true,
                            recordId: row.id ? Number(row.id) : null,
                          });
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={11} align="center">
                    {/* ⬆️ colSpan updated to 11 to match columns */}
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
      />

      {/* ⬇️ Common History Modal for tblBl */}
      <HistoryModal
        open={historyModal.open}
        onClose={() => setHistoryModal({ open: false, recordId: null })}
        tableName="tblBl"
        recordId={historyModal.recordId}
        title="BL History"
      />

      <ToastContainer />
    </ThemeProvider>
  );
}
