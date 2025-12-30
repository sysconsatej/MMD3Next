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
  isRequestAmendment = false,
  isRejectAmendment = false,
  isVerifyAmendment = false,
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
  const [isDisableBtn, setIsDisableBtn] = useState({
    isRequestDisable: false,
    isRequestAmdDisable: false,
    isRejAndAprAmdDisable: false,
    isRejAndConfDisable: false,
  });
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
          updatedBy: userData.userId,
          updatedDate: new Date(),
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
          updatedBy: userData.userId,
          updatedDate: new Date(),
        };
      })
    );
    await applyUpdate(rowsPayload, "Verified");
  };

  const handleReqAmd = async () => {
    if (!hasAny) return;
    const veriFyStatus = hblStatus.filter(
      (item) => item.Name === "Request for Amendment"
    );
    const rowsPayload = ids.flatMap((keyVal) =>
      keyVal.split(",").map((id) => {
        return {
          [keyColumn]: id,
          hblRequestStatus: veriFyStatus[0].Id,
          hblRequestRemarks: null,
          updatedBy: userData.userId,
          updatedDate: new Date(),
        };
      })
    );
    await applyUpdate(rowsPayload, "Request for Amendment");
  };

  const handleVerifyAmd = async () => {
    if (!hasAny) return;
    const veriFyStatus = hblStatus.filter(
      (item) => item.Name === "Approved for Amendment"
    );
    const rowsPayload = ids.flatMap((keyVal) =>
      keyVal.split(",").map((id) => {
        return {
          [keyColumn]: id,
          hblRequestStatus: veriFyStatus[0].Id,
          hblRequestRemarks: null,
          updatedBy: userData.userId,
          updatedDate: new Date(),
        };
      })
    );
    await applyUpdate(rowsPayload, "Approved");
  };

  const submitReject = async (filterStatus) => {
    if (!hasAny) return;
    if (remarks) {
      const rejectStatus = hblStatus.filter(
        (item) => item.Name === filterStatus
      );
      const rowsPayload = ids.flatMap((keyVal) =>
        keyVal.split(",").map((id) => {
          return {
            [keyColumn]: id,
            hblRequestStatus: rejectStatus[0].Id,
            hblRequestRemarks: (remarks || "").trim() || null,
            updatedBy: userData.userId,
            updatedDate: new Date(),
          };
        })
      );
      const ok = await applyUpdate(rowsPayload, "Rejected");
      if (ok) closeReject();
    } else {
      toast.warn("Please enter reject remark!");
    }
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

      const filterStatus = hblStatus?.filter(
        (item) =>
          item.Name !== "Reject" && item.Name !== "Approved for Amendment"
      );
      const filterCheckReq = data?.some((item) =>
        filterStatus?.some((status) => status.Id === item.hblRequestStatus)
      );
      setIsDisableBtn((prev) => ({
        ...prev,
        isRequestDisable: filterCheckReq,
      }));

      const filterStatusAmd = hblStatus?.filter(
        (item) =>
          item.Name !== "Confirm" && item.Name !== "Reject for Amendment"
      );
      const hasNonEmpty = data?.every((obj) => Object.keys(obj).length > 0);
      let filterCheckReqAmd = data?.some((item) =>
        filterStatusAmd?.some((status) => status.Id === item.hblRequestStatus)
      );
      if (!hasNonEmpty) {
        filterCheckReqAmd = true;
      }
      setIsDisableBtn((prev) => ({
        ...prev,
        isRequestAmdDisable: filterCheckReqAmd,
      }));

      const filterStatusAprAndRejAmd = hblStatus?.filter(
        (item) => item.Name !== "Request for Amendment"
      );
      const filterCheckAprAndRejAmd = data?.some((item) =>
        filterStatusAprAndRejAmd?.some(
          (status) => status.Id === item.hblRequestStatus
        )
      );
      setIsDisableBtn((prev) => ({
        ...prev,
        isRejAndAprAmdDisable: filterCheckAprAndRejAmd,
      }));

      const filterStatusAprAndRej = hblStatus?.filter(
        (item) => item.Name !== "Request"
      );
      const filterCheckAprAndRej = data?.some((item) =>
        filterStatusAprAndRej?.some(
          (status) => status.Id === item.hblRequestStatus
        )
      );
      setIsDisableBtn((prev) => ({
        ...prev,
        isRejAndConfDisable: filterCheckAprAndRej,
      }));
    }
    checkStatus();
  }, [ids]);

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
        <div className="flex border text-black border-[#B5C4F0] mt-2 text-xs rounded-sm overflow-hidden whitespace-nowrap ">
          <Segment
            label="View"
            onClick={() => isSingle && onView && onView(ids[0])}
            disabled={!isSingle}
          />
          {isEdit && (
            <Segment
              label="Edit"
              onClick={() => isSingle && onEdit && onEdit(ids[0])}
              disabled={!isSingle || isDisableBtn?.isRequestDisable}
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
              disabled={!hasAny || isDisableBtn?.isRequestDisable}
            />
          )}
          {isReject && (
            <Segment
              label="Reject"
              onClick={openReject}
              disabled={
                !hasAny ||
                isDisableBtn?.isRejAndConfDisable ||
                !isDisableBtn?.isRejAndAprAmdDisable
              }
            />
          )}
          {isVerify && (
            <Segment
              label="Verify"
              onClick={handleVerify}
              disabled={
                !hasAny ||
                isDisableBtn?.isRejAndConfDisable ||
                !isDisableBtn?.isRejAndAprAmdDisable
              }
            />
          )}
          {isVerifyAmendment && (
            <Segment
              label="APR-AMD"
              onClick={handleVerifyAmd}
              disabled={!hasAny || isDisableBtn?.isRejAndAprAmdDisable}
            />
          )}
          {isRejectAmendment && (
            <Segment
              label="REJ-AMD"
              onClick={openReject}
              disabled={!hasAny || isDisableBtn?.isRejAndAprAmdDisable}
              isLast
            />
          )}
          {isRequestAmendment && (
            <Segment
              label="REQ-AMD"
              onClick={handleReqAmd}
              disabled={!hasAny || isDisableBtn?.isRequestAmdDisable}
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
            onClick={() =>
              !isDisableBtn?.isRejAndAprAmdDisable
                ? submitReject("Reject for Amendment")
                : submitReject("Reject")
            }
          >
            Save
          </div>
        </DialogActions>
      </Dialog>
    </>
  );
}
