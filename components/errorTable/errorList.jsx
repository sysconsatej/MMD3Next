import React, { useEffect, useState } from "react";
import CustomPagination from "@/components/pagination/pagination";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import CustomButton from "../button/button";

const ErrorList = ({ errorGrid, fileName }) => {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [totalPage, setTotalPage] = useState(1);
  const [totalRows, setTotalRows] = useState(1);
  const [errorData, setErrorData] = useState([]);

  const handleChangePage = (_e, newPage) => {
    setPage(newPage);
  };
  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(+e.target.value);
    setTotalPage(Math.ceil(errorData.length / e.target.value));
  };

  function excelUploadHandler() {
    const csv = errorGrid
      .map((tr) => `${tr.referenceNo},${tr.message}`)
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileName}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  useEffect(() => {
    setErrorData(errorGrid);
    setTotalRows(errorGrid.length);
  }, [errorGrid]);

  return (
    <Box>
      {errorData.length > 0 && (
        <Box>
          <TableContainer component={Paper} className="mt-2">
            <Table size="small" sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Reference No</TableCell>
                  <TableCell>Message</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {errorData
                  .slice(
                    (page - 1) * rowsPerPage,
                    (page - 1) * rowsPerPage + rowsPerPage
                  )
                  .map((row) => (
                    <TableRow key={row.id} hover className="relative group ">
                      <TableCell>{row.referenceNo}</TableCell>
                      <TableCell>{row.message}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Box className="flex justify-between items-center mt-2">
            <CustomButton text={"Download CSV"} onClick={excelUploadHandler} />
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
      )}
    </Box>
  );
};

export default ErrorList;
