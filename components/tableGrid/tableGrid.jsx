import React, { useState } from "react";
import Box from "@mui/material/Box";
import {
  Card,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
} from "@mui/material";
import CustomPagination from "../pagination/pagination";
import AddIcon from "@mui/icons-material/Add";
import SaveIcon from "@mui/icons-material/Save";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { CustomInput } from "../customInput";
import { HoverActionIcons } from "../tableHoverIcons/tableHoverIcons";

function TableGrid({
  fields,
  formData,
  setFormData,
  fieldsMode,
  gridName,
  tableMap,
}) {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loadingState, setLoadingState] = useState("No data found!");
  const [gridId, setGridId] = useState(-1);
  const [gridData, setGridData] = useState([]);
  const [gridFieldsMode, setGridFieldsMode] = useState(fieldsMode);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
  };

  function modeHandler(mode, containerIndex) {
    if (mode === "delete") {
      const filterData = formData[gridName].filter(
        (obj, index) => index !== containerIndex
      );
      setGridData(filterData);
      setFormData((prev) => ({
        ...prev,
        [gridName]: filterData,
      }));
      return;
    }
    if (fieldsMode !== "view") {
      setGridFieldsMode(mode);
    }
    setGridId(containerIndex);
  }

  function gridAddHandler() {
    setFormData((prev) => ({
      ...prev,
      [gridName]: [...(prev[gridName] || []), {}],
    }));
    setGridId(gridId + 1);
  }

  function gridSaveHandler() {
    const filterData = formData[gridName].filter(
      (obj) => Object.keys(obj).length > 0
    );
    setGridData(filterData);
    setFormData((prev) => ({
      ...prev,
      [gridName]: filterData,
    }));
  }

  return (
    <Box>
      <Box className="flex flex-row items-start justify-end border-t border-gray-300 rounded-2xl">
        <Box className="flex items-start justify-between flex-row w-full">
          <Box className="grid grid-cols-7 gap-2 w-full p-2">
            <CustomInput
              fields={fields}
              formData={formData}
              setFormData={setFormData}
              fieldsMode={gridFieldsMode}
              gridName={gridName}
              containerIndex={gridId}
            />
          </Box>
          <Box className="flex items-center justify-between flex-col">
            <Tooltip title="Save" arrow>
              <IconButton size="small" onClick={gridSaveHandler}>
                <SaveIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Revert" arrow>
              <IconButton size="small">
                <RestartAltIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        <Tooltip title="Add" arrow>
          <IconButton size="small" onClick={gridAddHandler}>
            <AddIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
      <Box>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} size="small" aria-label="simple table">
            <TableHead>
              <TableRow>
                {tableMap?.map((item) => {
                  return <TableCell>{item.heading}</TableCell>;
                })}
              </TableRow>
            </TableHead>
            <TableBody>
              {!gridData.length ? (
                <TableRow>
                  <TableCell>{loadingState}</TableCell>
                </TableRow>
              ) : (
                gridData
                  .slice(
                    (page - 1) * rowsPerPage,
                    (page - 1) * rowsPerPage + rowsPerPage
                  )
                  .map((row, index) => (
                    <TableRow key={index} hover className="relative group ">
                      {tableMap?.map((item) => {
                        return <TableCell>{row[item.value]}</TableCell>;
                      })}
                      <TableCell className="table-icons opacity-0 group-hover:opacity-100">
                        <HoverActionIcons
                          onView={() => modeHandler("view", index)}
                          onEdit={() => modeHandler("edit", index)}
                          onDelete={() => modeHandler("delete", index)}
                        />
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <Card className="flex justify-end items-center tableGrid">
          <CustomPagination
            count={Math.ceil(gridData.length / rowsPerPage)}
            totalRows={gridData.length}
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
