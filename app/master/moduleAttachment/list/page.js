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
import { country } from "../moduleAttachment";
import { useGetUserAccessUtils } from "@/utils/getUserAccessUtils";
import { getUserByCookies } from "@/utils";

function createData(
  shippingLine,
  location,
  moduleName,
  attachmentNames,
  updatedBy,
  updatedDate,
  id,
) {
  return {
    shippingLine,
    location,
    moduleName,
    attachmentNames,
    updatedBy,
    updatedDate,
    id,
  };
}

export default function ModuleAttachmentList() {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [totalPage, setTotalPage] = useState(1);
  const [totalRows, setTotalRows] = useState(1);
  const [attachmentData, setAttachmentData] = useState([]);
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
            line.name AS shippingLine,
            l.name AS location,
            master1.name AS moduleName,
            STRING_AGG(master2.name, ', ') AS attachmentNames,
            u.name AS updatedBy,
            m.updatedDate AS updatedDate,
            m.id
          `,
          tableName: "tblModuleAttachment m",
          pageNo,
          pageSize,
          searchColumn: search.searchColumn,
          searchValue: search.searchValue,
          joins: `
            LEFT JOIN tblCompany line ON line.id = m.shippingLineId
            LEFT JOIN tblLocation l ON l.id = m.locationId
            LEFT JOIN tblUser u ON u.id = m.updatedBy
            LEFT JOIN tblMasterData master1 ON master1.id = m.moduleId
            OUTER APPLY STRING_SPLIT(m.attachmentId, ',') s
            LEFT JOIN tblMasterData master2 ON master2.id = TRY_CAST(s.value AS INT)
            LEFT JOIN tblUser u3 ON u3.roleCode = 'shipping'
            LEFT JOIN tblUser loggedUser ON ${searchConditionMain}

            JOIN tblModuleAttachment m2
              ON m2.id = m.id
             AND m.createdBy = loggedUser.id
             AND m.locationId = ${userData?.location}
          `,
          groupBy: `
            GROUP BY
              line.name,
              l.name,
              master1.name,
              u.name,
              m.updatedDate,
              m.id
          `,
          orderBy: `order by m.updatedDate desc`,
        };

        const { data, totalPage, totalRows } = await fetchTableValues(tableObj);

        setAttachmentData(data || []);
        setTotalPage(totalPage);
        setPage(pageNo);
        setRowsPerPage(pageSize);
        setTotalRows(totalRows);
        setLoadingState("No data found");
      } catch {
        setLoadingState("Failed to load data");
      }
    },
    [page, rowsPerPage, search, searchCondition, userData?.location],
  );

  const rows = attachmentData
    ? attachmentData.map((item) =>
        createData(
          item["shippingLine"],
          item["location"],
          item["moduleName"],
          item["attachmentNames"],
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
      tableName: "tblModuleAttachment",
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
    router.push("/master/moduleAttachment");
  };

  useEffect(() => {
    if (userData?.roleCode === "admin") {
      const adminCondition = `loggedUser.roleCodeId = u3.id`;
      setSearchCondition(adminCondition);
      getData(1, rowsPerPage, adminCondition);
    } else {
      getData(1, rowsPerPage);
      setMode({ mode: null, formId: null });
    }
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box className="sm:px-4 py-1 ">
        <Box className="flex flex-col sm:flex-row justify-between pb-1">
          <Typography variant="body1" className="text-left flex items-center ">
            Module Attachment
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
              <CustomButton text="Add" href="/master/moduleAttachment" />
            )}
          </Box>
        </Box>

        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} size="small" aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>Shipping Line</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Module</TableCell>
                <TableCell>Attachments</TableCell>
                <TableCell>Updated By</TableCell>
                <TableCell>Updated Date</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {!rows.length ? (
                <TableRow>
                  <TableCell colSpan={6}>{loadingState}</TableCell>
                </TableRow>
              ) : (
                rows.map((row, index) => (
                  <TableRow key={index} hover className="relative group">
                    <TableCell>{row.shippingLine}</TableCell>
                    <TableCell>{row.location}</TableCell>
                    <TableCell>{row.moduleName}</TableCell>
                    <TableCell>{row.attachmentNames}</TableCell>
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
