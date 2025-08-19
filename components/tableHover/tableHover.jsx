"use client";

import React, { useState } from "react";
import PropTypes from "prop-types";
import { styled } from "@mui/material/styles";
import Tooltip, { tooltipClasses } from "@mui/material/Tooltip";
import { IconButton } from "@mui/material";
import Image from "next/image";

//
// -----------------------------
// 1️⃣ LightTooltip (named export)
// -----------------------------
export const LightTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} arrow />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.common.white,
    color: "rgba(0, 0, 0, 0.87)",
    boxShadow: theme.shadows[1],
    fontSize: 11,
  },
  [`& .${tooltipClasses.arrow}`]: {
    color: theme.palette.common.white,
  },
}));

//
// -----------------------------
// 2️⃣ HoverIcon (default export)
// Visible only when parent cell/row is hovered
// -----------------------------
const HoverIcon = ({
  defaultIcon,
  hoverIcon,
  altText,
  onClick,
  title,
  className,
  isDisabled,
  useNextImage, // true = Next.js Image, false = React/MUI nodes
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const iconToRender = isHovered ? hoverIcon : defaultIcon;

  return (
    <LightTooltip title={isDisabled ? `${title} (disabled)` : title}>
      <span
        className="hover-icon-wrapper"
        style={{
          display: "inline-flex",
          visibility: "hidden", // hidden by default
        }}>
        <IconButton
          aria-label={altText}
          className={className}
          onClick={onClick}
          disabled={isDisabled}
          sx={{
            paddingTop: "0px",
            paddingBottom: "0px",
            color:
              title === "Delete"
                ? "var(--color-delete)" // 🔴 delete stays red
                : "var(--color-foreground)", // 🟡 edit/view stay yellow
          }}>
          {defaultIcon}
        </IconButton>
      </span>
    </LightTooltip>
  );
};

HoverIcon.propTypes = {
  defaultIcon: PropTypes.oneOfType([PropTypes.string, PropTypes.node])
    .isRequired,
  hoverIcon: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
  altText: PropTypes.string,
  onClick: PropTypes.func,
  title: PropTypes.string,
  className: PropTypes.string,
  isDisabled: PropTypes.bool,
  useNextImage: PropTypes.bool,
};

HoverIcon.defaultProps = {
  isDisabled: false,
  useNextImage: false,
};

export { HoverIcon };

//
// -----------------------------
// 3️⃣ Global CSS to show only on cell hover
// -----------------------------
/* Add this to your globals.css */
//
// .MuiTableCell-root:hover .hover-icon-wrapper {
//    visibility: visible !important;
