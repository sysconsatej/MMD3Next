"use client";
import { useEffect, useRef, useState } from "react";
import { chartRegister } from "./chartRegister";
import { Box, Skeleton } from "@mui/material";
import { chartApi } from "@/apis";
import { useChartVisible } from "@/store";

export const ChartRender = ({ type, fullscreen, spCallName }) => {
  //  api call to get chart data based on type
  const [chartData, setChartData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  // const { setChartVisible } = useChartVisible();

  useEffect(() => {
    const fetchChartData = async () => {
      setIsLoading(true);
      try {
        const data = await chartApi({ apiCallName: spCallName });
        setChartData(data?.data || {});
        // const funcApi = spCallName;
        // setChartVisible(funcApi, !!data?.data && data?.data.length > 0);
        // hasFetched.current = true;
      } catch (error) {
        console.error("Error fetching chart data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChartData();
  }, [spCallName, setChartData]);

  const ChartComponent = chartRegister[type];

  if (!ChartComponent) return null;

  return (
    <Box
      className="w-full max-w-[600px] flex  items-center gap-10 p-[10px] "
      sx={fullscreen ? { height: "85vh", border: "1px solid #ccc" } : {}}
    >
      {/* {fullscreen ? (
        <Autocomplete
          disablePortal
          options={chartArr}
          sx={{ width: 200, height: 50 }}
          renderInput={(params) => <TextField {...params} />}
          getOptionDisabled={() => false}
          onChange={(event, newValue) => setSelectChartType(newValue.chartType)}
          defaultValue={
            String(type).charAt(0).toLocaleUpperCase() +
            String(type).slice(1, type?.length).toLowerCase()
          }
        />
      ) : (
        <></>
      )} */}

      {isLoading ? (
        <Skeleton variant="rounded" height={250} width={300} />
      ) : (
        <>
          {chartData ? (
            <ChartComponent type={type} data={chartData || []} />
          ) : (
            <></>
          )}
        </>
      )}
    </Box>
  );
};
