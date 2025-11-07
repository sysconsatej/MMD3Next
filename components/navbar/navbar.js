"use client";
import React, { useEffect, useState } from "react";
import {
  ThemeProvider,
  CssBaseline,
  Box,
  Typography,
  Menu,
  MenuItem,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Collapse,
  useMediaQuery,
  Avatar,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ExpandMore from "@mui/icons-material/ExpandMore";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { navItems } from "./index";
import { navTheme } from "@/styles";
import { useModal, auth } from "@/store";
import { useInitUser } from "@/utils";

const norm = (s) => (s ? s.split("?")[0].replace(/\/$/, "") : "");
const scope = (path, depth) => norm(path).split("/").slice(0, depth).join("/");

function getActiveNavItem(items, rawPathname) {
  const pathname = norm(rawPathname);
  const pathScope3 = scope(pathname, 3);
  const pathScope4 = scope(pathname, 4);

  let matched = { activeLink: "", activeSubLink: "", activeParentSubLink: "" };

  for (const item of items) {
    if (item.submenu) {
      for (const sub of item.submenu) {
        const subKey = scope(sub.href, 3);
        if (pathScope3 === subKey || pathname.startsWith(subKey)) {
          matched = {
            activeLink: item.name,
            activeSubLink: subKey,
            activeParentSubLink: "",
          };
        }
        if (sub.children) {
          for (const child of sub.children) {
            const childKey = scope(child.href, 4);
            if (pathScope4 === childKey || pathname.startsWith(childKey)) {
              matched = {
                activeLink: item.name,
                activeSubLink: childKey,
                activeParentSubLink: subKey,
              };
            }
          }
        }
      }
    } else {
      const itemKey = scope(item.href, 2);
      if (pathname.startsWith(itemKey)) {
        matched = {
          activeLink: item.name,
          activeSubLink: "",
          activeParentSubLink: "",
        };
      }
    }
  }
  return matched;
}

const sx = {
  link: {
    position: "relative",
    fontWeight: 400,
    fontSize: "0.95rem",
    cursor: "pointer",
    color: "#111",
    textDecoration: "none",
    display: "inline-block",
    lineHeight: "26px",
    "&::after": {
      content: '""',
      position: "absolute",
      left: 0,
      bottom: "-6px",
      height: "2px",
      width: 0,
      backgroundColor: "#a8b2ef",
      transition: "width .18s ease",
      borderRadius: 0,
    },
    "&:hover::after": { width: "100%" },
    "&.active::after": { width: "100%" },
  },
  caret: {
    ml: "6px",
    color: "#000",
    transition: "transform .25s ease",
    verticalAlign: "middle",
  },
  caretOpen: { transform: "rotate(180deg)" },
};

export default function Navbar() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [thirdMenuAnchor, setThirdMenuAnchor] = useState(null);
  const [openThirdMenu, setOpenThirdMenu] = useState(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("Home");
  const [activeSubLink, setActiveSubLink] = useState("");
  const [activeParentSubLink, setActiveParentSubLink] = useState("");
  const [openSubmenus, setOpenSubmenus] = useState({});

  const isMobile = useMediaQuery("(max-width:900px)");
  const pathname = usePathname();
  const router = useRouter();

  // aakash yadav code
  useInitUser();
  const { userData } = auth();
  const { setModalOpen } = useModal();
  console.log("Navbar User Data:", userData);

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

  const toggleDrawer = () => setDrawerOpen((v) => !v);
  const toggleSubmenu = (name) =>
    setOpenSubmenus((prev) => ({ ...prev, [name]: !prev[name] }));

  // if (pathname === "/login") return <></>;

  return (
    <ThemeProvider theme={navTheme}>
      <CssBaseline />

      <Box className="nav-root">
        <Box className="nav-container">
          <Box className="mr-6">
            <Image
              src="/images/logo.png"
              alt="Master Group Logo"
              width={40}
              height={30}
            />
          </Box>

          {!isMobile && (
            <Box className="nav-grid">
              <Box className="nav-links">
                {/* {navItems.map((item) =>
                  item.submenu ? (
                    <Box
                      key={item.name}
                      onClick={(e) => {
                        if (anchorEl?.textContent === item.name) {
                          setAnchorEl(null);
                        } else {
                          setAnchorEl(e.currentTarget);
                        }
                        setThirdMenuAnchor(null);
                        setOpenThirdMenu(null);
                      }}
                    >
                      <Box>
                        <Typography
                          sx={sx.link}
                          className={activeLink === item.name ? "active" : ""}
                          component="span"
                        >
                          {item.name}
                        </Typography>
                        <ExpandMore
                          fontSize="small"
                          sx={{
                            ...sx.caret,
                            ...(anchorEl?.textContent === item.name
                              ? sx.caretOpen
                              : {}),
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
                        transformOrigin={{
                          vertical: "top",
                          horizontal: "left",
                        }}
                      >
                        {item.submenu.map((sub) => {
                          const subKey = scope(sub.href, 3);
                          const isSubActive =
                            activeSubLink === subKey ||
                            activeParentSubLink === subKey;

                          return (
                            <Box key={sub.name}>
                              <MenuItem
                                selected={isSubActive}
                                onMouseEnter={(e) => {
                                  if (sub.children) {
                                    setThirdMenuAnchor(e.currentTarget);
                                    setOpenThirdMenu(sub.name);
                                  }
                                }}
                                onClick={(e) => {
                                  if (sub.children) {
                                    e.preventDefault();
                                    return;
                                  }
                                  setActiveSubLink(subKey);
                                  closeMenus();
                                  router.push(sub.href);
                                }}
                              >
                                <Link href={sub.href} className="nav-block">
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
                                >
                                  {sub.children.map((child) => {
                                    const childKey = scope(child.href, 4);
                                    const isChildActive =
                                      activeSubLink === childKey;

                                    return (
                                      <MenuItem
                                        key={child.name}
                                        selected={isChildActive}
                                        onClick={() => {
                                          setActiveSubLink(childKey);
                                          closeMenus();
                                          router.push(child.href);
                                        }}
                                      >
                                        <Typography
                                          variant="inherit"
                                          className="nav-block"
                                        >
                                          {child.name}
                                        </Typography>
                                      </MenuItem>
                                    );
                                  })}
                                </Menu>
                              )}
                            </Box>
                          );
                        })}
                      </Menu>
                    </Box>
                  ) : (
                    <Box key={item.name}>
                      <Link href={item.href}>
                        <Typography
                          sx={sx.link}
                          className={activeLink === item.name ? "active" : ""}
                          component="span"
                          onClick={() => setActiveLink(item.name)}
                        >
                          {item.name}
                        </Typography>
                      </Link>
                    </Box>
                  )
                )} */}
              </Box>

              <Box
                className="nav-account cursor-pointer "
                role="button"
                tabIndex={1}
                onClick={() => setModalOpen("logout")}
              >
                <Avatar>
                  {String(userData?.data?.userName).charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <div className="account-name">
                    {userData?.data?.companyName}
                  </div>
                  <div className="account-role">
                    {userData.data?.roleName || ""}
                  </div>
                </Box>
              </Box>
            </Box>
          )}

          {isMobile && (
            <IconButton onClick={toggleDrawer} aria-label="open navigation">
              <MenuIcon />
            </IconButton>
          )}
        </Box>
      </Box>

      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer}>
        <Box role="presentation">
          <List>
            {/* {navItems.map((item) =>
              item.submenu ? (
                <React.Fragment key={item.name}>
                  <ListItemButton
                    onClick={() =>
                      setOpenSubmenus((p) => ({
                        ...p,
                        [item.name]: !p[item.name],
                      }))
                    }
                    className={activeLink === item.name ? "is-active" : ""}
                  >
                    <ListItemText primary={item.name} />
                    {openSubmenus[item.name] ? <ExpandLess /> : <ExpandMore />}
                  </ListItemButton>

                  <Collapse
                    in={openSubmenus[item.name]}
                    timeout="auto"
                    unmountOnExit
                  >
                    <List component="div" disablePadding>
                      {item.submenu.map((sub) => {
                        const subKey = scope(sub.href, 3);
                        const isSubActive =
                          activeSubLink === subKey ||
                          activeParentSubLink === subKey;

                        return (
                          <React.Fragment key={sub.name}>
                            {sub.children ? (
                              <>
                                <ListItemButton
                                  onClick={() =>
                                    setOpenSubmenus((p) => ({
                                      ...p,
                                      [item.name + sub.name]:
                                        !p[item.name + sub.name],
                                    }))
                                  }
                                  className={isSubActive ? "is-active" : ""}
                                >
                                  <ListItemText primary={sub.name} />
                                  {openSubmenus[item.name + sub.name] ? (
                                    <ExpandLess />
                                  ) : (
                                    <ExpandMore />
                                  )}
                                </ListItemButton>

                                <Collapse
                                  in={openSubmenus[item.name + sub.name]}
                                  timeout="auto"
                                  unmountOnExit
                                >
                                  <List component="div" disablePadding>
                                    {sub.children.map((child) => {
                                      const childKey = scope(child.href, 4);
                                      const isChildActive =
                                        activeSubLink === childKey;

                                      return (
                                        <Link
                                          href={child.href}
                                          key={child.name}
                                        >
                                          <ListItemButton
                                            className={
                                              isChildActive ? "is-active" : ""
                                            }
                                            onClick={() => {
                                              setDrawerOpen(false);
                                              setActiveLink(item.name);
                                              setActiveSubLink(childKey);
                                            }}
                                          >
                                            <ListItemText
                                              primary={child.name}
                                            />
                                          </ListItemButton>
                                        </Link>
                                      );
                                    })}
                                  </List>
                                </Collapse>
                              </>
                            ) : (
                              <Link href={sub.href}>
                                <ListItemButton
                                  className={isSubActive ? "is-active" : ""}
                                  onClick={() => {
                                    setDrawerOpen(false);
                                    setActiveSubLink(subKey);
                                    setActiveLink(item.name);
                                  }}
                                >
                                  <ListItemText primary={sub.name} />
                                </ListItemButton>
                              </Link>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </List>
                  </Collapse>
                </React.Fragment>
              ) : (
                <Link href={item.href} key={item.name}>
                  <ListItemButton
                    onClick={() => {
                      setDrawerOpen(false);
                      setActiveLink(item.name);
                      setActiveSubLink("");
                    }}
                    className={activeLink === item.name ? "is-active" : ""}
                  >
                    <ListItemText primary={item.name} />
                  </ListItemButton>
                </Link>
              )
            )} */}
          </List>

          <Box className="nav-mobile-chip">
            <Avatar>
              {String(userData?.data?.userName).charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography className="account-name">
                {userData?.data?.companyName || ``}
              </Typography>
              <Typography className="account-role">
                {userData?.data?.roleName || ""}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Drawer>
    </ThemeProvider>
  );
}
