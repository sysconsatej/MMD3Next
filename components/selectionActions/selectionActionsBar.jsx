"use client";
import React, { useMemo, useState } from "react";
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
} from "@mui/material";
import { toast } from "react-toastify";
import { updateStatusRows } from "@/apis";

export default function SelectionActionsBar({
  selectedIds = [],
  tableName,
  keyColumn = "id",
  onView,
  onEdit,
  onDelete,
  onUpdated,
  allowBulkDelete = false, // NEW: opt-in to multi-delete
}) {
  // sanitize ids (avoid null/empty/whitespace)
  const ids = useMemo(
    () =>
      (Array.isArray(selectedIds) ? selectedIds : [])
        .map((v) => (v ?? ""))
        .map((v) => (typeof v === "string" ? v.trim() : v))
        .filter((v) => v !== "" && v !== null && v !== undefined),
    [selectedIds]
  );

  const count = ids.length;
  const isSingle = count === 1;
  const hasAny = count > 0;

  const [rejectOpen, setRejectOpen] = useState(false);
  const [remarks, setRemarks] = useState("");

  const openReject = () => {
    setRemarks("");
    setRejectOpen(true);
  };
  const closeReject = () => setRejectOpen(false);

  const applyUpdate = async (rowsPayload, okMsg) => {
    const res = await updateStatusRows({
      tableName,
      rows: rowsPayload,
      keyColumn,
    });
    const { success, message } = res || {};
    if (!success) {
      toast.error(message || "Update failed");
      return false;
    }
    toast.success(okMsg);
    onUpdated && onUpdated();
    return true;
  };

  const handleRequest = async () => {
    if (!hasAny) return;
    const rowsPayload = ids.map((keyVal) => ({
      [keyColumn]: keyVal, // dynamic key
      blStatus: "Requested",
      remarks: null,
    }));
    await applyUpdate(rowsPayload, "Requested");
  };

  const handleVerify = async () => {
    if (!hasAny) return;
    const rowsPayload = ids.map((keyVal) => ({
      [keyColumn]: keyVal, // dynamic key
      blStatus: "Verified",
      remarks: null,
    }));
    await applyUpdate(rowsPayload, "Verified");
  };

  const submitReject = async () => {
    if (!hasAny) return;
    const rowsPayload = ids.map((keyVal) => ({
      [keyColumn]: keyVal, // dynamic key
      blStatus: "Rejected",
      remarks: (remarks || "").trim() || null,
    }));
    const ok = await applyUpdate(rowsPayload, "Rejected");
    if (ok) closeReject();
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
          />
          <Segment
            label="Edit"
            onClick={() => isSingle && onEdit && onEdit(ids[0])}
            disabled={!isSingle}
          />
          <Segment
            label="Delete"
            onClick={() => {
              if (!onDelete) return;
              if (allowBulkDelete) {
                onDelete(ids); // array of keys
              } else if (isSingle) {
                onDelete(ids[0]); // single key (legacy behavior)
              }
            }}
            disabled={allowBulkDelete ? !hasAny : !isSingle}
          />
          <Segment label="Request" onClick={handleRequest} disabled={!hasAny} />
          <Segment label="Reject" onClick={openReject} disabled={!hasAny} />
          <Segment
            label="Verify"
            onClick={handleVerify}
            disabled={!hasAny}
            isLast
          />
        </div>

        <Typography variant="caption" className="mt-2 ml-2">
          Selected: {count}
        </Typography>
      </Box>

      <Dialog open={rejectOpen} onClose={closeReject} maxWidth="xs" fullWidth>
        <DialogTitle>Reject — Add Remarks</DialogTitle>
        <DialogContent dividers>
          <TextField
            fullWidth
            margin="dense"
            multiline
            minRows={3}
            label="Remarks"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <div
            className="py-1 px-3 border border-[#B5C4F0] rounded-sm text-xs cursor-pointer hover:bg-[#B5C4F0] hover:text-white"
            onClick={closeReject}
          >
            Cancel
          </div>
          <div
            className="py-1 px-3 border border-[#B5C4F0] rounded-sm text-xs cursor-pointer hover:bg-[#B5C4F0] hover:text-white"
            onClick={submitReject}
          >
            Save
          </div>
        </DialogActions>
      </Dialog>
    </>
  );
}
