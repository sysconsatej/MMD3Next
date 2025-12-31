import React from "react";
import { Box, InputLabel, TextField } from "@mui/material";

const NumberInput = ({
  commonProps,
  fieldValue,
  field,
  handleBlurEventFunctions,
  fieldHighLight
}) => {
  const { label, ...remainingProps } = commonProps;
  return (
    <Box className={`flex items-end gap-2 ${field.style} `}>
      {label && (
        <InputLabel className={`${fieldHighLight && "bg-[#FDACAC]"}`}>
          {remainingProps.required && (
            <span className="text-red-600 font-bold ">┃</span>
          )}
          {label}
        </InputLabel>
      )}
      <TextField
        {...remainingProps}
        key={commonProps.key}
        value={fieldValue ?? ""}
        type="number"
        variant="standard"
        slotProps={{
          htmlInput: {
            min: field?.acceptBelowZero ? undefined :  0,
            step: "any",
          },
        }}
        onBlur={(event) =>
          field.blurFun ? handleBlurEventFunctions[field.blurFun](event) : null
        }
      />
    </Box>
  );
};

export default NumberInput;
