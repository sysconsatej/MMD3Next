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
import { depot } from "../depotData";
import { useGetUserAccessUtils } from "@/utils/getUserAccessUtils";
import { getUserByCookies } from "@/utils";
import { TableExcelButton } from "@/components/tableExportButtons/tableExportButtons";
function createData(
  depotName,
  location,
  code,
  address,
  updatedBy,
  updateDate,
  companyName,
  id,
) {
  return {
    depotName,
    location,
    code,
    address,
    updatedBy,
    updateDate,
    companyName,
    id,
  };
}

export default function DepotList() {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [totalPage, setTotalPage] = useState(1);
  const [totalRows, setTotalRows] = useState(1);
  const [depotData, setDepotData] = useState([]);
  const [search, setSearch] = useState({ searchColumn: "", searchValue: "" });
  const [loadingState, setLoadingState] = useState("Loading...");
  const { setMode } = formStore();
  const router = useRouter();
  const { data } = useGetUserAccessUtils();
  const userData = getUserByCookies();
  const tableWrapRef = useRef(null);
  const [searchCondition, setSearchCondition] = useState(
    `usr.id = ${userData?.userId}`,
  );

  const getData = useCallback(
    async (
      pageNo = page,
      pageSize = rowsPerPage,
      searchConditionMain = searchCondition,
    ) => {
      try {
        const tableObj = {
          columns:
            "p.name depotName ,m.name location,p.code code,p.address address,u.name updatedBy,p.updatedDate updateDate,comp.name companyName,p.id",
          tableName: "tblPort p",
          pageNo,
          pageSize,
          searchColumn: search.searchColumn,
          searchValue: search.searchValue,
          joins: `join tblMasterData m on m.id = p.portTypeId and m.name = 'DEPOT' and m.masterListName = 'tblPortType'
                  left join tblUser u on u.id = p.updatedBy
                  left join tblUser u3 on u3.roleCode = 'shipping'
                  left join tblUser usr on ${searchConditionMain}
                  left join tblUser u2 on u2.companyId = usr.companyId
                  left join tblCompany comp on comp.id=p.companyId
                  join tblPort p2 on p2.id = p.id and p2.createdBy = u2.id and p2.status = 1`,
        };
        const { data, totalPage, totalRows } = await fetchTableValues(tableObj);
        setDepotData(data);
        setTotalPage(totalPage);
        setPage(pageNo);
        setRowsPerPage(pageSize);
        setTotalRows(totalRows);
      } catch {
        setLoadingState("Failed to load data");
      }
    },
    [page, rowsPerPage, search, searchCondition],
  );

  const rows = depotData
    ? depotData.map((item) =>
        createData(
          item["depotName"],
          item["location"],
          item["code"],
          item["address"],
          item["updatedBy"],
          item["updateDate"],
          item["companyName"],
          item["id"],
        ),
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
      tableName: "tblPort",
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
    router.push("/master/depot");
  };

  useEffect(() => {
    if (userData?.roleCode === "admin") {
      setSearchCondition(`usr.roleCodeId = u3.id`);
      getData(1, rowsPerPage, `usr.roleCodeId = u3.id`);
    } else {
      getData(1, rowsPerPage);
      setMode({ mode: null, formId: null });
    }
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box className="sm:px-4 py-1">
        <Box className="flex flex-col sm:flex-row justify-between pb-2">
          <Typography variant="body1" className="text-left flex items-center">
            Empty Depot
          </Typography>
          <Box className="flex flex-col sm:flex-row gap-6">
            <SearchBar
              getData={getData}
              rowsPerPage={rowsPerPage}
              search={search}
              setSearch={setSearch}
              options={depot}
            />
            {userData?.roleCode === "shipping" && (
              <CustomButton text="Add" href="/master/depot" />
            )}
          </Box>
        </Box>

        <TableContainer component={Paper} ref={tableWrapRef} className="mt-2">
          <Table size="small" sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell>Code</TableCell>
                <TableCell>Empty Yard/Empty Depot</TableCell>
                <TableCell>Address</TableCell>
                <TableCell>Updated By</TableCell>
                <TableCell>Updated Date</TableCell>
                <TableCell>Company Name</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length > 0 ? (
                rows.map((row, i) => (
                  <TableRow key={i} hover className="relative group">
                    <TableCell>{row.code}</TableCell>
                    <TableCell>{row.depotName}</TableCell>
                    <TableCell>{row.address}</TableCell>
                    <TableCell>{row.updatedBy}</TableCell>
                    <TableCell>{row.updateDate}</TableCell>
                    <TableCell>{row.companyName}</TableCell>
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
                  <TableCell colSpan={6} align="center">
                    Loading...
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <Box
          className={`flex items-center mt-2 ${
            userData?.roleCode === "admin" ? "justify-between" : "justify-end"
          }`}
        >
          {userData?.roleCode === "admin" && (
            <TableExcelButton
              targetRef={tableWrapRef}
              title="Empty Depot"
              fileName="Empty-Depot-List"
            />
          )}
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
      </Box>
      <ToastContainer />
    </ThemeProvider>
  );
}
