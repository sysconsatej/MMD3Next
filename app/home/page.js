"use client";

import { ChartRender } from "@/components/charts/page";
import {  Card, Grid, IconButton } from "@mui/material";
import { useState } from "react";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";

export default function HomePage() {
  const [fullscreen, setFullscreen] = useState(false);

  const chartArr = [
    { id: 1, chartType: "line" },
    { id: 2, chartType: "area" },
    { id: 3, chartType: "bar" },
    { id: 4, chartType: "pie" },
    { id: 5, chartType: "bar" },
    { id: 6, chartType: "line" },
  ];

  const toggleFullscreen = () => {
    setFullscreen(!fullscreen);
  };

  return (
    <Grid
      container
      spacing={{ xs: 2, md: 3 }}
      columns={{ xs: 4, sm: 8, md: 12 }}
      sx={{ padding: "16px" }}
    >
      {chartArr.map((_) => (
        <Grid key={_.id} item size={{ xs: 12, sm: 4, md: 4, lg: 4 }}>
          <Card
            sx={{
              borderRadius: !fullscreen  ?   5 :  0,
              padding: 2,
              height: 550,
              position: "relative",
              ...(fullscreen && {
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width: "100vw",
                height: "100vh",
                zIndex: 9999,
              }),
            }}
          >
            <IconButton
              onClick={toggleFullscreen}
              sx={{
                position: "absolute",
                top: 10,
                right: 10,
                zIndex: 9999,
              }}
            >
              {fullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
            </IconButton>

            <ChartRender type={_.chartType} />
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
