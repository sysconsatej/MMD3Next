"use client";
import React, { useEffect, useState } from "react";
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
import { listData } from "./listData";
import { theme } from "@/styles/globalCss";
import { fetchTableValues } from "@/apis";

function createData(code, name, countryPhoneCode, activeInactive) {
  return { code, name, countryPhoneCode, activeInactive };
}

export default function BlList() {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [totalPage, setTotalPage] = useState(1);
  const [totalRows, setTotalRows] = useState(1);
  const [countryData, setCountryData] = useState([]);
  const [loadingState, setLoadingState] = useState("Loading...");

  useEffect(() => {
    async function fetchData() {
      const tableObj = {
        columns: "code, name, countryPhoneCode, activeInactive",
        tableName: "tblCountry",
      };
      const { data, totalPage, totalRows } = await fetchTableValues(tableObj);
      setCountryData(data);
      setTotalPage(totalPage);
      setTotalRows(totalRows);
    }
    fetchData();
  }, []);

  const rows = countryData
    ? countryData.map((item) =>
        createData(
          item["code"],
          item["name"],
          item["countryPhoneCode"],
          item["activeInactive"]
        )
      )
    : [];

  const handleChangePage = (event, newPage) => {
    async function fetchData() {
      const tableObj = {
        columns: "code, name, countryPhoneCode, activeInactive",
        tableName: "tblCountry",
        pageNo: newPage,
        pageSize: rowsPerPage,
      };
      const { data, totalPage, totalRows } = await fetchTableValues(tableObj);
      setCountryData(data);
      setTotalPage(totalPage);
      setTotalRows(totalRows);
      setPage(newPage);
    }
    fetchData();
  };

  const handleChangeRowsPerPage = (event) => {
    async function fetchData() {
      const tableObj = {
        columns: "code, name, countryPhoneCode, activeInactive",
        tableName: "tblCountry",
        pageNo: 1,
        pageSize: +event.target.value,
      };
      const { data, totalPage, totalRows } = await fetchTableValues(tableObj);
      setCountryData(data);
      setTotalPage(totalPage);
      setPage(1);
      setRowsPerPage(+event.target.value);
      setTotalRows(totalRows);
    }
    fetchData();
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box className="sm:px-4 py-1 ">
        <Box className="flex flex-col sm:flex-row justify-between pb-1">
          <Typography variant="body1" className="text-left flex items-center ">
            Country List
          </Typography>
          <Box className="flex flex-col sm:flex-row">
            <CustomButton text="Add" href="/master/country" />
          </Box>
        </Box>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} size="small" aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>Country Code</TableCell>
                <TableCell>Country Name</TableCell>
                <TableCell>Country Phone Code</TableCell>
                <TableCell>Active Inactive</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!rows.length ? (
                <TableRow>
                  <TableCell>{loadingState}</TableCell>
                </TableRow>
              ) : (
                rows.map((row, index) => (
                  <TableRow key={index} hover className="relative group ">
                    <TableCell>{row.code}</TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.countryPhoneCode}</TableCell>
                    <TableCell>{`${row.activeInactive}`}</TableCell>
                  </TableRow>
                ))
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
    </ThemeProvider>
  );
}
