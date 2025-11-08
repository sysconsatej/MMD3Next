"use client";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
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
import CustomButton from "@/components/button/button";
import CustomPagination from "@/components/pagination/pagination";
import { theme } from "@/styles/globalCss";
import { deleteRecord, fetchTableValues } from "@/apis";
import AdvancedSearchBar from "@/components/advanceSearchBar/advanceSearchBar";
import { ToastContainer, toast } from "react-toastify";
import { HoverActionIcons } from "@/components/tableHoverIcons/tableHoverIcons";
import { useRouter } from "next/navigation";
import { auth, formStore } from "@/store";
import { advanceSearchFields } from "../hblData";
import { advanceSearchFilter } from "../utils";
import TableExportButtons from "@/components/tableExportButtons/tableExportButtons";
import SelectionActionsBar from "@/components/selectionActions/selectionActionsBar";
import BLModal from "../modal";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import { useGetUserAccessUtils } from "@/utils/getUserAccessUtils";

const LIST_TABLE = "tblBl b";
const UPDATE_TABLE = LIST_TABLE.trim()
  .split(/\s+/)[0]
  .replace(/^dbo\./i, "");
const CHECKBOX_HEAD_SX = { width: 36, minWidth: 36, maxWidth: 36 };
const CHECKBOX_CELL_SX = { width: 32, minWidth: 32, maxWidth: 32 };
const CHECKBOX_SX = { p: 0.25, "& .MuiSvgIcon-root": { fontSize: 18 } };

const getRowId = (item) => String(item?.mblNo ?? "");

