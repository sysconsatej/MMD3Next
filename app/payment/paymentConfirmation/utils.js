import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import { getDataWithCondition } from "@/apis";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
    if (!modal?.value || !modal.toggle) {
      setModalData([]);
      return;
    }

    async function getModalData() {
      const obj = {
        columns: "a.path, m.name",
        tableName: "tblAttachment a",
        joins: "LEFT JOIN tblMasterData m ON m.id = a.attachmentTypeId",
        whereCondition: `a.invoicePaymentId = ${modal.value} AND a.status = 1`,
      };

      const { data } = await getDataWithCondition(obj);
      setModalData(data || []);
    }

    getModalData();
  }, [modal.value, modal.toggle]);

  return (
    <Modal
      open={!!modal.toggle}
      onClose={() => setModal((prev) => ({ ...prev, toggle: false }))}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <FormHeading text="Attachments" />
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="attachments table">
            <TableHead>
              <TableRow>
                <TableCell>Sr No.</TableCell>
                <TableCell>Select</TableCell>
                <TableCell>Attachment</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {modalData?.map((item, index) => (
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
                      target="_blank"
                      rel="noreferrer"
                      href={`${url}uploads/${item.path}`}
                      style={{ color: "#95a9e8" }}
                    >
                      {item.path?.split(/-(.+)/)[1]}
                    </a>
                  </TableCell>
                </TableRow>
              ))}
              {(!modalData || modalData.length === 0) && (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    No attachments found.
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
