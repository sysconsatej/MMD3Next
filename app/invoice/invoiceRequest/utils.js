import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import { getDataWithCondition } from "@/apis";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";
import FormHeading from "@/components/formHeading/formHeading";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "auto",
  bgcolor: "background.paper",
  boxShadow: 1,
  p: 1,
};

export function InvoiceModal({ modal, setModal }) {
  const [modalData, setModalData] = useState([]);
  const url = process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
    async function getModalData() {
      const obj = {
        columns: "a.path, m.name",
        tableName: "tblAttachment a",
        joins: "LEFT JOIN tblMasterData m ON m.id = a.attachmentTypeId",
        whereCondition: `a.invoiceRequestId = ${modal.value} AND a.status = 1`,
      };

      const { data } = await getDataWithCondition(obj);
      setModalData(data);
    }
    getModalData();
  }, [modal.value]);

  return (
    <div>
      <Modal
        open={modal.toggle}
        onClose={() => setModal((prev) => ({ ...prev, toggle: false }))}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <FormHeading text="Attachments" />
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>SrNo.</TableCell>
                  <TableCell>select</TableCell>
                  <TableCell>Attachment</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {modalData?.map((item, index) => {
                  return (
                    <TableRow
                      key={index}
                      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                    >
                      <TableCell component="th" scope="row">
                        {index + 1}
                      </TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>
                        <a
                          target="_black"
                          href={`${url}uploads/${item.path}`}
                          style={{ color: "#95a9e8" }}
                        >
                          {item.path?.split(/-(.+)/)[1]}
                        </a>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Modal>
    </div>
  );
}
export const RejectModal = ({ rejectState, setRejectState, rejectHandler }) => {
  return (
    <Dialog
      open={rejectState.toggle}
      onClose={() => setRejectState((prev) => ({ ...prev, toggle: false }))}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle>Reject — Add Remarks</DialogTitle>

      <DialogContent dividers>
        <TextField
          fullWidth
          margin="dense"
          multiline
          minRows={3}
          label="Remarks"
          value={rejectState.value}
          onChange={(e) =>
            setRejectState((prev) => ({ ...prev, value: e.target.value }))
          }
        />
      </DialogContent>

      <DialogActions>
        <div
          className="py-1 px-3 border border-[#B5C4F0] rounded-sm text-xs cursor-pointer hover:bg-[#B5C4F0] hover:text-white"
          onClick={() => setRejectState((prev) => ({ ...prev, toggle: false }))}
        >
          Cancel
        </div>

        <div
          className="py-1 px-3 border border-[#B5C4F0] rounded-sm text-xs cursor-pointer hover:bg-[#B5C4F0] hover:text-white"
          onClick={rejectHandler}
        >
          Save
        </div>
      </DialogActions>
    </Dialog>
  );
};
