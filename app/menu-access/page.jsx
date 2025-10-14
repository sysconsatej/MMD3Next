"use client";
import React, { useEffect, useState, useCallback } from "react";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "./menuAccessStyling";
import CustomButton from "@/components/button/button";
import { getMenuButtons } from "@/apis/getMenuButtons";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Checkbox,
  Typography,
} from "@mui/material";
import { ExpandMoreOutlined } from "@mui/icons-material";

const MenuAccess = () => {
  const [menuButtons, setMenuButtons] = useState([]);
  const [expand, setExpand] = useState("");

  // Memoized handleChange function using useCallback
  const handleChange = useCallback((menuName, buttonName, status) => {
    setMenuButtons((prevMenuButtons) => {
      // Update the buttons state immutably and avoid unnecessary updates
      const updatedMenuButtons = prevMenuButtons.map((menu) => {
        if (menu.menuName === menuName) {
          const updatedButtons = menu.buttons.map((button) => {
            if (button.buttonName === buttonName && button.status !== !status) {
              // Only update the button status if it actually changes
              return { ...button, status: !status };
            }
            return button;
          });

          return { ...menu, buttons: updatedButtons };
        }
        return menu;
      });

      // Compare the previous state and the new state to avoid unnecessary updates
      // Only update if the menuButtons array has changed
      const isChanged = !updatedMenuButtons.every(
        (menu, index) =>
          JSON.stringify(menu.buttons) ===
          JSON.stringify(prevMenuButtons[index]?.buttons)
      );

      return isChanged ? updatedMenuButtons : prevMenuButtons;
    });
  }, []);

  const handleExpand = (panel) => (event, isExpanded) => {
    setExpand(isExpanded ? panel : false);
  };

  useEffect(() => {
    const fetchMenuButtons = async () => {
      try {
        const data = await getMenuButtons();
        const arr = Array.isArray(data?.menuButtons) ? data.menuButtons : [];
        setMenuButtons(arr);
      } catch (error) {
        console.error("Error fetching menu buttons:", error);
      }
    };

    fetchMenuButtons();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <Box className="p-4 overflow-auto h-[calc(100vh-120px)]">
        <CustomButton text={"Submit"} type="submit" onClick={() => {}} />
        <Box className="mt-4">
          {menuButtons && menuButtons.length > 0 ? (
            <>
              {menuButtons.map((item) => (
                <Accordion
                  className="mt-4 "
                  key={item.menuName}
                  expanded={expand === item.menuName}
                  onChange={handleExpand(item.menuName)}
                  style={{ background: "transparent", borderRadius: "5px" }}
                >
                  <AccordionSummary
                    className="bg-gradient-to-b from-blue-600 via-indigo-700 to-blue-900 rounded"
                    expandIcon={
                      <ExpandMoreOutlined style={{ color: "#FFF" }} />
                    }
                    id={`${item.menuName}-header`}
                    aria-controls={`${item.menuName}-content`}
                    style={{ borderRadius: "5px" }}
                  >
                    <Typography
                      color="white"
                      sx={{ fontWeight: "500", fontSize: "14px" }}
                    >
                      {item.menuName}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails className="flex flex-row justify-between gap-10">
                    {item.buttons?.map((r, __index) => (
                      <Box key={__index} className="flex flex-row items-center">
                        <Typography key={__index}>
                          {String(r.buttonName).charAt(0).toUpperCase() +
                            String(r.buttonName).slice(1)}
                        </Typography>
                        <Checkbox
                          checked={r.status || false}
                          onChange={() =>
                            handleChange(item?.menuName, r.buttonName, r.status)
                          }
                        />
                      </Box>
                    ))}
                  </AccordionDetails>
                </Accordion>
              ))}
            </>
          ) : (
            <> No Data </>
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default MenuAccess;
