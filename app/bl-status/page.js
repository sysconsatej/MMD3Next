"use client";

import { ThemeProvider } from "@mui/material/styles";
import { BlStatus } from "./BlStatus";
import { theme } from "@/styles";

const Page = () => {
  return (
    <ThemeProvider theme={theme}>
      <BlStatus />
    </ThemeProvider>
  );
};

export default Page;
