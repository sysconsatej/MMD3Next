"use client";
import React, { useState } from "react";
// import { fetchReportData } from "@/services/auth/FormControl.services";
import { MenuButton } from "./menuButton";
import {
  buildTree,
  // buildTree,
  // dropdownFieldData,
  // getMenuDataByUser,
  // getMenuSubmitValues,
  markParentsChecked,
  renderToggleIcon,
  updateCheckAccessStatus,
  updateCheckStatus,
} from "./menuUtils";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "./menuAccessStyling";
// import { menuAccessSubmit } from "@/services/auth/Auth.services";
// import styles from "@/app/app.module.css";
// import { getUserDetails } from "@/helper/userDetails";
// import CustomeInputFields from "@/components/Inputs/customeInputFields";
// import LightTooltip from "@/components/Tooltip/customToolTip";
import KeyboardDoubleArrowDownIcon from "@mui/icons-material/KeyboardDoubleArrowDown";
import KeyboardDoubleArrowUpIcon from "@mui/icons-material/KeyboardDoubleArrowUp";
import { SmapleMenuData } from "./sampleMenuData";
import CustomButton from "@/components/button/button";

const MenuAccess = () => {
  const [menuTree, setMenuTree] = useState(buildTree(SmapleMenuData.data));
  // const [selectedUserName, setSelectedUserName] = useState("");
  // const [userNameInitial] = useState({
  //   exportdropdown: "",
  // });
  const [expandAll, setExpandAll] = useState(false);
  // const { clientId, userId, roleId } = getUserDetails();

  const handleCheckChange = (id, checked) => {
    let newTree = updateCheckStatus([...menuTree], id, checked);
    if (checked) {
      newTree = markParentsChecked(newTree, id);
    }
    setMenuTree([...newTree]);
  };

  const handleCheckAccessChange = (id, type, checked) => {
    const newTree = updateCheckAccessStatus([...menuTree], id, type, checked);
    setMenuTree([...newTree]);
  };

  // async function handleSubmit() {
  //   const userObj = {
  //     createdBy: userId,
  //     roleId: roleId,
  //     clientId: clientId,
  //     updatedBy: userId,
  //     userId: selectedUserName,
  //   };
  //   let result = getMenuSubmitValues(menuTree, userObj);
  //   const menuObj = {
  //     userId: selectedUserName,
  //     menu_json: JSON.stringify(result),
  //     updatedBy: userId,
  //   };
  //   if (selectedUserName) {
  //     const response = await menuAccessSubmit(menuObj);
  //     if (response?.success) {
  //       toast.success("Menu updated successfully!");
  //     } else {
  //       toast.error(response?.message);
  //     }
  //   } else {
  //     toast.warning("Select User!");
  //   }
  // }

  // const handleChange = async (updatedValue) => {
  //   const { user, copyUser } = updatedValue;
  //   let selectedUserId = null;

  //   if (copyUser && !user) {
  //     setSelectedUserName(user);
  //     toast.warn("Please select user first for copy!");
  //     return;
  //   }

  //   if (copyUser || user) {
  //     selectedUserId = copyUser || user;
  //   }

  // setSelectedUserName(user);
  // const requestBodyMenuAccess = {
  //   columns: "menuId,isEdit,isView,isAdd,isDelete,isExport,isAccess",
  //   tableName: "tblMenuAccess",
  //   whereCondition: `userId = ${selectedUserId}`,
  //   clientIdCondition: `status = 1 FOR JSON PATH, include_null_values`,
  // };
  // const { data } = await fetchReportData(requestBodyMenuAccess);
  // const setMenuByUser = getMenuDataByUser(menuTree, data);
  // setMenuTree(setMenuByUser);
  // };

  // useEffect(() => {
  //   const fetchData = async () => {
  //     const requestBodyMenu = {
  //       columns: "menuName,id,parentMenuId",
  //       tableName: "tblMenu",
  //       whereCondition: null,
  //       clientIdCondition: `status = 1 FOR JSON PATH, include_null_values`,
  //     };

  //     try {
  //       const { data } = await fetchReportData(requestBodyMenu);
  //       const treeData = buildTree(data);
  //       setMenuTree(treeData);
  //     } catch (error) {
  //       console.error(error);
  //     }
  //   };

  //   fetchData();
  // }, []);

  return (
    <ThemeProvider theme={theme}>
      <div className="flex items-center justify-between py-2 px-4 ">
        <div className="flex">
          {/* <CustomeInputFields
            inputFieldData={dropdownFieldData}
            onValuesChange={(value) =>
              handleChange({ ...userNameInitial, ...value })
            }
            values={userNameInitial}
          /> */}
          <CustomButton text={"Submit"} type="submit" onClick={() => {}}>
            Submit
          </CustomButton>
        </div>
        {/* <LightTooltip title={expandAll ? "Collapse All" : "Expand All"}> */}
        {/* <div className="bg-['black'] cursor-pointer rounded-full w-[30px] h-[30px] flex items-center justify-center "> */}
        {renderToggleIcon(
          expandAll,
          KeyboardDoubleArrowDownIcon,
          KeyboardDoubleArrowUpIcon,
          setExpandAll
        )}
        {/* </div> */}
        {/* </LightTooltip> */}
      </div>
      <div className="flex items-center justify-center">
        <MenuButton
          items={menuTree}
          onCheckChange={handleCheckChange}
          onCheckAccessChange={handleCheckAccessChange}
          expandAll={expandAll}
        />
      </div>
    </ThemeProvider>
  );
};

export default MenuAccess;
