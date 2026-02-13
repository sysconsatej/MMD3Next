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
  Link,
  Checkbox,
} from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import CustomButton from "@/components/button/button";
import CustomPagination from "@/components/pagination/pagination";
import { theme } from "@/styles/globalCss";
import { deleteRecord, fetchTableValues } from "@/apis";
import AdvancedSearchBar from "@/components/advanceSearchBar/advanceSearchBar";
import { toast, ToastContainer } from "react-toastify";
import { useRouter } from "next/navigation";
import { formStore } from "@/store";
import { advanceSearchFields, vesselVoyageFilters } from "../mblData";
import {
  advanceSearchFilter,
  craeateHandleChangeEventFunction,
  handleLock,
} from "../utils";
import TableExportButtons from "@/components/tableExportButtons/tableExportButtons";
import ReportPickerModal from "@/components/ReportPickerModal/reportPickerModal";
import { getUserByCookies } from "@/utils";
import HistoryIcon from "@mui/icons-material/History";
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import BLHistoryModal from "../modal";
import MBLSelectionActionsBar from "@/components/selectionActions/mblSelectionActionsBar";
import { CustomInput } from "@/components/customInput";

const LIST_TABLE = "tblBl b";
const UPDATE_TABLE = LIST_TABLE.trim()
  .split(/\s+/)[0]
  .replace(/^dbo\./i, "");

const CHECKBOX_HEAD_SX = { width: 36, minWidth: 36, maxWidth: 36 };
const CHECKBOX_CELL_SX = { width: 32, minWidth: 32, maxWidth: 32 };
const CHECKBOX_SX = {
  p: 0.25,
  "& .MuiSvgIcon-root": {
    fontSize: 18,
  },
};

const REPORTS = [
  { key: "Survey Letter", label: "Survey Letter" },
  { key: "Delivery Order", label: "Delivery Order" },
  { key: "EmptyOffLoadingLetter", label: "Empty Off-Loading Letter" },
  { key: "CMCLetter", label: "CMC Letter" },
  { key: "CustomsExaminationOrder", label: "Customs Examination Order" },
];
const REPORT_ROUTE = "/htmlReports/rptDoLetter";
const getId = (val) => {
  if (!val) return null;
  if (typeof val === "number") return val;
  if (typeof val === "string") return Number(val) || null;
  return Number(val?.Id ?? val?.id ?? val?.value ?? val?.key) || null;
};

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
  mblHblFlag,
  active,
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
    active,
  };
}

