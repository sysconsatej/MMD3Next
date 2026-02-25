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
  Liner,
  blNo,
  igmNo,
  doNo,
  doDate,
  isFreeDays,
  validTill,
  stuffDestuffId,
  doRequestStatusId,
  releasedDateTime,
  ConfirmationStatus,
  confirmTimeAtCfs,
  doRejectRemarks,
  submittedBy,
  id,
) {
  return {
    Liner,
    blNo,
    igmNo,
    doNo,
    doDate,
    isFreeDays,
    validTill,
    stuffDestuffId,
    doRequestStatusId,
    releasedDateTime,
    ConfirmationStatus,
    confirmTimeAtCfs,
    doRejectRemarks,
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
      c1.name AS Liner,
      u2.name AS submittedBy,
      d.blNo AS blNo,
      d.isFreeDays AS isFreeDays,
      FORMAT(
        (d.validTill AT TIME ZONE 'UTC' 
         AT TIME ZONE 'India Standard Time'),
        'dd-MM-yyyy '
      ) AS validTill,
      m2.name AS stuffDestuffId,
      m.name AS doRequestStatusId,
      d.cfsRemarks AS doRejectRemarks,
      m1.name AS ConfirmationStatus,
      d.id AS id,

      FORMAT(
        (rel.EventDate AT TIME ZONE 'UTC' 
         AT TIME ZONE 'India Standard Time'),
        'dd-MM-yyyy hh:mm:ss tt'
      ) AS releasedDateTime,

      FORMAT(
        (cfs.EventDate AT TIME ZONE 'UTC' 
         AT TIME ZONE 'India Standard Time'),
        'dd-MM-yyyy hh:mm:ss tt'
      ) AS confirmTimeAtCfs,

      vr.igmNo AS igmNo,
      b.doNo AS doNo,
      b.doDate AS doDate
  `,

          tableName: "tblDoRequest d",

          pageNo,
          pageSize,

          advanceSearch: advanceSearchFilter(advanceSearch),

          joins: `

      LEFT JOIN tblBl b 
          ON b.hblNo = d.blNo 
          OR b.mblNo = d.blNo

      LEFT JOIN tblVoyageRoute vr 
          ON vr.portOfCallId = b.podId 
          AND vr.voyageId = b.podVoyageId

      LEFT JOIN tblMasterData m 
          ON m.id = d.doRequestStatusId

      LEFT JOIN tblMasterData m1 
          ON m1.id = d.cfsStatusId

      LEFT JOIN tblCompany c1 
          ON c1.id = d.shippingLineId

      LEFT JOIN tblMasterData m2 
          ON m2.id = d.stuffDestuffId

      LEFT JOIN tblUser u2 
          ON u2.id = d.createdBy

      LEFT JOIN tblPort p 
          ON p.id = d.nominatedAreaId

      INNER JOIN tblMasterData ms 
          ON ms.id = d.doRequestStatusId 
          AND ms.name = 'Released for DO'

      INNER JOIN tblCompany c 
          ON c.id = ${userData.companyId}
          AND p.name = c.name

      INNER JOIN tblLocation l
          ON l.id = ${userData.location}
          AND d.locationId = l.id

      OUTER APPLY (
          SELECT TOP 1 t.EventDate
          FROM dbo.fn_AuditLogSummary('dbo.tblDoRequest', d.id) t
          LEFT JOIN tblMasterData newm 
              ON newm.id = TRY_CONVERT(INT, t.NewValue)
          WHERE 
              t.ColumnName = 'doRequestStatusId'
              AND newm.name = 'Released for DO'
          ORDER BY t.EventDate DESC
      ) rel

      OUTER APPLY (
          SELECT TOP 1 t.EventDate
          FROM dbo.fn_AuditLogSummary('dbo.tblDoRequest', d.id) t
          WHERE 
              t.ColumnName = 'cfsStatusId'
          ORDER BY t.EventDate DESC
      ) cfs

      INNER JOIN tblDoRequest d2
          ON d2.id = d.id
          AND d2.status = 1
          and  rel.EventDate >= dateadd(day,-90,getdate())
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
          item["Liner"],
          item["blNo"],
          item["igmNo"],
          item["doNo"],
          item["doDate"],
          item["isFreeDays"],
          item["validTill"],
          item["stuffDestuffId"],
          item["doRequestStatusId"],
          item["releasedDateTime"],
          item["ConfirmationStatus"],
          item["confirmTimeAtCfs"],
          item["doRejectRemarks"],
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
              fields={advanceSearchFields.CfsBl}
              advanceSearch={advanceSearch}
              setAdvanceSearch={setAdvanceSearch}
              getData={getData}
              rowsPerPage={rowsPerPage}
            />
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
                <TableCell>Liner</TableCell>
                <TableCell>BL No</TableCell>
                <TableCell>IGM No</TableCell>
                <TableCell>DO No</TableCell>
                <TableCell>DO Date</TableCell>
                <TableCell>Free Days</TableCell>
                <TableCell>Valid Till</TableCell>
                <TableCell>Stuff/Destuff</TableCell>
                <TableCell>DO Status</TableCell>
                <TableCell>CFS Status</TableCell>
                <TableCell>Confirmed Date at CFS</TableCell>
                <TableCell>Remarks</TableCell>
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
                    <TableCell>{row.Liner}</TableCell>
                    <TableCell>{row.blNo}</TableCell>
                    <TableCell>{row.igmNo}</TableCell>
                    <TableCell>{row.doNo}</TableCell>
                    <TableCell>{row.releasedDateTime}</TableCell>
                    <TableCell>{row.isFreeDays}</TableCell>
                    <TableCell>{row.validTill}</TableCell>
                    <TableCell>{row.stuffDestuffId}</TableCell>

                    <TableCell
                      sx={{
                        color: statusColor(
                          row?.doRequestStatusId?.replace(/\s+/g, ""),
                        ),
                      }}
                    >
                      {row.doRequestStatusId}
                    </TableCell>

                    <TableCell
                      sx={{
                        color: statusColor(
                          row?.ConfirmationStatus?.replace(/\s+/g, ""),
                        ),
                      }}
                    >
                      {row.ConfirmationStatus}
                    </TableCell>

                    <TableCell>{row.confirmTimeAtCfs}</TableCell>
                    <TableCell>{row.doRejectRemarks}</TableCell>
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
