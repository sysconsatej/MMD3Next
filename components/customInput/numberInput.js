import React from "react";
import { TextField } from "@mui/material";

const NumberInput = ({ commonProps, fieldValue }) => {
  return (
    <TextField
      {...commonProps}
      key={commonProps.key}
      value={fieldValue ?? ""}
      type="number"
      variant="outlined"
      slotProps={{
        htmlInput: {
          min: 0,
          step: 1,
        },
      }}
    />
  );
};

export default NumberInput;
