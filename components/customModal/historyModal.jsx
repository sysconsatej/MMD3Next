"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  CircularProgress,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Box,
  Typography,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CropSquareIcon from "@mui/icons-material/CropSquare";
import { fetchHistory } from "@/apis/history";

export default function HistoryModal({
  open,
  onClose,
  tableName,
  recordId,
  title = "History",
}) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [windowMode, setWindowMode] = useState("normal"); // "normal" | "maximized"

  // reset mode whenever reopened
  useEffect(() => {
    if (open) setWindowMode("normal");
  }, [open]);

  useEffect(() => {
    if (!open || !tableName || !recordId) return;

    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setErrorMsg("");
        setRows([]);

        const res = await fetchHistory({ tableName, recordId });

        if (cancelled) return;

        if (res?.success) {
          setRows(res.data || []);
        } else {
          setErrorMsg(res?.message || "Failed to fetch history.");
        }
      } catch (err) {
        console.error("History load error:", err);
        if (!cancelled) setErrorMsg("Failed to fetch history.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [open, tableName, recordId]);

  const handleClose = () => onClose?.();

  const handleMaximizeToggle = () =>
    setWindowMode((prev) => (prev === "maximized" ? "normal" : "maximized"));

  const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullScreen={windowMode === "maximized"}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          m: windowMode === "maximized" ? 0 : 4,
          p: 0,
          overflow: "hidden",
        },
      }}
    >
      {/* Title bar with □ X */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 1.5,
          py: 0.5,
          bgcolor: "#1f1f1f",
          color: "#fff",
        }}
      >
        <Typography
          variant="body2"
          sx={{ fontWeight: 500, userSelect: "none", whiteSpace: "nowrap" }}
        >
          {title}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          {/* Maximize / Restore */}
          <IconButton
            size="small"
            onClick={handleMaximizeToggle}
            sx={{
              color: "#fff",
              "&:hover": { bgcolor: "rgba(255,255,255,0.08)" },
            }}
          >
            <CropSquareIcon fontSize="inherit" />
          </IconButton>

          {/* Close */}
          <IconButton
            size="small"
            onClick={handleClose}
            sx={{
              color: "#fff",
              "&:hover": { bgcolor: "rgba(232,17,35,0.8)" },
            }}
          >
            <CloseIcon fontSize="inherit" />
          </IconButton>
        </Box>
      </Box>

      <DialogContent
        dividers
        sx={{ px: 2, py: 1.5, maxHeight: "70vh", overflow: "auto" }}
      >
        {loading ? (
          <Box className="flex justify-center py-6">
            <CircularProgress size={24} />
          </Box>
        ) : errorMsg ? (
          <Typography color="error" variant="body2">
            {errorMsg}
          </Typography>
        ) : rows.length === 0 ? (
          <Typography variant="body2">No history found.</Typography>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                {columns.map((col) => (
                  <TableCell key={col} sx={{ fontWeight: 600 }}>
                    {col}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row, idx) => (
                <TableRow key={idx}>
                  {columns.map((col) => (
                    <TableCell key={col}>
                      {row[col] != null ? String(row[col]) : ""}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DialogContent>
    </Dialog>
  );
}
