"use client";

import React, { useEffect, useState } from "react";
import {
  Modal,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import FormHeading from "@/components/formHeading/formHeading";
import { getDataWithCondition } from "@/apis";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 700,
  maxHeight: "80vh",
  overflowY: "auto",
  bgcolor: "background.paper",
  borderRadius: 2,
  boxShadow: 24,
  p: 3,
};

export function InvoiceModal({ modal, setModal }) {
  const [modalData, setModalData] = useState([]);
  const [loading, setLoading] = useState(false);
  const url = process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
    if (!modal?.value) return;

    const getModalData = async () => {
      try {
        setLoading(true);

        const obj = {
          columns: "a.path, m.name",
          tableName: "tblAttachment a",
          joins: "LEFT JOIN tblMasterData m ON m.id = a.attachmentTypeId",
          whereCondition: `
            a.doRequestId = ${modal.value} 
            AND a.status = 1 and m.name in ('DO Released')
          `,
        };

        const { data } = await getDataWithCondition(obj);
        setModalData(data || []);
      } catch (error) {
        console.error("Attachment fetch error:", error);
        setModalData([]);
      } finally {
        setLoading(false);
      }
    };

    getModalData();
  }, [modal?.value]);

  const handleClose = () => {
    setModal((prev) => ({
      ...prev,
      toggle: false,
      value: null,
    }));
    setModalData([]);
  };

  return (
    <Modal
      open={modal?.toggle || false}
      onClose={handleClose}
      aria-labelledby="attachment-modal-title"
    >
      <Box sx={style}>
        <FormHeading text="Attachments" />

        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell width={60}>Sr No.</TableCell>
                <TableCell width={200}>Attachment Type</TableCell>
                <TableCell>File</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : modalData.length > 0 ? (
                modalData.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{item?.name || "-"}</TableCell>
                    <TableCell>
                      {item?.path ? (
                        <a
                          target="_blank"
                          rel="noopener noreferrer"
                          href={`${url}uploads/${item.path}`}
                          style={{ color: "#1976d2" }}
                        >
                          {item.path?.split(/-(.+)/)[1] || item.path}
                        </a>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    No Attachments Found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Modal>
  );
}
export const ConfirmRemarkModal = ({
  confirmState,
  setConfirmState,
  confirmHandler,
}) => {
  const [error, setError] = useState(false);

  const handleClose = () => {
    setConfirmState((prev) => ({
      ...prev,
      toggle: false,
      value: "",
    }));
    setError(false);
  };

  const handleSave = () => {
    if (!confirmState?.value?.trim()) {
      setError(true);
      return;
    }

    confirmHandler(confirmState.ids, confirmState.value.trim());
    handleClose();
  };

  return (
    <Dialog
      open={confirmState.toggle}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle>Confirm — Add Remarks</DialogTitle>

      <DialogContent dividers>
        <TextField
          fullWidth
          margin="dense"
          multiline
          minRows={3}
          label="Remarks"
          value={confirmState.value}
          error={error}
          helperText={error ? "Remarks is required" : ""}
          onChange={(e) => {
            setConfirmState((prev) => ({
              ...prev,
              value: e.target.value,
            }));
            if (error) setError(false);
          }}
        />
      </DialogContent>

      <DialogActions>
        <div
          className="py-1 px-3 border border-[#B5C4F0] rounded-sm text-xs cursor-pointer hover:bg-[#B5C4F0] hover:text-white"
          onClick={handleClose}
        >
          Cancel
        </div>

        <div
          className="py-1 px-3 border border-[#B5C4F0] rounded-sm text-xs cursor-pointer hover:bg-[#B5C4F0] hover:text-white"
          onClick={handleSave}
        >
          Save
        </div>
      </DialogActions>
    </Dialog>
  );
};
