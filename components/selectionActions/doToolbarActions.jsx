"use client";
import React, { useMemo } from "react";
import { Box, Tooltip } from "@mui/material";
import LocalShippingIcon from "@mui/icons-material/LocalShipping"; // Release DO
import EditIcon from "@mui/icons-material/Edit"; // Edit BL Docs
import SearchIcon from "@mui/icons-material/Search"; // View BL Docs
import CheckIcon from "@mui/icons-material/Check"; // Confirm
import MailOutlineIcon from "@mui/icons-material/MailOutline"; // Notify
import FolderOpenIcon from "@mui/icons-material/FolderOpen"; // Generate DO
import DesktopMacIcon from "@mui/icons-material/DesktopMac"; // PCS
import CloseIcon from "@mui/icons-material/Close"; // Reject
import WorkIcon from "@mui/icons-material/Work"; // Security Slip
import PageviewIcon from "@mui/icons-material/Pageview";
import RequestPageIcon from "@mui/icons-material/RequestPage";

export default function DoToolbarActions({
  selectedIds = [],
  onReleaseDO,
  onEditBL,
  onViewBL,
  onConfirm,
  onNotify,
  onGenerateDO,
  onPCS,
  onReject,
  onSecuritySlip,
  onView,
  onEdit,
  onRequestDO,
  allowBulk = true, // global bulk toggle
}) {
  const ids = useMemo(
    () =>
      (Array.isArray(selectedIds) ? selectedIds : [])
        .map((v) => (typeof v === "string" ? v.trim() : v))
        .filter((v) => v !== "" && v !== null && v !== undefined),
    [selectedIds]
  );

  const count = ids.length;
  const isSingle = count === 1;
  const hasAny = count > 0;

  const call = (fn) => {
    if (!fn) return;
    if (allowBulk) fn(ids);
    else if (isSingle) fn(ids[0]);
  };

  const Segment = ({ label, icon, onClick, disabled }) => (
    <Tooltip title={label} arrow disableInteractive>
      <div
        className={[
          "flex items-center gap-1 rounded-[3px] px-1.5 py-[2px] text-[11px] leading-none",
          "bg-[#efefef] text-[#444] border border-[#d9d9d9]",
          "cursor-pointer hover:bg-[#e5e5e5]",
          disabled ? "pointer-events-none opacity-50 cursor-not-allowed" : "",
        ].join(" ")}
        onClick={!disabled ? onClick : undefined}
      >
        <span className="inline-flex items-center" style={{ lineHeight: 0 }}>
          {React.cloneElement(icon, { sx: { fontSize: 14 } })}
        </span>
        <span className="whitespace-nowrap">{label}</span>
      </div>
    </Tooltip>
  );

  return (
    <Box className="w-full flex items-center gap-2 flex-wrap">
      <div className="flex items-center gap-1.5 flex-wrap">
        {/* View */}
        {onView && (
          <Segment
            label="View"
            icon={<PageviewIcon />}
            onClick={() => call(onView)}
            disabled={!isSingle}
          />
        )}

        {/* Edit */}
        {onEdit && (
          <Segment
            label="Edit"
            icon={<EditIcon />}
            onClick={() => call(onEdit)}
            disabled={!isSingle}
          />
        )}

        {/* Request */}
        {onRequestDO && (
          <Segment
            label="Request DO"
            icon={<RequestPageIcon />}
            onClick={() => call(onRequestDO)}
            disabled={!hasAny || !onRequestDO}
          />
        )}

        {/* Release DO */}
        {onReleaseDO && (
          <Segment
            label="Release DO"
            icon={<LocalShippingIcon />}
            onClick={() => call(onReleaseDO)}
            disabled={!hasAny || !onReleaseDO}
          />
        )}

        {/* Edit BL Docs */}
        {onEditBL && (
          <Segment
            label="Edit BL Docs"
            icon={<EditIcon />}
            onClick={() => call(onEditBL)}
            disabled={!hasAny || !onEditBL}
          />
        )}

        {/* View BL Docs */}
        {onViewBL && (
          <Segment
            label="View BL Docs"
            icon={<SearchIcon />}
            onClick={() => call(onViewBL)}
            disabled={!isSingle || !onViewBL}
          />
        )}

        {/* Confirm */}
        {onConfirm && (
          <Segment
            label="Confirm"
            icon={<CheckIcon />}
            onClick={() => call(onConfirm)}
            disabled={!hasAny || !onConfirm}
          />
        )}

        {/* Notify */}
        {onNotify && (
          <Segment
            label="Notify"
            icon={<MailOutlineIcon />}
            onClick={() => call(onNotify)}
            disabled={!hasAny || !onNotify}
          />
        )}

        {/* Generate DO */}
        {onGenerateDO && (
          <Segment
            label="Generate DO"
            icon={<FolderOpenIcon />}
            onClick={() => call(onGenerateDO)}
            disabled={!hasAny || !onGenerateDO}
          />
        )}

        {/* PCS */}
        {onPCS && (
          <Segment
            label="PCS"
            icon={<DesktopMacIcon />}
            onClick={() => call(onPCS)}
            disabled={!hasAny || !onPCS}
          />
        )}

        {/* Reject */}
        {onReject && (
          <Segment
            label="Reject"
            icon={<CloseIcon />}
            onClick={() => call(onReject)}
            disabled={!hasAny || !onReject}
          />
        )}

        {/* Security Slip */}
        {onSecuritySlip && (
          <Segment
            label="Security Slip"
            icon={<WorkIcon />}
            onClick={() => call(onSecuritySlip)}
            disabled={!hasAny || !onSecuritySlip}
          />
        )}
      </div>

      {/* Selected Count */}
      <div className="ml-auto text-[11px] text-[#666]">Selected: {count}</div>
    </Box>
  );
}
