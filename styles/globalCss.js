import { createTheme } from "@mui/material";

export const theme = createTheme({
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        "::-webkit-scrollbar": {
          width: "4px",
          height: "4px",
        },
        "::-webkit-scrollbar-thumb": {
          backgroundColor: "#95a9e8",
          borderRadius: "10px",
        },
        "::-webkit-scrollbar-track": {
          backgroundColor: "#dee8fa",
          borderRadius: "10px",
        },
        "::-webkit-scrollbar-thumb:hover": {
          backgroundColor: "#555",
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          padding: "10px",
        },
        input: {
          height: "100%",
          boxSizing: "border-box",
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontSize: "13px",
          overflow: "unset",
          color: "black",
        },
      },
    },
    MuiFormControl: {
      styleOverrides: {
        root: {
          "& .MuiPickersSectionList-root": {
            fontSize: "12px",
          },
          "&  .MuiInputLabel-root": {
            fontWeight: "bold",
            transform: "translate(14px, 10px) scale(1)",
          },
          "& .MuiInputBase-root .MuiOutlinedInput-input": {
            padding: 0,
          },
          "&  .MuiInputLabel-root.MuiInputLabel-shrink": {
            fontSize: "13px",
            transform: "translate(14px, -11px) scale(0.75)",
          },
          "& .MuiFormLabel-root.radioLabel": {
            fontSize: "13px",
            color: "black",
            display: "flex",
          },
        },
      },
    },
    MuiAutocomplete: {
      styleOverrides: {
        popper: {
          "& .MuiAutocomplete-listbox li": {
            fontSize: "12px",
          },
          minWidth: "200px",
        },
        input: {
          textOverflow: "clip",
          padding: "5px 9px",
          fontSize: "12px",
        },
        root: {
          "& .MuiInputBase-root .MuiAutocomplete-endAdornment": {
            "& .MuiIconButton-root .MuiSvgIcon-root": {
              fontSize: "18px",
            },
          },
          "& .MuiButtonBase-root.MuiChip-root": {
            height: "auto",
            "& .MuiSvgIcon-root": {
              fontSize: "11px",
            },
            "& .MuiChip-label": {
              fontSize: "10px",
              whiteSpace: "wrap",
            },
          },
          "&.multiSelect .MuiInputBase-root": {
            padding: "0px 0px !important",
            height: "auto",
            minHeight: "20px",
            "& .MuiInputBase-input": {
              padding: "0px",
            },
            "& .MuiAutocomplete-tag": {
              cursor: "pointer",
              margin: "1px",
            },
          },
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          padding: "0px",
          "& .MuiSvgIcon-root": {
            width: "15px",
            height: "15px",
          },
        },
      },
    },
    MuiPagination: {
      styleOverrides: {
        root: {
          display: "inline-flex",
          alignItems: "center",
        },
      },
    },
    MuiPaginationItem: {
      styleOverrides: {
        root: {
          color: "#000",
          border: "1px solid #b1c1f2",
          backgroundColor: "#fff",
          fontSize: "10px",
          minWidth: "24px",
          height: "24px",
          borderRadius: "4px",
          padding: "0 4px",
          "&:hover": {
            backgroundColor: "#B5C4F0",
          },
          "&.Mui-selected": {
            backgroundColor: "#95a9e8",
            color: "white",
            border: "1px solid #b1c1f2",
          },
          "&.Mui-selected:hover": {
            backgroundColor: "#B5C4F0",
          },
          "& .MuiPaginationItem-icon": {
            color: "#000",
          },
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: "#95a9e8",
          "& .MuiTableCell-root": {
            color: "white",
            fontSize: "12.5px",
            lineHeight: "17px",
            paddingTop: "3px",
            paddingBottom: "3px",
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: "2px 16px",
          fontSize: 12,
          minWidth: "150px",
          "&.table-icons": {
            position: "absolute",
            right: 0,
            transition: "opacity",
            border: "none",
            padding: 0,
            "& .MuiButtonBase-root": {
              padding: 0,
              "& .MuiSvgIcon-root": {
                width: "17px",
                height: "17px",
              },
            },
          },
        },
      },
    },
    MuiFormGroup: {
      styleOverrides: {
        root: {
          "& .MuiFormControlLabel-root": {
            "& .MuiSvgIcon-root": {
              height: "12px",
              width: "12px",
            },
            "& .MuiTypography-root": {
              fontSize: "12px",
            },
            "& .MuiButtonBase-root": {
              padding: "0px 8px",
            },
          },
        },
      },
    },
    MuiStack: {
      styleOverrides: {
        root: {
          paddingTop: "0px !important",
          overflow: "unset !important",
          "& .MuiPickersInputBase-root .MuiPickersSectionList-root": {
            padding: "0px",
            flexWrap: "wrap",
            width: "auto",
          },
          "& .MuiPickersTextField-root": {
            minWidth: "auto !important",
          },
          "& .MuiPickersTextField-root .MuiFormLabel-root": {
            fontSize: "12px",
          },
          "& .MuiPickersTextField-root .MuiFormLabel-root:not(& .MuiInputLabel-shrink)":
            {
              transform: "translate(14px, 6px) scale(1)",
            },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          "&.tableGrid .MuiToolbar-root": {
            minHeight: "30px",
            "& .MuiTablePagination-select": {
              padding: "0px 15px",
            },
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          "& .MuiButtonBase-root": {
            minHeight: "auto",
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          "&.custom-btn": {
            fontSize: "11px",
            color: "white",
          },
          "&.custom-btn:not(.Mui-disabled)": {
            backgroundColor: "#95a9e8",
          },
        },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
          borderRadius: "10px",
          marginBottom: "10px",
          overflow: "hidden",
          "&:before": { display: "none" },
        },
      },
    },

    MuiAccordionSummary: {
      styleOverrides: {
        root: {
          minHeight: 32,
          padding: "0 16px",
          background: "linear-gradient(135deg, #95a9e8, #7f96e6)",
          transition: "all 0.25s ease",
          "&:hover": {
            background: "linear-gradient(135deg, #8da2e4, #6f87df)",
          },
          "&.Mui-expanded": {
            minHeight: 32,
          },
        },
        content: {
          margin: "0px !important",
          fontSize: "13px",
          fontWeight: 600,
          letterSpacing: "0.4px",
          color: "#ffffff",
        },
        expandIconWrapper: {
          color: "#ffffff",
          transition: "transform 0.3s ease",
          "&.Mui-expanded": {
            transform: "rotate(180deg)",
          },
          "& .MuiSvgIcon-root": {
            fontSize: 18,
          },
        },
      },
    },

    MuiAccordionDetails: {
      styleOverrides: {
        root: {
          backgroundColor: "#f8faff",
          padding: "12px 16px",
          borderTop: "1px solid #e0e6ff",
        },
      },
    },
  },
});

