"use client";
import React, { useState } from "react";
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
}) {
  const count = selectedIds.length;
  if (count === 0) return null; // hide when nothing selected

  const isSingle = count === 1;
  const hasAny = count > 0;

  // reject dialog state (remarks only)
  const [rejectOpen, setRejectOpen] = useState(false);
  const [remarks, setRemarks] = useState("");

  const openReject = () => {
    setRemarks("");
    setRejectOpen(true);
  };
  const closeReject = () => setRejectOpen(false);

  // ---- helper to call API ----
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

  // REQUEST: set blStatus to "Requested" (no dialog)
  const handleRequest = async () => {
    if (!hasAny) return;
    const rowsPayload = selectedIds.map((id) => ({
      id,
      blStatus: "Requested",
      remarks: null,
    }));
    await applyUpdate(rowsPayload, "Requested");
  };

  // VERIFY: set blStatus to "Verified" (no dialog)
  const handleVerify = async () => {
    if (!hasAny) return;
    const rowsPayload = selectedIds.map((id) => ({
      id,
      blStatus: "Verified",
      remarks: null,
    }));
    await applyUpdate(rowsPayload, "Verified");
  };

  // REJECT: set blStatus to "Rejected" (with remarks)
  const submitReject = async () => {
    const rowsPayload = selectedIds.map((id) => ({
      id,
      blStatus: "Rejected",
      remarks: (remarks || "").trim() || null,
    }));
    const ok = await applyUpdate(rowsPayload, "Rejected");
    if (ok) closeReject();
  };

  // segment helper
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
          {/* Single-row actions */}
          <Segment
            label="View"
            onClick={() => isSingle && onView && onView(selectedIds[0])}
            disabled={!isSingle}
          />
          <Segment
            label="Edit"
            onClick={() => isSingle && onEdit && onEdit(selectedIds[0])}
            disabled={!isSingle}
          />
          <Segment
            label="Delete"
            onClick={() => isSingle && onDelete && onDelete(selectedIds[0])}
            disabled={!isSingle}
          />
          {/* Bulk or single */}
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

      {/* Reject dialog (remarks only) */}
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
            onClick={closeReject}>
            Cancel
          </div>
          <div
            className="py-1 px-3 border border-[#B5C4F0] rounded-sm text-xs cursor-pointer hover:bg-[#B5C4F0] hover:text-white"
            onClick={submitReject}>
            Save
          </div>
        </DialogActions>
      </Dialog>
    </>
  );
}
