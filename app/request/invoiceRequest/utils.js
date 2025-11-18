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
    async function getModalData() {
      const obj = {
        columns: "path, (select hblNo from tblBl b where b.id = a.blId) hblNo",
        tableName: "tblAttachment a",
        whereCondition: `invoiceRequestId in (${modal.value}) and status = 1`,
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
                  <TableCell>HBLNo.</TableCell>
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
                      <TableCell>{item.hblNo}</TableCell>
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
