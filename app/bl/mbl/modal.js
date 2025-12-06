"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
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

import { statusColor } from "./utils";
import { fetchHistoryBl } from "@/apis";

export default function BLHistoryModal({ open, onClose, recordId, blNumber }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [windowMode, setWindowMode] = useState("normal");

  useEffect(() => {
    if (open) {
      setWindowMode("normal");
      loadHistory();
    }
  }, [open]);

  const loadHistory = async () => {
    try {
      setLoading(true);

      const res = await fetchHistoryBl({
        tableName: "tblBl",
        recordId,
      });

      if (res?.success) {
        setRows(res.data || []);
      } else {
        setRows([]);
      }
    } catch (err) {
      console.error("BL History error:", err);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={windowMode === "maximized"}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          m: windowMode === "maximized" ? 0 : 4,
          overflow: "hidden",
        },
      }}
    >
      {/* HEADER BAR */}
      <Box
        sx={{
          px: 2,
          py: 1,
          bgcolor: "#1f1f1f",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
          View History
        </Typography>

        <Box sx={{ display: "flex", gap: 1 }}>
          <IconButton
            size="small"
            sx={{ color: "#fff" }}
            onClick={() =>
              setWindowMode((prev) =>
                prev === "maximized" ? "normal" : "maximized"
              )
            }
          >
            <CropSquareIcon fontSize="inherit" />
          </IconButton>

          <IconButton size="small" sx={{ color: "#fff" }} onClick={onClose}>
            <CloseIcon fontSize="inherit" />
          </IconButton>
        </Box>
      </Box>

      {/* CONTENT */}
      <DialogContent dividers sx={{ minHeight: "300px" }}>
        <Typography sx={{ fontWeight: 700, mb: 2 }}>
          BL No. <span style={{ fontWeight: 400 }}>{blNumber}</span>
        </Typography>

        {loading ? (
          <Box className="flex justify-center py-6">
            <CircularProgress size={26} />
          </Box>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Sr. No.</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Login Id</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    align="center"
                    sx={{ py: 3, fontWeight: 500, color: "#777" }}
                  >
                    No Data Found
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell>{row.date}</TableCell>
                    <TableCell>{row.loginId}</TableCell>
                    <TableCell
                      sx={{
                        color: statusColor(row.status.replace(/\s+/g, "")),
                      }}
                    >
                      {row.status}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </DialogContent>
    </Dialog>
  );
}
