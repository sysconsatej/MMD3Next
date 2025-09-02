"use client";
import React from "react";
import MuiButton from "@mui/material/Button";
import Link from "next/link";

const CustomButton = ({
  text,
  onClick,
  href,
  startIcon = null,
  endIcon = null,
  size = "small",
  target,
  buttonStyles = "!text-[white] !bg-[#95a9e8] !text-[11px] ",
  ...props
}) => {
  const button = (
    <MuiButton
      variant="contained"
      disableRipple
      size={size}
      onClick={onClick}
      className={buttonStyles}
      startIcon={startIcon}
      endIcon={endIcon}
      {...props}
    >
      {text}
    </MuiButton>
  );

  if (href) {
    return (
      <Link href={href} target={target} className="inline-block">
        {button}
      </Link>
    );
  }

  return button;
};

export default CustomButton;
