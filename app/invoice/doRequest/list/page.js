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
import { fetchTableValues } from "@/apis";
import { ToastContainer } from "react-toastify";
import { formStore } from "@/store";
import TableExportButtons from "@/components/tableExportButtons/tableExportButtons";
import { useGetUserAccessUtils } from "@/utils/getUserAccessUtils";
import { getUserByCookies } from "@/utils";
import DoToolbarActions from "@/components/selectionActions/doToolbarActions";
import { doStatusHandler, statusColor } from "../utils";
import { useRouter } from "next/navigation";

function createData(
  mblNo,
  validTill,
  isFreeDays,
  stuffDestuffId,
  linerName,
  doStatus,
  id
) {
  return {
    mblNo,
    validTill,
    isFreeDays,
    stuffDestuffId,
    linerName,
    doStatus,
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
  const [idsOnPage, setIdsOnPage] = useState([]);
  const userData = getUserByCookies();
  const { data } = useGetUserAccessUtils("HBL Request");
  const [someChecked, setSomeChecked] = useState(false);
  const [allChecked, setAllChecked] = useState(false);
  const router = useRouter();

  // --------------------------------------------
  // 🔥 Fetch Table Data
  // --------------------------------------------
  const getData = useCallback(
    async (pageNo = page, pageSize = rowsPerPage) => {
      try {
        const tableObj = {
          columns:
            "b.mblNo mblNo, b.validTill validTill, b.isFreeDays isFreeDays, m2.name stuffDestuffId, c.name linerName, m.name doStatus, b.id id",
          tableName: "tblBl b",
          pageNo,
          pageSize,
          joins: `
            left join tblCompany c on c.id = b.shippingLineId
            left join tblMasterData m on m.id = b.dostatusId
            left join tblMasterData m2 on m2.id = b.stuffDestuffId
            left join tblUser u on u.id = ${userData.userId}
            left join tblUser u2 on u2.companyId = u.companyId
            join tblBl b2 on b2.id = b.id and b.dostatusId is not null and b.locationId = ${userData.location} and b.doRequestCreatedBy = u2.id and m.name <> 'Confirm for DO'
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
    [page, rowsPerPage]
  );

  const rows = blData
    ? blData.map((item) =>
        createData(
          item["mblNo"],
          item["validTill"],
          item["isFreeDays"],
          item["stuffDestuffId"],
          item["linerName"],
          item["doStatus"],
          item["id"]
        )
      )
    : [];

  // ---------------- Checkbox Logic ----------------
  const toggleAll = () => {
    if (selectedIds.length > 0) {
      setSelectedIds([]);
      setAllChecked(false);
    } else {
      setSelectedIds(rows.map((item) => item.id));
      setAllChecked(true);
    }
  };

  const toggleOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    getData(1, rowsPerPage);
    setMode({ mode: null, formId: null });
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box className="sm:px-4 py-1">
        <Box className="flex flex-col sm:flex-row justify-between pb-1">
          <Typography variant="body1" className="text-left flex items-center">
            Do Request List
          </Typography>
          <CustomButton text="ADD" href="/invoice/doRequest" />
        </Box>
        <DoToolbarActions
          selectedIds={selectedIds}
          onView={(ids) =>
            doStatusHandler(getData, router, setMode).handleView(ids)
          }
          onEdit={(ids) =>
            doStatusHandler(getData, router, setMode).handleEdit(ids)
          }
          onRequestDO={(ids) => doStatusHandler(getData).handleRequestDO(ids)}
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
                <TableCell>Valid Till</TableCell>
                <TableCell>Free Days</TableCell>
                <TableCell>Stuff Destuff</TableCell>
                <TableCell>Liner Name</TableCell>
                <TableCell>Do Status</TableCell>
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
                    <TableCell>{row.mblNo}</TableCell>
                    <TableCell>{row.validTill}</TableCell>
                    <TableCell>{row.isFreeDays}</TableCell>
                    <TableCell>{row.stuffDestuffId}</TableCell>
                    <TableCell>{row.linerName}</TableCell>
                    <TableCell
                      sx={{
                        color: statusColor(row.doStatus.replace(/\s+/g, "")),
                      }}
                    >
                      {row.doStatus}
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

      <ToastContainer />
    </ThemeProvider>
  );
}
