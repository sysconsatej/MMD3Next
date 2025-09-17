"use client";
import React, { useCallback, useEffect, useState } from "react";
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
import SearchBar from "@/components/searchBar/searchBar";
import { ToastContainer } from "react-toastify";
import { dropdowns } from "@/utils";
import { HoverActionIcons } from "@/components/tableHoverIcons/tableHoverIcons";
import { useRouter } from "next/navigation";
import { formStore } from "@/store";

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
  const [search, setSearch] = useState({ searchColumn: "", searchValue: "" });
  const [loadingState, setLoadingState] = useState("Loading...");
  const { setMode } = formStore();
  const router = useRouter();

  const getData = useCallback(
    async (pageNo = page, pageSize = rowsPerPage) => {
      try {
        const tableObj = {
          columns:
            "b.mblNo mblNo, b.mblDate mblDate, b.consigneeText consigneeText, p.name pol, p.code polCode, p1.name pod, p1.code podCode, p2.name fpd, p2.code fpdCode, m.name cargoMovement, v1.name arrivalVessel, v.voyageNo arrivalVoyage, b.itemNo line, b.id id",
          tableName: "tblBl b",
          pageNo,
          pageSize,
          searchColumn: search.searchColumn,
          searchValue: search.searchValue,
          joins:
            " left join tblPort p on p.id = b.polId  left join tblPort p1 on p1.id=b.podId left join tblPort p2 on p2.id=b.fpdId left join tblVoyage v on v.id=b.podVoyageId left join tblVessel v1 on v1.id=b.podVesselId left join tblMasterData m on m.id = b.movementTypeId",
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
    [page, rowsPerPage, search]
  );

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
          { name: item["pol"], code: item["polCode"] },
          { name: item["pod"], code: item["podCode"] },
          { name: item["fpd"], code: item["fpdCode"] },
          item["cargoMovement"],
          item["arrivalVessel"],
          item["arrivalVoyage"],
          item["line"],
          item["id"]
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
    console.log("Delete response:", { success, message, error });

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
            <SearchBar
              getData={getData}
              rowsPerPage={rowsPerPage}
              search={search}
              setSearch={setSearch}
              options={dropdowns.bl}
            />
            <CustomButton text="Add" href="/bl/hbl" />
          </Box>
        </Box>

        <TableContainer component={Paper}>
          <Table size="small" sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell>MBL NO</TableCell>
                <TableCell>MBL date</TableCell>
                <TableCell>Consignee Name</TableCell>
                <TableCell>POL</TableCell>
                <TableCell>POD</TableCell>
                <TableCell>FPD</TableCell>
                <TableCell>Cargo Movement</TableCell>
                <TableCell>Arrival Vessel</TableCell>
                <TableCell>Arrival Voyage</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length > 0 ? (
                rows.map((row, index) => (
                  <TableRow key={index} hover className="relative group ">
                    <TableCell>{row.mblNo}</TableCell>
                    <TableCell>{row.mblDate}</TableCell>
                    <TableCell>{row.consigneeText}</TableCell>
                    <TableCell>
                      {row.pol?.name
                        ? `${row.pol.name}${
                            row.pol.code ? ` - ${row.pol.code}` : ""
                          }`
                        : ""}
                    </TableCell>
                    <TableCell>
                      {row.pod?.name
                        ? `${row.pod.name}${
                            row.pod.code ? ` - ${row.pod.code}` : ""
                          }`
                        : ""}
                    </TableCell>
                    <TableCell>
                      {" "}
                      {row.fpd?.name
                        ? `${row.fpd.name}${
                            row.fpd.code ? ` - ${row.fpd.code}` : ""
                          }`
                        : ""}{" "}
                    </TableCell>
                    <TableCell>{row.cargoMovement}</TableCell>
                    <TableCell>{row.arrivalVessel}</TableCell>
                    <TableCell>{row.arrivalVoyage}</TableCell>
                    <TableCell className="table-icons opacity-0 group-hover:opacity-100">
                      <HoverActionIcons
                        onView={() => modeHandler("view", row.id)}
                        onEdit={() => modeHandler("edit", row.id)}
                        onDelete={() => modeHandler("delete", row.id)}
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
      <ToastContainer />
    </ThemeProvider>
  );
}
