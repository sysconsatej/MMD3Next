import React from "react";
import { Box, InputLabel, TextField } from "@mui/material";

const TextInput = ({
  commonProps,
  fieldValue,
  handleBlurEventFunctions,
  field,
}) => {
  const { label, ...remainingProps } = commonProps;
  return (
    <Box className={`flex items-end gap-2 ${field.style} `}>
      <InputLabel>
        {remainingProps.required && label && (
          <span className="text-red-600 font-bold ">┃</span>
        )}
        {label}
      </InputLabel>
      <TextField
        {...remainingProps}
        value={fieldValue ? fieldValue : ""}
        variant="standard"
        key={commonProps.key}
        onBlur={(event) =>
          field.blurFun ? handleBlurEventFunctions[field.blurFun](event) : null
        }
      />
    </Box>
  );
};

export default TextInput;
