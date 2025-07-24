import React from "react";
import { TextField } from "@mui/material";

const NumberInput = ({ commonProps, fieldValue }) => {
  return (
    <TextField
      {...commonProps}
      value={fieldValue ? fieldValue : ""}
      type="number"
      variant="outlined"
      key={commonProps.key}
    />
  );
};

export default NumberInput;
