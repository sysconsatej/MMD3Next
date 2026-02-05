export function updateMenuVisibility(menuList, permissions) {
  function setVisibility(items, menuName, accessFlag, roleId) {
    for (const item of items) {
      if (item.name.trim() === menuName.trim()) {
        if (accessFlag === "Y") {
          ((item.isShow = true), (item.roleId = roleId));
        }
        return true;
      }

      if (
        item?.submenu &&
        setVisibility(item.submenu, menuName, accessFlag, roleId)
      ) {
        if (accessFlag === "Y") {
          ((item.isShow = true), (item.roleId = roleId));
        } // show parent
        return true;
      }

      if (
        item?.children &&
        setVisibility(item.children, menuName, accessFlag, roleId)
      ) {
        if (accessFlag === "Y") {
          ((item.isShow = true), (item.roleId = roleId));
        } // show parent
        return true;
      }
    }
    return false;
  }

  for (const p of permissions) {
    if (p.buttons === "Y" && p.menuName) {
      setVisibility(menuList, p.menuName, p.buttons, p.roleId);
    }
  }

  return menuList; // return menuArray i.e navItems
}
