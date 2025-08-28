import React from "react";
import { Box, InputLabel } from "@mui/material";

const TextAreaInput = ({ commonProps, fieldValue, field }) => {
  return (
    <Box className={`flex items-end gap-2 ${field.gridColumn}`}>
      <InputLabel>{commonProps.label}</InputLabel>
      <textarea
        {...commonProps}
        value={fieldValue ? fieldValue : ""}
        className={`py-[1px] peer px-2 border border-solid border-[#0000003b] rounded-[4px] placeholder-[#000000a6] w-full hover:border-black focus:outline-[#1976d2] ${commonProps.className}`}
        rows={field.rows}
        key={commonProps.key}
      />
    </Box>
  );
};

export default TextAreaInput;
