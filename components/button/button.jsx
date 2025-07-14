"use client";
import React from "react";
import MuiButton from "@mui/material/Button";
import clsx from "clsx";
import Link from "next/link";



export const Button = ({
    text,
    onClick,
    href,
    bg = "custom",
    className = "",
    startIcon,
    endIcon,
    size = "small",
    color = "red",
    hoverColor = "orange",
    ...props
}) => {
    // const bgClasses = {
    //     blue: "bg-blue-500 hover:bg-blue-600",
    //     red: "bg-red-500 hover:bg-red-600",
    //     green: "bg-green-500 hover:bg-green-600",
    //     yellow: "bg-yellow-500 hover:bg-yellow-600",
    //     gray: "bg-gray-500 hover:bg-gray-600",
    // };

    // const finalClass = clsx("text-white", bgClasses[bg] || bgClasses.blue, className);
    const bgColor = clsx(`!bg-[${color}] !hover:bg-[black]`);
    console.log("bgColor", bgColor);
    const button = (
        <MuiButton
            variant="contained"
            size={size}
            onClick={onClick}
            className={bgColor}
            disableElevation
            startIcon={startIcon}
            endIcon={endIcon}
            {...props}
        >
            {text}
        </MuiButton>
    );

    const isExternal = href?.startsWith("http");

    if (href) {

        if (isExternal) {
            return (
                <a href={href} target="_blank" rel="noopener noreferrer">
                    {button}
                </a>
            );
        }

        return (
            <Link href={href} target="" passHref legacyBehavior>
                <a>{button}</a>
            </Link>
        );
    }
    return button;
};

export default Button;
