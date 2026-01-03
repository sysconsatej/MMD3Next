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

export function DoHistoryModal({ historyModal, setHistoryModal }) {
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
      console.error("DO History Error:", err);
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
          DO History
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
              "& .sr-col": {
                width: 40,
                maxWidth: 40,
              },
            }}
          >
            {/* ===================== TABLE HEAD ===================== */}
            <TableHead>
              <TableRow>
                <TableCell className="sr-col">Sr. No.</TableCell>
                <TableCell>Date & Time</TableCell>
                <TableCell>Requester Name</TableCell>
                <TableCell>Requester Id</TableCell>
                <TableCell>Liner Name</TableCell>
                <TableCell>Liner Id</TableCell>
                <TableCell>Contact No</TableCell>
                <TableCell>Field Name</TableCell>
                <TableCell>Old Value</TableCell>
                <TableCell>New Value</TableCell>
                <TableCell>Rejection Remarks</TableCell>
                <TableCell>Remark</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>

            {/* ===================== TABLE BODY ===================== */}
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={15} align="center">
                    No history found
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((r, i) => (
                  <TableRow key={i}>
                    <TableCell className="sr-col">{i + 1}</TableCell>
                    <TableCell>{r.date}</TableCell>
                    <TableCell>{r.requesterName}</TableCell>
                    <TableCell>{r.requesterId}</TableCell>
                    <TableCell>{r.linerName}</TableCell>
                    <TableCell>{r.linerId}</TableCell>
                    <TableCell>{r.contactNo}</TableCell>
                    <TableCell>{r.fieldName}</TableCell>
                    <TableCell>{r.oldValue}</TableCell>
                    <TableCell>{r.newValue}</TableCell>
                    <TableCell>{r.rejectionRemarks}</TableCell>
                    <TableCell>{r.remark}</TableCell>
                    <TableCell
                      sx={{
                        color: statusColor(r.status),
                        fontWeight: 600,
                      }}
                    >
                      {r.status}
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
