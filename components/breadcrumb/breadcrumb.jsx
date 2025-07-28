"use client";
import React, { useEffect, useState } from "react";
import { Breadcrumbs, Typography, Stack } from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

export default function CustomBreadcrumb() {
    const [crumbs, setCrumbs] = useState([]);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const path = window.location.pathname;

            const rawSegments = path
                .split("/")
                .filter((segment) => segment && !segment.startsWith("{"));

            let segments = rawSegments;
            if (segments[segments.length - 1]?.toLowerCase() === "list") {
                segments = segments.slice(0, -1); // remove "list"
            }

            const capitalized = segments.map(
                (seg) => seg.charAt(0).toUpperCase() + seg.slice(1)
            );

            setCrumbs(capitalized);
        }
    }, []);

    if (crumbs.length === 0) return null;

    const items = crumbs.map((item, index) => (
        <Typography
            key={item + index}
            sx={{
                fontSize: "10px",
                color: "#000000",
                fontWeight: index === crumbs.length - 1 ? "bold" : "normal",
            }}
        >
            {item}
        </Typography>
    ));

    return (
        <div className="relative top-2 pl-1">
            <Stack spacing={1}>
                <Breadcrumbs
                    separator={
                        <NavigateNextIcon
                            sx={{ color: "#000", fontSize: "12px", mx: 0.2 }}
                        />
                    }
                    sx={{
                        "& ol": {
                            gap: "2px",
                        },
                    }}
                >
                    {items}
                </Breadcrumbs>
            </Stack>
        </div>
    );
}
