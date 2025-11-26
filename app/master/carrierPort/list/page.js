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
import { useGetUserAccessUtils } from "@/utils/getUserAccessUtils";
import { fieldData, searchDataAray } from "../carrierPortData";
import { getUserByCookies } from "@/utils";

function createData(
  companyId,
  name,
  podId,
  fpdId,
  modeId,
  panNo,
  bondNo,
  id
) {
  return {
    companyId,
    name,
    podId,
    fpdId,
    modeId,
    panNo,
    bondNo,
    id,
  };
}

export default function CompanyList() {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [totalPage, setTotalPage] = useState(1);
  const [totalRows, setTotalRows] = useState(1);
  const [berthData, setBerthData] = useState([]);
  const [search, setSearch] = useState({ searchColumn: "", searchValue: "" });
  const [loadingState, setLoadingState] = useState("Loading...");
  const { setMode } = formStore();
  const router = useRouter();
  const { data } = useGetUserAccessUtils("Company");
  const userData = getUserByCookies();
  const getData = useCallback(
    async (pageNo = page, pageSize = rowsPerPage) => {
      try {
        const tableObj = {
          columns:
            "s.name as companyId,c.name as name,p.name as podId,p1.name as fpdId,m.name as modeId,c.panNo,c.bondNo , c.id as id",
          tableName: "tblCarrierPort c",
          pageNo,
          pageSize,
          searchColumn: search.searchColumn,
          searchValue: search.searchValue,
          joins:
            `left join tblCompany s on s.id='${userData?.companyId}' left join tblPort p on p.id=c.podId left join tblPort p1 on p1.id=c.fpdId left join tblMasterData m on m.id=c.modeId`,
        };
        const { data, totalPage, totalRows } = await fetchTableValues(tableObj);
        setBerthData(data ?? []);
        setTotalPage(totalPage);
        setPage(pageNo);
        setRowsPerPage(pageSize);
        setTotalRows(totalRows);
      } catch (err) {
        setLoadingState("Failed to load data");
      } finally  {
        setLoadingState("Loading ...")
      }
    },
    [page, rowsPerPage, search]
  );

  useEffect(() => {
    getData(1, rowsPerPage);
    setMode({ mode: null, formId: null });
  }, []);

  const rows = berthData
    ? berthData.map((item) =>
        createData(
          item["companyId"],
          item["name"],
          item["podId"],
          item["fpdId"],
          item["modeId"],
          item["panNo"],
          item["bondNo"],
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

  // delete
  const handleDeleteRecord = async (formId) => {
    
     const updateObj = {
      updatedBy: userData?.userId,
      clientId: 1,
      updatedDate: new Date(),
    };
    const obj = {
      recordId: formId,
      tableName: "tblCarrierPort",
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
    router.push("/master/carrierPort");
  };


  




  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box className="sm:px-4 py-1">
        <Box className="flex flex-col sm:flex-row justify-between pb-1">
          <Typography variant="body1" className="text-left flex items-center">
            Carrier Port
          </Typography>
          <Box className="flex flex-col sm:flex-row gap-6">
            <SearchBar
              getData={getData}
              rowsPerPage={rowsPerPage}
              search={search}
              setSearch={setSearch}
              options={searchDataAray}
            />
            <CustomButton text="Add" href="/master/carrierPort" />
          </Box>
        </Box>
        {/* Table */}
        <TableContainer component={Paper}>
          <Table size="small" sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                {fieldData.berthAgentFields.map((item) => (
                  <TableCell key={item.name}>{item.label}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length > 0 ? (
                rows.map((row, index) => (
                  <TableRow key={index} hover className="relative group">
                    <TableCell>{row?.companyId}</TableCell>
                    <TableCell>{row?.name}</TableCell>
                    <TableCell>{row?.podId}</TableCell>
                    <TableCell>{row?.fpdId}</TableCell>
                    <TableCell>{row?.modeId}</TableCell>
                    <TableCell>{row?.panNo}</TableCell>
                    <TableCell>{row?.bondNo}</TableCell>
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
                    {"No Data Found"}
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
