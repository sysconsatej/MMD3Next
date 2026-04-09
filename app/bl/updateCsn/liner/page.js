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
} from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import CustomPagination from "@/components/pagination/pagination";
import { theme } from "@/styles/globalCss";
import { fetchTableValues } from "@/apis";
import AdvancedSearchBar from "@/components/advanceSearchBar/advanceSearchBar";
import { ToastContainer } from "react-toastify";
import { useRouter } from "next/navigation";
import { formStore } from "@/store";
import {
  vesselVoyageFilters,
  vesselVoyageFiltersAdmin,
} from "../../mbl/mblData";
import TableExportButtons from "@/components/tableExportButtons/tableExportButtons";
import { getUserByCookies } from "@/utils";
import HistoryIcon from "@mui/icons-material/History";
import { CustomInput } from "@/components/customInput";
import BLHistoryModal from "../../mbl/modal";
import { createHandleChangeEventFunction } from "@/utils/dropdownUtils";
import CustomButton from "@/components/button/button";
import {
  advanceSearchFilter,
  BlRejectModal,
  csnStatusHandler,
  statusColor,
} from "../utils";
import { advanceSearchFields } from "../updateCsnData";
import SearchRequestToolbarActions from "@/components/selectionActions/csnRequestActionBar";
import { craeateHandleChangeEventFunction } from "../../mbl/utils";

const LIST_TABLE = "tblCsn csn";

const CHECKBOX_HEAD_SX = { width: 36, minWidth: 36, maxWidth: 36 };
const CHECKBOX_CELL_SX = { width: 32, minWidth: 32, maxWidth: 32 };
const CHECKBOX_SX = {
  p: 0.25,
  "& .MuiSvgIcon-root": {
    fontSize: 18,
  },
};

function createData(
  id,
  blNo,
  company,
  csnNo,
  csnDate,
  status,
  csnRequestRemarks,
  pol,
  pod,
) {
  return {
    id,
    blNo,
    company,
    csnNo,
    csnDate,
    status,
    csnRequestRemarks,
    pol,
    pod,
  };
}

