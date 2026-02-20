"use client";
import React, { useCallback, useEffect, useState, useRef } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  CssBaseline,
  Checkbox,
} from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import CustomButton from "@/components/button/button";
import CustomPagination from "@/components/pagination/pagination";
import { theme } from "@/styles/globalCss";
import {
  fetchTableValues,
  getDataWithCondition,
  updateStatusRows,
} from "@/apis";
import { ToastContainer } from "react-toastify";
import { formStore } from "@/store";
import TableExportButtons from "@/components/tableExportButtons/tableExportButtons";
import { getUserByCookies } from "@/utils";
import DoToolbarActions from "@/components/selectionActions/doToolbarActions";
import { advanceSearchFilter, statusColor } from "../utils";
import AdvancedSearchBar from "@/components/advanceSearchBar/advanceSearchBar";
import { advanceSearchFields } from "../doData";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import IconButton from "@mui/material/IconButton";

import { ConfirmRemarkModal, InvoiceModal } from "./utils";
function createData(
  blNo,
  isFreeDays,
  stuffDestuffId,
  Liner,
  doRequestStatusId,
  doRejectRemarks,
  ConfirmationStatus,
  submittedBy,
  id,
) {
  return {
    blNo,
    isFreeDays,
    stuffDestuffId,
    Liner,
    doRequestStatusId,
    doRejectRemarks,
    ConfirmationStatus,
    submittedBy,
    id,
  };
}

