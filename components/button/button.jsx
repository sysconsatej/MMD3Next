"use client";
import React from "react";
import MuiButton from "@mui/material/Button";
import clsx from "clsx";
import Link from "next/link";
import PropTypes from "prop-types";

export const CustomButton = ({
    text,
    onClick,
    href,
    startIcon,
    endIcon,
    size = "small",
    target,
    buttonStyles = "!text-[black] !bg-[#fadb0f]",
}) => {

    const button = (
        <MuiButton
            variant="contained"
            disableElevation
            disableRipple
            size={size}
            onClick={onClick}
            className={buttonStyles}
            startIcon={startIcon || null}
            endIcon={endIcon || null}
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
