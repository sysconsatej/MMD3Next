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
} from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import CustomButton from "@/components/button/button";
import CustomPagination from "@/components/pagination/pagination";
import { theme } from "@/styles/globalCss";
import { deleteRecord, fetchTableValues } from "@/apis";
import AdvancedSearchBar from "@/components/advanceSearchBar/advanceSearchBar";
import { ToastContainer } from "react-toastify";
import { HoverActionIcons } from "@/components/tableHoverIcons/tableHoverIcons";
import { useRouter } from "next/navigation";
import { formStore } from "@/store";
import { advanceSearchFields } from "../hblData";
import { advanceSearchFilter } from "../utils";
import TableExportButtons from "@/components/tableExportButtons/tableExportButtons";

function createData(mblNo, hblNo, cargoTypeId, podVesselId, hblCount, hblId) {
  return {
    mblNo,
    hblNo,
    cargoTypeId,
    podVesselId,
    hblCount,
    hblId,
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

  const getData = useCallback(
    async (pageNo = page, pageSize = rowsPerPage) => {
      try {
        const tableObj = {
          columns:
            "mblNo, string_agg(b.hblNo, ',') as hblNo, m.name cargoTypeId, v.name podVesselId, count(b.id) as hblCount, string_agg(b.id, ',') as hblId",
          tableName: "tblBl b",
          pageNo,
          pageSize,
          advanceSearch: advanceSearchFilter(advanceSearch),
          groupBy: "group by b.mblNo, m.name, v.name",
          orderBy: "order by max(b.createdDate) desc",
          joins:
            "left join tblMasterData m on b.cargoTypeId = m.id left join tblVessel v on b.podVesselId = v.id",
        };
        const { data, totalPage, totalRows } = await fetchTableValues(tableObj);

        setBlData(data);
        setTotalPage(totalPage);
        setPage(pageNo);
        setRowsPerPage(pageSize);
        setTotalRows(totalRows);
      } catch (err) {
        console.error("Error fetching city data:", err);
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
          item["mblNo"],
          item["hblNo"],
          item["cargoTypeId"],
          item["podVesselId"],
          item["hblCount"],
          item["hblId"]
        )
      )
    : [];

  const handleChangePage = (event, newPage) => {
    getData(newPage, rowsPerPage);
  };

  const handleChangeRowsPerPage = (event) => {
    getData(1, +event.target.value);
  };

  const handleDeleteRecord = async (formId) => {
    const obj = {
      recordId: formId,
      tableName: "tblBl",
    };

    const { success, message, error } = await deleteRecord(obj);

    if (success) {
      toast.success(message);
      getData(page, rowsPerPage);
    } else {
      toast.error(error || message);
    }
  };

  const modeHandler = (mode, formId = null) => {
    if (mode === "delete") {
      handleDeleteRecord(formId);
      return;
    }
    setMode({ mode, formId });
    router.push("/bl/hbl");
  };

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
        <TableContainer component={Paper} ref={tableWrapRef}>
          <Table size="small" sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell>MBL NO</TableCell>
                <TableCell>HBL NO</TableCell>
                <TableCell>Type Of Cargo</TableCell>
                <TableCell>Vessel-Voyage No</TableCell>
                <TableCell>HBL Count</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length > 0 ? (
                rows.map((row, index) => (
                  <TableRow key={index} hover className="relative group ">
                    <TableCell>{row.mblNo}</TableCell>
                    <TableCell>{row.hblNo}</TableCell>
                    <TableCell>{row.cargoTypeId}</TableCell>
                    <TableCell>{row.podVesselId}</TableCell>
                    <TableCell>{row.hblCount}</TableCell>
                    <TableCell className="table-icons opacity-0 group-hover:opacity-100">
                      <HoverActionIcons
                        onView={() => modeHandler("view", row.hblId)}
                        onEdit={() => modeHandler("edit", row.hblId)}
                        onDelete={() => modeHandler("delete", row.hblId)}
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
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
      <ToastContainer />
    </ThemeProvider>
  );
}
