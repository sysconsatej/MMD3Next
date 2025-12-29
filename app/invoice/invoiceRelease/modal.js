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
  Modal,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import CropSquareIcon from "@mui/icons-material/CropSquare";
import { fetchInvoiceReleaseHistory } from "@/apis/history";
import { statusColor } from "./invoiceReleaseData";
import FormHeading from "@/components/formHeading/formHeading";
import { CustomInput } from "@/components/customInput";
import CustomButton from "@/components/button/button";
import { getUserByCookies } from "@/utils";

export default function InvoiceHistoryModal({
  open,
  onClose,
  invoiceId,
  invoiceNo,
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
    try {
      setLoading(true);

      const { success, data } = await fetchInvoiceReleaseHistory({
        recordId: invoiceId,
      });

      if (success) {
        setRows(data || []);
      } else {
        setRows([]);
      }
    } catch (err) {
      console.error("Invoice Release History Error:", err);
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
          Invoice Release History
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
      <DialogContent
        dividers
        sx={{
          minHeight: 400,
          p: 2,
          overflow: "hidden",
        }}
      >
        <Typography sx={{ fontWeight: 700, mb: 2 }}>
          BL No: <span style={{ fontWeight: 400 }}>{invoiceNo}</span>
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
                <TableCell sx={{ fontWeight: 700 }}>Date &amp; Time</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Requester Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Requester Id</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Field Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Old Value</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>New Value</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Modify By</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Modify Date</TableCell>

                <TableCell sx={{ fontWeight: 700 }}>Liner Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Liner Id</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Contact No</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>
                  Rejection Remarks
                </TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Remark</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
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
                rows.map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="sr-col">{idx + 1}</TableCell>
                    <TableCell>{row.date}</TableCell>
                    <TableCell>{row["Requester Name"]}</TableCell>
                    <TableCell>{row["Requester Id"]}</TableCell>
                    <TableCell>{row["Field Name"]}</TableCell>
                    <TableCell>{row["Old Value"]}</TableCell>
                    <TableCell>{row["New Value"]}</TableCell>
                    <TableCell>{row["Liner Name"]}</TableCell>
                    <TableCell>{row["Liner Id"]}</TableCell>
                    <TableCell>{row["Contact No"]}</TableCell>
                    <TableCell>{row["Rejection Remarks"]}</TableCell>
                    <TableCell>{row["Remark"]}</TableCell>
                    <TableCell sx={{ color: statusColor(row.Status) }}>
                      {row.Status}
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

export function InvoiceAssignModal({ modal, setModal, onAssignHandler }) {
  const [formData, setFormData] = useState({});
  const userData = getUserByCookies();

  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "auto",
    bgcolor: "background.paper",
    boxShadow: 1,
    p: 1,
    width: "300px",
    height: "200px",
  };

  const field = [
    {
      label: "User Name",
      name: "userId",
      type: "dropdown",
      tableName: "tblUser u",
      displayColumn: "u.name",
      where: `u.userType = 'U' and u.companyId = ${userData?.companyId}`,
      orderBy: "u.name",
      isEdit: true,
    },
  ];

  return (
    <Modal
      open={modal.toggle}
      onClose={() => setModal((prev) => ({ ...prev, toggle: false }))}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <FormHeading text="Assign To" />
        <Box className="my-3 ">
          <CustomInput
            fields={field}
            formData={formData}
            setFormData={setFormData}
            fieldsMode={""}
          />
        </Box>
        <CustomButton
          text="Submit"
          onClick={() => onAssignHandler(formData, modal.invoiceIds)}
        />
      </Box>
    </Modal>
  );
}
