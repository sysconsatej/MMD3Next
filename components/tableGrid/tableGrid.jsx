import React, { useState } from "react";
import Box from "@mui/material/Box";
import {
  Card,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import CustomPagination from "../pagination/pagination";
import { CustomInput } from "../customInput";
import CustomButton from "../button/button";
import { toast } from "react-toastify";
import ExcelModal from "./modal";

function TableGrid({
  fields,
  formData,
  setFormData,
  fieldsMode,
  gridName,
  tabName = null,
  tabIndex = null,
  buttons = [],
  handleBlurEventFunctions = null,
}) {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [gridId, setGridId] = useState(null);
  const [excelFile, setExcelFile] = useState({ open: false, excelFile: null });
  const targetGrid = tabName
    ? formData?.[tabName]?.[tabIndex || 0]?.[gridName]
    : formData[gridName];

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
  };

  function gridRequiredHandler() {
    const gridRows = targetGrid || [];
    const lastAndCurrentRow = [gridRows.length - 1 || 0, gridId || 0];
    let checkRequired = true;

    lastAndCurrentRow.forEach((rowIndex) => {
      checkRequired = fields.every((field) =>
        gridRows.length > 0
          ? !field.required || !!gridRows[rowIndex][field.name]
          : true
      );
    });

    if (checkRequired === false) {
      toast.error(
        "Need to fill all required columns in current row or last row!"
      );
    }

    return checkRequired;
  }

  const funcHandler = {
    gridAddHandler: () => {
      const checkRequired = gridRequiredHandler();
      if (!checkRequired) return;

      const filterData = targetGrid?.filter((obj) =>
        Object.values(obj).some(
          (val) => val !== null && val !== "" && val !== undefined
        )
      );

      setFormData((prev) => {
        if (tabName) {
          const updatedTab = [...(prev[tabName] || [])];
          const tabItem = { ...(updatedTab[tabIndex] || {}) };
          tabItem[gridName] = [...(filterData || []), {}];
          updatedTab[tabIndex] = tabItem;
          return {
            ...prev,
            [tabName]: updatedTab,
          };
        } else {
          return {
            ...prev,
            [gridName]: [...(filterData || []), {}],
          };
        }
      });
      setGridId(filterData?.length || 0);
    },
    gridDeleteHandler: () => {
      const filterData = targetGrid?.filter((item, index) => {
        return index !== gridId;
      });

      setFormData((prev) => {
        if (tabName) {
          const updatedTab = [...(prev[tabName] || [])];
          const tabItem = { ...(updatedTab[tabIndex] || {}) };
          tabItem[gridName] = [...(filterData || [])];
          updatedTab[tabIndex] = tabItem;
          return {
            ...prev,
            [tabName]: updatedTab,
          };
        } else {
          return {
            ...prev,
            [gridName]: filterData,
          };
        }
      });
      setGridId(null);
    },
    gridCopyHandler: () => {
      const checkRequired = gridRequiredHandler();
      if (!checkRequired) return;

      const filterData = targetGrid?.filter((item, index) => {
        let isValueExist = null;
        if (index === gridId) {
          isValueExist = Object.values(item).some((val) => {
            return val !== null && val !== "" && val !== undefined;
          });
        }
        if (isValueExist) return index === gridId;
      });

      setFormData((prev) => {
        if (tabName) {
          const updatedTab = [...(prev[tabName] || [])];
          const tabItem = { ...(updatedTab[tabIndex] || {}) };
          tabItem[gridName] = [...tabItem[gridName], ...filterData];
          updatedTab[tabIndex] = tabItem;
          return {
            ...prev,
            [tabName]: updatedTab,
          };
        } else {
          return {
            ...prev,
            [gridName]: [...(prev[gridName] || []), ...filterData],
          };
        }
      });
    },
    excelUpload: () => {
      setExcelFile((prev) => ({ ...prev, open: true }));
    },
  };

  function doubleClickHandler(index) {
    const checkRequired = gridRequiredHandler();
    if (!checkRequired) return;

    if (gridId === index) {
      setGridId(null);
    } else {
      setGridId(index);
    }
  }

  return (
    <Box>
      <Box className="flex flex-row items-start justify-start gap-2 p-2  border-t border-gray-300 rounded-2xl">
        {buttons.map((item) => {
          return (
            <CustomButton
              key={item.text}
              text={item.text}
              startIcon={item.icon}
              onClick={funcHandler[item.func]}
            />
          );
        })}
      </Box>
      <Box>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} size="small" aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell sx={{ minWidth: "auto" }}>SNo</TableCell>
                {fields?.map((item) => {
                  return (
                    <TableCell>
                      {item.label}
                      {item.required && (
                        <span className="text-red-600 font-bold "> *</span>
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableHead>
            <TableBody>
              {targetGrid
                ?.slice(
                  (page - 1) * rowsPerPage,
                  (page - 1) * rowsPerPage + rowsPerPage
                )
                ?.map((rowItem, rowIndex) => {
                  const containerIndex = rowIndex + rowsPerPage * (page - 1);
                  return (
                    <TableRow
                      onDoubleClick={() => doubleClickHandler(containerIndex)}
                    >
                      <TableCell sx={{ minWidth: "auto" }}>
                        {containerIndex + 1}
                      </TableCell>
                      {fields.map((item) => {
                        const { label, ...remainItem } = item;
                        return (
                          <>
                            {gridId == containerIndex ? (
                              <TableCell>
                                <CustomInput
                                  fields={[remainItem]}
                                  formData={formData}
                                  setFormData={setFormData}
                                  fieldsMode={fieldsMode}
                                  gridName={gridName}
                                  containerIndex={containerIndex}
                                  tabName={tabName}
                                  tabIndex={tabIndex}
                                  handleBlurEventFunctions={
                                    handleBlurEventFunctions
                                  }
                                />
                              </TableCell>
                            ) : (
                              <TableCell>
                                {rowItem[item.name]?.Name ??
                                  `${
                                    item.type == "fileupload"
                                      ? rowItem[item.name]?.split(/-(.+)/)[1]
                                      : rowItem[item.name] || ""
                                  }`}
                              </TableCell>
                            )}
                          </>
                        );
                      })}
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </TableContainer>
        <Card className="flex justify-end items-center tableGrid">
          <CustomPagination
            count={Math.ceil(targetGrid?.length / rowsPerPage || 0)}
            totalRows={targetGrid?.length || 0}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={handleChangePage}
            handleChangeRowsPerPage={handleChangeRowsPerPage}
          />
        </Card>
      </Box>
      <ExcelModal
        excelFile={excelFile}
        setExcelFile={setExcelFile}
        setFormData={setFormData}
        gridName={gridName}
        fields={fields}
      />
    </Box>
  );
}

export default TableGrid;
