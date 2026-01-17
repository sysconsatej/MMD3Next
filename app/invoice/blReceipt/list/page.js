"use client";
import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CssBaseline,
  Link,
  Typography,
} from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "@/styles/globalCss";

import { fetchTableValues } from "@/apis";
import { ToastContainer, toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { formStore } from "@/store";
import CustomPagination from "@/components/pagination/pagination";
import CustomButton from "@/components/button/button";
import AdvancedSearchBar from "@/components/advanceSearchBar/advanceSearchBar";
import { getUserByCookies } from "@/utils";

import { advanceSearchFields, advanceSearchFilter } from "../blReceiptData";
import { InvoiceModal } from "../utils";
import AttachFileIcon from "@mui/icons-material/AttachFile";

const LIST_TABLE = "tblInvoicePayment p";

export default function ReceiptList() {
  const router = useRouter();
  const { setMode } = formStore();

  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [totalPage, setTotalPage] = useState(1);
  const [totalRows, setTotalRows] = useState(1);
  const [advanceSearch, setAdvanceSearch] = useState({});
  const [modal, setModal] = useState({
    toggle: false,
    value: null,
  });

  const tableWrapRef = useRef(null);

  const getData = useCallback(
    async (pg = page, pgSize = rowsPerPage) => {
      try {
        const userData = getUserByCookies();
        if (!userData?.userId) {
          toast.error("Login required.");
          return;
        }

        const tableObj = {
          columns: `
          MIN(p.id) AS id,                                 
          STRING_AGG(p.receiptNo, ', ') AS receiptNo,      
          MAX(p.receiptDate) AS receiptDate,               
          p.blNo AS blNo,                
          u1.name AS payorName,                            
          SUM(p.Amount) AS Amount,
          STRING_AGG(p.id, ',') AS receiptIds   
          `,
          tableName: LIST_TABLE,
          pageNo: pg,
          pageSize: pgSize,

          // NEW — advanced search injection
          advanceSearch: advanceSearchFilter(advanceSearch),

          joins: `
            LEFT JOIN tblUser u ON u.id = ${userData.userId} and p.shippingLineId = u.companyId 
            left join tblLocation l on l.id =p.locationId and p.locationId = ${userData.location}
            LEFT JOIN tblUser u1 ON u1.id = p.createdBy
            JOIN tblMasterData ms ON ms.id = p.paymentStatusId and ms.name='Payment Confirmed' and p.receiptNo is not null
          `,
          groupBy: `GROUP BY p.blNo, u1.name`,
          orderBy: "ORDER BY MAX(p.createdDate) DESC",
        };

        const { data, totalPage, totalRows } = await fetchTableValues(tableObj);

        setRows(Array.isArray(data) ? data : []);
        setPage(pg);
        setRowsPerPage(pgSize);
        setTotalPage(totalPage);
        setTotalRows(totalRows);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load receipt list");
      }
    },
    [page, rowsPerPage, advanceSearch]
  );

  useEffect(() => {
    setMode({ mode: null, formId: null });
    getData(1, rowsPerPage);
  }, []);

  const changePage = (e, v) => getData(v, rowsPerPage);
  const changeRows = (e) => getData(1, +e.target.value);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <Box className="sm:px-4 py-1">
        {/* TITLE + ADD BUTTON */}

        <Box className="flex flex-col sm:flex-row justify-between pb-1">
          <Typography variant="body1">Receipt</Typography>

          <Box className="flex flex-col sm:flex-row gap-6">
            <AdvancedSearchBar
              fields={advanceSearchFields.bl}
              advanceSearch={advanceSearch}
              setAdvanceSearch={setAdvanceSearch}
              getData={() => getData(1, rowsPerPage)}
              rowsPerPage={rowsPerPage}
            />
            <CustomButton text="Add" href="/invoice/blReceipt" />
          </Box>
        </Box>

        {/* TABLE */}
        <TableContainer component={Paper} ref={tableWrapRef}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Receipt No</TableCell>
                <TableCell>Receipt Date</TableCell>
                <TableCell>BL No</TableCell>
                <TableCell>Payor Name</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Attachments</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {rows.length > 0 ? (
                rows.map((row, i) => (
                  <TableRow key={i} hover>
                    <TableCell>
                      <Link
                        href="#"
                        underline="hover"
                        onClick={(e) => {
                          e.preventDefault();
                          formStore
                            .getState()
                            .setMode({ mode: "view", formId: row.receiptIds });
                          router.push(`/invoice/blReceipt`);
                        }}
                        sx={{ cursor: "pointer", fontWeight: 500 }}
                      >
                        {row.receiptNo || "-"}
                      </Link>
                    </TableCell>

                    <TableCell>{row.receiptDate || "-"}</TableCell>
                    <TableCell>{row.blNo || "-"}</TableCell>
                    <TableCell>{row.payorName || "-"}</TableCell>
                    <TableCell>{row.Amount}</TableCell>
                    <TableCell>
                      <AttachFileIcon
                        sx={{ cursor: "pointer", fontSize: 16 }}
                        onClick={() =>
                          setModal((prev) => ({
                            ...prev,
                            toggle: true,
                            value: row.receiptIds, // paymentId
                          }))
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No records found
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
            onPageChange={changePage}
            handleChangeRowsPerPage={changeRows}
          />
        </Box>
      </Box>
      <InvoiceModal modal={modal} setModal={setModal} />

      <ToastContainer />
    </ThemeProvider>
  );
}
