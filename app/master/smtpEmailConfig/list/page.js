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
import { getUserByCookies } from "@/utils";

// 🔹 SAME STYLE helper
function createData(emailId, hostName, port, isSSL, updatedBy, updateDate, id) {
  return {
    emailId,
    hostName,
    port,
    isSSL,
    updatedBy,
    updateDate,
    id,
  };
}

export default function SmtpEmailConfigList() {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [totalPage, setTotalPage] = useState(1);
  const [totalRows, setTotalRows] = useState(1);
  const [smtpListData, setSmtpListData] = useState([]);
  const [search, setSearch] = useState({ searchColumn: "", searchValue: "" });
  const [loadingState, setLoadingState] = useState("Loading...");
  const { setMode } = formStore();
  const router = useRouter();
  const { data } = useGetUserAccessUtils("SMTP Email Configuration");
  const userData = getUserByCookies();

  // 🔹 FETCH DATA (same pattern)
  const getData = useCallback(
    async (pageNo = page, pageSize = rowsPerPage) => {
      try {
        const tableObj = {
          columns: `
            s1.emailId emailId,
            s1.hostName hostName,
            s1.port port,
            s1.isSSL isSSL,
            u.name updatedBy,
            s1.updatedDate updateDate,
            s1.id
          `,
          tableName: "tblSMTP s1",
          pageNo,
          pageSize,
          searchColumn: search.searchColumn,
          searchValue: search.searchValue,
          joins: `
            join tblSMTP s2 
              on s2.id = s1.id
                 and s2.companyId = ${userData?.companyId}
             and s2.locationId = ${userData?.location}
            left join tblUser u 
              on u.id = s1.updatedBy
          `,
        };

        const response = await fetchTableValues(tableObj);

        setSmtpListData(response?.data || response?.result || []);
        setTotalPage(response?.totalPage || 1);
        setTotalRows(response?.totalRows || 0);
        setPage(pageNo);
        setRowsPerPage(pageSize);
      } catch (err) {
        console.error("Error fetching SMTP data:", err);
        setLoadingState("Failed to load data");
      }
    },
    [page, rowsPerPage, search, userData]
  );

  useEffect(() => {
    getData(1, rowsPerPage);
    setMode({ mode: null, formId: null });
  }, []);

  // 🔹 SAME rows mapping style
  const rows = smtpListData
    ? smtpListData.map((item) =>
        createData(
          item["emailId"],
          item["hostName"],
          item["port"],
          item["isSSL"],
          item["updatedBy"],
          item["updateDate"],
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

  // 🔹 DELETE (same pattern)
  const handleDeleteRecord = async (formId) => {
    const obj = {
      recordId: formId,
      tableName: "tblSMTP",
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

  // 🔹 MODE HANDLER (same)
  const modeHandler = (mode, formId = null) => {
    if (mode === "delete") {
      handleDeleteRecord(formId);
      return;
    }
    setMode({ mode, formId });
    router.push("/master/smtpEmailConfig");
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <Box className="sm:px-4 py-1">
        <Box className="flex flex-col sm:flex-row justify-between pb-1">
          <Typography variant="body1" className="text-left flex items-center">
            SMTP Email Configuration
          </Typography>

          <Box className="flex flex-col sm:flex-row gap-6">
            <SearchBar
              getData={getData}
              rowsPerPage={rowsPerPage}
              search={search}
              setSearch={setSearch}
              options={[
                { label: "Email Id", value: "s1.emailId" },
                { label: "Host Name", value: "s1.hostName" },
              ]}
            />
            <CustomButton text="Add" href="/master/smtpEmailConfig" />
          </Box>
        </Box>

        <TableContainer component={Paper}>
          <Table size="small" sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell>Email Id</TableCell>
                <TableCell>Host Name</TableCell>
                <TableCell>Port</TableCell>
                <TableCell>SSL </TableCell>
                <TableCell> Updated By</TableCell>
                <TableCell> Updated Date</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {rows.length > 0 ? (
                rows.map((row, index) => (
                  <TableRow key={index} hover className="relative group">
                    <TableCell>{row.emailId}</TableCell>
                    <TableCell>{row.hostName}</TableCell>
                    <TableCell>{row.port}</TableCell>
                    <TableCell>{row.isSSL === "1" ? "Yes" : "No"}</TableCell>
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
