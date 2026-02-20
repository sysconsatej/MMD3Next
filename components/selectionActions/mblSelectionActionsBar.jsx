"use client";
import React, { useMemo } from "react";
import { Box, Typography } from "@mui/material";
import { useGetUserAccessUtils } from "@/utils/getUserAccessUtils";

export default function MBLSelectionActionsBar({
  selectedIds = [],
  onView,
  onEdit,
  onDelete,
  onPrint,
  onLock,
}) {
  const ids = useMemo(() => selectedIds.filter(Boolean), [selectedIds]);
  const userAccess = useGetUserAccessUtils()?.data || {};

  const count = ids.length;
  const single = count === 1;

  const Action = ({ label, onClick, disabled }) => (
    <div
      className={`flex-1 text-center py-1 px-3 cursor-pointer hover:bg-[#B5C4F0] hover:text-white
      ${disabled ? "pointer-events-none opacity-50" : ""}`}
      onClick={!disabled ? onClick : undefined}
    >
      {label}
    </div>
  );

  return (
    <Box className="flex items-center justify-between mb-2">
      <div className="flex border border-[#B5C4F0] text-xs rounded-sm overflow-hidden">
        {userAccess?.["view"] && (
          <Action
            label="View"
            disabled={!single}
            onClick={() => onView(ids[0])}
          />
        )}
        {userAccess?.["edit"] && (
          <Action
            label="Edit"
            disabled={!single}
            onClick={() => onEdit(ids[0])}
          />
        )}
        {userAccess?.["delete"] && (
          <Action
            label="Delete"
            disabled={count === 0}
            onClick={() => onDelete(ids)}
          />
        )}
        {userAccess?.["print"] && (
          <Action
            label="Print"
            disabled={!single}
            onClick={() => onPrint(ids[0])}
          />
        )}
        {/* {userAccess?.["print"] && ( */}
        <Action
          label="Lock"
          disabled={count === 0}
          onClick={() => onLock(ids)}
        />
        {/* )} */}
      </div>

      <Typography variant="caption">Selected: {count}</Typography>
    </Box>
  );
}
