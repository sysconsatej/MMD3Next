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
import { statusColor } from "../utils";

export function CfsHistoryModal({ historyModal, setHistoryModal }) {
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
        spName: "dbo.getCfsHistory",
        recordId,
      });
      setRows(success ? data || [] : []);
    } catch (err) {
      console.error("CFS History Error:", err);
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
          CFS History
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

      {/* Content */}
      <DialogContent dividers sx={{ minHeight: 400 }}>
        <Typography fontWeight={700} mb={2}>
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
              "& th, & td": {
                fontSize: 11,
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
                <TableCell className="sr-col">Sr No</TableCell>
                <TableCell>Date & Time</TableCell>
                <TableCell>MBL Number</TableCell>
                <TableCell>Shipping Line</TableCell>
                <TableCell>User Name</TableCell>
                <TableCell>User Id</TableCell>
                <TableCell>Contact No</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Field Name</TableCell>
                <TableCell>Old Value</TableCell>
                <TableCell>New Value</TableCell>
                <TableCell>Rejection Remark</TableCell>
                <TableCell>Amendment Remark</TableCell>
                <TableCell>Confirmed Date & Time</TableCell>
                <TableCell>Rejection Date & Time</TableCell>
              </TableRow>
            </TableHead>

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

                    <TableCell>{r["Date and Time"]}</TableCell>
                    <TableCell>{r["MBL Number"]}</TableCell>
                    <TableCell>{r["Shipping Line"]}</TableCell>
                    <TableCell>{r["User Name"]}</TableCell>
                    <TableCell>{r["User Id"]}</TableCell>
                    <TableCell>{r["Contact No"]}</TableCell>

                    <TableCell
                      sx={{
                        color: statusColor(r["Status"]?.replace(/\s+/g, "")),
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
                    <TableCell>{r["Rejection Date and time"]}</TableCell>
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
