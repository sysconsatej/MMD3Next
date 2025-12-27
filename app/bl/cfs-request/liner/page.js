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
import { toast, ToastContainer } from "react-toastify";
import { formStore } from "@/store";
import TableExportButtons from "@/components/tableExportButtons/tableExportButtons";
import { getUserByCookies } from "@/utils";
import SearchRequestToolbarActions from "@/components/selectionActions/cfsRequestActionBar";
import { cfsStatusHandler, statusColor } from "../utils";
import { useRouter } from "next/navigation";

/* ---------------- Constants ---------------- */
const LIST_TABLE = "tblBl b";

// checkbox sizing
const CHECKBOX_HEAD_SX = { width: 36, minWidth: 36, maxWidth: 36 };
const CHECKBOX_CELL_SX = { width: 32, minWidth: 32, maxWidth: 32 };
const CHECKBOX_SX = { p: 0.25, "& .MuiSvgIcon-root": { fontSize: 18 } };

export default function SearchRequestCfsDpdIcd() {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [totalPage, setTotalPage] = useState(1);
  const [totalRows, setTotalRows] = useState(1);
  const [blData, setBlData] = useState([]);
  const [loadingState, setLoadingState] = useState("NO DATA...");
  const [selectedIds, setSelectedIds] = useState([]);

  // toolbar checkbox states
  const [amendment, setAmendment] = useState(false);
  const [history, setHistory] = useState(false);

  const tableWrapRef = useRef(null);
  const { setMode } = formStore();
  const userData = getUserByCookies();
  const router = useRouter();

  /* ---------------- Fetch Table Data ---------------- */
  const getData = useCallback(
    async (pageNo = page, pageSize = rowsPerPage) => {
      try {
        setLoadingState("Loading...");

        const tableObj = {
          columns: `
            c1.name as CompanyName,
            b.mblNo as mblNo,
            v.name as vesselName,
            vy.voyageNo as voyageName,
            p1.name as POD,
            f.name as PlaceOfDeleverey,
            r.name as cfsType,
            p.name as cfs,
            c.name as dpd,
            b.consigneeText as consigneeName,
            b.customBrokerText as NominatedCB,
            l.name as locationName,
            m.name as statusName,
            c1.name as UserName,
            c1.emailId as LoginId,
            c1.telephoneNo as ContactNo,
            b.id as id
          `,
          tableName: LIST_TABLE,
          pageNo,
          pageSize,
          joins: `
        left join tblUser u on u.id = ${userData?.userId}
        left join tblCompany c1 on c1.id = u.companyId 
        left join tblLocation l on l.id = ${userData?.location}
        join tblMasterData m on m.id = b.cfsRequestStatusId 
        and b.cfsRequestStatusId IS NOT NULL and b.locationId = l.id and b.shippingLineId = u.companyId and m.name <> 'Pending' 
        left join tblMasterData r on r.id = b.cfsTypeId 
        left join tblPort p1 on p1.id = b.polId 
        left join tblPort p on p.id = b.nominatedAreaId 
        left join tblPort c on c.id = b.dpdId 
        left join tblVessel v on v.id = b.podVesselId 
        left join tblVoyage vy on vy.id = b.podVoyageId 
        left join tblPort f on f.id = b.fpdId
          `,
        };

        const { data, totalPage, totalRows } = await fetchTableValues(tableObj);

        setBlData(data || []);
        setSelectedIds([]);
        setTotalPage(totalPage || 1);
        setTotalRows(totalRows || 0);
        setPage(pageNo);
        setRowsPerPage(pageSize);

        if (!data || data.length === 0) setLoadingState("NO DATA...");
      } catch (err) {
        console.error(err);
        setBlData([]);
        setSelectedIds([]);
        setLoadingState("Failed to load data");
      }
    },
    [page, rowsPerPage, userData?.userId, userData?.location]
  );

  const idsOnPage = blData.map((r) => r.id);
  const allChecked =
    selectedIds.length > 0 && selectedIds.length === idsOnPage.length;
  const someChecked =
    selectedIds.length > 0 && selectedIds.length < idsOnPage.length;

  const toggleAll = () => setSelectedIds(allChecked ? [] : idsOnPage);
  const toggleOne = (id) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  useEffect(() => {
    getData(1, rowsPerPage);
    setMode({ mode: null, formId: null });
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <Box className="sm:px-4 py-1">
        <Typography variant="body1" className="pb-1">
          Search Request for CFS / DPD / ICD
        </Typography>

        {/* ACTION TOOLBAR */}
        <SearchRequestToolbarActions
          selectedIds={selectedIds}
          onEdit={(id) =>
            cfsStatusHandler(getData, router, setMode).handleEdit(id)
          }
          onView={(id) =>
            cfsStatusHandler(getData, router, setMode).handleView(id)
          }
          onReject={(ids) =>
            cfsStatusHandler(getData, router, setMode).handleReject(ids)
          }
          onConfirm={(ids) =>
            cfsStatusHandler(getData, router, setMode).handleConfirm(ids)
          }
          onRejectAmendment={(ids) =>
            cfsStatusHandler(getData, router, setMode).handleRejectAmend(ids)
          }
          onConfirmAmendment={(ids) =>
            cfsStatusHandler(getData, router, setMode).handleConfirmAmend(ids)
          }
        />

        {/* TABLE */}
        <TableContainer component={Paper} ref={tableWrapRef} className="mt-2">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox" sx={CHECKBOX_HEAD_SX}>
                  <Checkbox
                    size="small"
                    indeterminate={someChecked}
                    checked={allChecked}
                    onChange={toggleAll}
                    sx={CHECKBOX_SX}
                  />
                </TableCell>

                <TableCell>Company Name</TableCell>
                <TableCell>MBL No.</TableCell>
                <TableCell>Vessel</TableCell>
                <TableCell>Voyage No</TableCell>
                <TableCell>POD</TableCell>
                <TableCell>Place of Delivery</TableCell>
                <TableCell>Delivery Type</TableCell>
                <TableCell>CFS Type</TableCell>
                <TableCell>Consignee Name</TableCell>
                <TableCell>Nominated CB</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Login Id</TableCell>
                <TableCell>User Name</TableCell>
                <TableCell>Contact No</TableCell>
                <TableCell>Location</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {blData.length > 0 ? (
                blData.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell padding="checkbox" sx={CHECKBOX_CELL_SX}>
                      <Checkbox
                        size="small"
                        checked={selectedIds.includes(row.id)}
                        onChange={() => toggleOne(row.id)}
                        sx={CHECKBOX_SX}
                      />
                    </TableCell>

                    <TableCell>{row.CompanyName || "-"}</TableCell>
                    <TableCell>{row.mblNo || "-"}</TableCell>
                    <TableCell>{row.vesselName}</TableCell>
                    <TableCell>{row.voyageName}</TableCell>
                    <TableCell>{row.POD || "-"}</TableCell>
                    <TableCell>{row.PlaceOfDeleverey || "-"}</TableCell>
                    <TableCell>{row.dpd || "-"}</TableCell>
                    <TableCell>{row.cfsType || "-"}</TableCell>
                    <TableCell>{row.consigneeName || "-"}</TableCell>
                    <TableCell>{row.NominatedCB || "-"}</TableCell>
                    <TableCell
                      sx={{
                        color: statusColor(row.statusName.replace(/\s+/g, "")),
                      }}
                    >
                      {row.statusName || "-"}
                    </TableCell>
                    <TableCell>{row.LoginId || "-"}</TableCell>
                    <TableCell>{row.UserName || "-"}</TableCell>
                    <TableCell>{row.ContactNo || "-"}</TableCell>
                    <TableCell>{row.locationName || "-"}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={15} align="center">
                    {loadingState}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* FOOTER */}
        <Box className="flex justify-between items-center mt-1">
          <TableExportButtons
            targetRef={tableWrapRef}
            title="Search Request for CFS / DPD / ICD"
            fileName="search-request-cfs-dpd-icd"
          />

          <CustomPagination
            count={totalPage}
            totalRows={totalRows}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={(e, v) => getData(v, rowsPerPage)}
            handleChangeRowsPerPage={(e) => getData(1, Number(e.target.value))}
          />
        </Box>
      </Box>

      <ToastContainer />
    </ThemeProvider>
  );
}
