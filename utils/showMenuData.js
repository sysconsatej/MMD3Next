export function updateMenuVisibility(menuList, permissions) {
    function setVisibility(items, menuName, accessFlag) {
      for (const item of items) {
        if (item.name.trim() === menuName.trim()) {
          if (accessFlag === "Y") item.isShow = true;
          return true; // found
        }

        if (item?.submenu && setVisibility(item.submenu, menuName, accessFlag)) {
          if (accessFlag === "Y") item.isShow = true;  // show parent
          return true;
        }

        if (
          item?.children &&
          setVisibility(item.children, menuName, accessFlag)
        ) {
          if (accessFlag === "Y") item.isShow = true; // show parent
          return true;
        }
      }
      return false;
    }

    for (const p of permissions) {
      if (p.buttons === "Y" && p.menuName) {
        setVisibility(menuList, p.menuName, p.buttons);
      }
    }

    return menuList;  // return menuArray i.e navItems
  }