export const textFieldStyles = () => {
  return {
    width: "min(300px,100%)",
    "@media (max-width: 640px)": {
      width: "100%",
    },
    "& .MuiInputBase-root": {
      height: "20px",
      fontSize: "12px",
      padding: "3px 10px",
    },
    "& .MuiFormLabel-root.Mui-focused": {
      top: "3px",
    },
    "& .MuiFormLabel-root.MuiInputLabel-shrink": {
      top: "3px",
    },
    "& .MuiFormControl-root .MuiFormLabel-root:not(& .MuiInputLabel-shrink)": {
      transform: "translate(14px, 2px) scale(1)",
      fontSize: "12px",
    },
    "& .MuiFormControl-root .MuiFormLabel-root": {
      fontSize: "12px",
    },
    "&.MuiFormControl-root.datepicker .MuiFormLabel-root:not(& .MuiInputLabel-shrink)":
      {
        transform: "translate(14px, 2px) scale(1)",
        fontSize: "12px",
      },
    "&.MuiFormControl-root.datepicker .MuiSvgIcon-root": {
      width: "16px",
      height: "16px",
    },
    "&.MuiFormControl-root.datepicker .MuiPickersSectionList-root": {
      padding: "0px",
    },
    "&.MuiFormControl-root.datepicker .MuiButtonBase-root": {
      padding: "2px",
    },
    "& .MuiFormLabel-root.Mui-disabled, & .MuiInputBase-input.Mui-disabled": {
      color: "rgba(0, 0, 0, 0.87)",
      "-webkit-text-fill-color": "unset",
    },
  };
};

export const inputLabelProps = {
  sx: {
    fontSize: "12px",
    top: "-8px",
  },
};

