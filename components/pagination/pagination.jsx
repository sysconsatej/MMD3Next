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
  page,
  rowsPerPage,
  onPageChange,
  handleChangeRowsPerPage,
}) => {
  const totalPages = Math.ceil(count / rowsPerPage);

  const handleChange = (event, value) => {
    onPageChange(event, value - 1);
  };

  return (
    <Box className="flex gap-2">
      <TablePagination
        component="div"
        count={count}
        page={page}
        onPageChange={onPageChange}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
        ActionsComponent={() => null}
      />
      <Pagination
        count={totalPages}
        page={page + 1}
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
