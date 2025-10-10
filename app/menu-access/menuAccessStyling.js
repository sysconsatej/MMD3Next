import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  components: {
    MuiFormControlLabel: {
      styleOverrides: {
        label: {
          fontSize: "10px",
          color: "var(--inputTextColor)",
        },
      },
    },
    MuiSvgIcon: {
      styleOverrides: {
        root: {
          fontSize: "32px",
          color: "var(--inputBorderHoverColor)",
          "&.tableArrow": {
            fontSize: "40px",
          },
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          fontSize: "12px",
          color: "var(--inputTextColor)",
          cursor: "pointer",
        },
      },
    },
    MuiCollapse: {
      styleOverrides: {
        root: {
          position: "relative",
          "&:before": {
            content: '""',
            position: "absolute",
            height: "100%",
            width: "1px",
            background: "var(--inputBorderHoverColor)",
            boxShadow:
              "var(--inputBorderColor) 0px 54px 55px, var(--inputBorderColor) 0px -12px 30px, var(--inputBorderColor) 0px 4px 6px, red 0px 12px 13px, var(--inputBorderColor) 0px -3px 5px",
            left: "0px",
            animation: "slideIn 3s ease",
            "@keyframes slideIn": {
              "0%": {
                height: "0%",
              },
              "100%": {
                hright: "100%",
              },
            },
          },
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderBottom: "1px solid var(--inputBorderHoverColor)",
          borderLeft: "1px solid var(--inputBorderHoverColor)",
          cursor: "default",
          padding: "0px",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          width: "250px",
          backgroundColor: "var(--inputBg)",
          borderRadius: "4px",
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        input: {
          padding: "8px 14px",
          fontSize: "0.75rem",
          color: "var(--inputTextColor)",
        },
        notchedOutline: {
          borderColor: "var(--inputBorderColor)",
        },
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: {
          fontSize: "0.75rem",
          top: "-7px",
          color: "var(--inputTextColor)",
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        icon: {
          color: "var(--inputTextColor)",
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundColor: "var(--inputBg)",
          color: "var(--inputTextColor)",
          maxHeight: "300px",
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontSize: "12px",
        },
      },
    },
    MuiFormGroup: {
      styleOverrides: {
        root: {
          paddingLeft: "12px",
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          padding: "2px 9px",
        },
      },
    },
  },
});
