"use client";
import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  Fragment,
} from "react";
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
  Grid,
  Skeleton,
  Typography,
} from "@mui/material";
import { ExpandMoreOutlined } from "@mui/icons-material";
import { CustomInput } from "@/components/customInput";
import { insertAccess } from "@/apis";
import { toast, ToastContainer } from "react-toastify";
import { getSpecificRoleMenuButtons } from "@/apis/menuAccess";
import { fieldsData, createHandleChangeEventFunction } from "./utils";
import { getUserByCookies } from "@/utils";

const MenuAccess = () => {
  const [menuButtons, setMenuButtons] = useState([]);
  const [expand, setExpand] = useState("");
  const [formData, setFormData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [expandAllMenus, setExpandAllMenus] = useState(false);
  const [arr, setArr] = useState([]);
  const [mode, setMode] = useState("add");
  const [jsonData, setJsonData] = useState(fieldsData);
  const user = getUserByCookies();

  const handleExpand = (panel) => (event, isExpanded) => {
    setExpand(isExpanded ? panel : false);
  };

  const expandAll = () => {
    setExpandAllMenus(true);
  };

  const collapseAll = () => {
    setExpandAllMenus(false);
  };

  // menuButtons data
  useEffect(() => {
    const fetchMenuButtons = async () => {
      try {
        setIsLoading(true);
        const data = await getMenuButtons();
        const arr = Array.isArray(data?.menuButtons) ? data.menuButtons : [];
        if (data) {
          const formattedData = arr?.map((item) => {
            const updatedButtons = item?.buttons?.map((info) => {
              return { ...info, accessFlag: "N" };
            });

            return { ...item, buttons: updatedButtons };
          });
          setMenuButtons(formattedData || []);
          setArr(formattedData || []);
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

  //
  useEffect(() => {
    if (formData?.userType?.Id) {
      const fetchData = async () => {
        if (!formData?.userType?.Id) {
          return toast.error("Please Select  Role Type");
        }
        const res = await getSpecificRoleMenuButtons({
          roleId: formData?.userType?.Id,
        });
        const fetchedArr = res?.data || arr;
        setMenuButtons(fetchedArr);
        setMode("edit");
        expandAll();
      };
      fetchData();
    }
  }, [formData?.userType?.Id]);

  const handleChange = useCallback(
    (menuName, buttonName, currentFlag, roleId) => {
      if (!formData?.userType?.Id) return toast.warn("Please Select User Role");
      setMenuButtons((prevMenuButtons) => {
        const updatedMenuButtons = prevMenuButtons.map((menu) => {
          if (menu.menuName === menuName) {
            const updatedButtons = menu.buttons.map((button) => {
              if (button.buttonName === buttonName) {
                return {
                  ...button,
                  accessFlag: currentFlag === "Y" ? "N" : "Y",
                  roleId: roleId,
                };
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
            JSON.stringify(prevMenuButtons[index]?.buttons),
        );

        return isChanged ? updatedMenuButtons : prevMenuButtons;
      });
    },
    [formData?.userType?.Id],
  );

  //  submit  code
  const handleSubmit = async () => {
    const uploadData = menuButtons.flatMap((menu) => menu.buttons);

    const data = uploadData.map((r) => ({
      ...r,
      roleId: formData.userType.Id,
      menuButtonId: r.menuButtonId ?? r.id,
    }));

    console.log({ roleId: formData?.userType?.Id, menu_json: data });
    // return

    try {
      const res = await insertAccess({
        roleId: formData?.userType?.Id,
        menu_json: JSON.stringify(data),
      });
      return toast.success(`${res.message}`);
    } catch (err) {
      console.log(err, "error");
    }
  };

  const isAllSelected = useMemo(() => {
    return (
      menuButtons.length > 0 &&
      menuButtons.every((menu) =>
        menu.buttons.every((btn) => btn.accessFlag === "Y"),
      )
    );
  }, [menuButtons]);

  const handleSelectAll = useCallback(
    (selectAll) => {
      if (!formData?.userType?.Id) {
        toast.warn("Please Select User Role");
        return;
      }

      setMenuButtons((prev) =>
        prev.map((menu) => ({
          ...menu,
          buttons: menu.buttons.map((btn) => ({
            ...btn,
            accessFlag: selectAll ? "Y" : "N",
            roleId: formData.userType.Id,
          })),
        })),
      );
    },
    [formData?.userType?.Id],
  );

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

  const handleChangeEventFunctions = createHandleChangeEventFunction({
    setJsonData,
    setFormData,
    setMenuButtons,
    formData,
  });

  return (
    <ThemeProvider theme={theme}>
      <Box className="p-4">
        <Box className="flex flex-col lg:flex-row">
          <Box className="w-full lg:basis-6/10">
            <Box className="block lg:grid lg:grid-cols-2">
              <CustomInput
                fields={jsonData.dp}
                formData={formData}
                setFormData={setFormData}
                handleChangeEventFunctions={handleChangeEventFunctions}
              />
            </Box>
          </Box>

          <Box className="w-full flex flex-col gap-4 lg:basis-4/10 lg:flex-row">
            <CustomButton
              text="Submit"
              type="submit"
              onClick={() => handleSubmit()}
            />
            <CustomButton
              text={expandAllMenus ? "Close All" : "Open All"}
              onClick={() => (expandAllMenus ? collapseAll() : expandAll())}
            />
            <CustomButton
              text={isAllSelected ? "UnSelect All" : "Select All"}
              onClick={() => handleSelectAll(!isAllSelected)}
            />
          </Box>
        </Box>

        <Box className="p-1 overflow-auto h-[calc(100vh-120px)]">
          <Box className="mt-4">
            {menuButtons && menuButtons.length > 0 ? (
              <>
                {menuButtons.map((item, __id) => (
                  <Accordion
                    className="mt-4"
                    key={item?.menuName}
                    expanded={expandAllMenus || expand === item.menuName}
                    onChange={handleExpand(item.menuName)}
                    style={{ background: "transparent", borderRadius: "5px" }}
                  >
                    {item?.menuName !== "Nominated Area" ? (
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
                    ) : (
                      <></>
                    )}
                    {/* <Typography>Buttons</Typography> */}
                    <AccordionDetails className="flex flex-row flex-wrap  gap-10 ">
                      {item.buttons
                        ?.filter((info) => info.status)
                        ?.map((buttonItem, __index) => (
                          <Fragment key={__index}>
                            <Box className="flex  flex-row  items-center">
                              <Typography key={__index}>
                                {String(buttonItem?.buttonName)
                                  .charAt(0)
                                  .toUpperCase() +
                                  String(buttonItem?.buttonName).slice(1) || ""}
                              </Typography>
                              <Checkbox
                                checked={
                                  buttonItem.accessFlag === "Y" ? true : false
                                } // use accessFlag
                                onChange={(e) => {
                                  handleChange(
                                    item?.menuName,
                                    buttonItem?.buttonName,
                                    buttonItem?.accessFlag,
                                    formData?.userType?.Id,
                                  );
                                }}
                              />
                            </Box>
                          </Fragment>
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
      <ToastContainer />
    </ThemeProvider>
  );
};

export default MenuAccess;
