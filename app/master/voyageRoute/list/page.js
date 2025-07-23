"use client";
import React, { useState } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Typography,
  CssBaseline,
} from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import CustomButton from "@/components/button/button";
import CustomPagination from "@/components/pagination/pagination";
import { listData } from "./listData";
import { theme } from "@/styles/globalCss";

function createData(jobNo, blDate, plr, pol, pod, fpd) {
  return { jobNo, blDate, plr, pol, pod, fpd };
}

export default function BlList() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loadingState, setLoadingState] = useState("Loading...");

  const rows = listData
    ? listData.map((item) =>
        createData(
          item["jobNo"],
          item["jobDate"],
          item["plr"],
          item["pol"],
          item["pod"],
          item["fpd"]
        )
      )
    : [];

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box className="sm:px-4 py-1 ">
        <Box className="flex flex-col sm:flex-row justify-between pb-1">
          <Typography variant="body1" className="text-left flex items-center ">
            Voyage Route List
          </Typography>
          <Box className="flex flex-col sm:flex-row">
            <CustomButton text="Add" href="/master/voyageRoute" />
          </Box>
        </Box>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} size="small" aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>Booking No.</TableCell>
                <TableCell>B/L Date</TableCell>
                <TableCell>PLR</TableCell>
                <TableCell>POL</TableCell>
                <TableCell>POD</TableCell>
                <TableCell>FPD</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!rows.length ? (
                <TableRow>
                  <TableCell>{loadingState}</TableCell>
                </TableRow>
              ) : (
                rows
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row, index) => (
                    <TableRow key={index} hover className="relative group ">
                      <TableCell>{row.jobNo}</TableCell>
                      <TableCell>{row.blDate}</TableCell>
                      <TableCell>{row.plr}</TableCell>
                      <TableCell>{row.pol}</TableCell>
                      <TableCell>{row.pod}</TableCell>
                      <TableCell>{row.fpd}</TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <Box className="flex justify-end items-center mt-2">
          <TablePagination
            component="div"
            count={rows.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
            ActionsComponent={() => null}
          />
          <CustomPagination
            count={rows.length}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={handleChangePage}
          />
        </Box>
      </Box>
    </ThemeProvider>
  );
}
