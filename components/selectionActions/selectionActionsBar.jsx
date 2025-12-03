"use client";
import React, { useEffect, useMemo, useState } from "react";
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
import { getDataWithCondition, updateStatusRows } from "@/apis";
import { getUserByCookies } from "@/utils";

export default function SelectionActionsBar({
  selectedIds = [],
  tableName,
  keyColumn = "id",
  onView,
  onEdit,
  onDelete,
  onUpdated,
  allowBulkDelete = false,
  isDelete = false,
  isRequest = false,
  isReject = false,
  isVerify = false,
  isEdit = false,
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

  const [rejectOpen, setRejectOpen] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [hblStatus, setHblStatus] = useState(null);
  const [isRequestDisable, setIsRequestDisable] = useState(false);
  const userData = getUserByCookies();

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
    const requestStatus = hblStatus.filter((item) => item.Name === "Request");
    const rowsPayload = ids.flatMap((keyVal) =>
      keyVal.split(",").map((id) => {
        return {
          [keyColumn]: id,
          hblRequestStatus: requestStatus[0].Id,
          hblRequestRemarks: null,
          requestedBy: userData.userId,
          requestDate: new Date(),
        };
      })
    );
    await applyUpdate(rowsPayload, "Requested");
  };

  const handleVerify = async () => {
    if (!hasAny) return;
    const veriFyStatus = hblStatus.filter((item) => item.Name === "Confirm");
    const rowsPayload = ids.flatMap((keyVal) =>
      keyVal.split(",").map((id) => {
        return {
          [keyColumn]: id,
          hblRequestStatus: veriFyStatus[0].Id,
          hblRequestRemarks: null,
          verifiedBy: userData.userId,
          verifyDate: new Date(),
        };
      })
    );
    await applyUpdate(rowsPayload, "Verified");
  };

  const submitReject = async () => {
    if (!hasAny) return;
    const rejectStatus = hblStatus.filter((item) => item.Name === "Reject");
    const rowsPayload = ids.flatMap((keyVal) =>
      keyVal.split(",").map((id) => {
        return {
          [keyColumn]: id,
          hblRequestStatus: rejectStatus[0].Id,
          hblRequestRemarks: (remarks || "").trim() || null,
          rejectedBy: userData.userId,
          rejectDate: new Date(),
        };
      })
    );
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

  useEffect(() => {
    async function checkStatus() {
      const obj = {
        columns: "hblRequestStatus",
        tableName: "tblBl",
        whereCondition: `id in (${ids.join(",")}) and status = 1`,
      };
      const { data } = await getDataWithCondition(obj);
      const filterStatus = hblStatus.filter((item) => item.Name !== "Reject");
      const filterCheck = data?.some((item) =>
        filterStatus.some((status) => status.Id === item.hblRequestStatus)
      );
      setIsRequestDisable(filterCheck);
    }
    checkStatus();
  }, [ids, isRequestDisable]);

  useEffect(() => {
    async function getHblStatus() {
      const obj = {
        columns: "id as Id, name as Name",
        tableName: "tblMasterData",
        whereCondition: `masterListName = 'tblHblStatus' and status = 1`,
      };
      const { data } = await getDataWithCondition(obj);
      setHblStatus(data);
    }

    getHblStatus();
  }, []);

  return (
    <>
      <Box className="flex items-center justify-between">
        <div className="flex border text-black border-[#B5C4F0] mt-2 text-xs rounded-sm overflow-hidden">
          <Segment
            label="View"
            onClick={() => isSingle && onView && onView(ids[0])}
            disabled={!isSingle}
          />
          {isEdit && (
            <Segment
              label="Edit"
              onClick={() => isSingle && onEdit && onEdit(ids[0])}
              disabled={!isSingle || isRequestDisable}
            />
          )}
          {isDelete && (
            <Segment
              label="Delete"
              onClick={() => {
                if (!onDelete) return;
                if (allowBulkDelete) {
                  onDelete(ids);
                } else if (isSingle) {
                  onDelete(ids[0]);
                }
              }}
              disabled={allowBulkDelete ? !hasAny : !isSingle}
            />
          )}
          {isRequest && (
            <Segment
              label="Request"
              onClick={handleRequest}
              disabled={!hasAny || isRequestDisable}
            />
          )}
          {isReject && (
            <Segment label="Reject" onClick={openReject} disabled={!hasAny} />
          )}
          {isVerify && (
            <Segment
              label="Verify"
              onClick={handleVerify}
              disabled={!hasAny}
              isLast
            />
          )}
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
