import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  components: {
    MuiCheckbox: {
      styleOverrides: {
        root: {
          padding: "2px 6px",
        },
      },
    },
    MuiAccordionSummary: {
      styleOverrides: {
        root: {
          minHeight: "40px",
          height: "40px",
          "&.Mui-expanded": {
            minHeight: "40px",
          },
        },
      },
    },
    MuiAccordionDetails: {
      styleOverrides: {
        root: {
          padding: "8px 10px 8px",
          background : "transparent"
        },
      
      },
    },
  },
});
