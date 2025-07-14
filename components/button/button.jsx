"use client";
import React from "react";
import MuiButton from "@mui/material/Button";
import clsx from "clsx";
import Link from "next/link";
import PropTypes from "prop-types";

export const CoustomButton = ({
    text,
    onClick,
    href,
    bg = "blue",
    className = "",
    startIcon,
    endIcon,
    size = "small",
    target,
    buttonStyles,
    ...props
}) => {
    const colorMap = {
        buttonStyles: buttonStyles ? buttonStyles : "!bg-blue-500 hover:bg-blue-600",
    };

    const buttonClass = clsx(
        "!text-white",
        colorMap[bg] || colorMap["buttonStyles"],
        className
    );

    const button = (
        <MuiButton
            variant="contained"
            size={size}
            onClick={onClick}
            className={buttonClass}
            startIcon={startIcon || null}
            endIcon={endIcon || null}
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


export default CoustomButton;
