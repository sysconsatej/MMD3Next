"use client";
import React from "react";
import {
  Box,
  Pagination,
  PaginationItem,
  TablePagination,
} from "@mui/material";

const CustomPagination = ({
  count,
  totalRows,
  page,
  rowsPerPage,
  onPageChange,
  handleChangeRowsPerPage,
}) => {
  const handleChange = (event, value) => {
    onPageChange(event, value);
  };

  return (
    <Box className="flex gap-2">
      <TablePagination
        component="div"
        count={totalRows}
        page={page - 1}
        onPageChange={onPageChange}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[10, 25, 50, 100]}
        ActionsComponent={() => null}
      />
      <Pagination
        count={count}
        page={page}
        onChange={handleChange}
        variant="outlined"
        shape="rounded"
        size="small"
        siblingCount={1}
        boundaryCount={1}
        renderItem={(item) => <PaginationItem {...item} />}
      />
    </Box>
  );
};

export default CustomPagination;
