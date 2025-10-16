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
  Skeleton,
  Typography,
} from "@mui/material";
import { ExpandMoreOutlined } from "@mui/icons-material";
import { CustomInput } from "@/components/customInput";

const fieldsData = {
  dp: [
    {
      label: "Select User",
      name: "user",
      type: "dropdown",
      tableName: "tblUser",
      displayColumn: "name",
      orderBy: "name",
      foreignTable: "name,tblUser",
      where: "userType = 'U'",
      key: "user",
    },
  ],
};

const MenuAccess = () => {
  const [menuNames, setMenuNames] = useState([]);
  const [menuButtons, setMenuButtons] = useState([]);
  const [expand, setExpand] = useState("");
  const [arr, setArr] = useState([]);
  const [formData, setFromData] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleExpand = (panel) => (event, isExpanded) => {
    setExpand(isExpanded ? panel : false);
  };

  useEffect(() => {
    const fetchMenuButtons = async () => {
      try {
        setIsLoading(true);
        const data = await getMenuButtons();
        const arr = Array.isArray(data?.menuButtons) ? data.menuButtons : [];
        if (data) {
          setMenuButtons(arr);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error fetching menu buttons:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenuButtons();
  }, []);

  const handleChange = useCallback((menuName, buttonName, status) => {
    setMenuButtons((prevMenuButtons) => {
      const updatedMenuButtons = prevMenuButtons.map((menu) => {
        if (menu.menuName === menuName) {
          const updatedButtons = menu.buttons.map((button) => {
            if (button.buttonName === buttonName && button.status !== !status) {
              return { ...button, status: !status };
            }
            return button;
          });

          return { ...menu, buttons: updatedButtons };
        }
        return menu;
      });
      const isChanged = !updatedMenuButtons.every(
        (menu, index) =>
          JSON.stringify(menu.buttons) ===
          JSON.stringify(prevMenuButtons[index]?.buttons)
      );

      return isChanged ? updatedMenuButtons : prevMenuButtons;
    });
  }, []);

  const getBtnArr = useCallback((id, status) => {
    const obj = { id: id, status: status };
    console.log(obj, "obj");
  }, []);

  const handleSubmit = () => {
    console.log(arr, "arr");
    console.log("Form submitted");
    console.log(menuNames, "menuName[][][");
  };

  if (isLoading) {
    return (
      <Box className="p-16">
        {Array.from({ length: 10 }).map((_, idx) => (
          <Skeleton
            key={idx}
            variant="rectangular"
            className="rounded-xl"
            width={"100%"}
            height={50}
          />
        ))}
      </Box>
    );
  }

  console.log(formData , 'formData')

  return (
    <ThemeProvider theme={theme}>
      <Box className="p-4">
        <CustomButton
          text={"Submit"}
          type="submit"
          onClick={() => handleSubmit()}
        />
        <br />
        <CustomInput
          fields={fieldsData.dp}
          formData={formData}
          setFormData={setFromData}
        />
        <br />

        <Box className="p-1 overflow-auto h-[calc(100vh-120px)]">
          <Box className="mt-4">
            {menuButtons && menuButtons.length > 0 ? (
              <>
                {menuButtons.map((item) => (
                  <Accordion
                    className="mt-4"
                    key={item.menuName}
                    expanded={expand === item.menuName}
                    onChange={handleExpand(item.menuName)}
                    style={{ background: "transparent", borderRadius: "5px" }}
                  >
                    <AccordionSummary
                      className="bg-gradient-to-t from-blue-500  to-indigo-500"
                      expandIcon={
                        <ExpandMoreOutlined style={{ color: "#FFF" }} />
                      }
                      id={`${item.menuName}-header`}
                      aria-controls={`${item.menuName}-content`}
                      style={{
                        borderRadius: "5px",
                      }}
                    >
                      <Typography
                        color="white"
                        sx={{ fontWeight: "500", fontSize: "14px" }}
                      >
                        {item.menuName}
                      </Typography>
                    </AccordionSummary>
                    {/* <Typography>Buttons</Typography> */}
                    <AccordionDetails className="flex flex-row flex-wrap  gap-10 ">
                      {item.buttons?.map((r, __index) => (
                        <Box
                          key={__index}
                          className="flex  flex-row   items-center"
                        >
                          <Typography key={__index}>
                            {String(r.buttonName).charAt(0).toUpperCase() +
                              String(r.buttonName).slice(1)}
                          </Typography>
                          <Checkbox
                            checked={r.status || false}
                            onChange={(e) => {
                              (handleChange(
                                item?.menuName,
                                r.buttonName,
                                r.status
                              ),
                                getBtnArr(r?.id, e.target.checked));
                            }}
                          />
                        </Box>
                      ))}
                    </AccordionDetails>
                  </Accordion>
                ))}
              </>
            ) : (
              <> </>
            )}
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default MenuAccess;