export const navTheme = createTheme({
  components: {
    MuiMenu: {
      defaultProps: {
        disableScrollLock: true,
        keepMounted: true,
        marginThreshold: 0,
      },
      styleOverrides: {
        paper: {
          backgroundColor: "#0b2545",
          color: "#fff",
          borderRadius: 8,
          boxShadow: "0 6px 18px rgba(0,0,0,.18), 0 2px 6px rgba(0,0,0,.08)",
          overflow: "hidden",
        },
        list: {
          paddingTop: 4,
          paddingBottom: 4,
          maxHeight: 360,
          overflow: "auto",
          "&::-webkit-scrollbar": { width: 10 },
          "&::-webkit-scrollbar-track": { backgroundColor: "#f1f1f1" },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#95a9e8",
            borderRadius: 3,
          },
        },
      },
    },

    MuiMenuItem: {
      styleOverrides: {
        root: {
          minHeight: 32,
          paddingTop: 6,
          paddingBottom: 6,
          paddingLeft: 14,
          paddingRight: 12,
          fontSize: "0.875rem",
          lineHeight: 1.3,
          transition: "background-color .15s ease, color .15s ease",
          "&:hover": { backgroundColor: "#95a9e8", color: "#fff" },
          "&.Mui-selected, &.Mui-selected:hover": {
            backgroundColor: "#95a9e8",
            color: "#fff",
            fontWeight: 400,
          },
        },
      },
    },

    MuiDrawer: {
      styleOverrides: {
        paper: {
          width: 280,
          padding: 8,
          borderRadius: "0 10px 10px 0",
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          minHeight: 38,
          "& .MuiListItemText-primary": {
            fontSize: "0.875rem",
            lineHeight: 1.25,
          },
          "&.is-active, &.is-active .MuiListItemText-primary": {
            color: "#95a9e8",
            fontWeight: 400,
          },
        },
      },
    },

    MuiAvatar: {
      styleOverrides: { root: { width: 28, height: 28, fontSize: "14px" } },
    },

    MuiCssBaseline: {
      styleOverrides: {
        ".nav-root": {
          backgroundColor: "#edf1f4",
          padding: "4px 16px",
          borderBottom: "1px solid #e6ebf2",
          boxShadow: "none",
          position: "sticky",
          top: 0,
          zIndex: 1100,
        },
        ".nav-container": {
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginInline: "auto",
        },
        ".nav-grid": {
          display: "grid",
          gridTemplateColumns: "auto 1fr",
          columnGap: "1rem",
          alignItems: "center",
          width: "100%",
        },
        ".nav-links": {
          display: "flex",
          alignItems: "center",
          gap: "2rem",
          justifySelf: "center",
        },

        ".nav-account": {
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: 4,
          justifySelf: "end",
        },
        ".account-name": {
          fontSize: 10,
          fontWeight: 400,
          lineHeight: 1.1,
          color: "#222",
        },
        ".account-role": { fontSize: 10, color: "#7b8596", lineHeight: 1.1 },

        ".nav-mobile-chip": {
          marginTop: 14,
          display: "flex",
          alignItems: "center",
          gap: 8,
          backgroundColor: "#edf1f4",
          borderRadius: 8,
          padding: 8,
        },

        ".nav-block": { display: "block", width: "100%" },
      },
    },
    MuiAutocomplete: {
      styleOverrides: {
        popper: {
          "& .MuiAutocomplete-listbox li": {
            fontSize: "12px",
          },
          minWidth: "200px",
        },
        input: {
          textOverflow: "clip",
          padding: "5px 9px",
          fontSize: "12px",
        },
        root: {
          "& .MuiInputBase-root .MuiAutocomplete-endAdornment": {
            "& .MuiIconButton-root .MuiSvgIcon-root": {
              fontSize: "18px",
            },
          },
          "& .MuiButtonBase-root.MuiChip-root": {
            height: "auto",
            "& .MuiSvgIcon-root": {
              fontSize: "11px",
            },
            "& .MuiChip-label": {
              fontSize: "10px",
              whiteSpace: "wrap",
            },
          },
          "&.multiSelect .MuiInputBase-root": {
            padding: "0px 0px !important",
            height: "auto",
            minHeight: "20px",
            "& .MuiInputBase-input": {
              padding: "0px",
            },
            "& .MuiAutocomplete-tag": {
              cursor: "pointer",
              margin: "1px",
            },
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          "&.custom-btn": {
            fontSize: "11px",
            color: "white",
          },
          "&.custom-btn:not(.Mui-disabled)": {
            backgroundColor: "#95a9e8",
          },
        },
      },
    },
  },
});
