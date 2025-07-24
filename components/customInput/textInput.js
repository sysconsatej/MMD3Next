import React from "react";
import { TextField } from "@mui/material";

const TextInput = ({ commonProps, fieldValue, handleBlurEventFunctions, field }) => {
  return (
    <TextField
      {...commonProps}
      value={fieldValue ? fieldValue : ""}
      variant="outlined"
      key={commonProps.key}
      onBlur={(event) =>
        field.blurFun ? handleBlurEventFunctions[field.blurFun](event) : null
      }
    />
  );
};

export default TextInput;
