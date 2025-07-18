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
          backgroundColor: "#ffc400",
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
          fontSize: "15px",
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
      height: "30px",
      fontSize: "12px",
    },
    "& .MuiFormLabel-root.Mui-focused": {
      top: "3px",
    },
    "& .MuiFormLabel-root.MuiInputLabel-shrink": {
      top: "3px",
    },
    "& .MuiFormControl-root .MuiFormLabel-root:not(& .MuiInputLabel-shrink)": {
      transform: "translate(14px, 6px) scale(1)",
      fontSize: "12px",
    },
    "& .MuiFormControl-root .MuiFormLabel-root": {
      fontSize: "12px",
    },
    "&.MuiFormControl-root.datepicker .MuiFormLabel-root:not(& .MuiInputLabel-shrink)":
      {
        transform: "translate(14px, 6px) scale(1)",
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
      padding: "7px",
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
