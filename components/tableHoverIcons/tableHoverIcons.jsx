"use client";
import { Box, IconButton, Tooltip } from "@mui/material";
import { Edit, Delete, Visibility } from "@mui/icons-material";

export const HoverActionIcons = ({ onView, onEdit, onDelete }) => {
  return (
    <Box className="flex justify-end items-center gap-2">
      <Tooltip title="View" arrow>
        <IconButton onClick={onView} sx={{ color: "#ffc400" }} size="small">
          <Visibility fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Edit" arrow>
        <IconButton onClick={onEdit} sx={{ color: "#ffc400" }} size="small">
          <Edit fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Delete" arrow>
        <IconButton onClick={onDelete} color="error" size="small">
          <Delete fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );
};
