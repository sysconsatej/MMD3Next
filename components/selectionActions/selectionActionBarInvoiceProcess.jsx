// components/actions/InvoiceMiniToggles.js
"use client";
import React from "react";
import { Box, Checkbox, Tooltip } from "@mui/material";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";

export default function InvoiceMiniToggles({
  // controlled state
  reRequest = false,
  reProcess = false,
  hblCount = false,
  // handlers
  onToggle = (name, val) => {},
  onOpenNotifications = () => {},
  // disabled flags (optional)
  disabled = false,
}) {
  const Pill = ({ label, checked, onChange, bg, border, text }) => (
    <Tooltip title={label} arrow disableInteractive>
      <label
        className={[
          // smaller: tighter padding, font, radius, gap
          "inline-flex items-center gap-1 rounded-[3px] px-1.5 py-[2px] text-[11px] leading-none",
          "border select-none",
          disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer",
        ].join(" ")}
        style={{ background: bg, borderColor: border, color: text }}
      >
        <Checkbox
          size="small"
          disableRipple
          checked={!!checked}
          disabled={disabled}
          onChange={(e) => onChange?.(e.target.checked)}
          sx={{
            p: 0,
            mr: 0.5,
            "& .MuiSvgIcon-root": { fontSize: 12, verticalAlign: "middle" }, // smaller icon
          }}
        />
        <span className="font-medium">{label}</span>
      </label>
    </Tooltip>
  );

  const Btn = ({ label, onClick }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        "inline-flex items-center gap-1 rounded-[3px] px-1.5 py-[2px] text-[11px] leading-none",
        "border text-sky-600 border-slate-300 hover:bg-slate-50",
        disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer",
      ].join(" ")}
    >
      <AccessTimeRoundedIcon sx={{ fontSize: 14 }} />
      {label}
    </button>
  );

  return (
    <Box className="flex items-center gap-2 flex-wrap py-2">
      <Pill
        label="Re - Request"
        checked={reRequest}
        onChange={(v) => onToggle("reRequest", v)}
        bg="#fbe0e6"
        border="#e9b8c1"
        text="#6b3a46"
      />
      <Pill
        label="Re - Process"
        checked={reProcess}
        onChange={(v) => onToggle("reProcess", v)}
        bg="#ffe29a"
        border="#e6b94b"
        text="#6a5312"
      />
      <Pill
        label="HBL Count"
        checked={hblCount}
        onChange={(v) => onToggle("hblCount", v)}
        bg="#f2e9b3"
        border="#d6ca69"
        text="#5f5720"
      />
      <Btn label="Notification History" onClick={onOpenNotifications} />
    </Box>
  );
}