function createData(
  id,
  mblNo,
  hblNo,
  cargoTypeId,
  podVesselId,
  hblCount,
  hblId,
  status,
  remark
) {
  return {
    id,
    mblNo,
    hblNo,
    cargoTypeId,
    podVesselId,
    hblCount,
    hblId,
    status,
    remark,
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
  const [modal, setModal] = useState({ toggle: false, value: null });
  const { data } = useGetUserAccessUtils("HBL Request");
  const { userData } = auth();

  const getData = useCallback(
    async (pageNo = page, pageSize = rowsPerPage) => {
      try {
        const tableObj = {
          columns:
            "b.mblNo, string_agg(b.hblNo, ',') as hblNo, m.name cargoTypeId, v.name podVesselId, count(b.id) as hblCount, string_agg(b.id, ',') as hblId, m1.name status, b.hblRequestRemarks remark",
          tableName: "tblBl b",
          pageNo,
          pageSize,
          advanceSearch: advanceSearchFilter(advanceSearch),
          groupBy:
            "group by b.mblNo, m.name, v.name, m1.name, b.hblRequestRemarks",
          orderBy: "order by max(b.createdDate) desc, b.mblNo asc",
          joins: `left join tblMasterData m on b.cargoTypeId = m.id  left join tblVessel v on b.podVesselId = v.id left join tblMasterData m1 on m1.id = b.hblRequestStatus  left join tblUser u on u.id = ${userData.data.userId} left join tblUser usr1 on usr1.companyId = u.companyId join tblBl b1 on b1.id = b.id and b1.mblHblFlag = 'HBL' and b1.status = 1 and b.createdBy = usr1.id`,
        };
        const { data, totalPage, totalRows } = await fetchTableValues(tableObj);

        setBlData(data || []);
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

  const rows = Array.isArray(blData)
    ? blData.map((item) =>
        createData(
          getRowId(item),
          item["mblNo"],
          item["hblNo"],
          item["cargoTypeId"],
          item["podVesselId"],
          item["hblCount"],
          item["hblId"],
          item["status"],
          item["remark"]
        )
      )
    : [];

  useEffect(() => {
    setIdsOnPage((blData || []).map((r) => getRowId(r)));
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

  const handleDeleteRecord = async (formIdsCsv) => {
    const deleteRecords = formIdsCsv
      ?.split(",")
      ?.map((x) => x.trim())
      .filter(Boolean)
      .map(async (id) => {
        const obj = { recordId: id, tableName: "tblBl" };
        const { success, message, error } = await deleteRecord(obj);
        if (success) toast.success(message);
        else toast.error(error || message);
      });

    await Promise.all(deleteRecords || []);
    getData(page, rowsPerPage);
  };

  const modeHandler = (mode, formId = null) => {
    if (mode === "delete") {
      handleDeleteRecord(formId);
      return;
    }
    setMode({ mode, formId });
    router.push("/bl/hbl");
  };

  const mblToHblIds = useMemo(() => {
    const map = {};
    (blData || []).forEach((r) => {
      map[getRowId(r)] = r?.hblId;
    });
    return map;
  }, [blData]);

  const selectedHblIds = useMemo(() => {
    const list = selectedIds.flatMap((mbl) => mblToHblIds[mbl] || "");
    return Array.from(new Set(list));
  }, [selectedIds, mblToHblIds]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box className="sm:px-4 py-1">
        <Box className="flex flex-col sm:flex-row justify-between pb-1">
          <Typography variant="body1" className="text-left flex items-center">
            HBL Request
          </Typography>
          <Box className="flex flex-col sm:flex-row gap-6">
            <AdvancedSearchBar
              fields={advanceSearchFields.bl}
              advanceSearch={advanceSearch}
              setAdvanceSearch={setAdvanceSearch}
              getData={getData}
              rowsPerPage={rowsPerPage}
            />
            <CustomButton text="Add" href="/bl/hbl" />
          </Box>
        </Box>

        <SelectionActionsBar
          selectedIds={selectedHblIds}
          tableName={UPDATE_TABLE}
          keyColumn="id"
          allowBulkDelete
          onView={(id) => modeHandler("view", id)}
          onEdit={(id) => modeHandler("edit", id)}
          onDelete={(ids) => handleDeleteRecord((ids || []).join(","))}
          onUpdated={() => getData(page, rowsPerPage)}
          isDelete={true}
          isRequest={true}
        />

        <TableContainer component={Paper} ref={tableWrapRef} className="mt-2">
          <Table size="small" sx={{ minWidth: 650 }}>
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
                <TableCell>MBL NO</TableCell>
                <TableCell>HBL NO</TableCell>
                <TableCell>Type Of Cargo</TableCell>
                <TableCell>Vessel-Voyage No</TableCell>
                <TableCell>HBL Count</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Remark</TableCell>
                <TableCell>Attachment</TableCell>
              </TableRow>
            </TableHead>

            <TableBody key={`page-${page}-${rowsPerPage}`}>
              {rows.length > 0 ? (
                rows.map((row) => (
                  <TableRow key={row.id} hover className="relative group ">
                    <TableCell padding="checkbox" sx={CHECKBOX_CELL_SX}>
                      <Checkbox
                        size="small"
                        checked={selectedIds.includes(row.id)}
                        onChange={() => toggleOne(row.id)}
                        sx={CHECKBOX_SX}
                      />
                    </TableCell>
                    <TableCell>{row.mblNo}</TableCell>
                    <TableCell>{row.hblNo}</TableCell>
                    <TableCell>{row.cargoTypeId}</TableCell>
                    <TableCell>{row.podVesselId}</TableCell>
                    <TableCell>{row.hblCount}</TableCell>
                    <TableCell>{row.status}</TableCell>
                    <TableCell>{row.remark}</TableCell>
                    <TableCell>
                      <AttachFileIcon
                        sx={{ cursor: "pointer", fontSize: "16px" }}
                        onClick={() =>
                          setModal((prev) => ({
                            ...prev,
                            toggle: true,
                            value: row.hblId,
                          }))
                        }
                      />
                    </TableCell>
                    <TableCell className="table-icons opacity-0 group-hover:opacity-100 !min-w-fit">
                      <HoverActionIcons
                        onView={() => modeHandler("view", row.hblId)}
                        onEdit={() => modeHandler("edit", row.hblId)}
                        onDelete={() => modeHandler("delete", row.hblId)}
                        menuAccess={data ?? {}}
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
            title="HBL Request"
            fileName="hbl-list"
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
      <BLModal modal={modal} setModal={setModal} />
      <ToastContainer />
    </ThemeProvider>
  );
}
