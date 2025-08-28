import React from "react";
import { Typography } from "@mui/material";

const FormHeading = ({
  text,
  variant = "caption",
  style = "!ml-3 border-b border-solid ",
}) => {
  return (
    <Typography variant={variant} className={style}>
      {text}
    </Typography>
  );
};

export default FormHeading;
