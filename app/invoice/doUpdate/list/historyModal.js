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

export function DoGENHistoryModal({ historyModal, setHistoryModal }) {
  const { toggle, value: id, blNo } = historyModal;

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
        recordId: id,
        spName: "dbo.getDoGenrateHistory",
      });

      setRows(success ? data || [] : []);
    } catch (error) {
      console.error("MBL History Error:", error);
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
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
          DO Generate History
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
            onClick={() => setHistoryModal({ toggle: false, value: null })}
          >
            <CloseIcon fontSize="inherit" />
          </IconButton>
        </Box>
      </Box>

      <DialogContent dividers sx={{ minHeight: 400, p: 2 }}>
        <Typography sx={{ fontWeight: 700, mb: 2 }}>
          MBL No: <span style={{ fontWeight: 400 }}>{blNo}</span>
        </Typography>

        {loading ? (
          <Box className="flex justify-center py-6">
            <CircularProgress size={26} />
          </Box>
        ) : (
          <Table
            size="small"
            sx={{
              width: "100%",
              tableLayout: "fixed",

              "& th": {
                fontSize: 11,
                fontWeight: 700,
                padding: "4px 8px",
                height: 32,
                whiteSpace: "nowrap",
              },

              "& td": {
                fontSize: 11,
                padding: "2px 8px",
                height: 28,
                wordBreak: "break-word",
              },

              /* Sr No column spacing kam */
              "& th:nth-of-type(1), & td:nth-of-type(1)": {
                width: 80,
                minWidth: 80,
                maxWidth: 80,
                paddingLeft: 4,
                paddingRight: 4,
                textAlign: "center",
              },
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell>Sr No</TableCell>
                <TableCell>Date & Time</TableCell>
                <TableCell>BL No</TableCell>
                <TableCell>Field Name</TableCell>
                <TableCell>Old Value</TableCell>
                <TableCell>New Value</TableCell>
                <TableCell>User Name</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No history found
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row, i) => (
                  <TableRow key={i}>
                    <TableCell>{row?.srNo ?? row?.sr?.no ?? i + 1}</TableCell>
                    <TableCell>{row["date &Time"]}</TableCell>
                    <TableCell>{row["BL No"]}</TableCell>
                    <TableCell>{row["field name"]}</TableCell>
                    <TableCell>{row["Old value"]}</TableCell>
                    <TableCell>{row["New value"]}</TableCell>
                    <TableCell>{row["User name"]}</TableCell>
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
