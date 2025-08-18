"use client";
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Menu,
  MenuItem,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Collapse,
  useMediaQuery,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import Image from "next/image";
import Link from "next/link";
import CustomButton from "@/components/button/button";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";

const navItems = [
  { name: "Home", href: "/" },
  {
    name: "Master",
    submenu: [
      { name: "Commodity", href: "/master/commodity/list" },
      { name: "Company", href: "/master/company/list" },
      { name: "Company Branch", href: "/master/companyBranch/list" },
      { name: "Container Size", href: "/master/containerSize/list" },
      { name: "Container Status", href: "/master/containerStatus/list" },
      { name: "Container Type", href: "/master/containerType/list" },
      { name: "CFS", href: "/master/cfs/list" },
      { name: "Depot", href: "/master/depot/list" },
      { name: "ISO Code", href: "/master/isoCode/list" },
      { name: "IMO ", href: "/master/imo/list" },
      { name: "ITEM Type", href: "/master/itemType/list" },
      { name: "Cargo Type", href: "/master/cargoType/list" },
      { name: "Country", href: "/master/country/list" },
      { name: "Vessel", href: "/master/vessel/list" },
      { name: "Voyage Route", href: "/master/voyageRoute/list" },
      { name: "City", href: "/master/city/list" },
      { name: "State", href: "/master/state/list" },
      { name: "Port", href: "/master/port/list" },
      { name: "Nominated Area", href: "/master/nominatedArea/list" },
      { name: "Terminal", href: "/master/terminal/list" },
      { name: "Dpd", href: "/master/dpd/list" },
      { name: "Type Of Company", href: "/master/typeOfCompany/list" },
      { name: "Package Type", href: "/master/packageType/list" },
      { name: "Voyage", href: "/master/voyage/list" },
      { name: "User", href: "/master/user/list" },
      { name: "Unit", href: "/master/unit/list" },
      {name:"Unit Type",href:"/master/unitType/list"},
      { name: "SMTP", href: "/master/smtpCarrier/list" },
      { name: "Mode Of Transport", href: "/master/modeOfTransport/list" },
      { name: "Movement Type", href: "/master/movementType/list" },
    ],
  },
  {
    name: "BL",
    href: "/bl/list",
  },
  { name: "HBL", href: "/hbl/list" },
];
function getActiveNavItem(navItems, pathname) {
  let matched = { activeLink: "", activeSubLink: "", activeParentSubLink: "" };

  for (const item of navItems) {
    if (item.submenu) {
      for (const sub of item.submenu) {
        const subPrefix = sub.href.split("/").slice(0, 3).join("/");
        const pathPrefix = pathname.split("/").slice(0, 3).join("/");

        if (subPrefix === pathPrefix) {
          matched = { activeLink: item.name, activeSubLink: sub.name };

          if (sub.children) {
            for (const child of sub.children) {
              const childPrefix = child.href.split("/").slice(0, 4).join("/");
              const childPath = pathname.split("/").slice(0, 4).join("/");

              if (childPrefix === childPath) {
                matched = {
                  activeLink: item.name,
                  activeSubLink: child.name,
                  activeParentSubLink: sub.name,
                };
              }
            }
          }
        }
      }
    } else {
      const base = item.href.split("/")[1];
      const current = pathname.split("/")[1];

      if (base === current) {
        matched = { activeLink: item.name, activeSubLink: "" };
      }
    }
  }

  return matched;
}

