"use client";

import { Box, IconButton, Tooltip, SvgIcon } from "@mui/material";
import {
  PersonAddAlt1,
  CheckCircle,
  Close,
  NotificationsNone,
  Search,
  History as HistoryIcon,
} from "@mui/icons-material";
import { useGetUserAccessUtils } from "@/utils/getUserAccessUtils";

export function TopActionIcons({
  onAddUser,
  onHistory,
  onApprove,
  onReject,
  onNotify,
  onSearch,
  show = {},
  color = "#95A9E8",
}) {
  const {
    addUser = false,
    history = false,
    approve = false,
    reject = false,
    notify = false,
    search = false,
  } = show;
  const userAccess = useGetUserAccessUtils()?.data || {};
  const blue = { color };
  const red = { color: "#e11d2e" };
  return (
    <Box className="flex items-center gap-2">
      {addUser && userAccess?.addUser && (
        <Tooltip title="Add User" arrow>
          <IconButton onClick={onAddUser} size="small" sx={blue}>
            <PersonAddAlt1 fontSize="small" />
          </IconButton>
        </Tooltip>
      )}

      {history && userAccess?.history && (
        <Tooltip title="History" arrow>
          <IconButton onClick={onHistory} size="small" sx={blue}>
            <HistoryIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}

      {approve && userAccess?.approve && (
        <Tooltip title="Approve" arrow>
          <IconButton onClick={onApprove} size="small" sx={blue}>
            <CheckCircle fontSize="small" />
          </IconButton>
        </Tooltip>
      )}

      {reject && userAccess?.reject && (
        <Tooltip title="Reject" arrow>
          <IconButton onClick={onReject} size="small" sx={red}>
            <Close fontSize="small" />
          </IconButton>
        </Tooltip>
      )}

      {notify && userAccess?.notify && (
        <Tooltip title="Notifications" arrow>
          <IconButton onClick={onNotify} size="small" sx={blue}>
            <NotificationsNone fontSize="small" />
          </IconButton>
        </Tooltip>
      )}

      {search && userAccess?.search && (
        <Tooltip title="Search" arrow>
          <IconButton onClick={onSearch} size="small" sx={blue}>
            <Search fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
}
