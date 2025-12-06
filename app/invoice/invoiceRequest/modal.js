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
        tableName: "tblInvoiceRequest",
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
          overflow: "hidden",
        },
      }}
    >
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

      <DialogContent dividers sx={{ minHeight: "260px" }}>
        <Typography sx={{ fontWeight: 700, mb: 1 }}>
          Bl NO: <span style={{ fontWeight: 400 }}>{customer || "-"}</span>
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
              "& .sr-col": {
                width: 40,
                maxWidth: 40,
              },
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell className="sr-col" sx={{ fontWeight: 700 }}>
                  Sr. No.
                </TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Login Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Login Id</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Shipping Line</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Shipping Email</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Telephone</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>
                  Rejection Remarks
                </TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Remarks</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} align="center">
                    No history found
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="sr-col">{idx + 1}</TableCell>
                    <TableCell>{row.date}</TableCell>
                    <TableCell>{row.loginName}</TableCell>
                    <TableCell>{row.loginId}</TableCell>
                    <TableCell>{row.shippingLine}</TableCell>
                    <TableCell>{row.shippingLineEmailId}</TableCell>
                    <TableCell>{row.shippingLineTelephoneNo}</TableCell>
                    <TableCell>{row.rejectionRemarks}</TableCell>
                    <TableCell>{row.remarks}</TableCell>
                    <TableCell sx={{ color: statusColor(row.status) }}>
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
