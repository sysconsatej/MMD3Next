"use client";
import React from "react";
import { Box, Pagination, PaginationItem } from "@mui/material";

const CustomPagination = ({ count, page, rowsPerPage, onPageChange }) => {
    const totalPages = Math.ceil(count / rowsPerPage);

    const handleChange = (event, value) => {
        onPageChange(event, value - 1);
    };

    return (
        <Box>
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
