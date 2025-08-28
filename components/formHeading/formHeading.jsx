import React from "react";
import { Typography } from "@mui/material";

const FormHeading = ({ text, variant = "caption" }) => {
  return (
    <Typography variant={variant} className="!ml-3 border-b border-solid ">
      {text}
    </Typography>
  );
};

export default FormHeading;
