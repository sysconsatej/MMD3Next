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
import SelectionActionsBar from "@/components/selectionActions/selectionActionPayment";
import { tableObj } from "../utils";
import TableExportButtons from "@/components/tableExportButtons/tableExportButtons";
import { statusColor } from "../../hbl/utils";
import AdvancedSearchBar from "@/components/advanceSearchBar/advanceSearchBar";

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
  const [loadingState, setLoadingState] = useState("Loading...");
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

  useEffect(() => {
    getData(1, rowsPerPage);
    setMode({ mode: null, formId: null });
  }, []);

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

  const modeHandler = (mode, id) => {
    if (mode === "delete") {
      handleDeleteRecord(id);
      return;
    }
    setMode({ mode, formId: id });
    router.push("/bl/cfs-request");
  };

  /* ---------------- Render ---------------- */
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box className="sm:px-4 py-1">
        <Box className="flex justify-between pb-1">
          <Typography variant="body1">CFS Request</Typography>

          <Box className="flex gap-4">
            <AdvancedSearchBar
              fields={fieldData.fields.map((r) => {
                return { ...r, disabled: false };
              })}
              advanceSearch={advanceSearch}
              setAdvanceSearch={setAdvanceSearch}
              getData={getData}
              rowsPerPage={rowsPerPage}
            />
            <CustomButton text="Add" href="/bl/cfs-request" />
          </Box>
        </Box>

        {/* ACTION BAR */}
        <SelectionActionsBar
          selectedIds={selectedIds}
          onEdit={(id) => modeHandler("edit", id)}
          onView={(id) => modeHandler("view", id)}
          onUpdated={() => getData(page, rowsPerPage)}
        />

        {/* TABLE */}
        <TableContainer component={Paper} className="mt-2" ref={tableWrapRef}>
          <Table
            size="small"
            className="
            w-full table-fixed
            [&_th]:whitespace-normal [&_td]:whitespace-normal
            [&_th]:break-words      [&_td]:break-words
            [&_th]:px-1 [&_td]:px-1
            [&_th]:py-1 [&_td]:py-1
            [&_th]:text-[11px] [&_td]:text-[11px]
           "
          >
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

                <TableCell />
              </TableRow>
            </TableHead>

            <TableBody>
              {rows.length > 0 ? (
                rows.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell padding="checkbox" sx={CHECKBOX_CELL_SX}>
                      <Checkbox
                        size="small"
                        checked={selectedIds.includes(row.id)}
                        onChange={() => toggleOne(row.id)}
                        sx={CHECKBOX_SX}
                      />
                    </TableCell>

                    <TableCell>{row.locationId}</TableCell>
                    <TableCell>{row.shippingLineId}</TableCell>
                    <TableCell>{row.mblNo}</TableCell>
                    <TableCell>{row.mblDate}</TableCell>
                    <TableCell>{row.podVesselId}</TableCell>
                    <TableCell>{row.podVoyageId}</TableCell>
                    <TableCell>{row.fpdId}</TableCell>
                    <TableCell>{row.consigneeText}</TableCell>
                    <TableCell>{row.cfsTypeId}</TableCell>
                    <TableCell>{row.nominatedAreaId}</TableCell>
                    <TableCell>{row.dpdId}</TableCell>
                    <TableCell>{row.customBrokerText}</TableCell>
                    <TableCell
                      sx={{
                        color: statusColor(
                          row.cfsRequestStatusId.replace(/\s+/g, "")
                        ),
                      }}
                    >
                      {row.cfsRequestStatusId}
                    </TableCell>

                    {/* ACTION ICONS */}
                    <TableCell
                      onClick={(e) => e.stopPropagation()}
                      className="opacity-0 group-hover:opacity-100"
                    >
                      <HoverActionIcons
                        onView={() => modeHandler("view", row.id)}
                        onEdit={() => modeHandler("edit", row.id)}
                        onDelete={() => modeHandler("delete", row.id)}
                        menuAccess={menuAccess ?? {}}
                      />
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