export default function BLList() {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [totalPage, setTotalPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [blData, setBlData] = useState([]);
  const [advanceSearch, setAdvanceSearch] = useState({ podVesselId: null });
  const { setMode } = formStore();
  const router = useRouter();
  const tableWrapRef = useRef(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [idsOnPage, setIdsOnPage] = useState([]);
  const [allChecked, setAllChecked] = useState(false);
  const [someChecked, setSomeChecked] = useState(false);
  const [historyModal, setHistoryModal] = useState({
    open: false,
    recordId: null,
  });
  const [modal, setModal] = useState({
    toggle: false,
    value: null,
    ids: [],
    actionType: null,
  });
  const userData = getUserByCookies();
  const [SearchCondition, setSearchCondition] = useState(
    `u.id = ${userData?.userId}`,
  );

  const getData = useCallback(
    async (
      pageNo = page,
      pageSize = rowsPerPage,
      advanceSearchQuery = advanceSearch,
      SearchConditionMain = SearchCondition,
    ) => {
      try {
        const tableObj = {
          columns: `csn.id id, csn.mblNo  blNo, c2.name company, csn.csnNo csnNo, convert(date, csn.csnDate, 19) csnDate, m2.name status, csn.csnRequestRemarks csnRequestRemarks, concat(p.code, ' - ', p.name) pol, concat(p1.code, ' - ', p1.name) pod`,
          tableName: LIST_TABLE,
          pageNo,
          pageSize,
          joins: `
            left join tblCompany c2 on c2.id = csn.companyId
            left join tblPort p on p.id = csn.polId 
            left join tblPort p1 on p1.id = csn.podId  
            left join tblMasterData m2 on m2.id = csn.csnRequestStatusId 
            left join tblUser u2 on u2.roleCode = 'shipping' 
            left join tblUser u on ${SearchConditionMain}
            join tblCSN csn2 on csn2.id = csn.id and csn.locationId = ${userData?.location} and csn.shippingLineId = u.companyId and csn.csnRequestStatusId is not null
          `,
          advanceSearch: advanceSearchFilter(advanceSearchQuery),
        };

        const { data, totalPage, totalRows } = await fetchTableValues(tableObj);

        setBlData(Array.isArray(data) ? data : []);
        setTotalPage(Number(totalPage || 1));
        setTotalRows(Number(totalRows || 0));
        setPage(pageNo);
        setRowsPerPage(pageSize);
        setSelectedIds([]);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    },
    [page, rowsPerPage, advanceSearch],
  );

  const rows = useMemo(() => {
    return (blData || []).map((item) =>
      createData(
        item["id"],
        item["blNo"],
        item["company"],
        item["csnNo"],
        item["csnDate"],
        item["status"],
        item["csnRequestRemarks"],
        item["pol"],
        item["pod"],
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

  const handleChangeEventFunctions = useMemo(() => {
    if (userData?.roleCode === "shipping") {
      return craeateHandleChangeEventFunction({
        setFormData: setAdvanceSearch,
        formData: advanceSearch,
      });
    }

    return createHandleChangeEventFunction({
      setFormData: setAdvanceSearch,
      fields: vesselVoyageFiltersAdmin,
    });
  }, [userData?.roleCode, advanceSearch]);

  useEffect(() => {
    getData();
  }, [advanceSearch?.podVesselId, advanceSearch?.podVoyageId]);

  useEffect(() => {
    getData(1, rowsPerPage);
    setMode({ mode: null, formId: null });
    if (userData.roleCode === "admin") {
      setSearchCondition(`u.roleCodeId = u2.id`);
      getData(1, rowsPerPage, advanceSearch, "u.roleCodeId = u2.id");
    }
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box className="sm:px-4 py-1">
        <Box className="flex flex-col sm:flex-row justify-between pb-1">
          <Typography variant="body1" className="text-left flex items-center">
            Track Update CSN
          </Typography>

          <Box className="flex flex-col sm:flex-row gap-6 items-start">
            <Box
              className={`min-w-[600px] w-[600px] grid ${userData?.roleCode === "admin" ? "grid-cols-3" : "grid-cols-2"} gap-x-2 gap-y-1 items-center [&>*]:min-w-0`}
            >
              <CustomInput
                fields={
                  userData?.roleCode === "admin"
                    ? vesselVoyageFiltersAdmin
                    : vesselVoyageFilters
                }
                formData={advanceSearch}
                setFormData={setAdvanceSearch}
                fieldsMode={"edit"}
                handleChangeEventFunctions={handleChangeEventFunctions}
              />
            </Box>
            <Box className="flex gap-4">
              <AdvancedSearchBar
                fields={advanceSearchFields.bl}
                advanceSearch={advanceSearch}
                setAdvanceSearch={setAdvanceSearch}
                getData={getData}
                rowsPerPage={rowsPerPage}
              />
            </Box>
          </Box>
        </Box>

        <SearchRequestToolbarActions
          selectedIds={selectedIds}
          onView={(id) =>
            csnStatusHandler(getData, router, setMode, "liner").handleView(id)
          }
          onReject={(ids) =>
            setModal((prev) => ({
              ...prev,
              toggle: true,
              ids: ids,
            }))
          }
          onConfirm={(ids) =>
            csnStatusHandler(getData, router, setMode).handleConfirm(ids)
          }
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
                <TableCell>Company Name</TableCell>
                <TableCell>CSN No</TableCell>
                <TableCell>CSN Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Reject Remark</TableCell>
                <TableCell>POL</TableCell>
                <TableCell>POD</TableCell>
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
                    <TableCell>{row.company}</TableCell>
                    <TableCell>{row.csnNo}</TableCell>
                    <TableCell>{row.csnDate}</TableCell>
                    <TableCell
                      sx={{
                        color: statusColor(row.status?.replace(/\s+/g, "")),
                      }}
                    >
                      {row.status}
                    </TableCell>
                    <TableCell>{row.csnRequestRemarks}</TableCell>
                    <TableCell>{row.pol}</TableCell>
                    <TableCell>{row.pod}</TableCell>
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
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={11} align="center">
                    Data not found!
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

      <BLHistoryModal
        open={historyModal.open}
        onClose={() => setHistoryModal({ open: false, recordId: null })}
        recordId={historyModal.recordId}
        blNumber={rows.find((x) => x.id === historyModal.recordId)?.blNo || ""}
      />
      <BlRejectModal modal={modal} setModal={setModal} getData={getData} />
      <ToastContainer />
    </ThemeProvider>
  );
}
