"use client";
import React, { useEffect } from "react";
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
import Image from "next/image";
import Link from "next/link";
import CustomButton from "@/components/button/button";
import { usePathname } from "next/navigation";

const navItems = [
  { name: "Home", href: "/" },
  { name: "Master", href: "/master" },
  { name: "BL", href: "/bl/list" },
  { name: "HBL", href: "/hbl/list" },
];

const offeringsSubmenu = [
  { name: "Commodity", href: "/master/commodity" },
  { name: "Company", href: "/master/company" },
  { name: "Country", href: "/master/country" },
  { name: "Vessel", href: "/master/vessel" },
  { name: "Voyage Route", href: "/master/voyageRoute" },
];

function Navbar() {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [submenuOpen, setSubmenuOpen] = React.useState(false);
  const [activeLink, setActiveLink] = React.useState("Home");
  const [activeSubLink, setActiveSubLink] = React.useState("");
  const isMobile = useMediaQuery("(max-width:900px)");
  const pathname = usePathname();

  useEffect(() => {
    const foundSub = offeringsSubmenu.find((sub) =>
      pathname.startsWith(sub.href)
    );
    if (foundSub) {
      setActiveLink("Master");
      setActiveSubLink(foundSub.name);
    } else {
      const foundMain = navItems.find((item) => item.href === pathname);
      if (foundMain) setActiveLink(foundMain.name);
    }
  }, [pathname]);

  const handleOpen = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const toggleDrawer = () => setDrawerOpen(!drawerOpen);
  const toggleSubmenu = () => setSubmenuOpen(!submenuOpen);

  const baseClass =
    "font-semibold cursor-pointer relative transition-transform duration-200";
  const afterUnderline =
    "after:content-[''] after:absolute after:w-full after:h-[2px] after:bottom-[-4px] after:left-0";
  const activeClass = `text-[#03bafc] ${afterUnderline} after:bg-[#03bafc]`;
  const hoverClass = `text-black hover:${afterUnderline} hover:after:bg-[#03bafc] hover:scale-105`;

  return (
    <>
      <Box className="bg-[#edf1f4] px-4 py-1 shadow-md">
        <Box className="flex items-center  mx-auto justify-between">
          <Image
            src="/images/logo.png"
            alt="Master Group Logo"
            width={40}
            height={30}
            className="object-contain"
          />

          {!isMobile && (
            <Box className="col-span-2 grid grid-cols-[1fr_auto] gap-8 items-center">
              <Box className="flex gap-8">
                {navItems.map((item) =>
                  item.name === "Master" ? (
                    <Box
                      key={item.name}
                      className="relative"
                      onMouseEnter={handleOpen}
                      onMouseLeave={handleClose}
                    >
                      <Box
                        className="flex items-center gap-1 cursor-pointer"
                        onClick={(e) => {
                          setActiveLink(item.name);
                          setAnchorEl(anchorEl ? null : e.currentTarget);
                        }}
                      >
                        <Typography
                          className={` !text-sm ${baseClass} ${
                            activeLink === item.name ? activeClass : hoverClass
                          }`}
                        >
                          {item.name}
                        </Typography>
                        <ExpandMore
                          fontSize="small"
                          sx={{
                            color: "#000",
                            transform: Boolean(anchorEl)
                              ? "rotate(180deg)"
                              : "rotate(0deg)",
                            transition: "transform 0.3s ease",
                          }}
                        />
                      </Box>

                      <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleClose}
                        MenuListProps={{ onMouseLeave: handleClose }}
                        anchorOrigin={{
                          vertical: "bottom",
                          horizontal: "left",
                        }}
                        sx={{
                          mt: 1,
                          "& .MuiPaper-root": {
                            backgroundColor: "#0b2545",
                            color: "white",
                            px: 2,
                          },
                        }}
                      >
                        {offeringsSubmenu.map((sub) => (
                          <MenuItem
                            key={sub.name}
                            onClick={handleClose}
                            sx={{
                              backgroundColor:
                                activeSubLink === sub.name
                                  ? "#03bafc"
                                  : "transparent",
                              color:
                                activeSubLink === sub.name
                                  ? "white"
                                  : "inherit",
                              fontWeight:
                                activeSubLink === sub.name ? "bold" : "normal",
                              "&:hover": {
                                borderBottom: "2px solid #03bafc",
                                color: "white",
                              },
                            }}
                          >
                            <Link
                              href={sub.href}
                              onClick={() => setActiveSubLink(sub.name)}
                              className="w-full block text-sm"
                            >
                              {sub.name}
                            </Link>
                          </MenuItem>
                        ))}
                      </Menu>
                    </Box>
                  ) : (
                    <Box key={item.name} className="relative">
                      <Link href={item.href}>
                        <Typography
                          onClick={() => setActiveLink(item.name)}
                          className={` !text-sm ${baseClass} ${
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
              item.name === "Offerings" ? (
                <React.Fragment key={item.name}>
                  <ListItem button onClick={toggleSubmenu}>
                    <ListItemText primary={item.name} />
                    {submenuOpen ? <ExpandLess /> : <ExpandMore />}
                  </ListItem>
                  <Collapse in={submenuOpen} timeout="auto" unmountOnExit>
                    <List component="Box" disablePadding>
                      {offeringsSubmenu.map((sub) => (
                        <Link href={sub.href} key={sub.name}>
                          <ListItem
                            className={`pl-8 rounded-none transition-all border-b-2 ${
                              activeSubLink === sub.name
                                ? "border-[#03bafc] text-[#03bafc] font-semibold"
                                : "border-transparent hover:border-[#03bafc]"
                            }`}
                            onClick={() => {
                              setDrawerOpen(false);
                              setActiveSubLink(sub.name);
                              setActiveLink("Offerings");
                            }}
                          >
                            <ListItemText
                              primary={sub.name}
                              className="text-sm"
                            />
                          </ListItem>
                        </Link>
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
                    }}
                  >
                    <ListItemText
                      primary={item.name}
                      className={
                        activeLink === item.name
                          ? "text-[#03bafc] font-semibold text-sm"
                          : "text-sm"
                      }
                    />
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
