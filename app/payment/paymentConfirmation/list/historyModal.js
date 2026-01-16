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
import { fetchHistory } from "@/apis/history";
import { paymentStatusColor } from "../paymentConfirmationData";

export function PaymentHistoryModal({ historyModal, setHistoryModal }) {
  const { toggle, value: recordId, mblNo } = historyModal;

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [windowMode, setWindowMode] = useState("normal");

  useEffect(() => {
    if (toggle && recordId) {
      setWindowMode("normal");
      loadHistory();
    }
  }, [toggle, recordId]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const { success, data } = await fetchHistory({
        spName: "dbo.getPaymentHistory",
        recordId, // ✅ paymentId ONLY
      });
      setRows(success ? data || [] : []);
    } catch (err) {
      console.error("Payment History Error:", err);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={toggle}
      onClose={() =>
        setHistoryModal({
          toggle: false,
          value: null,
          mblNo: null,
        })
      }
      fullScreen={windowMode === "maximized"}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: {
          m: windowMode === "maximized" ? 0 : 4,
          overflow: "hidden",
        },
      }}
    >
      {/* ================= HEADER ================= */}
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
          Payment History
        </Typography>

        <Box sx={{ display: "flex", gap: 1 }}>
          <IconButton
            size="small"
            sx={{ color: "#fff" }}
            onClick={() =>
              setWindowMode((p) => (p === "maximized" ? "normal" : "maximized"))
            }
          >
            <CropSquareIcon fontSize="inherit" />
          </IconButton>

          <IconButton
            size="small"
            sx={{ color: "#fff" }}
            onClick={() =>
              setHistoryModal({
                toggle: false,
                value: null,
                mblNo: null,
              })
            }
          >
            <CloseIcon fontSize="inherit" />
          </IconButton>
        </Box>
      </Box>

      {/* ================= CONTENT ================= */}
      <DialogContent
        dividers
        sx={{
          minHeight: 400,
          p: 2,
          overflow: "auto",
        }}
      >
        <Typography sx={{ fontWeight: 700, mb: 2 }}>
          BL No: <span style={{ fontWeight: 400 }}>{mblNo}</span>
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
                fontWeight: 700,
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
                <TableCell>Sr. No.</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>User Name</TableCell>
                <TableCell>User ID</TableCell>
                <TableCell>Contact Number</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Field Name</TableCell>
                <TableCell>Old Value</TableCell>
                <TableCell>New Value</TableCell>
                <TableCell>Assigned To</TableCell>
                <TableCell>Assigned Date</TableCell>
                <TableCell>Rejection Remarks</TableCell>
                <TableCell>Rejected By</TableCell>
                <TableCell>Rejected Date & Time</TableCell>
                <TableCell>Confirmed By</TableCell>
                <TableCell>Confirmed Date & Time</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={16} align="center">
                    No history found
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((r, i) => (
                  <TableRow key={i}>
                    <TableCell>{i + 1}</TableCell>

                    <TableCell>{r["Date"]}</TableCell>
                    <TableCell>{r["User Name"]}</TableCell>
                    <TableCell>{r["User Id"]}</TableCell>
                    <TableCell>{r["Contact Number"]}</TableCell>

                    <TableCell
                      sx={{
                        color: paymentStatusColor(r["Status"]),

                        fontWeight: 600,
                      }}
                    >
                      {r["Status"]}
                    </TableCell>

                    <TableCell>{r["Field Name"]}</TableCell>
                    <TableCell>{r["Old Value"]}</TableCell>
                    <TableCell>{r["New Value"]}</TableCell>

                    <TableCell>{r["Assigned To"]}</TableCell>
                    <TableCell>{r["Assigned Date & Time"]}</TableCell>

                    <TableCell>{r["Rejection Remarks"]}</TableCell>
                    <TableCell>{r["Rejected By"]}</TableCell>
                    <TableCell>{r["Rejected Date & Time"]}</TableCell>

                    <TableCell>{r["Confirmed By"]}</TableCell>
                    <TableCell>{r["Confirmed date and Time"]}</TableCell>
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
