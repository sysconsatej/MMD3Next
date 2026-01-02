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
import { fetchInvoiceReleaseHistory } from "@/apis/history";
import { statusColor } from "../utils";

export function CfsHistoryLinerModal({ historyModal, setHistoryModal }) {
  const { toggle, value: mblNo } = historyModal;

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [windowMode, setWindowMode] = useState("normal");

  useEffect(() => {
    if (toggle) {
      setWindowMode("normal");
      loadHistory();
    }
  }, [toggle]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const { success, data } = await fetchInvoiceReleaseHistory({ mblNo });
      setRows(success ? data || [] : []);
    } catch (err) {
      console.error("BL History Error:", err);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={toggle}
      onClose={() => setHistoryModal({ toggle: false, value: null })}
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
      {/* Header */}
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
          CFS Request History
        </Typography>

        <Box sx={{ display: "flex", gap: 1 }}>
          <IconButton
            size="small"
            sx={{ color: "#fff" }}
            onClick={() =>
              setWindowMode((p) =>
                p === "maximized" ? "normal" : "maximized"
              )
            }
          >
            <CropSquareIcon fontSize="inherit" />
          </IconButton>

          <IconButton
            size="small"
            sx={{ color: "#fff" }}
            onClick={() =>
              setHistoryModal({ toggle: false, value: null })
            }
          >
            <CloseIcon fontSize="inherit" />
          </IconButton>
        </Box>
      </Box>

      {/* Content */}
      <DialogContent
        dividers
        sx={{
          minHeight: 400,
          p: 2,
          overflow: "auto",
        }}
      >
        <Typography sx={{ fontWeight: 700, mb: 2 }}>
          MBL No: <span style={{ fontWeight: 400 }}>{mblNo}</span>
        </Typography>

        {loading ? (
          <Box className="flex justify-center py-6">
            <CircularProgress size={26} />
          </Box>
        ) : (
          <Table
            size="small"
            sx={{
              tableLayout: "fixed", // ✅ SAME AS INVOICE
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
              "& .sr-col": {
                width: 40,
                maxWidth: 40,
              },
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell className="sr-col">Sr. No.</TableCell>
                <TableCell>MBL Number</TableCell>
                <TableCell>HBL Number</TableCell>
                <TableCell>User Name</TableCell>
                <TableCell>User ID</TableCell>
                <TableCell>Company Name</TableCell>
                <TableCell>Contact No</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Field Name</TableCell>
                <TableCell>Old Value</TableCell>
                <TableCell>New Value</TableCell>
                <TableCell>Rejection Remark</TableCell>
                <TableCell>Amendment Remark</TableCell>
                <TableCell>Confirmed By</TableCell>
                <TableCell>Confirmed Date & Time</TableCell>
                <TableCell>Rejected By</TableCell>
                <TableCell>Rejected Date & Time</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={17} align="center">
                    No history found
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((r, i) => (
                  <TableRow key={i}>
                    <TableCell className="sr-col">{i + 1}</TableCell>
                    <TableCell>{r.mblNo}</TableCell>
                    <TableCell>{r.hblNo}</TableCell>
                    <TableCell>{r.userName}</TableCell>
                    <TableCell>{r.userId}</TableCell>
                    <TableCell>{r.companyName}</TableCell>
                    <TableCell>{r.contactNo}</TableCell>
                    <TableCell
                      sx={{
                        color: statusColor(r.status),
                        fontWeight: 600,
                      }}
                    >
                      {r.status}
                    </TableCell>
                    <TableCell>{r.fieldName}</TableCell>
                    <TableCell>{r.oldValue}</TableCell>
                    <TableCell>{r.newValue}</TableCell>
                    <TableCell>{r.rejectionRemark}</TableCell>
                    <TableCell>{r.amendmentRemark}</TableCell>
                    <TableCell>{r.confirmedBy}</TableCell>
                    <TableCell>{r.confirmedDate}</TableCell>
                    <TableCell>{r.rejectedBy}</TableCell>
                    <TableCell>{r.rejectedDate}</TableCell>
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
