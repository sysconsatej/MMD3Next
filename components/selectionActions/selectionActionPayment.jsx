"use client";
import React, { useMemo, useState } from "react";
import { Box, Typography } from "@mui/material";

export default function SelectionActionsBar({
  selectedIds = [],
  keyColumn = "id",
  onView,
  onEdit,
  disablePay = false, // ⬅ already there
  isPay = false,
  onPay, // optional callback
  showEdit = true, // ⬅ NEW PROP (default: show Edit)
}) {
  const ids = useMemo(
    () =>
      (Array.isArray(selectedIds) ? selectedIds : [])
        .map((v) => v ?? "")
        .map((v) => (typeof v === "string" ? v.trim() : v))
        .filter((v) => v !== "" && v !== null && v !== undefined),
    [selectedIds]
  );

  const count = ids.length;
  const isSingle = count === 1;
  const hasAny = count > 0;

  const handlePay = () => {
    if (!hasAny || !onPay) return;
    onPay(ids); // pass all selected ids
  };

  const Segment = ({ label, onClick, disabled, isLast }) => {
    let cls =
      "flex-1 text-center py-1 px-3 cursor-pointer hover:bg-[#B5C4F0] hover:text-white";
    if (!isLast) cls += " border-r border-[#B5C4F0]";
    if (disabled) cls += " pointer-events-none opacity-50 cursor-not-allowed";
    return (
      <div className={cls} onClick={!disabled ? onClick : undefined}>
        {label}
      </div>
    );
  };

  return (
    <>
      <Box className="flex items-center justify-between">
        <div className="flex border text-black border-[#B5C4F0] mt-2 text-xs rounded-sm overflow-hidden">
          <Segment
            label="View"
            onClick={() => isSingle && onView && onView(ids[0])}
            disabled={!isSingle}
            // not last, we keep as-is
          />

          {showEdit && (
            <Segment
              label="Edit"
              onClick={() => isSingle && onEdit && onEdit(ids[0])}
              disabled={!isSingle}
              // not last, same as before
            />
          )}

          {isPay && (
            <Segment
              label="Pay"
              onClick={handlePay}
              disabled={disablePay}
              isLast
            />
          )}
          {!isPay && <div className="hidden" />} {/* keep layout stable */}
        </div>

        <Typography variant="caption" className="mt-2 ml-2">
          Selected: {count}
        </Typography>
      </Box>
    </>
  );
}
