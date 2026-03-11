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
import { country } from "../consigneeCfsMappingData";
import { useGetUserAccessUtils } from "@/utils/getUserAccessUtils";
import { getUserByCookies } from "@/utils";

function createData(
  shippingLine,
  location,
  consignee,
  cfs,
  activeInactive,
  updatedBy,
  updatedDate,
  id,
) {
  return { shippingLine, location, consignee, cfs, activeInactive, updatedBy, updatedDate, id };
}

export default function ConsigneeCfsMappingList() {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [totalPage, setTotalPage] = useState(1);
  const [totalRows, setTotalRows] = useState(1);
  const [tableData, setTableData] = useState([]);
  const [search, setSearch] = useState({ searchColumn: "", searchValue: "" });
  const [loadingState, setLoadingState] = useState("Loading...");

  const { setMode } = formStore();
  const router = useRouter();
  const userData = getUserByCookies();
  const { data } = useGetUserAccessUtils();

  const [searchCondition, setSearchCondition] = useState(
    `loggedUser.id = ${userData?.userId}`,
  );

  const getData = useCallback(
    async (
      pageNo = page,
      pageSize = rowsPerPage,
      searchConditionMain = searchCondition,
    ) => {
      try {
        setLoadingState("Loading...");

        const tableObj = {
          columns: `
            s.name AS shippingLine,
            l.name AS location,
            consignee.name AS consignee,
            cfs.name + '-' + cfs.code AS cfs,
            up.name AS updatedBy,
            c.updatedDate AS updatedDate,
            c.activeInactive AS activeInactive,
            c.id
          `,
          tableName: "tblConsigneeCfsMapping c",
          pageNo,
          pageSize,
          searchColumn: search.searchColumn,
          searchValue: search.searchValue,
          joins: `
            LEFT JOIN tblCompany s ON s.id = c.companyId
            LEFT JOIN tblLocation l ON l.id = c.locationId
            LEFT JOIN tblUser consignee ON consignee.id = c.consigneeId
            LEFT JOIN tblPort cfs ON cfs.id = c.cfsId
            LEFT JOIN tblUser creator ON creator.id = c.createdBy
            LEFT JOIN tblUser up ON up.id = c.updatedBy
            LEFT JOIN tblUser u3 ON u3.roleCode = 'shipping'
            LEFT JOIN tblUser loggedUser ON ${searchConditionMain}

            JOIN tblConsigneeCfsMapping c2
              ON c2.id = c.id
             AND c.createdBy = loggedUser.id
             AND c.locationId = ${userData?.location}
          `,
        };

        const { data, totalPage, totalRows } = await fetchTableValues(tableObj);

        setTableData(data || []);
        setTotalPage(totalPage || 1);
        setPage(pageNo);
        setRowsPerPage(pageSize);
        setTotalRows(totalRows || 0);
        setLoadingState("No data found");
      } catch {
        setTableData([]);
        setLoadingState("Failed to load data");
      }
    },
    [page, rowsPerPage, search, searchCondition, userData?.location],
  );

  useEffect(() => {
    getData(1, rowsPerPage);
    setMode({ mode: null, formId: null });

    if (userData?.roleCode === "admin") {
      const adminCondition = `loggedUser.roleCodeId = u3.id`;
      setSearchCondition(adminCondition);
      getData(1, rowsPerPage, adminCondition);
    }
  }, []);

  const rows = tableData
    ? tableData.map((item) =>
        createData(
          item["shippingLine"],
          item["location"],
          item["consignee"],
          item["cfs"],
          item["activeInactive"],
          item["updatedBy"],
          item["updatedDate"],
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
      tableName: "tblConsigneeCfsMapping",
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
    router.push("/master/consigneeCfsMapping");
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <Box className="sm:px-4 py-1">
        <Box className="flex flex-col sm:flex-row justify-between pb-1">
          <Typography variant="body1" className="text-left flex items-center">
            Consignee CFS Mapping
          </Typography>

          <Box className="flex flex-col sm:flex-row gap-6">
            <SearchBar
              getData={getData}
              rowsPerPage={rowsPerPage}
              search={search}
              setSearch={setSearch}
              options={country}
            />

            {userData?.roleCode === "shipping" && (
              <CustomButton text="Add" href="/master/consigneeCfsMapping" />
            )}
          </Box>
        </Box>

        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} size="small" aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>Shipping Line</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Consignee</TableCell>
                <TableCell>CFS</TableCell>
                <TableCell>Active</TableCell>
                <TableCell>Updated By</TableCell>
                <TableCell>Updated Date</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {!rows.length ? (
                <TableRow>
                  <TableCell colSpan={7}>{loadingState}</TableCell>
                </TableRow>
              ) : (
                rows.map((row, index) => (
                  <TableRow key={index} hover className="relative group">
                    <TableCell>{row.shippingLine}</TableCell>
                    <TableCell>{row.location}</TableCell>
                    <TableCell>{row.consignee}</TableCell>
                    <TableCell>{row.cfs}</TableCell>
                    <TableCell>{row.activeInactive}</TableCell>
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