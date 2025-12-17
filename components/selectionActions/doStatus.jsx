"use client";
import React from "react";
import { Box, Checkbox } from "@mui/material";
import DescriptionIcon from "@mui/icons-material/Description";
import AttachFileIcon from "@mui/icons-material/AttachFile";

export default function DoStatusToolbar({
  values = {},
  onAdvanceBL,
  onNotificationHistory,
  onRemarksHold,
  onReRequest,
  onSeawayBL,
  onAttachments,
  onAutoDoRequest,
}) {
  const Item = ({ label, color, icon, checked, onChange }) => (
    <Box
      className="flex items-center gap-1 px-2 py-[2px] rounded-sm text-[11px] border cursor-pointer"
      sx={{
        backgroundColor: color,
        borderColor: "#ccc",
      }}
      onClick={() => onChange(!checked)}
    >
      <Checkbox
        size="small"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        sx={{
          p: 0.2,
          "& .MuiSvgIcon-root": { fontSize: 14 },
        }}
      />

      {icon && (
        <span className="inline-flex items-center">
          {React.cloneElement(icon, { sx: { fontSize: 12, opacity: 0.8 } })}
        </span>
      )}

      <span>{label}</span>
    </Box>
  );

  return (
    <Box className="flex gap-2 flex-wrap my-2">
      <Item label="Advance BL" color="#f8cccc" checked={values.advanceBL} onChange={onAdvanceBL} />
      <Item
        label="Notification History"
        color="#f1f1f1"
        checked={values.notificationHistory}
        onChange={onNotificationHistory}
      />
      <Item label="Remarks for Hold" color="#fff" checked={values.remarksHold} onChange={onRemarksHold} />
      <Item label="Re - Request" color="#d1e7dd" checked={values.reRequest} onChange={onReRequest} />
      <Item
        label="Seaway BL/Telex BL"
        color="#fff3cd"
        icon={<DescriptionIcon />}
        checked={values.seawayBL}
        onChange={onSeawayBL}
      />
      <Item
        label="Attachments"
        color="#f1f1f1"
        icon={<AttachFileIcon />}
        checked={values.attachments}
        onChange={onAttachments}
      />
      <Item
        label="Auto DO Request"
        color="#fff"
        checked={values.autoDoRequest}
        onChange={onAutoDoRequest}
      />
    </Box>
  );
}
