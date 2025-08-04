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
  Typography,
  CssBaseline,
} from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import CustomButton from "@/components/button/button";
import CustomPagination from "@/components/pagination/pagination";
import { listData } from "./listData";
import { theme } from "@/styles/globalCss";

export default function DepotList() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const rows = listData || [];



  const handleChangePage = (_, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box className="sm:px-4 py-1">
        <Box className="flex flex-col sm:flex-row justify-between pb-2">
          <Typography variant="body1" className="text-left flex items-center">
            Depot List
          </Typography>
          <CustomButton text="Add" href="/master/depot" />
        </Box>

        <TableContainer component={Paper}>
          <Table size="small" sx={{ minWidth: 650 }}>
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
              {rows.length > 0 ? (
                rows
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row, i) => (
                    <TableRow key={i} hover>
                      <TableCell>{row.jobNo}</TableCell>
                      <TableCell>{row.jobDate}</TableCell>
                      <TableCell>{row.plr}</TableCell>
                      <TableCell>{row.pol}</TableCell>
                      <TableCell>{row.pod}</TableCell>
                      <TableCell>{row.fpd}</TableCell>
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
            count={rows.length}
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
