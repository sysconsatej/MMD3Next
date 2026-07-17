"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  Box,
  Typography,
  IconButton,
  ThemeProvider,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import CropSquareIcon from "@mui/icons-material/CropSquare";

import { getDataWithCondition } from "@/apis";
import { theme } from "@/styles";
import { getUserByCookies } from "@/utils";

export default function PciUploadHistoryModal({ modal, setModal }) {
  const [modalData, setModalData] = useState([]);
  const [windowMode, setWindowMode] = useState("normal");

  const userData = getUserByCookies();

  useEffect(() => {
    if (!modal?.toggle) {
      setModalData([]);
      return;
    }

    async function getUploadHistory() {
      let where = "up.status = 1";

      if (modal?.vesselId) {
        where += ` AND up.vesselId = ${modal.vesselId}`;
      }

      if (modal?.voyageId) {
        where += ` AND up.voyageId = ${modal.voyageId}`;
      }

      if (modal?.locationId) {
        where += ` AND up.locationId = ${modal.locationId}`;
      }

      const obj = {
        columns: `
                v.name Vessel,
                vo.voyageNo Voyage,
                p.name Port,

                up.CsnStatus,
                up.CsnNumber,
                FORMAT(up.CsnDate,'dd-MM-yyyy') as CsnDate,
                up.UniqueID,

                u.emailId createdBy,
                a.path uploadPath,

                FORMAT(
                (CAST(up.createdDate AS datetime2)
                AT TIME ZONE 'UTC'
                AT TIME ZONE 'India Standard Time'),
                'dd-MM-yyyy hh:mm:ss tt'
                ) AS createdDate
            `,
        tableName: "tblPciUpload up",
        joins: `
          left join tblVessel v on v.id = up.vesselId
          left join tblVoyage vo on vo.id = up.voyageId
          left join tblPort p on p.id = up.podId
          left join tblUser u on u.id = up.createdBy
          left join tblAttachment a on a.pciUploadId = up.id
        `,
        whereCondition: where,
        orderBy: "up.id desc",
      };

      const { data } = await getDataWithCondition(obj);

      setModalData(data || []);
    }

    getUploadHistory();
  }, [modal?.toggle]);

  return (
    <ThemeProvider theme={theme}>
      <Dialog
        open={!!modal.toggle}
        onClose={() => setModal({ ...modal, toggle: false })}
        fullScreen={windowMode === "maximized"}
        maxWidth="xl"
        fullWidth
      >
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
            PCI Upload History
          </Typography>

          <Box>
            <IconButton
              size="small"
              sx={{ color: "#fff" }}
              onClick={() =>
                setWindowMode((p) =>
                  p === "maximized" ? "normal" : "maximized",
                )
              }
            >
              <CropSquareIcon fontSize="inherit" />
            </IconButton>

            <IconButton
              size="small"
              sx={{ color: "#fff" }}
              onClick={() =>
                setModal({
                  ...modal,
                  toggle: false,
                })
              }
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          </Box>
        </Box>

        <DialogContent dividers>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Sr No.</TableCell>
                  <TableCell>Vessel</TableCell>
                  <TableCell>Voyage</TableCell>
                  <TableCell>Port</TableCell>

                  <TableCell>CSN Status</TableCell>
                  <TableCell>CSN Number</TableCell>
                  <TableCell>CSN Date</TableCell>
                  <TableCell>Unique ID</TableCell>

                  <TableCell>Uploaded By</TableCell>
                  <TableCell>Uploaded Date</TableCell>
                  <TableCell>Attachment</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {modalData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} align="center">
                      No upload history found.
                    </TableCell>
                  </TableRow>
                ) : (
                  modalData.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{index + 1}</TableCell>

                      <TableCell>{item.Vessel}</TableCell>

                      <TableCell>{item.Voyage}</TableCell>

                      <TableCell>{item.Port}</TableCell>

                      <TableCell>{item.CsnStatus}</TableCell>

                      <TableCell>{item.CsnNumber}</TableCell>

                      <TableCell>{item.CsnDate}</TableCell>

                      <TableCell>{item.UniqueID}</TableCell>

                      <TableCell>{item.createdBy}</TableCell>

                      <TableCell>{item.createdDate}</TableCell>
                      <TableCell>
                        {item.uploadPath ? (
                          <a
                            target="_blank"
                            rel="noreferrer"
                            href={`${process.env.NEXT_PUBLIC_BACKEND_URL}uploads/${item.uploadPath}`}
                            style={{ color: "#95a9e8" }}
                          >
                            {item.uploadPath?.split(/-(.+)/)[1]}
                          </a>
                        ) : (
                          "No File"
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
      </Dialog>
    </ThemeProvider>
  );
}
