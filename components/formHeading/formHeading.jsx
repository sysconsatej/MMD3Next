import React from "react";
import { Box, Typography } from "@mui/material";
import CustomButton from "../button/button";

const FormHeading = ({ text, buttons = [], children }) => {
  return children ? (
    <Box className="border-2 border-solid border-gray-300 relative mt-5 mb-4 px-3 pt-5">
      <Box className="absolute -top-3 left-3 bg-white flex items-center gap-2 px-1">
        <Typography
          variant="caption"
          className="!text-[13px] !font-bold !leading-[14px]"
        >
          {text}
        </Typography>
        {buttons.map((btn, index) => (
          <CustomButton
            key={index}
            text={btn.text}
            onClick={btn.onClick}
            startIcon={btn.icon || null}
            buttonStyles={btn.buttonStyles}
          />
        ))}
      </Box>
      {children}
    </Box>
  ) : (
    <Typography
      variant="body2"
      className="!text-[13px] !font-bold !mx-3 !mt-4 border-b-2 border-solid border-[#03bafc] flex"
    >
      {text}
    </Typography>
  );
};

export default FormHeading;
