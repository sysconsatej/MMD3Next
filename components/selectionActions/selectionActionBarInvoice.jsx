// components/actions/InvoiceToolbarActions.js
"use client";
import React, { useMemo } from "react";
import { Box, Tooltip } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import GroupsIcon from "@mui/icons-material/Groups";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import CloseIcon from "@mui/icons-material/Close";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import PersonIcon from "@mui/icons-material/Person";

export default function InvoiceToolbarActions({
  selectedIds = [],
  onView,
  onRelease,
  onKyc,
  onUpload,
  onInvoiceLookup,
  onNotify,
  onClose,
  onReprocess,
  onAssign,
  allowBulkRelease = true,
  allowBulkKyc = true,
  allowBulkUpload = true,
  allowBulkInvoiceLookup = true,
  allowBulkNotify = true,
  allowBulkClose = true,
  allowBulkReprocess = true,
  disableRelease = false, // 👈 NEW PROP
  allowBulkAssign = true,
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

  const call = (fn, bulkAllowed) => {
    if (!fn) return;
    if (bulkAllowed) fn(ids);
    else if (isSingle) fn(ids[0]);
  };

  const Segment = ({ label, icon, onClick, disabled }) => (
    <Tooltip title={label} arrow disableInteractive>
      <div
        className={[
          // compact sizing
          "flex items-center gap-1 rounded-[3px] px-1.5 py-[2px] text-[11px] leading-none",
          "bg-[#efefef] text-[#444] border border-[#d9d9d9]",
          "cursor-pointer hover:bg-[#e9e9e9] hover:text-[#111]",
          disabled ? "pointer-events-none opacity-50 cursor-not-allowed" : "",
        ].join(" ")}
        onClick={!disabled ? onClick : undefined}
      >
        {/* smaller icon */}
        <span className="inline-flex items-center" style={{ lineHeight: 0 }}>
          {React.cloneElement(icon, { sx: { fontSize: 14 } })}
        </span>
        <span className="whitespace-nowrap">{label}</span>
      </div>
    </Tooltip>
  );

  return (
    <Box className="w-full flex items-center justify-between gap-2 flex-wrap">
      {/* left: actions (compact gaps) */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <Segment
          label="View"
          icon={<SearchIcon />}
          onClick={() => onView && onView(ids[0])}
          disabled={!isSingle || !onView}
        />
        <Segment
          label="Release"
          icon={<VpnKeyIcon />}
          onClick={() => call(onRelease, allowBulkRelease)}
          disabled={
            !hasAny ||
            !onRelease ||
            (!allowBulkRelease && !isSingle) ||
            disableRelease // 👈 USE FLAG FROM PARENT
          }
        />
        <Segment
          label="KYC"
          icon={<GroupsIcon />}
          onClick={() => call(onKyc, allowBulkKyc)}
          disabled={!hasAny || !onKyc || (!allowBulkKyc && !isSingle)}
        />
        <Segment
          label="Upload"
          icon={<CloudUploadIcon />}
          onClick={() => call(onUpload, allowBulkUpload)}
          disabled={!hasAny || !onUpload || (!allowBulkUpload && !isSingle)}
        />
        <Segment
          label="Invoice Lookup"
          icon={<LocalShippingIcon />}
          onClick={() => call(onInvoiceLookup, allowBulkInvoiceLookup)}
          disabled={
            !hasAny ||
            !onInvoiceLookup ||
            (!allowBulkInvoiceLookup && !isSingle)
          }
        />
        <Segment
          label="Notify"
          icon={<MailOutlineIcon />}
          onClick={() => call(onNotify, allowBulkNotify)}
          disabled={!hasAny || !onNotify || (!allowBulkNotify && !isSingle)}
        />
        <Segment
          label="Close"
          icon={<CloseIcon />}
          onClick={() => call(onClose, allowBulkClose)}
          disabled={!hasAny || !onClose || (!allowBulkClose && !isSingle)}
        />
        <Segment
          label="Reprocess"
          icon={<AutorenewIcon />}
          onClick={() => call(onReprocess, allowBulkReprocess)}
          disabled={
            !hasAny || !onReprocess || (!allowBulkReprocess && !isSingle)
          }
        />
        <Segment
          label="Assign To"
          icon={<PersonIcon />}
          onClick={() => call(onAssign, allowBulkAssign)}
          disabled={
            !hasAny ||
            !onAssign ||
            (!allowBulkAssign && !isSingle) ||
            disableRelease
          }
        />
      </div>

      {/* right: selected counter (corner), compact text */}
      <div className="ml-auto text-[11px] text-[#666]">Selected: {count}</div>
    </Box>
  );
}
