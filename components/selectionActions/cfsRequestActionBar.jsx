"use client";
import React, { useEffect, useMemo, useState } from "react";
import { Box, Tooltip } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RequestPageIcon from "@mui/icons-material/RequestPage";
import { getDataWithCondition } from "@/apis";

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
}) {
  const [cfsStatus, setCfsStatus] = useState(null);
  const [isDisableBtn, setIsDisableBtn] = useState({
    isRequestDisable: false,
    isRequestAmdDisable: false,
    isRejAndAprAmdDisable: false,
    isRejAndConfDisable: false,
  });

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

  useEffect(() => {
    async function checkStatus() {
      const obj = {
        columns: "cfsRequestStatusId",
        tableName: "tblBl",
        whereCondition: `id in (${ids.join(",")}) and status = 1`,
      };
      const { data } = await getDataWithCondition(obj);

      const filterStatus = cfsStatus?.filter(
        (item) =>
          item.Name !== "Reject" && item.Name !== "Confirm for Amendment" && item.Name !== "Pending"
      );
      const filterCheckReq = data?.some((item) =>
        filterStatus?.some((status) => status.Id === item.cfsRequestStatusId)
      );
      setIsDisableBtn((prev) => ({
        ...prev,
        isRequestDisable: filterCheckReq,
      }));

      const filterStatusAmd = cfsStatus?.filter(
        (item) => item.Name !== "Confirm"
      );
      const hasNonEmpty = data?.every((obj) => Object.keys(obj).length > 0);
      let filterCheckReqAmd = data?.some((item) =>
        filterStatusAmd?.some((status) => status.Id === item.cfsRequestStatusId)
      );
      if (!hasNonEmpty) {
        filterCheckReqAmd = true;
      }
      setIsDisableBtn((prev) => ({
        ...prev,
        isRequestAmdDisable: filterCheckReqAmd,
      }));

      const filterStatusAprAndRejAmd = cfsStatus?.filter(
        (item) => item.Name !== "Request for Amendment"
      );
      const filterCheckAprAndRejAmd = data?.some((item) =>
        filterStatusAprAndRejAmd?.some(
          (status) => status.Id === item.cfsRequestStatusId
        )
      );
      setIsDisableBtn((prev) => ({
        ...prev,
        isRejAndAprAmdDisable: filterCheckAprAndRejAmd,
      }));

      const filterStatusAprAndRej = cfsStatus?.filter(
        (item) => item.Name !== "Request"
      );
      const filterCheckAprAndRej = data?.some((item) =>
        filterStatusAprAndRej?.some(
          (status) => status.Id === item.cfsRequestStatusId
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
    async function getCfsStatus() {
      const obj = {
        columns: "id as Id, name as Name",
        tableName: "tblMasterData",
        whereCondition: `masterListName = 'tblCfsStatusType' and status = 1`,
      };
      const { data } = await getDataWithCondition(obj);
      setCfsStatus(data);
    }

    getCfsStatus();
  }, []);

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
            disabled={!hasAny || isDisableBtn?.isRequestDisable}
          />
        )}
        {onReject && (
          <Segment
            label="Reject"
            icon={<CancelIcon />}
            onClick={() => onReject?.(ids)}
            disabled={
              !hasAny ||
              isDisableBtn?.isRejAndConfDisable ||
              !isDisableBtn?.isRejAndAprAmdDisable
            }
          />
        )}
        {onConfirm && (
          <Segment
            label="Confirm"
            icon={<CheckCircleIcon />}
            onClick={() => onConfirm?.(ids)}
            disabled={
              !hasAny ||
              isDisableBtn?.isRejAndConfDisable ||
              !isDisableBtn?.isRejAndAprAmdDisable
            }
          />
        )}
        {onRequestAmendment && (
          <Segment
            label="Request for Amendment"
            icon={<RequestPageIcon />}
            onClick={() => onRequestAmendment?.(ids)}
            disabled={!hasAny || isDisableBtn?.isRequestAmdDisable}
          />
        )}
        {onRejectAmendment && (
          <Segment
            label="Reject for Amendment"
            icon={<CancelIcon />}
            onClick={() => onRejectAmendment?.(ids)}
            disabled={!hasAny || isDisableBtn?.isRejAndAprAmdDisable}
          />
        )}
        {onConfirmAmendment && (
          <Segment
            label="Confirm for Amendment"
            icon={<CheckCircleIcon />}
            onClick={() => onConfirmAmendment?.(ids)}
            disabled={!hasAny || isDisableBtn?.isRejAndAprAmdDisable}
          />
        )}
      </div>
    </Box>
  );
}
