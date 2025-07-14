"use client";
import React from "react";
import {
  Box,
  Typography,
  Button,
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
import CoustomButton from "@/components/button/button";

const navItems = [
  "Home",
  "About",
  "Offerings",
  "CSR",
  "Career",
  "News and Events",
  "Contact",
];

const offeringsSubmenu = [
  "Survey",
  "Logistics",
  "Digital Solutions",
  "Yard & CFS",
  "Hydro Power",
];

function Navbar() {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [submenuOpen, setSubmenuOpen] = React.useState(false);
  const isMobile = useMediaQuery("(max-width:900px)");
  const [activeLink, setActiveLink] = React.useState("Home");

  const handleOpen = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const toggleDrawer = () => setDrawerOpen(!drawerOpen);
  const toggleSubmenu = () => setSubmenuOpen(!submenuOpen);

  return (
    <>
      <Box className="bg-[#edf1f4] px-4 py-3 shadow-md">
        <Box className="flex items-center max-w-[1440px] mx-auto justify-between">
          {/* Logo */}
          <Box className="flex justify-between">
            <Image
              src="/images/logo.png"
              alt="Master Group Logo"
              width={40}
              height={30}
              className="object-contain"
            />
          </Box>

          {/* Desktop Navigation */}
          {!isMobile && (
            <Box className="col-span-2 grid grid-cols-[1fr_auto] gap-8 items-center">
              <Box className="flex gap-8">
                {navItems.map((item) => {
                  const isActive = activeLink === item;
                  const baseClass = "font-semibold cursor-pointer relative";
                  const afterUnderline =
                    "after:content-[''] after:absolute after:w-full after:h-[2px] after:bottom-[-4px] after:left-0";
                  const activeClass = `text-[#03bafc] ${afterUnderline} after:bg-[#03bafc]`;
                  const hoverClass = `text-black hover:${afterUnderline} hover:after:bg-[#03bafc]`;

                  return item === "Offerings" ? (
                    <Box
                      key={item}
                      className="relative"
                      onMouseEnter={handleOpen}
                      onMouseLeave={handleClose}
                    >
                      <Box
                        className="flex items-center gap-1 cursor-pointer"
                        onClick={() => setActiveLink(item)}
                      >
                        <Typography
                          className={`${baseClass} ${isActive ? activeClass : hoverClass
                            }`}
                        >
                          {item}
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
                            key={sub}
                            onClick={handleClose}
                            sx={{
                              "&:hover": {
                                backgroundColor: "#03bafc",
                                color: "white",
                              },
                            }}
                          >
                            {sub}
                          </MenuItem>
                        ))}
                      </Menu>
                    </Box>
                  ) : (
                    <Box key={item} className="relative">
                      <Typography
                        onClick={() => setActiveLink(item)}
                        className={`${baseClass} ${isActive ? activeClass : hoverClass
                          }`}
                      >
                        {item}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
              <CoustomButton text="Enquire Now" />
            </Box>
          )}

          {/* Mobile Hamburger Icon */}
          {isMobile && (
            <IconButton className="justify-self-end" onClick={toggleDrawer}>
              <MenuIcon sx={{ color: "#000" }} />
            </IconButton>
          )}
        </Box>
      </Box>

      {/* Mobile Drawer */}
      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer}>
        <Box className="w-[250px] p-2" role="presentation">
          <List>
            {navItems.map((item) =>
              item === "Offerings" ? (
                <React.Fragment key={item}>
                  <ListItem button onClick={toggleSubmenu}>
                    <ListItemText primary={item} />
                    {submenuOpen ? <ExpandLess /> : <ExpandMore />}
                  </ListItem>
                  <Collapse in={submenuOpen} timeout="auto" unmountOnExit>
                    <List component="Box" disablePadding>
                      {offeringsSubmenu.map((sub) => (
                        <ListItem
                          key={sub}
                          className="pl-8 hover:bg-[#03bafc] hover:text-white rounded-md transition-all"
                          onClick={() => {
                            setDrawerOpen(false);
                            setActiveLink(sub);
                          }}
                        >
                          <ListItemText primary={sub} />
                        </ListItem>
                      ))}
                    </List>
                  </Collapse>
                </React.Fragment>
              ) : (
                <ListItem
                  key={item}
                  button
                  onClick={() => {
                    setDrawerOpen(false);
                    setActiveLink(item);
                  }}
                >
                  <ListItemText
                    primary={item}
                    className={
                      activeLink === item ? "text-[#03bafc] font-semibold" : ""
                    }
                  />
                </ListItem>
              )
            )}
          </List>
          <Box className="mt-4">
            <Button
              fullWidth
              className="!bg-[#FFD700] text-black font-bold rounded-md py-2 hover:bg-[#ffc400]"
            >
              ENQUIRE NOW
            </Button>
          </Box>
        </Box>
      </Drawer>
    </>
  );
}

export default Navbar;
