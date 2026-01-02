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

export function BLHistoryModal({ historyModal, setHistoryModal }) {
  const { toggle, value: mblNo } = historyModal;

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [windowMode, setWindowMode] = useState("normal");

  useEffect(() => {
    if (toggle && mblNo) {
      setWindowMode("normal");
      loadHistory();
    }
  }, [toggle, mblNo]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const { success, data } = await fetchInvoiceReleaseHistory({ mblNo });
      setRows(success ? data || [] : []);
    } catch (e) {
      console.error("BL History error", e);
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
          overflowX: "hidden", // 🚫 kill x-scroll at root
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
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography fontSize={14} fontWeight={600}>
          BL History
        </Typography>

        <Box>
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

      <DialogContent
        dividers
        sx={{
          minHeight: 400,
          overflowX: "hidden", // 🚫 no horizontal scroll
          overflowY: "auto",   // ✅ vertical scroll
        }}
      >
        <Typography fontWeight={700} mb={2}>
          MBL No: <span style={{ fontWeight: 400 }}>{mblNo}</span>
        </Typography>

        {loading ? (
          <Box className="flex justify-center py-6">
            <CircularProgress size={26} />
          </Box>
        ) : (
          <Box sx={{ width: "100%", overflowX: "hidden" }}>
            <Table
              size="small"
              sx={{
                tableLayout: "fixed", // ⭐ KEY FIX
                width: "100%",
                "& th, & td": {
                  fontSize: 11,
                  padding: "4px 6px",
                  whiteSpace: "normal",
                  wordBreak: "break-word",
                  overflowWrap: "break-word",
                },
              }}
            >
              <TableHead>
                <TableRow>
                  {[
                    "Sr No",
                    "MBL Number",
                    "HBL Number",
                    "User Name",
                    "User ID",
                    "Shipping Line",
                    "Contact Number",
                    "Status",
                    "Field Name",
                    "Old Value",
                    "New Value",
                    "Rejection Remark",
                    "Amendment Remark",
                    "Confirmed Date & Time",
                    "Rejected By",
                    "Rejected Date & Time",
                  ].map((h) => (
                    <TableCell key={h} sx={{ fontWeight: 700 }}>
                      {h}
                    </TableCell>
                  ))}
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
                      <TableCell>{i + 1}</TableCell>
                      <TableCell>{r.mblNo}</TableCell>
                      <TableCell>{r.hblNo}</TableCell>
                      <TableCell>{r.userName}</TableCell>
                      <TableCell>{r.userId}</TableCell>
                      <TableCell>{r.companyName}</TableCell>
                      <TableCell>{r.contactNo}</TableCell>
                      <TableCell sx={{ color: statusColor(r.status) }}>
                        {r.status}
                      </TableCell>

                      {/* text-heavy columns */}
                      <TableCell sx={{ maxWidth: 140 }}>{r.fieldName}</TableCell>
                      <TableCell sx={{ maxWidth: 140 }}>{r.oldValue}</TableCell>
                      <TableCell sx={{ maxWidth: 140 }}>{r.newValue}</TableCell>
                      <TableCell sx={{ maxWidth: 160 }}>
                        {r.rejectionRemark}
                      </TableCell>
                      <TableCell sx={{ maxWidth: 160 }}>
                        {r.amendmentRemark}
                      </TableCell>

                      <TableCell>{r.confirmedBy}</TableCell>
                      <TableCell>{r.confirmedDate}</TableCell>
                      <TableCell>{r.rejectedBy}</TableCell>
                      <TableCell>{r.rejectedDate}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
