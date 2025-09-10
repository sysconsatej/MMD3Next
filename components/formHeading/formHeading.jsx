import React from "react";
import { Box, Typography } from "@mui/material";

const FormHeading = ({ text, children }) => {
  return children ? (
    <Box className="border-2 border-solid border-gray-300 relative mt-5 mb-4 py-4 px-3">
      <Typography
        variant={"caption"}
        className={
          "!ml-1 absolute -top-2 !text-[13px] !font-bold border-b-2 border-white !leading-[6px] "
        }
      >
        {text}
      </Typography>
      {children}
    </Box>
  ) : (
    <Typography
      variant={"body2"}
      className={`!text-[13px] !font-bold !mx-3 !mt-4 border-b-2 border-solid border-[#03bafc] flex`}
    >
      {text}
    </Typography>
  );
};

export default FormHeading;
