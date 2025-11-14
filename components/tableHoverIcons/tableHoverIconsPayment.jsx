"use client";

import { Box, IconButton, Tooltip, SvgIcon } from "@mui/material";
import {
  PersonAddAlt1,
  Undo,
  CheckCircle,
  Close,
  NotificationsNone,
  Search,
} from "@mui/icons-material";

export function TopActionIcons({
  onAddUser,
  onUndo,
  onApprove,
  onReject,
  onNotify,
  onSearch,
  show = {},
  color = "#95A9E8",
}) {
  const {
    addUser = false,
    undo = false,
    approve = false,
    reject = false,
    notify = false,
    search = false,
  } = show;

  const blue = { color };
  const red = { color: "#e11d2e" }; 
  return (
    <Box className="flex items-center gap-2">
      {addUser && (
        <Tooltip title="Add User" arrow>
          <IconButton onClick={onAddUser} size="small" sx={blue}>
            <PersonAddAlt1 fontSize="small" />
          </IconButton>
        </Tooltip>
      )}

      {undo && (
        <Tooltip title="Undo" arrow>
          <IconButton onClick={onUndo} size="small" sx={blue}>
            <Undo fontSize="small" />
          </IconButton>
        </Tooltip>
      )}

      {approve && (
        <Tooltip title="Approve" arrow>
          <IconButton onClick={onApprove} size="small" sx={blue}>
            <CheckCircle fontSize="small" />
          </IconButton>
        </Tooltip>
      )}

      {reject && (
        <Tooltip title="Reject" arrow>
          <IconButton onClick={onReject} size="small" sx={red}>
            <Close fontSize="small" />
          </IconButton>
        </Tooltip>
      )}

      {notify && (
        <Tooltip title="Notifications" arrow>
          <IconButton onClick={onNotify} size="small" sx={blue}>
            <NotificationsNone fontSize="small" />
          </IconButton>
        </Tooltip>
      )}

      {search && (
        <Tooltip title="Search" arrow>
          <IconButton onClick={onSearch} size="small" sx={blue}>
            <Search fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
}
