import { Box } from "@mui/material";
import React from "react";

const TextAreaInput = ({ commonProps, fieldValue, field }) => {
  return (
    <Box className={`relative ${field.gridColumn} `} key={commonProps.key}>
      <textarea
        {...commonProps}
        value={fieldValue ? fieldValue : ""}
        className={`peer py-2 px-3 border border-solid border-[#0000003b] rounded-[4px] placeholder-[#000000a6] w-full hover:border-black focus:outline-[#1976d2] ${commonProps.className}`}
        rows={field.rows}
        key={commonProps.key}
      />
      <p
        className={`absolute top-0 transition-all duration-150 ease-in-out text-[#00000099] font-medium text-xs my-1 mx-3 peer-focus:text-[#1976d2] peer-focus:top-[-12px] peer-focus:px-1 peer-focus:bg-white peer-focus:text-[9px] ${
          fieldValue ? " px-1 top-[-12px] bg-white text-[9px]" : ""
        } `}
      >
        {commonProps.label}
      </p>
    </Box>
  );
};

export default TextAreaInput;
