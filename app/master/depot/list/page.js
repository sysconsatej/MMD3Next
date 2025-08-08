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
import { fetchTableValues } from "@/apis";
import SearchBar from "@/components/searchBar/searchBar";
import { ToastContainer } from "react-toastify";
import { dropdowns } from "@/utils";

function createData(depotName, location, code, address) {
  return { depotName, location, code, address };
}

export default function DepotList() {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [totalPage, setTotalPage] = useState(1);
  const [totalRows, setTotalRows] = useState(1);
  const [depotData, setDepotData] = useState([]);
  const [search, setSearch] = useState({ searchColumn: "", searchValue: "" });
  const [loadingState, setLoadingState] = useState("Loading...");

  const getData = useCallback(
    async (pageNo = page, pageSize = rowsPerPage) => {
      try {
        const tableObj = {
          columns:
            "p.name depotName ,m.name location,p.code code,p.address address",
          tableName: "tblPort p",
          pageNo,
          pageSize,
          searchColumn: search.searchColumn,
          searchValue: search.searchValue,
          joins: "left join tblMasterData m on m.id = p.portTypeId",
        };
        const { data, totalPage, totalRows } = await fetchTableValues(tableObj);
        setDepotData(data);
        setTotalPage(totalPage);
        setPage(pageNo);
        setRowsPerPage(pageSize);
        setTotalRows(totalRows);
      } catch {
        setLoadingState("Failed to load data");
      }
    },
    [page, rowsPerPage, search]
  );

  useEffect(() => {
    getData(1, rowsPerPage);
  }, []);

  const rows = depotData
    ? depotData.map((item) =>
        createData(
          item["depotName"],
          item["location"],
          item["code"],
          item["address"]
        )
      )
    : [];

  const handleChangePage = (event, newPage) => {
    getData(newPage, rowsPerPage);
  };

  const handleChangeRowsPerPage = (event) => {
    getData(1, +event.target.value);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box className="sm:px-4 py-1">
        <Box className="flex flex-col sm:flex-row justify-between pb-2">
          <Typography variant="body1" className="text-left flex items-center">
            Depot List
          </Typography>
          <Box className="flex flex-col sm:flex-row gap-6">
            <SearchBar
              getData={getData}
              rowsPerPage={rowsPerPage}
              search={search}
              setSearch={setSearch}
              options={dropdowns.depot}
            />
            <CustomButton text="Add" href="/master/depot" />
          </Box>
        </Box>

        <TableContainer component={Paper}>
          <Table size="small" sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell>Location</TableCell>
                <TableCell>Depot Code</TableCell>
                <TableCell>Depot Name</TableCell>
                <TableCell>Address</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length > 0 ? (
                rows.map((row, i) => (
                  <TableRow key={i} hover>
                    <TableCell>{row.location}</TableCell>
                    <TableCell>{row.code}</TableCell>
                    <TableCell>{row.depotName}</TableCell>
                    <TableCell>{row.address}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    Loading...
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
