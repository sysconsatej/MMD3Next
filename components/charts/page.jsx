"use client";

import { useState } from "react";
import { chartRegister } from "./chartRegister";
import { Autocomplete, TextField } from "@mui/material";

export const ChartRender = ({ type }) => {
  const chartArr = [
    {
      id: 1,
      label: "Line",
      chartType: "line",
    },
    {
      id: 2,
      label: "Area",
      chartType: "area",
    },
    {
      id: 3,
      label: "Bar",
      chartType: "bar",
    },
    {
      id: 4,
      label: "Pie",
      chartType: "pie",
    },
  ];

  const ChartComponent = chartRegister[type];
  // const [selectChartType, setSelectChartType] = useState("");

  if (!ChartComponent) return null;

  return (
    <div className="w-full max-w-[600px] flex flex-col items-center gap-10">
      {/* <Autocomplete
        disablePortal
        options={chartArr}
        sx={{ width: 200, height: 50}}
        renderInput={(params) => <TextField {...params} />}
        getOptionDisabled={() => false}
        onChange={(event, newValue) => setSelectChartType(newValue.chartType)}
        defaultValue={
          String(type).charAt(0).toLocaleUpperCase() +
          String(type)
            .slice(1, type?.length)
            .toLowerCase()
        }
      /> */}

      <ChartComponent type={type} />
    </div>
  );
};
