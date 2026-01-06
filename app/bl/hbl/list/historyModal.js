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
import { fetchHistory, fetchInvoiceReleaseHistory } from "@/apis/history";
import { statusColor } from "../utils";

export function BLHistoryModal({ historyModal, setHistoryModal }) {
  const { toggle, value: hblId, mblNo } = historyModal;

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
      const { success, data } = await fetchHistory({
        spName: "dbo.getHblHistory",
        recordId: hblId,
      });
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
              setWindowMode((p) => (p === "maximized" ? "normal" : "maximized"))
            }
          >
            <CropSquareIcon fontSize="inherit" />
          </IconButton>

          <IconButton
            size="small"
            sx={{ color: "#fff" }}
            onClick={() => setHistoryModal({ toggle: false, value: null })}
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
          overflowY: "auto", // ✅ vertical scroll
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
                      <TableCell className="sr-col">{i + 1}</TableCell>

                      <TableCell>{r["MBL Number"]}</TableCell>
                      <TableCell>{r["HBL Number"]}</TableCell>
                      <TableCell>{r["User Name"]}</TableCell>
                      <TableCell>{r["User ID"]}</TableCell>

                      {/* Company Name nahi hai, Shipping Line hai */}
                      <TableCell>{r["Shipping Line"]}</TableCell>

                      <TableCell>{r["Contact Number"]}</TableCell>

                      <TableCell
                        sx={{
                          color: statusColor(r["Status"]),
                          fontWeight: 600,
                        }}
                      >
                        {r["Status"]}
                      </TableCell>

                      <TableCell>{r["Field Name"]}</TableCell>
                      <TableCell>{r["Old Value"]}</TableCell>
                      <TableCell>{r["New Value"]}</TableCell>
                      <TableCell>{r["Rejection Remark"]}</TableCell>
                      <TableCell>{r["Amendment Remark"]}</TableCell>

                      <TableCell>{r["Confirmed Date and Time"]}</TableCell>
                      <TableCell>{r["Rejected By"]}</TableCell>
                      <TableCell>{r["Rejected Date and Time"]}</TableCell>
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
