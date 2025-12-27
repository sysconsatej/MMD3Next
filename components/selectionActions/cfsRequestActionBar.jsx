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
import RequestPageIcon from "@mui/icons-material/RequestPage";

export default function SearchRequestToolbarActions({
  selectedIds = [],
  onEdit,
  onView,
  onReject,
  onConfirm,
  onRequest,
  onRequestAmendment,
  onRejectAmendment,
  onConfirmAmendment,
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
          "flex items-center gap-1 rounded-[3px] px-1.5 py-[2px] text-[11px] leading-none",
          "bg-[#efefef] text-[#444] border border-[#d9d9d9]",
          "cursor-pointer hover:bg-[#e9e9e9] hover:text-[#111]",
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
    <Box className="w-full flex flex-col gap-2">
      {/* 🔹 FIRST ROW (Buttons) */}
      <div className="flex items-center gap-2 flex-wrap">
        {onView && (
          <Segment
            label="View"
            icon={<VisibilityIcon />}
            onClick={() => onView?.(ids[0])}
            disabled={!isSingle}
          />
        )}
        {onEdit && (
          <Segment
            label="Edit"
            icon={<EditIcon />}
            onClick={() => onEdit?.(ids[0])}
            disabled={!isSingle}
          />
        )}
        {onRequest && (
          <Segment
            label="Request"
            icon={<RequestPageIcon />}
            onClick={() => onRequest?.(ids)}
            disabled={!isSingle}
          />
        )}
        {onReject && (
          <Segment
            label="Reject"
            icon={<CancelIcon />}
            onClick={() => onReject?.(ids)}
            disabled={!hasAny}
          />
        )}
        {onConfirm && (
          <Segment
            label="Confirm"
            icon={<CheckCircleIcon />}
            onClick={() => onConfirm?.(ids)}
            disabled={!hasAny || disableConfirm}
          />
        )}
        {onRequestAmendment && (
          <Segment
            label="Request for Amendment"
            icon={<RequestPageIcon />}
            onClick={() => onRequestAmendment?.(ids)}
            disabled={!isSingle}
          />
        )}
        {onRejectAmendment && (
          <Segment
            label="Reject for Amendment"
            icon={<CancelIcon />}
            onClick={() => onRejectAmendment?.(ids)}
            disabled={!hasAny}
          />
        )}
        {onConfirmAmendment && (
          <Segment
            label="Confirm for Amendment"
            icon={<CheckCircleIcon />}
            onClick={() => onConfirmAmendment?.(ids)}
            disabled={!hasAny || disableConfirm}
          />
        )}
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
