"use client";
import React, { useCallback, useEffect, useState } from "react";
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
import { VoyageRoute } from "../voyageRouteData";
import { useGetUserAccessUtils } from "@/utils/getUserAccessUtils";
import { getUserByCookies } from "@/utils";
function createData(portOfCall, vesselNo, voyageNo, igmNo, terminal, updatedBy, updatedDate, id) {
  return {
    portOfCall,
    vesselNo,
    voyageNo,
    igmNo,
    terminal,
    updatedBy,
    updatedDate,
    id,
  };
}

export default function VoyageRouteList() {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [totalPage, setTotalPage] = useState(1);
  const [totalRows, setTotalRows] = useState(1);
  const [voyageRouteData, setVoyageRouteData] = useState([]);
  const [search, setSearch] = useState({ searchColumn: "", searchValue: "" });
  const [loadingState, setLoadingState] = useState("Loading...");
  const { setMode } = formStore();
  const router = useRouter();
  const { data } = useGetUserAccessUtils();
  const userData = getUserByCookies();
  const getData = useCallback(
    async (pageNo = page, pageSize = rowsPerPage) => {
      try {
        const tableObj = {
          columns:
            "p.name portOfCall, v.voyageId voyageId, ve.name vesselNo, v.exportLocking exportLocking, v.importLocking importLocking,v.igmNo igmNo, p1.code terminal, vo.voyageNo voyageNo,u.name updatedBy,v.updatedDate as updatedDate,v.id",
          tableName: "tblVoyageRoute v",
          pageNo,
          pageSize,
          searchColumn: search.searchColumn,
          searchValue: search.searchValue,
          joins: `left join tblPort p on v.portOfCallId = p.id left join tblPort p1 on v.berthId = p1.id left join tblVessel ve on v.vesselId = ve.id   join tblVoyage vo on vo.id=v.voyageId and v.companyid=${userData?.companyId} left join tblUser u on u.id = v.updatedBy
`,
        };
        const { data, totalPage, totalRows } = await fetchTableValues(tableObj);

        setVoyageRouteData(data);
        setTotalPage(totalPage);
        setPage(pageNo);
        setRowsPerPage(pageSize);
        setTotalRows(totalRows);
      } catch (err) {
        console.error("Error fetching city data:", err);
        setLoadingState("Failed to load data");
      }
    },
    [page, rowsPerPage, search]
  );

  useEffect(() => {
    getData(1, rowsPerPage);
    setMode({ mode: null, formId: null });
  }, []);

  const rows = voyageRouteData
    ? voyageRouteData.map((item) =>
        createData(
          item["portOfCall"],
          item["vesselNo"],
          item["voyageNo"],
          item["igmNo"],
          item["terminal"],
          item["updatedBy"],
          item["updatedDate"],
          item["id"]
        )
      )
    : [];

  const handleChangePage = (event, newPage) => {
    getData(newPage, rowsPerPage);
  };

  const handleChangeRowsPerPage = (event) => {
    getData(1, +event.target.value);
  };

  const handleDeleteRecord = async (formId) => {
    const updateObj = {
      updatedBy: userData?.userId,
      clientId: 1,
      updatedDate: new Date(),
    };
    const obj = {
      recordId: formId,
      tableName: "tblVoyageRoute",
      ...updateObj,
    };
    const { success, message, error } = await deleteRecord(obj);
    if (success) {
      toast.success(message);
      getData(page, rowsPerPage);
    } else {
      toast.error(error || message);
    }
  };

  const modeHandler = (mode, formId = null) => {
    if (mode === "delete") {
      handleDeleteRecord(formId);
      return;
    }
    setMode({ mode, formId });
    router.push("/master/voyageRoute");
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box className="sm:px-4 py-1">
        <Box className="flex flex-col sm:flex-row justify-between pb-1">
          <Typography variant="body1" className="text-left flex items-center">
            Voyage Route
          </Typography>
          <Box className="flex flex-col sm:flex-row gap-6">
            <SearchBar
              getData={getData}
              rowsPerPage={rowsPerPage}
              search={search}
              setSearch={setSearch}
              options={VoyageRoute}
            />
            <CustomButton text="Add" href="/master/voyageRoute" />
          </Box>
        </Box>

        <TableContainer component={Paper}>
          <Table size="small" sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell>Port Of Call</TableCell>
                <TableCell>Vessel Name</TableCell>
                <TableCell>Voyage</TableCell>
                <TableCell>IGM No</TableCell>
                <TableCell>Terminal</TableCell>
                <TableCell>Updated By</TableCell>
                <TableCell>Updated Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length > 0 ? (
                rows.map((row, index) => (
                  <TableRow key={index} hover className="relative group ">
                    <TableCell>{row.portOfCall}</TableCell>
                    <TableCell>{row.vesselNo}</TableCell>
                    <TableCell>{row.voyageNo}</TableCell>
                    <TableCell>{row.igmNo}</TableCell>
                    <TableCell>{row.terminal}</TableCell>
                    <TableCell>{row.updatedBy}</TableCell>
                    <TableCell>{row.updatedDate}</TableCell>
                    <TableCell className="table-icons opacity-0 group-hover:opacity-100">
                      <HoverActionIcons
                        onView={() => modeHandler("view", row.id)}
                        onEdit={() => modeHandler("edit", row.id)}
                        onDelete={() => modeHandler("delete", row.id)}
                        menuAccess={data ?? {}}
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    {loadingState}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Box className="flex justify-end items-center mt-2">
          <CustomPagination
            count={totalPage}
            totalRows={totalRows}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={handleChangePage}
            handleChangeRowsPerPage={handleChangeRowsPerPage}
          />
        </Box>
      </Box>
      <ToastContainer />
    </ThemeProvider>
  );
}
