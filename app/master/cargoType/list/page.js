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
  IconButton,
} from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import CustomButton from "@/components/button/button";
import CustomPagination from "@/components/pagination/pagination";
import { theme } from "@/styles/globalCss";
import { fetchTableValues } from "@/apis";
import SearchBar from "@/components/searchBar/searchBar";
import { ToastContainer } from "react-toastify";
import { dropdowns } from "@/utils";
import { HoverIcon } from "@/components/tableHover/tableHover";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityIcon from "@mui/icons-material/Visibility"; // ✅ import hover icon
import DeleteIcon from "@mui/icons-material/Delete";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditIcon from "@mui/icons-material/Edit";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";

function createData(code, name) {
  return { code, name };
}

export default function CargoTypeList() {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [totalPage, setTotalPage] = useState(1);
  const [totalRows, setTotalRows] = useState(1);
  const [unitTypeData, setUnitTypeData] = useState([]);
  const [search, setSearch] = useState({ searchColumn: "", searchValue: "" });
  const [loadingState, setLoadingState] = useState("Loading...");

  const getData = useCallback(
    async (pageNo = page, pageSize = rowsPerPage) => {
      try {
        const tableObj = {
          columns: "m.code,m.name",
          tableName: "tblMasterData m",
          pageNo,
          pageSize,
          searchColumn: search.searchColumn,
          searchValue: search.searchValue,
          joins: `join tblMasterData m1 on m1.id = m.id and m.masterListName = 'tblCargoType'`,
        };
        const { data, totalPage, totalRows } = await fetchTableValues(tableObj);
        setUnitTypeData(data);
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

  const rows = unitTypeData
    ? unitTypeData.map((item) => createData(item["code"], item["name"]))
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
      <Box className="sm:px-4 py-1 ">
        {/* Header Section */}
        <Box className="flex flex-col sm:flex-row justify-between pb-1">
          <Typography variant="body1" className="text-left flex items-center ">
            Cargo Type List
          </Typography>
          <Box className="flex flex-col sm:flex-row gap-6">
            <SearchBar
              getData={getData}
              rowsPerPage={rowsPerPage}
              search={search}
              setSearch={setSearch}
              options={dropdowns.cargoType}
            />
            <CustomButton text="Add" href="/master/cargoType" />
          </Box>
        </Box>

        {/* Table Section */}
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} size="small" aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell> Name</TableCell>
                <TableCell> Code</TableCell>
                <TableCell align="right"> Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!rows.length ? (
                <TableRow>
                  <TableCell colSpan={3}>{loadingState}</TableCell>
                </TableRow>
              ) : (
                rows.map((row, index) => (
                  <TableRow key={index} hover>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.code}</TableCell>
                    <TableCell align="right">
                      {/* ✅ Hover Icons here */}
                      <HoverIcon
                        defaultIcon={<EditOutlinedIcon />}
                        hoverIcon={<EditIcon />}
                        title="Edit"
                        onClick={() => console.log("Edit", row)}
                      />
                      <HoverIcon
                        defaultIcon={<VisibilityOutlinedIcon />}
                        hoverIcon={<VisibilityIcon />}
                        title="View"
                        onClick={() => console.log("View", row)}
                      />
                      <HoverIcon
                        defaultIcon={<DeleteOutlineIcon />}
                        hoverIcon={<DeleteIcon />}
                        title="Delete"
                        onClick={() => console.log("Delete", row)}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
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
