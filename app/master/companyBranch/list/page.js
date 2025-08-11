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

function createData(
  code,
  name,
  companyName,
  countryName,
  stateName,
  cityName,
  phoneNo,
  gstinNo,
  zipCode,
) {
  return {
    code,
    name,
    companyName,
    countryName,
    stateName,
    cityName,
    phoneNo,
    gstinNo,
    zipCode,
  };
}

export default function CompanyBranchList() {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [totalPage, setTotalPage] = useState(1);
  const [totalRows, setTotalRows] = useState(1);
  const [companyBranchDataData, setCompanyBranchDataData] = useState([]);
  const [search, setSearch] = useState({ searchColumn: "", searchValue: "" });
  const [loadingState, setLoadingState] = useState("Loading...");

  const getData = useCallback(
    async (pageNo = page, pageSize = rowsPerPage) => {
      try {
        const tableObj = {
          columns:
            "co.code code ,co.name name,com.name companyName, c.name countryName,s.name stateName,ci.name cityName, co.telephoneNo phoneNo,co.taxRegistrationNo gstinNo,co.pincode zipCode ",
          tableName: "tblCompanyBranch co  ",
          pageNo,
          pageSize,
          searchColumn: search.searchColumn,
          searchValue: search.searchValue,
          joins:
            " left join tblCountry c on co.countryId = c.id  left join tblState s on co.stateId = s.id left join tblCity ci on co.cityId = ci.id left join tblCompany com on co.companyId = com.id",
        };
        const { data, totalPage, totalRows } = await fetchTableValues(tableObj);

        setCompanyBranchDataData(data);
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
  }, []);

  const rows = companyBranchDataData
    ? companyBranchDataData.map((item) =>
        createData(
          item["code"],
          item["name"],
          item["companyName"],
          item["countryName"],
          item["stateName"],
          item["cityName"],
          item["phoneNo"],
          item["gstinNo"],
          item["zipCode"],
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
        <Box className="flex flex-col sm:flex-row justify-between pb-1">
          <Typography variant="body1" className="text-left flex items-center">
            Company Branch List
          </Typography>
          <Box className="flex flex-col sm:flex-row gap-6">
            <SearchBar
              getData={getData}
              rowsPerPage={rowsPerPage}
              search={search}
              setSearch={setSearch}
              options={dropdowns.companyBranch}
            />
            <CustomButton text="Add" href="/master/companyBranch" />
          </Box>
        </Box>

        <TableContainer component={Paper}>
          <Table size="small" sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell>Code</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>country Name</TableCell>
                <TableCell>Company Branch</TableCell>
                <TableCell>State Name</TableCell>
                <TableCell>City Name</TableCell>
                <TableCell>Phone NO</TableCell>
                <TableCell>GSTIN NO</TableCell>
                <TableCell>Zip Code</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length > 0 ? (
                rows.map((row, index) => (
                  <TableRow key={index} hover>
                    <TableCell>{row.code}</TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.companyName}</TableCell>
                    <TableCell>{row.countryName}</TableCell>
                    <TableCell>{row.stateName}</TableCell>
                    <TableCell>{row.cityName}</TableCell>
                    <TableCell>{row.phoneNo}</TableCell>
                    <TableCell>{row.gstinNo}</TableCell>
                    <TableCell>{row.zipCode}</TableCell>
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
