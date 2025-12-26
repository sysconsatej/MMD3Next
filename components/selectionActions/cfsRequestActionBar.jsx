"use client";
import React, { useMemo } from "react";
import { Box, Tooltip, Checkbox } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CancelIcon from "@mui/icons-material/Cancel";
import VerifiedIcon from "@mui/icons-material/Verified";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DirectionsBoatIcon from "@mui/icons-material/DirectionsBoat";
import MailOutlineIcon from "@mui/icons-material/MailOutline";

export default function SearchRequestToolbarActions({
  selectedIds = [],
  onEdit,
  onView,
  onReject,
  onConfirm,
  onEditVessel,
  onNotify,
  amendmentChecked = false,
  onAmendmentChange,
  historyChecked = false,
  onHistoryChange,
  disableConfirm = false,
}) {
  const ids = useMemo(
    () => (Array.isArray(selectedIds) ? selectedIds.filter(Boolean) : []),
    [selectedIds]
  );

  const count = ids.length;
  const isSingle = count === 1;
  const hasAny = count > 0;

  const Segment = ({ label, icon, onClick, disabled }) => (
    <Tooltip title={label} arrow disableInteractive>
      <div
        className={[
          "flex-1 text-center py-1 px-3 cursor-pointer hover:bg-[#B5C4F0] hover:text-white border-r border-[#B5C4F0]",
          // "bg-[#efefef] text-[#444] border border-[#d9d9d9]",
          // "cursor-pointer hover:bg-[#e9e9e9] hover:text-[#111]",
          disabled ? "pointer-events-none opacity-50 cursor-not-allowed" : "",
        ].join(" ")}
        onClick={!disabled ? onClick : undefined}
      >
        {/* {React.cloneElement(icon, { sx: { fontSize: 14 } })} */}
        <span>{label}</span>
      </div>
    </Tooltip>
  );

  return (
    <Box className="flex items-center justify-between">
      <div className="flex border text-black border-[#B5C4F0] mt-2 text-xs rounded-sm overflow-hidden">
        {/* <Segment
          label="Edit"
          icon={<EditIcon />}
          onClick={() => onEdit?.(ids[0])}
          disabled={!isSingle}
        /> */}
        {/* <Segment
          label="View"
          icon={<VisibilityIcon />}
          onClick={() => onView?.(ids[0])}
          disabled={!isSingle}
        /> */}
        <Segment
          label="Reject"
          onClick={() => onReject?.(ids)}
          disabled={!hasAny}
        />

        <Segment
          label="Confirm"
          onClick={() => onConfirm?.(ids)}
          disabled={!hasAny || disableConfirm}
        />
        {/* <Segment
          label="Edit Vessel"
          icon={<DirectionsBoatIcon />}
          onClick={() => onEditVessel?.(ids[0])}
          disabled={!isSingle}
        />
        <Segment
          label="Notify"
          icon={<MailOutlineIcon />}
          onClick={() => onNotify?.(ids)}
          disabled={!hasAny}
        /> */}
      </div>

      {/* 🔹 SECOND ROW (Checkboxes) */}
      {/* <div className="flex items-center gap-6">
        <label className="flex items-center gap-1 bg-[#ffcdd2] px-2 py-[3px] rounded-[3px] text-[11px] cursor-pointer">
          <Checkbox
            size="small"
            checked={amendmentChecked}
            onChange={(e) => onAmendmentChange?.(e.target.checked)}
            sx={{ p: 0, "& .MuiSvgIcon-root": { fontSize: 14 } }}
          />
          <span className="text-[#b71c1c] font-medium">
            Request For Amendment
          </span>
        </label>

        <label className="flex items-center gap-1 px-2 py-[3px] rounded-[3px] text-[11px] cursor-pointer">
          <Checkbox
            size="small"
            checked={historyChecked}
            onChange={(e) => onHistoryChange?.(e.target.checked)}
            sx={{ p: 0, "& .MuiSvgIcon-root": { fontSize: 14 } }}
          />
          <span className="text-[#0d47a1] font-medium">
            Notification History
          </span>
        </label>
      </div> */}
    </Box>
  );
}
