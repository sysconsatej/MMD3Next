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
          fontSize: "10px",
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
