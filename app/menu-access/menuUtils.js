import React from "react";

const menuAccessArr = ["Edit", "View", "Add", "Delete", "Export", "Access"];

const dropdownFieldData = [
  {
    columnsToBeVisible: true,
    controlname: "dropdown",
    fieldname: "user",
    dropdownFilter:
      "and clientId != (select id from tblClient where clientCode = 'syscon')",
    isAuditLog: true,
    isControlShow: true,
    isCopyEditable: true,
    isDataFlow: true,
    isEditable: true,
    referenceColumn: "name",
    referenceTable: "tblUser",
    size: 100,
    yourlabel: "Select User",
  },
  {
    columnsToBeVisible: true,
    controlname: "dropdown",
    fieldname: "copyUser",
    dropdownFilter:
      "and clientId != (select id from tblClient where clientCode = 'syscon')",
    isAuditLog: true,
    isControlShow: true,
    isCopyEditable: true,
    isDataFlow: true,
    isEditable: true,
    referenceColumn: "name",
    referenceTable: "tblUser",
    size: 100,
    yourlabel: "Select User Copy (Optional)",
  },
];

function buildTree(data, parentId = null) {
  return data
    .filter((item) => item.parentMenuId === parentId)
    .map((item) => ({
      ...item,
      children: buildTree(data, item.id),
      checked: false,
      isEdit: false,
      isView: false,
      isAdd: false,
      isDelete: false,
      isExport: false,
      isAccess: false,
    }));
}

function updateCheckStatus(tree, id, checked) {
  const updateChildren = (children) =>
    children?.map((child) => ({
      ...child,
      checked,
      isEdit: checked,
      isView: checked,
      isAdd: checked,
      isDelete: checked,
      isExport: checked,
      isAccess: checked,
      children: updateChildren(child.children),
    })) || [];

  return tree.map((item) => {
    if (item.id === id) {
      return {
        ...item,
        checked,
        isEdit: checked,
        isView: checked,
        isAdd: checked,
        isDelete: checked,
        isExport: checked,
        isAccess: checked,
        children: updateChildren(item.children),
      };
    }

    return {
      ...item,
      children: updateCheckStatus(item.children || [], id, checked),
    };
  });
}

function updateCheckAccessStatus(tree, id, type, checked) {
  return tree.map((item) => {
    if (item.id === id) {
      return {
        ...item,
        [type]: checked,
      };
    }

    if (item.children) {
      return {
        ...item,
        children: updateCheckAccessStatus(item.children, id, type, checked),
      };
    }

    return item;
  });
}

function markParentsChecked(tree, id) {
  const cloned = JSON.parse(JSON.stringify(tree));

  const mark = (nodes, targetId, path = []) => {
    for (const node of nodes) {
      if (node.id === targetId) {
        for (const parent of path) {
          parent.checked = true;
          parent.isEdit = true;
          parent.isView = true;
          parent.isAdd = true;
          parent.isDelete = true;
          parent.isExport = true;
          parent.isAccess = true;
        }
        return true;
      }

      if (node.children && mark(node.children, targetId, [...path, node])) {
        return true;
      }
    }
    return false;
  };

  mark(cloned, id);
  return cloned;
}

function getMenuSubmitValues(menuData, userObj) {
  const result = [];
  function menuRecursion(item) {
    if (item.checked) {
      result.push({
        ...userObj,
        menuId: item.id,
        isEdit: Number(item.isEdit),
        isView: Number(item.isView),
        isAdd: Number(item.isAdd),
        isDelete: Number(item.isDelete),
        isExport: Number(item.isExport),
        isAccess: Number(item.isAccess),
      });
    }

    if (item.children) {
      item.children.map((subItem) => {
        menuRecursion(subItem);
      });
    }
  }

  menuData.map((subItem) => {
    menuRecursion(subItem);
  });

  return result;
}

function getMenuDataByUser(menusData, selectedMenus) {
  return menusData.map((item) => {
    const matchedMenu = selectedMenus.find((menu) => menu.menuId === item.id);
    if (matchedMenu) {
      return {
        ...item,
        checked: true,
        isEdit: matchedMenu.isEdit,
        isView: matchedMenu.isView,
        isAdd: matchedMenu.isAdd,
        isDelete: matchedMenu.isDelete,
        isExport: matchedMenu.isExport,
        isAccess: matchedMenu.isAccess,
        children: getMenuDataByUser(item.children || [], selectedMenus),
      };
    }
    return {
      ...item,
      checked: false,
      isEdit: false,
      isView: false,
      isAdd: false,
      isDelete: false,
      isExport: false,
      isAccess: false,
      children: getMenuDataByUser(item.children || [], selectedMenus),
    };
  });
}

const renderToggleIcon = (condition, iconTrue, iconFalse, setCondition) => {
  const IconComponent = condition ? iconFalse : iconTrue;
  return (
    <IconComponent
      className="tableArrow"
      onClick={() => setCondition(!condition)}
    />
  );
};

export {
  menuAccessArr,
  dropdownFieldData,
  buildTree,
  updateCheckStatus,
  updateCheckAccessStatus,
  markParentsChecked,
  getMenuSubmitValues,
  getMenuDataByUser,
  renderToggleIcon,
};
