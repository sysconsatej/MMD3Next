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
import { tableCellClasses } from "@mui/material/TableCell";
import styled from "@emotion/styled";
import CustomButton from "@/components/button/button";
import CustomPagination from "@/components/pagination/pagination";
import { listData } from "./listData";
import { theme } from "@/styles/globalCss";

const StyledTableCell = styled(TableCell)({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: "#0b2545",
        color: "#fff",
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 14,
    },
});

const StyledTableRow = styled(TableRow)({
    "& td, & th": {
        padding: "6px 16px",
        fontSize: 12,
        minWidth: "120px",
    },
});

export default function CityList() {
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
                {/* Top Bar */}
                <Box className="flex flex-col sm:flex-row justify-between pb-2">
                    <Typography variant="body1" className="text-left flex items-center">
                        City List
                    </Typography>
                    <CustomButton text="Add" href="/master/city" />
                </Box>

                {/* Table */}
                <TableContainer component={Paper}>
                    <Table size="small" sx={{ minWidth: 650 }}>
                        <TableHead>
                            <TableRow>
                                <StyledTableCell>Booking No.</StyledTableCell>
                                <StyledTableCell>B/L Date</StyledTableCell>
                                <StyledTableCell>PLR</StyledTableCell>
                                <StyledTableCell>POL</StyledTableCell>
                                <StyledTableCell>POD</StyledTableCell>
                                <StyledTableCell>FPD</StyledTableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rows.length > 0 ? (
                                rows
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((row, i) => (
                                        <StyledTableRow key={i} hover>
                                            <TableCell>{row.jobNo}</TableCell>
                                            <TableCell>{row.jobDate}</TableCell>
                                            <TableCell>{row.plr}</TableCell>
                                            <TableCell>{row.pol}</TableCell>
                                            <TableCell>{row.pod}</TableCell>
                                            <TableCell>{row.fpd}</TableCell>
                                        </StyledTableRow>
                                    ))
                            ) : (
                                <StyledTableRow>
                                    <TableCell colSpan={6} align="center">
                                        Loading...
                                    </TableCell>
                                </StyledTableRow>
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
