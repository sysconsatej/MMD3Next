"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  Box,
  Typography,
  IconButton,
  Chip,
  Tooltip,
  Badge,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";

const CompactMultiFileUpload = ({
  label = "Attachments",
  accept = "*/*", // e.g. "image/*,.pdf"
  onChange, // returns array of File objects
  maxHeight = 160, // max height of file list area
}) => {
  const inputRef = useRef(null);
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  // cleanup preview URLs
  useEffect(() => {
    return () => {
      files.forEach((f) => {
        if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
      });
    };
  }, [files]);

  const openPicker = () => {
    inputRef.current?.click();
  };

  const addFiles = (fileList) => {
    const selected = Array.from(fileList || []);
    if (!selected.length) return;

    const mapped = selected.map((file) => ({
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      previewUrl: file.type.startsWith("image/")
        ? URL.createObjectURL(file)
        : null,
    }));

    const next = [...files, ...mapped];
    setFiles(next);
    onChange?.(next.map((f) => f.file));
  };

  const handleInputChange = (e) => {
    addFiles(e.target.files);
    e.target.value = null;
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const handleRemove = (idx) => {
    const next = [...files];
    const removed = next.splice(idx, 1)[0];
    if (removed?.previewUrl) URL.revokeObjectURL(removed.previewUrl);
    setFiles(next);
    onChange?.(next.map((f) => f.file));
  };

  const isPdf = (type, name) =>
    type === "application/pdf" || name?.toLowerCase().endsWith(".pdf");

  const formatSize = (size) => {
    if (!size && size !== 0) return "";
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
      {/* Label + count */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
        }}
      >
        <Typography variant="subtitle2" sx={{ fontSize: 12, fontWeight: 500 }}>
          {label}
        </Typography>

        <Badge
          badgeContent={files.length}
          color="primary"
          overlap="circular"
          sx={{
            "& .MuiBadge-badge": { fontSize: 10, height: 16, minWidth: 16 },
          }}
        >
          <UploadFileIcon
            onClick={openPicker}
            style={{ cursor: "pointer", fontSize: 20 }}
          />
        </Badge>
      </Box>

      {/* Hidden input */}
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={accept}
        style={{ display: "none" }}
        onChange={handleInputChange}
      />

      {/* Compact drag area */}
      <Box
        onClick={openPicker}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        sx={{
          mt: 0.2,
          borderRadius: 1,
          borderStyle: "dashed",
          borderWidth: 1,
          borderColor: isDragging ? "primary.main" : "divider",
          px: 1,
          py: 0.5,
          minHeight: 34,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
          backgroundColor: (theme) =>
            isDragging
              ? theme.palette.action.hover
              : theme.palette.background.paper,
        }}
      >
        <Typography
          variant="caption"
          sx={{
            fontSize: 11,
            color: "text.secondary",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          Drag & drop files here, or click to select
        </Typography>
        <Typography
          variant="caption"
          sx={{ fontSize: 10, color: "text.disabled" }}
        >
          {accept === "*/*" ? "Any file" : accept}
        </Typography>
      </Box>

      {/* Compact file list */}
      {files.length > 0 && (
        <Box
          sx={{
            mt: 0.5,
            borderRadius: 1,
            border: "1px solid",
            borderColor: "divider",
            maxHeight,
            overflowY: "auto",
            px: 0.5,
            py: 0.25,
          }}
        >
          {files.map((f, idx) => (
            <Box
              key={`${f.name}-${idx}`}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.75,
                py: 0.25,
                borderBottom:
                  idx === files.length - 1
                    ? "none"
                    : "1px solid rgba(255,255,255,0.04)",
              }}
            >
              {/* Tiny thumbnail / icon area */}
              <Box
                sx={{
                  width: 26,
                  height: 26,
                  borderRadius: 0.75,
                  overflow: "hidden",
                  flexShrink: 0,
                  bgcolor: "action.hover",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 10,
                }}
              >
                {f.previewUrl ? (
                  <img
                    src={f.previewUrl}
                    alt={f.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : isPdf(f.type, f.name) ? (
                  "PDF"
                ) : (
                  "FILE"
                )}
              </Box>

              {/* Name + size */}
              <Box
                sx={{
                  flex: 1,
                  minWidth: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 0.1,
                }}
              >
                <Tooltip title={f.name}>
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: 11,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {f.name}
                  </Typography>
                </Tooltip>
                <Typography
                  variant="caption"
                  sx={{ fontSize: 10, color: "text.secondary" }}
                >
                  {formatSize(f.size)}
                </Typography>
              </Box>

              {/* Type chip (tiny) */}
              <Chip
                label={isPdf(f.type, f.name) ? "PDF" : f.type || "file"}
                size="small"
                sx={{
                  maxWidth: 80,
                  fontSize: 9,
                  height: 18,
                  ".MuiChip-label": {
                    px: 0.5,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  },
                }}
              />

              {/* Actions */}
              <Box sx={{ display: "flex", alignItems: "center", ml: 0.5 }}>
                {isPdf(f.type, f.name) && (
                  <Tooltip title="Open">
                    <IconButton
                      size="small"
                      onClick={() =>
                        window.open(URL.createObjectURL(f.file), "_blank")
                      }
                    >
                      <VisibilityIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                )}

                <Tooltip title="Remove">
                  <IconButton size="small" onClick={() => handleRemove(idx)}>
                    <DeleteIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default CompactMultiFileUpload;
