import React from "react";
import { Box, InputLabel, TextField } from "@mui/material";

const NumberInput = ({ commonProps, fieldValue }) => {
  const { label, ...remainingProps } = commonProps;
  return (
    <Box className="flex items-end gap-2">
      <InputLabel>
        {remainingProps.required && (
          <span className="text-red-600 font-bold ">┃</span>
        )}
        {label}
      </InputLabel>
      <TextField
        {...remainingProps}
        key={commonProps.key}
        value={fieldValue ?? ""}
        type="number"
        variant="standard"
        slotProps={{
          htmlInput: {
            min: 0,
            step: 1,
          },
        }}
      />
    </Box>
  );
};

export default NumberInput;
