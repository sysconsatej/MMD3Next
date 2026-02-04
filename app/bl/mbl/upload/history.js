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
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import CropSquareIcon from "@mui/icons-material/CropSquare";

import { getDataWithCondition } from "@/apis";
import FormHeading from "@/components/formHeading/formHeading";

export default function BlUploadHistoryModal({ modal, setModal }) {
  const [modalData, setModalData] = useState([]);
  const [windowMode, setWindowMode] = useState("normal");

  const url = process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
    if (!modal?.toggle) {
      setModalData([]);
      return;
    }

    setWindowMode("normal");

    async function getUploadHistory() {
      let where = `up.status = 1`;

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
          v1.voyageNo Voyage,
          p.name Port,
          u1.emailId createdBy,
          a.path uploadPath
        `,
        tableName: "tblBlUpload up",
        joins: `
          left join tblVessel v on v.id=up.vesselId
          left join tblVoyage v1 on v1.id=up.voyageId
          left join tblPort p on p.id=up.podId
          left join tblUser u1 on u1.id=up.createdBy
          left join tblAttachment a on a.blUploadId=up.id
        `,
        whereCondition: where,
        orderBy: "up.id desc",
      };

      const { data } = await getDataWithCondition(obj);
      setModalData(data || []);
    }

    getUploadHistory();
  }, [modal.toggle]);

  return (
    <Dialog
      open={!!modal.toggle}
      onClose={() => setModal({ ...modal, toggle: false })}
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
          MBL Upload History
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
            onClick={() => setModal({ ...modal, toggle: false })}
          >
            <CloseIcon fontSize="inherit" />
          </IconButton>
        </Box>
      </Box>
      <DialogContent
        dividers
        sx={{
          minHeight: 400,
          p: 2,
          overflow: "auto",
        }}
      >
        <TableContainer component={Paper}>
          <Table
            size="small"
            sx={{
              tableLayout: "fixed",
              width: "100%",
              "& th": {
                fontSize: 11,
                fontWeight: 700,
                padding: "4px 6px",
              },
              "& td": {
                fontSize: 11,
                padding: "4px 6px",
              },
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: 60 }}>Sr No.</TableCell>
                <TableCell>Vessel</TableCell>
                <TableCell>Voyage</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Uploaded By</TableCell>
                <TableCell>Attachment</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {modalData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
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
                    <TableCell>{item.createdBy}</TableCell>
                    <TableCell>
                      {item.uploadPath ? (
                        <a
                          target="_blank"
                          rel="noreferrer"
                          href={`${url}uploads/${item.uploadPath}`}
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
  );
}