export default function BLList() {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [totalPage, setTotalPage] = useState(1);
  const [totalRows, setTotalRows] = useState(1);
  const [blData, setBlData] = useState([]);
  const [advanceSearch, setAdvanceSearch] = useState({});
  const [loadingState, setLoadingState] = useState("NO DATA...");
  const { setMode } = formStore();
  const tableWrapRef = useRef(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const userData = getUserByCookies();
  const [someChecked, setSomeChecked] = useState(false);
  const [allChecked, setAllChecked] = useState(false);
  const [cfsStatusList, setCfsStatusList] = useState([]);
  const [confirmState, setConfirmState] = useState({
    toggle: false,
    ids: [],
    value: "",
  });
  const [attachmentModal, setAttachmentModal] = useState({
    toggle: false,
    value: null,
  });

  const getData = useCallback(
    async (pageNo = page, pageSize = rowsPerPage) => {
      try {
        const tableObj = {
          columns: `
              c.name Liner,
              u2.name submittedBy,
              d.blNo blNo,
              d.isFreeDays isFreeDays,
              m2.name stuffDestuffId,
              m.name doRequestStatusId,
              d.cfsRemarks  doRejectRemarks,
              m1.name ConfirmationStatus,
              d.id id
           `,
          tableName: "tblDoRequest d",
          pageNo,
          pageSize,
          advanceSearch: advanceSearchFilter(advanceSearch),
          joins: `
                 LEFT JOIN tblMasterData m ON m.id = d.doRequestStatusId
                 LEFT JOIN tblMasterData m1 ON m1.id = d.cfsStatusId
                 LEFT JOIN tblCompany c ON c.id = d.shippingLineId
                 LEFT JOIN tblMasterData m2 ON m2.id = d.stuffDestuffId
                 LEFT JOIN tblLocation l ON l.id = ${userData?.location}
                 LEFT JOIN tblUser u2 ON u2.id = d.createdBy
                 LEFT JOIN tblPort p ON p.id = d.nominatedAreaId
                 JOIN tblDoRequest d2 ON d2.id = d.id AND d2.status = 1 AND p.name = l.name
                 `,
        };

        const { data, totalPage, totalRows } = await fetchTableValues(tableObj);

        setBlData(data);
        setTotalPage(totalPage);
        setPage(pageNo);
        setRowsPerPage(pageSize);
        setTotalRows(totalRows);
        setSelectedIds([]);
      } catch (err) {
        console.error("Error fetching data:", err);
        setLoadingState("Failed to load data");
      }
    },
    [page, rowsPerPage, advanceSearch],
  );

  const rows = blData
    ? blData.map((item) =>
        createData(
          item["blNo"],
          item["isFreeDays"],
          item["stuffDestuffId"],
          item["Liner"],
          item["doRequestStatusId"],
          item["doRejectRemarks"],
          item["ConfirmationStatus"],
          item["submittedBy"],
          item["id"],
        ),
      )
    : [];

  const toggleAll = () => {
    if (selectedIds.length > 0) {
      setSelectedIds([]);
      setAllChecked(false);
    } else {
      setSelectedIds(rows.map((item) => item.id));
      setAllChecked(true);
    }
  };
  const selectedRows = rows.filter((row) => selectedIds.includes(row.id));

  const toggleOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };
  const handleCfsConfirm = async (ids, remarks) => {
    try {
      if (!ids?.length) return;
      const confirmStatus = cfsStatusList.find(
        (item) => item.Name === "Confirm",
      );
      if (!confirmStatus?.Id) return;
      const rowsPayload = ids.map((id) => ({
        id: id,
        cfsStatusId: confirmStatus.Id,
        cfsRemarks: remarks || null,
        updatedBy: userData?.userId,
        updatedDate: new Date(),
      }));
      const res = await updateStatusRows({
        tableName: "tblDoRequest",
        rows: rowsPayload,
        keyColumn: "id",
      });
      const { success, message } = res || {};
      if (!success) {
        toast.error(message || "Update failed");
        return;
      }
      toast.success("CFS confirmed successfully!");
      getData();
    } catch (error) {
      console.error("CFS Confirm Error:", error);
    }
  };

  useEffect(() => {
    getData(1, rowsPerPage);
    setMode({ mode: null, formId: null });
  }, []);
  useEffect(() => {
    async function getCfsStatus() {
      const obj = {
        columns: "id as Id, name as Name",
        tableName: "tblMasterData",
        whereCondition: `masterListName = 'tblCfsConfirmation' and status = 1`,
      };

      const { data } = await getDataWithCondition(obj);
      setCfsStatusList(data || []);
    }

    getCfsStatus();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box className="sm:px-4 py-1">
        <Box className="flex flex-col sm:flex-row justify-between pb-1">
          <Typography variant="body1" className="text-left flex items-center">
            Do Request List
          </Typography>
          <Box className="flex gap-4">
            <AdvancedSearchBar
              fields={advanceSearchFields.bl}
              advanceSearch={advanceSearch}
              setAdvanceSearch={setAdvanceSearch}
              getData={getData}
              rowsPerPage={rowsPerPage}
            />
            <CustomButton text="ADD" href="/invoice/doRequest" />
          </Box>
        </Box>
        <DoToolbarActions
          selectedIds={selectedIds}
          selectedRows={selectedRows}
          onCfsConfirm={(ids) =>
            setConfirmState({
              toggle: true,
              ids,
              value: "",
            })
          }
        />

        <TableContainer component={Paper} ref={tableWrapRef} className="mt-2">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell
                  padding="checkbox"
                  sx={{ width: 36, minWidth: 36, maxWidth: 36 }}
                >
                  <Checkbox
                    size="small"
                    indeterminate={someChecked}
                    checked={allChecked}
                    onChange={toggleAll}
                    sx={{ p: 0.25, "& .MuiSvgIcon-root": { fontSize: 18 } }}
                  />
                </TableCell>
                <TableCell>BL NO</TableCell>
                <TableCell>Free Days</TableCell>
                <TableCell>Stuff Destuff</TableCell>
                <TableCell>Liner Name</TableCell>
                <TableCell>Do Status</TableCell>
                <TableCell>Remark</TableCell>
                <TableCell>Confirmation Status</TableCell>
                <TableCell>Submitted By</TableCell>
                <TableCell>Attachment</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {rows.length > 0 ? (
                rows.map((row) => (
                  <TableRow key={row.id} hover className="relative group">
                    <TableCell
                      padding="checkbox"
                      sx={{ width: 32, minWidth: 32, maxWidth: 32 }}
                    >
                      <Checkbox
                        size="small"
                        checked={selectedIds.includes(row.id)}
                        onChange={() => toggleOne(row.id)}
                        sx={{ p: 0.25, "& .MuiSvgIcon-root": { fontSize: 18 } }}
                      />
                    </TableCell>
                    <TableCell>{row.blNo}</TableCell>
                    <TableCell>{row.isFreeDays}</TableCell>
                    <TableCell>{row.stuffDestuffId}</TableCell>
                    <TableCell>{row.Liner}</TableCell>
                    <TableCell
                      sx={{
                        color: statusColor(
                          row?.doRequestStatusId?.replace(/\s+/g, ""),
                        ),
                      }}
                    >
                      {row.doRequestStatusId}
                    </TableCell>
                    <TableCell>{row.doRejectRemarks}</TableCell>
                    <TableCell
                      sx={{
                        color: statusColor(
                          row?.ConfirmationStatus?.replace(/\s+/g, ""),
                        ),
                      }}
                    >
                      {row.ConfirmationStatus}
                    </TableCell>
                    <TableCell>{row.submittedBy}</TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() =>
                          setAttachmentModal({
                            toggle: true,
                            value: row.id,
                          })
                        }
                      >
                        <AttachFileIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={10} align="center">
                    {loadingState}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Box className="flex justify-between items-center">
          <TableExportButtons
            targetRef={tableWrapRef}
            title="MBL Request"
            fileName="mbl-list"
          />

          <CustomPagination
            count={totalPage}
            totalRows={totalRows}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={(e, v) => getData(v, rowsPerPage)}
            handleChangeRowsPerPage={(e) => getData(1, +e.target.value)}
          />
        </Box>
      </Box>
      <InvoiceModal modal={attachmentModal} setModal={setAttachmentModal} />
      <ConfirmRemarkModal
        confirmState={confirmState}
        setConfirmState={setConfirmState}
        confirmHandler={handleCfsConfirm}
      />

      <ToastContainer />
    </ThemeProvider>
  );
}
