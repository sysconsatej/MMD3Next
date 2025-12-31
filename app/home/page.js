"use client";

import { useState } from "react";
import {
  Box,
  Card,
  Grid,
  IconButton,
  Skeleton,
  Typography,
} from "@mui/material";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import CustomButton from "@/components/button/button";
// import { useChartVisible } from "@/store";
import { ChartRender } from "@/components/charts/page";

export default function HomePage() {
  const [fullscreenId, setFullscreenId] = useState(null);
  // const { chartStatus, loading } = useChartVisible();

  const chartArr = [
    {
      id: 1,
      chartType: "bar",
      funcApi: "slInvoiceReleaseCountChart",
      chartName: "Invoice Release Chart",
    },
    {
      id: 2,
      chartType: "line",
      funcApi: "slDoReleaseCountChart",
      chartName: "Do Release Chart",
    },
    {
      id: 3,
      chartType: "area",
      funcApi: "slBlVerifiedCountChart",
      chartName: "Bl Verification Chart",
    },
    {
      id: 4,
      chartType: "pie",
      funcApi: "slTotalTeusCountChart",
      chartName: "Teus Chart ",
    },
    {
      id: 5,
      chartType: "bar",
      funcApi: "slCfsVerifiedCountChart",
      chartName: "CFS Chart  ",
    },
  ];

  const toggleFullscreen = (id) => {
    setFullscreenId(fullscreenId === id ? null : id);
  };

  // if (loading) {
  //   return <Skeleton variant="rounded" height={300} width={300} />;
  // }

  return (
    <>
      <Box className="flex justify-self-end pt-2">
        <CustomButton href={"/bl-status"} text={"BL Status"} />
      </Box>
      <Grid
        container
        spacing={{ xs: 2, md: 3 }}
        columns={{ xs: 4, sm: 8, md: 12 }}
        sx={{ padding: "16px" }}
      >
        {chartArr.map((_) => {
          if (!_.funcApi) return null;
          const isFullscreen = fullscreenId === _.id;
          // const isVisible = chartStatus[_.funcApi]?.visible;

          return (
            <Grid key={_.id} item size={{ xs: 12, sm: 4, md: 4, lg: 3 }}>
              {/* {isVisible ? ( */}
              <Card
                sx={{
                  borderRadius: !isFullscreen ? 5 : 0,
                  padding: 2,
                  height: 300,
                  position: "relative",
                  ...(isFullscreen && {
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    width: "100vw",
                    height: "100vh",
                    zIndex: !isFullscreen ? 0 : 9999,
                  }),
                }}
              >
                <IconButton
                  onClick={() => toggleFullscreen(_.id)}
                  sx={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                    zIndex: !isFullscreen ? 0 : 9999,
                  }}
                >
                  {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                </IconButton>
                <Typography className="text-center text-md  "  >
                  {_.chartName}{" "}
                </Typography>
                <ChartRender
                  type={_.chartType}
                  fullscreen={isFullscreen}
                  spCallName={_.funcApi}
                />
              </Card>
              {/* //  ) : (
              //   <></>
              // )}  */}
            </Grid>
          );
        })}
      </Grid>
    </>
  );
}