function Navbar() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [thirdMenuAnchor, setThirdMenuAnchor] = useState(null);
  const [openThirdMenu, setOpenThirdMenu] = useState(null);
  const [activeParentSubLink, setActiveParentSubLink] = useState("");

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("Home");
  const [activeSubLink, setActiveSubLink] = useState("");
  const [openSubmenus, setOpenSubmenus] = useState({});
  const isMobile = useMediaQuery("(max-width:900px)");
  const pathname = usePathname();
  const router = useRouter();
  const closeMenus = () => {
    setAnchorEl(null);
    setThirdMenuAnchor(null);
    setOpenThirdMenu(null);
  };

  useEffect(() => {
    const { activeLink, activeSubLink, activeParentSubLink } = getActiveNavItem(
      navItems,
      pathname
    );
    setActiveLink(activeLink);
    setActiveSubLink(activeSubLink);
    setActiveParentSubLink(activeParentSubLink);
  }, [pathname]);

  const toggleDrawer = () => setDrawerOpen(!drawerOpen);
  const toggleSubmenu = (name) =>
    setOpenSubmenus((prev) => ({ ...prev, [name]: !prev[name] }));

  const baseClass =
    "relative font-semibold cursor-pointer transition-all duration-200";
  const afterUnderline =
    "after:content-[''] after:absolute after:left-0 after:bottom-[-4px] after:h-[2px] after:w-full";
  const activeClass = `text-[#03bafc] ${afterUnderline} after:bg-[#03bafc]`;
  const hoverClass = `hover:scale-105 text-black hover:${afterUnderline} hover:after:bg-[#03bafc]`;

  return (
    <>
      <Box className="bg-[#edf1f4] px-4 py-1 shadow-md">
        <Box className="flex items-center mx-auto justify-between">
          <Image
            src="/images/logo.png"
            alt="Master Group Logo"
            width={40}
            height={30}
            className="object-contain"
          />

          {!isMobile && (
            <Box className="grid grid-cols-[1fr_auto] gap-8 items-center">
              <Box className="flex gap-8">
                {navItems.map((item) =>
                  item.submenu ? (
                    <Box
                      key={item.name}
                      className="relative"
                      onMouseEnter={(e) => setAnchorEl(e.currentTarget)}
                      onMouseLeave={() => {
                        setAnchorEl(null);
                        setThirdMenuAnchor(null);
                        setOpenThirdMenu(null);
                      }}
                    >
                      <Box className="flex items-center gap-1 cursor-pointer">
                        <Typography
                          className={`!text-sm ${baseClass} ${
                            activeLink === item.name ? activeClass : hoverClass
                          }`}
                        >
                          {item.name}
                        </Typography>
                        <ExpandMore
                          fontSize="small"
                          sx={{
                            color: "#000",
                            transform:
                              anchorEl?.textContent === item.name
                                ? "rotate(180deg)"
                                : "rotate(0deg)",
                            transition: "transform 0.3s ease",
                          }}
                        />
                      </Box>

                      <Menu
                        anchorEl={anchorEl}
                        open={anchorEl?.textContent === item.name}
                        onClose={closeMenus}
                        anchorOrigin={{
                          vertical: "bottom",
                          horizontal: "left",
                        }}
                        slotProps={{
                          paper: {
                            onMouseLeave: closeMenus,
                          },
                          list: {
                            sx: {
                              maxHeight: "350px",
                              overflow: "auto",
                              "&::-webkit-scrollbar": {
                                width: "4px",
                              },
                              "&::-webkit-scrollbar-track": {
                                backgroundColor: "#f1f1f1",
                              },
                              "&::-webkit-scrollbar-thumb": {
                                backgroundColor: "#ffc400",
                                borderRadius: "2px",
                              },
                              "&::-webkit-scrollbar-thumb:hover": {
                                backgroundColor: "#555",
                              },
                              transition: "all 200ms ease-in-out",
                              "& .MuiMenuItem-root": {
                                transition: "all 150ms ease-in-out",
                                "&:hover": {
                                  backgroundColor: "#03bafc",
                                  color: "white",
                                },
                              },
                            },
                          },
                        }}
                        sx={{
                          mt: 1,
                          "& .MuiPaper-root": {
                            backgroundColor: "#0b2545",
                            color: "white",
                          },
                        }}
                      >
                        {item.submenu.map((sub) => (
                          <Box key={sub.name}>
                            <MenuItem
                              onMouseEnter={(e) => {
                                if (sub.children) {
                                  setThirdMenuAnchor(e.currentTarget);
                                  setOpenThirdMenu(sub.name);
                                } else {
                                  setThirdMenuAnchor(null);
                                  setOpenThirdMenu(null);
                                }
                              }}
                              sx={{
                                py: 0.5,
                                display: "flex",
                                justifyContent: "space-between",
                                backgroundColor:
                                  activeSubLink === sub.name ||
                                  activeParentSubLink === sub.name ||
                                  activeParentSubLink === sub.name ||
                                  activeParentSubLink === sub.name
                                    ? "#03bafc"
                                    : "transparent",
                                fontWeight:
                                  activeSubLink === sub.name ||
                                  activeParentSubLink === sub.name ||
                                  activeParentSubLink === sub.name ||
                                  activeParentSubLink === sub.name
                                    ? "bold"
                                    : "normal",
                                color:
                                  activeSubLink === sub.name ||
                                  activeParentSubLink === sub.name ||
                                  activeParentSubLink === sub.name
                                    ? "white"
                                    : "inherit",
                                "&:hover": {
                                  borderBottom: "2px solid #03bafc",
                                  color: "white",
                                },
                              }}
                            >
                              <Link
                                href={sub.href}
                                onClick={() => {
                                  setActiveSubLink(sub.name);
                                  closeMenus();
                                }}
                                className="w-full block text-sm"
                              >
                                {sub.name}
                              </Link>

                              {sub.children && (
                                <ChevronRightIcon fontSize="small" />
                              )}
                            </MenuItem>

                            {sub.children && (
                              <Menu
                                anchorEl={thirdMenuAnchor}
                                open={openThirdMenu === sub.name}
                                onClose={() => {
                                  setThirdMenuAnchor(null);
                                  setOpenThirdMenu(null);
                                }}
                                anchorOrigin={{
                                  vertical: "top",
                                  horizontal: "right",
                                }}
                                transformOrigin={{
                                  vertical: "top",
                                  horizontal: "left",
                                }}
                                slotProps={{
                                  paper: {
                                    onMouseLeave: closeMenus,
                                  },
                                  list: {
                                    sx: {
                                      transition: "all 200ms ease-in-out",
                                      px: 0,
                                      py: 0,
                                      "& .MuiMenuItem-root": {
                                        transition: "all 150ms ease-in-out",
                                        "&:hover": {
                                          backgroundColor: "#03bafc",
                                          color: "white",
                                        },
                                      },
                                    },
                                  },
                                }}
                                sx={{
                                  "& .MuiPaper-root": {
                                    backgroundColor: "#0b2545",
                                    color: "white",
                                    px: 0,
                                    py: 0,
                                  },
                                }}
                              >
                                {sub.children.map((child) => (
                                  <MenuItem
                                    key={child.name}
                                    onClick={() => {
                                      setActiveSubLink(child.name);
                                      closeMenus();
                                      setTimeout(() => {
                                        router.push(child.href);
                                      }, 50);
                                    }}
                                    sx={{
                                      py: 0,
                                      backgroundColor:
                                        activeSubLink === child.name
                                          ? "#03bafc"
                                          : "transparent",
                                      color:
                                        activeSubLink === child.name
                                          ? "white"
                                          : "inherit",
                                      fontWeight:
                                        activeSubLink === child.name
                                          ? "bold"
                                          : "normal",
                                      "&:hover": {
                                        borderBottom: "2px solid #03bafc",
                                        color: "white",
                                      },
                                    }}
                                  >
                                    <Typography className="w-full block text-sm cursor-pointer">
                                      {child.name}
                                    </Typography>
                                  </MenuItem>
                                ))}
                              </Menu>
                            )}
                          </Box>
                        ))}
                      </Menu>
                    </Box>
                  ) : (
                    <Box key={item.name} className="relative">
                      <Link href={item.href}>
                        <Typography
                          onClick={() => setActiveLink(item.name)}
                          className={`!text-sm ${baseClass} ${
                            activeLink === item.name ? activeClass : hoverClass
                          }`}
                        >
                          {item.name}
                        </Typography>
                      </Link>
                    </Box>
                  )
                )}
              </Box>
              <CustomButton text="Enquire Now" size="small" />
            </Box>
          )}

          {isMobile && (
            <IconButton className="justify-self-end" onClick={toggleDrawer}>
              <MenuIcon sx={{ color: "#000" }} />
            </IconButton>
          )}
        </Box>
      </Box>

      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer}>
        <Box className="w-[250px] p-2" role="presentation">
          <List>
            {navItems.map((item) =>
              item.submenu ? (
                <React.Fragment key={item.name}>
                  <ListItem
                    button
                    onClick={() => toggleSubmenu(item.name)}
                    className={`${
                      activeLink === item.name
                        ? "text-[#03bafc] font-semibold"
                        : ""
                    }`}
                  >
                    <ListItemText primary={item.name} className="text-sm" />
                    {openSubmenus[item.name] ? <ExpandLess /> : <ExpandMore />}
                  </ListItem>

                  <Collapse
                    in={openSubmenus[item.name]}
                    timeout="auto"
                    unmountOnExit
                  >
                    <List component="div" disablePadding>
                      {item.submenu.map((sub) => (
                        <React.Fragment key={sub.name}>
                          {sub.children ? (
                            <>
                              <ListItem
                                button
                                onClick={() =>
                                  toggleSubmenu(item.name + sub.name)
                                }
                                className={`pl-6 ${
                                  activeSubLink === sub.name ||
                                  activeParentSubLink === sub.name ||
                                  activeParentSubLink === sub.name
                                    ? "text-[#03bafc] font-semibold"
                                    : ""
                                }`}
                              >
                                <ListItemText
                                  primary={sub.name}
                                  className="text-sm"
                                />
                                {openSubmenus[item.name + sub.name] ? (
                                  <ExpandLess />
                                ) : (
                                  <ExpandMore />
                                )}
                              </ListItem>

                              <Collapse
                                in={openSubmenus[item.name + sub.name]}
                                timeout="auto"
                                unmountOnExit
                              >
                                <List component="div" disablePadding>
                                  {sub.children.map((child) => (
                                    <Link href={child.href} key={child.name}>
                                      <ListItem
                                        button
                                        className={`pl-10 ${
                                          activeSubLink === child.name
                                            ? "text-[#03bafc] font-semibold"
                                            : ""
                                        }`}
                                        onClick={() => {
                                          setDrawerOpen(false);
                                          setActiveLink(item.name);
                                          setActiveSubLink(child.name);
                                        }}
                                      >
                                        <ListItemText
                                          primary={child.name}
                                          className="text-sm"
                                        />
                                      </ListItem>
                                    </Link>
                                  ))}
                                </List>
                              </Collapse>
                            </>
                          ) : (
                            <Link href={sub.href}>
                              <ListItem
                                button
                                className={`pl-6 ${
                                  activeSubLink === sub.name ||
                                  activeParentSubLink === sub.name ||
                                  activeParentSubLink === sub.name
                                    ? "text-[#03bafc] font-semibold"
                                    : ""
                                }`}
                                onClick={() => {
                                  setDrawerOpen(false);
                                  setActiveSubLink(sub.name);
                                  setActiveLink(item.name);
                                }}
                              >
                                <ListItemText
                                  primary={sub.name}
                                  className="text-sm"
                                />
                              </ListItem>
                            </Link>
                          )}
                        </React.Fragment>
                      ))}
                    </List>
                  </Collapse>
                </React.Fragment>
              ) : (
                <Link href={item.href} key={item.name}>
                  <ListItem
                    button
                    onClick={() => {
                      setDrawerOpen(false);
                      setActiveLink(item.name);
                      setActiveSubLink("");
                    }}
                    className={`${
                      activeLink === item.name
                        ? "text-[#03bafc] font-semibold"
                        : ""
                    }`}
                  >
                    <ListItemText primary={item.name} className="text-sm" />
                  </ListItem>
                </Link>
              )
            )}
          </List>
          <Box className="mt-4">
            <CustomButton text="Enquire Now" />
          </Box>
        </Box>
      </Drawer>
    </>
  );
}

export default Navbar;
