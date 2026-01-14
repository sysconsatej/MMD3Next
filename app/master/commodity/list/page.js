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
import { Commodity } from "../commodityData";
import { useGetUserAccessUtils } from "@/utils/getUserAccessUtils";
import { getUserByCookies } from "@/utils";
function createData(code, name, updatedBy, updateDate, id) {
  return { code, name, updatedBy, updateDate, id };
}

export default function CommodityList() {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [totalPage, setTotalPage] = useState(1);
  const [totalRows, setTotalRows] = useState(1);
  const [commodityData, setCommodityData] = useState([]);
  const [search, setSearch] = useState({ searchColumn: "", searchValue: "" });
  const [loadingState, setLoadingState] = useState("Loading...");
  const { setMode } = formStore();
  const router = useRouter();
  const { data } = useGetUserAccessUtils("Commodity");
  const userData = getUserByCookies();
  const getData = useCallback(
    async (pageNo = page, pageSize = rowsPerPage) => {
      try {
        const tableObj = {
          columns: " m.code code,m.name name,u.name updatedBy,m.updatedDate updateDate,m.id",
          tableName: "tblMasterData m",
          pageNo,
          pageSize,
          searchColumn: search.searchColumn,
          searchValue: search.searchValue,
          joins: ` join tblMasterData m1 on m1.id = m.id and m.masterListName = 'tblCommodityType' left join tblUser u on u.id= m.updatedBy`,
        };
        const { data, totalPage, totalRows } = await fetchTableValues(tableObj);
        setCommodityData(data);

        setTotalPage(totalPage);
        setPage(pageNo);
        setRowsPerPage(pageSize);
        setTotalRows(totalRows);
      } catch {
        setLoadingState("Failed to load data");
      }
    },
    [page, rowsPerPage, search]
  );

  useEffect(() => {
    getData(1, rowsPerPage);
    setMode({ mode: null, formId: null });
  }, []);

  const rows = commodityData
    ? commodityData.map((item) =>
        createData(item["code"], item["name"], item["updatedBy"], item["updateDate"], item["id"])
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
      tableName: "tblMasterData",
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
    router.push("/master/commodity");
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box className="sm:px-4 py-1 ">
        <Box className="flex flex-col sm:flex-row justify-between pb-1">
          <Typography variant="body1" className="text-left flex items-center ">
            Commodity
          </Typography>
          <Box className="flex flex-col sm:flex-row gap-6">
            <SearchBar
              getData={getData}
              rowsPerPage={rowsPerPage}
              search={search}
              setSearch={setSearch}
              options={Commodity}
            />
            <CustomButton text="Add" href="/master/commodity" />
          </Box>
        </Box>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} size="small" aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell> HSN Code</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Updated By</TableCell>
                <TableCell>Updated Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!rows.length ? (
                <TableRow>
                  <TableCell>{loadingState}</TableCell>
                </TableRow>
              ) : (
                rows.map((row, index) => (
                  <TableRow key={index} hover className="relative group ">
                    <TableCell>{row.code}</TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.updatedBy}</TableCell>
                    <TableCell>{row.updateDate}</TableCell>
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
