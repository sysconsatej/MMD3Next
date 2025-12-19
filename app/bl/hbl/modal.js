import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import { fetchTableValues, getDataWithCondition } from "@/apis";
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
import { getUserByCookies } from "@/utils";

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

export function BLModal({ modal, setModal }) {
  const [modalData, setModalData] = useState([]);
  const url = process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
    async function getModalData() {
      const obj = {
        columns: "path, (select hblNo from tblBl b where b.id = a.blId) hblNo",
        tableName: "tblAttachment a",
        whereCondition: `blId in (${modal.value}) and status = 1`,
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

export function BLHistoryModal({ historyModal, setHistoryModal }) {
  const [modalData, setModalData] = useState([]);
  const userData = getUserByCookies();

  useEffect(() => {
    async function getModalData() {
      const tableObj = {
        columns:
          "b.mblNo, iif(count(distinct coalesce(m1.name, '#null#')) = 1 and max(m1.name) is not null, max(m1.name), '') status, iif(count(distinct coalesce(b.hblRequestRemarks, '#null#')) = 1 and max(b.hblRequestRemarks) is not null,max(b.hblRequestRemarks),'') remark, max(b.requestedBy) requestedBy, max(b.requestDate) requestDate, max(b.verifiedBy) verifiedBy, max(b.verifyDate) verifyDate, max(b.rejectedBy) rejectedBy, max(b.rejectDate) rejectDate",
        tableName: "tblBl b",
        pageNo: 1,
        pageSize: 25,
        advanceSearch: null,
        groupBy: "group by b.mblNo, m.name, v.name",
        orderBy: "order by max(b.createdDate) desc, b.mblNo asc",
        joins: `left join tblMasterData m on b.cargoTypeId = m.id  left join tblVessel v on b.podVesselId = v.id left join tblMasterData m1 on m1.id = b.hblRequestStatus  left join tblUser u on u.id = ${userData.userId} left join tblUser usr1 on usr1.companyId = u.companyId join tblBl b1 on b1.id = b.id and b1.mblHblFlag = 'HBL' and b1.status = 1 and b.createdBy = usr1.id and b1.mblNo = '${historyModal.value}'`,
      };
      const { data, totalPage, totalRows } = await fetchTableValues(tableObj);
      // setModalData(data);
    }
    getModalData();
  }, [historyModal.value]);

  return (
    <div>
      <Modal
        open={historyModal.toggle}
        onClose={() => setHistoryModal((prev) => ({ ...prev, toggle: false }))}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <FormHeading text={`View MBL No. ${historyModal.value} History`} />
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>SrNo.</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Rejection Remarks</TableCell>
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
