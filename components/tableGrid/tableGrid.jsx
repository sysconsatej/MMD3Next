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

function TableGrid({
  fields,
  formData,
  setFormData,
  fieldsMode,
  gridName,
  gridStatus = null,
  buttons = [],
}) {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [gridId, setGridId] = useState(0);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
  };

  function gridRequiredHandler() {
    const gridRows = formData[gridName] || [];
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

      setFormData((prev) => ({
        ...prev,
        [gridName]: [...(prev[gridName] || []), {}],
      }));
      setGridId(formData[gridName]?.length || 0);
    },
    gridDeleteHandler: () => {
      const filterData = formData[gridName]?.filter((item, index) => {
        return index !== gridId;
      });
      setFormData((prev) => ({
        ...prev,
        [gridName]: filterData,
      }));
      setGridId(null);
    },
    gridCopyHandler: () => {
      const checkRequired = gridRequiredHandler();
      if (!checkRequired) return;

      const filterData = formData[gridName]?.filter((item, index) => {
        return index === gridId;
      });

      setFormData((prev) => ({
        ...prev,
        [gridName]: [...prev[gridName], ...filterData],
      }));
    },
    checkHandler: () => {
      return alert("working");
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
              {formData[gridName]
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
                                />
                              </TableCell>
                            ) : (
                              <TableCell>
                                {rowItem[item.name]?.Name ??
                                  rowItem[item.name]?.name ??
                                  `${rowItem[item.name] || ""}`}
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
            count={Math.ceil(formData[gridName]?.length / rowsPerPage)}
            totalRows={formData[gridName]?.length}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={handleChangePage}
            handleChangeRowsPerPage={handleChangeRowsPerPage}
          />
        </Card>
      </Box>
    </Box>
  );
}

export default TableGrid;
