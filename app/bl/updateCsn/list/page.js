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
import { fetchTableValues } from "@/apis";
import AdvancedSearchBar from "@/components/advanceSearchBar/advanceSearchBar";
import { ToastContainer } from "react-toastify";
import { useRouter } from "next/navigation";
import { formStore } from "@/store";
import {
  advanceSearchFields,
  vesselVoyageFiltersAdmin,
} from "../../mbl/mblData";
import {
  advanceSearchFilter,
  craeateHandleChangeEventFunction,
} from "../../mbl/utils";
import TableExportButtons from "@/components/tableExportButtons/tableExportButtons";
import { getUserByCookies } from "@/utils";
import HistoryIcon from "@mui/icons-material/History";
import MBLSelectionActionsBar from "@/components/selectionActions/mblSelectionActionsBar";
import { CustomInput } from "@/components/customInput";
import BLHistoryModal from "../../mbl/modal";

const LIST_TABLE = "tblBl b";

const CHECKBOX_HEAD_SX = { width: 36, minWidth: 36, maxWidth: 36 };
const CHECKBOX_CELL_SX = { width: 32, minWidth: 32, maxWidth: 32 };
const CHECKBOX_SX = {
  p: 0.25,
  "& .MuiSvgIcon-root": {
    fontSize: 18,
  },
};

function createData(id, blNo, shippingLine, csnNo, csnDate, pol, pod, fpd) {
  return {
    id,
    blNo,
    shippingLine,
    csnNo,
    csnDate,
    pol,
    pod,
    fpd,
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
          columns: `b.id id, b.mblNo  blNo, c2.name shippingLine, b.csnNo csnNo, convert(date, b.csnDate, 19) csnDate, concat(p.code, ' - ', p.name) pol, concat(p1.code, ' - ', p1.name) pod, concat(p2.code, ' - ', p2.name) fpd`,
          tableName: LIST_TABLE,
          pageNo,
          pageSize,
          joins: `
            left join tblCompany c2 on c2.id = b.shippingLineId
            left join tblPort p on p.id = b.polId left join tblPort p1 on p1.id=b.podId 
            left join tblPort p2 on p2.id=b.fpdId left join tblVoyage v on v.id=b.podVoyageId 
            left join tblVessel v1 on v1.id=b.podVesselId left join tblMasterData m on m.id = b.movementTypeId 
            left join tblMasterData m2 on m2.id = b.hblRequestStatus 
            left join tblUser u2 on u2.roleCode = 'customer' 
            join tblBl b1 on b1.id = b.id and 
            (b1.mblNo in (select distinct b3.mblNo
            from tblBl b3
            join tblUser u on ${SearchConditionMain}
            join tblMasterData m3 on m3.id = b3.hblRequestStatus
            join tblBl b4 on b4.id = b3.id and b4.companyId = u.companyId and m3.name = 'confirm' and b4.status = 1)
            and b1.status = 1 and  b1.mblHblFlag = 'MBL' 
            and b1.locationId = ${userData?.location}
)
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
        item["shippingLine"],
        item["csnNo"],
        item["csnDate"],
        item["pol"],
        item["pod"],
        item["fpd"],
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

  const handleChangeEventFunctions = craeateHandleChangeEventFunction({
    setFormData: setAdvanceSearch,
    formData: advanceSearch,
  });

  const modeHandler = (mode, formId = null) => {
    setMode({
      mode,
      formId,
      advanceSearch: advanceSearchFilter(advanceSearch),
    });
    router.push("/bl/updateCsn");
  };

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
            Update CSN
          </Typography>

          <Box className="flex flex-col sm:flex-row gap-6 items-start">
            <Box
              className={`min-w-[600px] w-[600px] grid grid-cols-3 gap-x-2 gap-y-1 items-center [&>*]:min-w-0`}
            >
              <CustomInput
                fields={vesselVoyageFiltersAdmin}
                formData={advanceSearch}
                setFormData={setAdvanceSearch}
                fieldsMode={"edit"}
                handleChangeEventFunctions={handleChangeEventFunctions}
              />
            </Box>
            <Box sx={{ flexShrink: 0 }}>
              <AdvancedSearchBar
                fields={advanceSearchFields.bl}
                advanceSearch={advanceSearch}
                setAdvanceSearch={setAdvanceSearch}
                getData={getData}
                rowsPerPage={rowsPerPage}
              />
            </Box>
            <Box sx={{ flexShrink: 0 }}>
              {userData?.roleCode === "customer" && (
                <CustomButton text="Add" href="/bl/updateCsn" />
              )}
            </Box>
          </Box>
        </Box>

        <MBLSelectionActionsBar
          selectedIds={selectedIds}
          onView={(id) => {
            modeHandler("view", id);
          }}
          onEdit={(id) => {
            modeHandler("edit", id);
          }}
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
                <TableCell>Shipping Line</TableCell>
                <TableCell>CSN No</TableCell>
                <TableCell>CSN Date</TableCell>
                <TableCell>POL</TableCell>
                <TableCell>POD</TableCell>
                <TableCell>FPD</TableCell>
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
                    <TableCell>{row.shippingLine}</TableCell>
                    <TableCell>{row.csnNo}</TableCell>
                    <TableCell>{row.csnDate}</TableCell>
                    <TableCell>{row.pol}</TableCell>
                    <TableCell>{row.pod}</TableCell>
                    <TableCell>{row.fpd}</TableCell>
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
      <ToastContainer />
    </ThemeProvider>
  );
}