export default function BLList() {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [totalPage, setTotalPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [blData, setBlData] = useState([]);
  const [advanceSearch, setAdvanceSearch] = useState({});
  const [loadingState, setLoadingState] = useState(
    "Please select Vessel and Voyage",
  );

  const { setMode } = formStore();
  const router = useRouter();
  const tableWrapRef = useRef(null);

  const [selectedIds, setSelectedIds] = useState([]);
  const [idsOnPage, setIdsOnPage] = useState([]);
  const [allChecked, setAllChecked] = useState(false);
  const [someChecked, setSomeChecked] = useState(false);

  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportModalForRow, setReportModalForRow] = useState(null);

  const userData = getUserByCookies();

  const [fieldsMode, setFieldsMode] = useState("");
  const [formData, setFormData] = useState({});
  const [historyModal, setHistoryModal] = useState({
    open: false,
    recordId: null,
  });
  const buildQueryWithVV = useCallback(
    (baseQuery) => {
      const vesselId = getId(formData?.podVesselId);
      const voyageId = getId(formData?.podVoyageId);
      if (!vesselId || !voyageId) return null;

      return {
        ...(baseQuery || {}),
        podVesselId: { Id: vesselId },
        podVoyageId: { Id: voyageId },
      };
    },
    [formData?.podVesselId, formData?.podVoyageId],
  );

  const getData = useCallback(
    async (
      pageNo = page,
      pageSize = rowsPerPage,
      advanceSearchQuery = advanceSearch,
    ) => {
      try {
        const finalQuery = buildQueryWithVV(advanceSearchQuery);
        if (!finalQuery) {
          setBlData([]);
          setTotalPage(1);
          setTotalRows(0);
          setPage(1);
          setRowsPerPage(pageSize);
          setSelectedIds([]);
          setLoadingState("Please select Vessel and Voyage");
          return;
        }

        const tableObj = {
          columns: `coalesce(b.hblNo, b.mblNo)  blNo, iif(b.hblNo is null, (select b2.id, b2.hblNo from tblBl b2 left join tblMasterData m3 on m3.id = b2.hblRequestStatus where b2.mblNo =  b.mblNo and b2.status = 1 and b2.mblHblFlag = 'HBL' and m3.name = 'Confirm' and b2.shippingLineId = u.companyId and b2.locationId = ${userData.location} for json path), null) hblNo, b.mblDate mblDate, b.consigneeText consigneeText, concat(p.code, ' - ', p.name) pol, concat(p1.code, ' - ', p1.name) pod, concat(p2.code, ' - ', p2.name) fpd, m.name cargoMovement, v1.name arrivalVessel, v.voyageNo arrivalVoyage, b.itemNo line, b.id id, b.clientId clientId, b.mblHblFlag mblHblFlag, b.active active`,
          tableName: LIST_TABLE,
          pageNo,
          pageSize,
          joins: `left join tblPort p on p.id = b.polId left join tblPort p1 on p1.id=b.podId left join tblPort p2 on p2.id=b.fpdId left join tblVoyage v on v.id=b.podVoyageId left join tblVessel v1 on v1.id=b.podVesselId left join tblMasterData m on m.id = b.movementTypeId left join tblUser u on u.id = ${userData.userId} left join tblMasterData m2 on m2.id = b.hblRequestStatus join tblBl b1 on (b1.id = b.id and b1.status = 1 and  b1.mblHblFlag = 'MBL' and b1.shippingLineId = u.companyId and b1.locationId = ${userData.location}) or (b1.id = b.id and b1.shippingLineId = u.companyId and b1.status = 1 and b1.mblHblFlag = 'HBL' and m2.name = 'Confirm' and b1.locationId = ${userData.location} and b1.mblNo in (select b3.mblNo from tblBl b3 where b3.mblHblFlag = 'MBL' and b3.status = 1 and b3.shippingLineId = u.companyId and b3.locationId = ${userData.location}) )`,
          advanceSearch: advanceSearchFilter(finalQuery),
        };

        const { data, totalPage, totalRows } = await fetchTableValues(tableObj);

        setBlData(Array.isArray(data) ? data : []);
        setTotalPage(Number(totalPage || 1));
        setTotalRows(Number(totalRows || 0));
        setPage(pageNo);
        setRowsPerPage(pageSize);
        setSelectedIds([]);
        setLoadingState(
          Array.isArray(data) && data.length > 0 ? "" : "Data not found!",
        );
      } catch (err) {
        console.error("Error fetching data:", err);
        setLoadingState("Failed to load data");
      }
    },
    [page, rowsPerPage, advanceSearch, buildQueryWithVV],
  );
  useEffect(() => {
    setBlData([]);
    setTotalPage(1);
    setTotalRows(0);
    setPage(1);
    setLoadingState("Please select Vessel and Voyage");
    setMode({ mode: null, formId: null });
  }, []);

  useEffect(() => {
    getData(1, rowsPerPage, advanceSearch);
  }, [formData?.podVesselId, formData?.podVoyageId]);

  const rows = useMemo(() => {
    return (blData || []).map((item) =>
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
        item["mblHblFlag"],
        item["active"],
      ),
    );
  }, [blData]);

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
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const handleChangePage = (_e, newPage) => {
    getData(newPage, rowsPerPage, advanceSearch);
  };

  const handleChangeRowsPerPage = (e) => {
    getData(1, +e.target.value, advanceSearch);
  };

  const handleDeleteRecord = async (formId) => {
    const obj = { recordId: formId, tableName: UPDATE_TABLE };
    const { success, message, error } = await deleteRecord(obj);

    if (success) {
      toast.success(message);
      getData(page, rowsPerPage, advanceSearch);
    } else {
      toast.error(error || message);
    }
  };

  const handleBulkDelete = async (ids) => {
    if (!ids.length) return;

    for (const id of ids) {
      await handleDeleteRecord(id);
    }

    toast.success("Selected records deleted successfully");
    setSelectedIds([]);
    getData(page, rowsPerPage, advanceSearch);
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

  const handleChangeEventFunctions = craeateHandleChangeEventFunction({
    setFormData,
    formData,
  });

  const setFormDataWithAutoClear = useCallback((updater) => {
    setFormData((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;

      const prevVessel = getId(prev?.podVesselId);
      const nextVessel = getId(next?.podVesselId);

      if (prevVessel !== nextVessel) {
        if (next?.podVoyageId) return { ...next, podVoyageId: null };
      }
      return next;
    });
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box className="sm:px-4 py-1">
        <Box className="flex flex-col sm:flex-row justify-between pb-1">
          <Typography variant="body1" className="text-left flex items-center">
            MBL
          </Typography>

          <Box className="flex flex-col sm:flex-row gap-6 items-start">
            <Box className="min-w-[520px] w-[520px] grid grid-cols-2 gap-x-2 gap-y-1 items-center [&>*]:min-w-0">
              <CustomInput
                fields={vesselVoyageFilters}
                formData={formData}
                setFormData={setFormDataWithAutoClear}
                fieldsMode={fieldsMode}
                handleChangeEventFunctions={handleChangeEventFunctions}
              />
            </Box>
            <Box sx={{ flexShrink: 0 }}>
              <AdvancedSearchBar
                fields={advanceSearchFields.bl}
                advanceSearch={advanceSearch}
                setAdvanceSearch={setAdvanceSearch}
                getData={(p = 1, rpp = rowsPerPage, q = advanceSearch) =>
                  getData(p, rpp, q)
                }
                rowsPerPage={rowsPerPage}
              />
            </Box>
            <Box sx={{ flexShrink: 0 }}>
              <CustomButton text="Add" href="/bl/mbl" />
            </Box>
          </Box>
        </Box>

        <MBLSelectionActionsBar
          selectedIds={selectedIds}
          onView={(id) => modeHandler("view", id, "MBL")}
          onEdit={(id) => modeHandler("edit", id, "MBL")}
          onPrint={(id) => {
            const row = rows.find((x) => x.id === id);
            handlePrint(id, row?.clientId);
          }}
          onDelete={(ids) => handleBulkDelete(ids)}
        />

        <TableContainer component={Paper} ref={tableWrapRef} className="mt-2">
          <Table size="small" sx={{ minWidth: 650 }}>
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
                <TableCell padding="checkbox" sx={CHECKBOX_HEAD_SX}></TableCell>
                <TableCell padding="checkbox" sx={CHECKBOX_HEAD_SX}></TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {rows.length > 0 ? (
                rows.map((row) => (
                  <TableRow key={row.id} hover className="relative group">
                    <TableCell padding="checkbox" sx={CHECKBOX_CELL_SX}>
                      <Checkbox
                        checked={selectedIds.includes(row.id)}
                        onChange={() => toggleOne(row.id)}
                        sx={CHECKBOX_SX}
                      />
                    </TableCell>

                    <TableCell>{row.blNo}</TableCell>

                    <TableCell>
                      {row?.hblNo &&
                        JSON.parse(row?.hblNo)?.map((item, idx) => (
                          <Link
                            key={idx}
                            href="#"
                            underline="hover"
                            onClick={(e) => {
                              e.preventDefault();
                              sessionStorage.setItem(
                                "roleId",
                                String(userData?.roleId ?? ""),
                              );
                              sessionStorage.setItem("menuName", "HBL Track");
                              modeHandler("view", item?.id, "HBL");
                            }}
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
                    <TableCell>{row.arrivalVoyage}</TableCell>

                    <TableCell padding="checkbox" sx={CHECKBOX_CELL_SX}>
                      <HistoryIcon
                        sx={{
                          cursor: "pointer",
                          fontSize: "16px",
                          color: "#1976d2",
                        }}
                        onClick={() =>
                          setHistoryModal({
                            open: true,
                            recordId: Number(row.id),
                          })
                        }
                      />
                    </TableCell>

                    {row.mblHblFlag === "MBL" &&
                      (row.active || row.active === undefined) && (
                        <TableCell padding="checkbox" sx={CHECKBOX_CELL_SX}>
                          <LockOpenIcon
                            sx={{
                              cursor: "pointer",
                              fontSize: "16px",
                              color: "#1976d2",
                            }}
                            onClick={() => handleLock(row.id, false, getData)}
                          />
                        </TableCell>
                      )}

                    {row.mblHblFlag === "MBL" && row.active === false && (
                      <TableCell padding="checkbox" sx={CHECKBOX_CELL_SX}>
                        <LockIcon
                          sx={{
                            cursor: "pointer",
                            fontSize: "16px",
                            color: "#1976d2",
                          }}
                          onClick={() => handleLock(row.id, true, getData)}
                        />
                      </TableCell>
                    )}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={11} align="center">
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
        tableName={"tblBl"}
      />

      <BLHistoryModal
        open={historyModal.open}
        onClose={() => setHistoryModal({ open: false, recordId: null })}
        recordId={historyModal.recordId}
        blNumber={rows.find((x) => x.id === historyModal.recordId)?.blNo || ""}
      />

      <ToastContainer />
    </ThemeProvider>
  );
}
