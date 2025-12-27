"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
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
import { deleteRecord, fetchTableValues } from "@/apis";
import SearchBar from "@/components/searchBar/searchBar";
import { toast, ToastContainer } from "react-toastify";
import { HoverActionIcons } from "@/components/tableHoverIcons/tableHoverIcons";
import { formStore } from "@/store";
import { useRouter } from "next/navigation";
import { fieldData, tblColsLables } from "../fieldsData";
import { useGetUserAccessUtils } from "@/utils/getUserAccessUtils";
import { getUserByCookies } from "@/utils";
import { cfsStatusHandler, tableObj } from "../utils";
import TableExportButtons from "@/components/tableExportButtons/tableExportButtons";
import { statusColor } from "../../hbl/utils";
import AdvancedSearchBar from "@/components/advanceSearchBar/advanceSearchBar";
import SearchRequestToolbarActions from "@/components/selectionActions/cfsRequestActionBar";

/* checkbox sizing – SAME AS OTHER PAGE */
const CHECKBOX_HEAD_SX = { width: 36, minWidth: 36, maxWidth: 36 };
const CHECKBOX_CELL_SX = { width: 32, minWidth: 32, maxWidth: 32 };
const CHECKBOX_SX = { p: 0.25, "& .MuiSvgIcon-root": { fontSize: 18 } };

export default function CompanyList() {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(100);
  const [totalPage, setTotalPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [rows, setRows] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [search, setSearch] = useState({ searchColumn: "", searchValue: "" });
  const [loadingState, setLoadingState] = useState("NO DATA...");
  const tableWrapRef = useRef(null);
  const [advanceSearch, setAdvanceSearch] = useState({});

  const { setMode } = formStore();
  const router = useRouter();
  const { data: menuAccess } = useGetUserAccessUtils("CFS Request");
  const userData = getUserByCookies();

  /* ---------------- Fetch Data ---------------- */
  const getData = useCallback(
    async (pageNo = page, pageSize = rowsPerPage) => {
      try {
        const payload = tableObj({ pageNo, pageSize, search });
        const { data, totalPage, totalRows } = await fetchTableValues(payload);

        setRows(data || []);
        setTotalPage(totalPage || 1);
        setTotalRows(totalRows || 0);
        setPage(pageNo);
        setRowsPerPage(pageSize);
        setSelectedIds([]);
      } catch (err) {
        console.error(err);
        setLoadingState("Failed to load data");
      }
    },
    [page, rowsPerPage, search]
  );

  /* ---------------- Checkbox Logic ---------------- */
  const idsOnPage = rows.map((r) => r.id);
  const allChecked =
    idsOnPage.length > 0 && selectedIds.length === idsOnPage.length;
  const someChecked =
    selectedIds.length > 0 && selectedIds.length < idsOnPage.length;

  const toggleAll = (checked) => setSelectedIds(checked ? idsOnPage : []);

  const toggleOne = (id) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  /* ---------------- Actions ---------------- */
  const handleDeleteRecord = async (id) => {
    const obj = {
      recordId: id,
      updatedBy: userData?.userId,
      clientId: 1,
      updatedDate: new Date(),
    };

    const { success, message, error } = await deleteRecord(obj);
    if (success) {
      toast.success(message);
      getData(page, rowsPerPage);
    } else {
      toast.error(error || message);
    }
  };

  /* ---------------- Render ---------------- */
  useEffect(() => {
    getData(1, rowsPerPage);
    setMode({ mode: null, formId: null });
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box className="sm:px-4 py-1">
        <Box className="flex justify-between pb-1">
          <Typography variant="body1">CFS Request</Typography>

          <Box className="flex gap-4">
            <CustomButton text="Add" href="/bl/cfs-request" />
          </Box>
        </Box>
        <SearchRequestToolbarActions
          selectedIds={selectedIds}
          onEdit={(id) =>
            cfsStatusHandler(getData, router, setMode).handleEdit(id)
          }
          onView={(id) =>
            cfsStatusHandler(getData, router, setMode).handleEdit(id)
          }
          onRequest={(ids) =>
            cfsStatusHandler(getData, router, setMode).handleRequest(ids)
          }
        />
        <TableContainer component={Paper} className="mt-2" ref={tableWrapRef}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox" sx={CHECKBOX_HEAD_SX}>
                  <Checkbox
                    size="small"
                    checked={allChecked}
                    indeterminate={someChecked}
                    onChange={(e) => toggleAll(e.target.checked)}
                    sx={CHECKBOX_SX}
                  />
                </TableCell>

                {tblColsLables.map((label, i) => (
                  <TableCell key={i}>{label}</TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {rows.length > 0 ? (
                rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell padding="checkbox" sx={CHECKBOX_CELL_SX}>
                      <Checkbox
                        size="small"
                        checked={selectedIds.includes(row.id)}
                        onChange={() => toggleOne(row.id)}
                        sx={CHECKBOX_SX}
                      />
                    </TableCell>

                    <TableCell>{row?.locationId}</TableCell>
                    <TableCell>{row?.shippingLineId}</TableCell>
                    <TableCell>{row?.mblNo}</TableCell>
                    <TableCell>{row?.mblDate}</TableCell>
                    <TableCell>{row?.podVesselId}</TableCell>
                    <TableCell>{row?.podVoyageId}</TableCell>
                    <TableCell>{row?.fpdId}</TableCell>
                    <TableCell>{row?.consigneeText}</TableCell>
                    <TableCell>{row?.cfsTypeId}</TableCell>
                    <TableCell>{row?.nominatedAreaId}</TableCell>
                    <TableCell>{row?.dpdId}</TableCell>
                    <TableCell>{row?.customBrokerText}</TableCell>
                    <TableCell
                      sx={{
                        color: statusColor(
                          row.cfsRequestStatusId.replace(/\s+/g, "")
                        ),
                      }}
                    >
                      {row.cfsRequestStatusId}
                    </TableCell>
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

        <Box className="flex justify-between items-center mt-1">
          <TableExportButtons
            targetRef={tableWrapRef}
            title="Search Request for CFS / DPD / ICD"
            fileName="CFS Request"
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
