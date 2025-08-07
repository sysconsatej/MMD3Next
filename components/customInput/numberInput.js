import React from "react";
import { TextField } from "@mui/material";

const NumberInput = ({ commonProps, fieldValue }) => {
  const handleChange = (e) => {
    const val = e.target.value;
    if (val === "" || parseFloat(val) >= 0) {
      commonProps.onChange(e);
    }
  };

  return (
    <TextField
      {...commonProps}
      value={fieldValue ?? ""}
      type="number"
      variant="outlined"
      key={commonProps.key}
      slotProps={{
        htmlInput: {
          min: 0,
          step: 1,
        },
      }}
      onChange={handleChange}
    />
  );
};

export default NumberInput;
