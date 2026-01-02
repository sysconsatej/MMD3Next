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
import { fetchInvoiceHistory } from "@/apis";
import { statusColor } from "./invoiceRequestData";

export default function CustomerHistoryModal({
  open,
  onClose,
  requestId,
  customer,
}) {
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
    if (!requestId) return;

    try {
      setLoading(true);

      const res = await fetchInvoiceHistory({
        recordId: requestId,
      });

      if (res?.success) {
        setRows(res.data || []);
      } else {
        setRows([]);
      }
    } catch (err) {
      console.error("InvoiceHistory error:", err);
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
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: {
          m: windowMode === "maximized" ? 0 : 4,
          overflow: "auto",
        },
      }}
    >
      {/* ---------- HEADER ---------- */}
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
          Invoice History
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

      {/* ---------- CONTENT ---------- */}
      <DialogContent dividers sx={{ minHeight: "260px" }}>
        <Typography sx={{ fontWeight: 700, mb: 1 }}>
          BL NO: <span style={{ fontWeight: 400 }}>{customer || "-"}</span>
        </Typography>

        {loading ? (
          <Box className="flex justify-center py-6">
            <CircularProgress size={26} />
          </Box>
        ) : (
          <Table
            size="small"
            sx={{
              tableLayout: "fixed",
              width: "100%",
              "& th": {
                whiteSpace: "normal",
                wordBreak: "break-word",
                padding: "4px 6px",
                fontSize: 11,
                backgroundColor: "#a9b8ec",
              },
              "& td": {
                whiteSpace: "normal",
                wordBreak: "break-word",
                padding: "4px 6px",
                fontSize: 11,
              },
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell>Sr.</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Requester Name</TableCell>
                <TableCell>Requester Id</TableCell>
                <TableCell>Field Name</TableCell>
                <TableCell>Old Value</TableCell>
                <TableCell>New Value</TableCell>
                <TableCell>Modify By</TableCell>
                <TableCell>Modify Date & timestamp</TableCell>
                <TableCell>Liner Name</TableCell>
                <TableCell>Contact No</TableCell>
                <TableCell>Rejection Remarks</TableCell>
                <TableCell>Remark</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={14} align="center">
                    No history found
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell>{row.date}</TableCell>
                    <TableCell>{row["Requester Name"]}</TableCell>
                    <TableCell>{row["Requester Id"]}</TableCell>
                    <TableCell>{row["Field Name"]}</TableCell>
                    <TableCell>{row["Old Value"]}</TableCell>
                    <TableCell>{row["New Value"]}</TableCell>
                    <TableCell>{row["Modify By"]}</TableCell>
                    <TableCell>{row["Modify Date & timestamp"]}</TableCell>
                    <TableCell>{row["Liner Name"]}</TableCell>
                    <TableCell>{row["Contact No"]}</TableCell>
                    <TableCell>{row["Rejection Remarks"]}</TableCell>
                    <TableCell>{row["Remark"]}</TableCell>
                    <TableCell
                      sx={{
                        color: statusColor(row["Status"]),
                        fontWeight: 600,
                      }}
                    >
                      {row["Status"]}
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
