"use client";
import { Box, IconButton, Tooltip } from "@mui/material";
import { Edit, Delete, Visibility, LocalPrintshop } from "@mui/icons-material";

export const HoverActionIcons = ({ onView, onEdit, onDelete, onPrint }) => {
  return (
    <Box className="flex justify-end items-center gap-2">
      <Tooltip title="View" arrow>
        <IconButton onClick={onView} sx={{ color: "#95a9e8" }} size="small">
          <Visibility fontSize="small" />
        </IconButton>
      </Tooltip>

      <Tooltip title="Edit" arrow>
        <IconButton onClick={onEdit} sx={{ color: "#95a9e8" }} size="small">
          <Edit fontSize="small" />
        </IconButton>
      </Tooltip>

      <Tooltip title="Delete" arrow>
        <IconButton onClick={onDelete} color="error" size="small">
          <Delete fontSize="small" />
        </IconButton>
      </Tooltip>

      <Tooltip title="Print" arrow>
        <IconButton onClick={onPrint} sx={{ color: "#95a9e8" }} size="small">
          <LocalPrintshop fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );
};
