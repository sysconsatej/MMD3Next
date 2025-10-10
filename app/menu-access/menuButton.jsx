"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Checkbox,
  Collapse,
  FormControlLabel,
  FormGroup,
  List,
  ListItemButton,
  Typography,
} from "@mui/material";
import ExpandLessOutlinedIcon from "@mui/icons-material/ExpandLessOutlined";
import ExpandMoreOutlinedIcon from "@mui/icons-material/ExpandMoreOutlined";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { menuAccessArr, renderToggleIcon } from "./menuUtils";

export const MenuButton = ({
  items,
  onCheckChange,
  onCheckAccessChange,
  expandAll,
}) => {
  return (
    <List component="nav">
      {items.map((item) => (
        <RecursiveMenu
          key={item.id}
          item={item}
          onCheckChange={onCheckChange}
          onCheckAccessChange={onCheckAccessChange}
          expandAll={expandAll}
        />
      ))}
    </List>
  );
};

const RecursiveMenu = ({
  item,
  onCheckChange,
  onCheckAccessChange,
  expandAll,
}) => {
  const [open, setOpen] = useState(false);
  const hasChildren = item.children && item.children.length > 0;

  const handleCheckboxChange = (e) => {
    onCheckChange(item.id, e.target.checked);
  };

  const handleCheckboxAccessChange = (e, type) => {
    onCheckAccessChange(item.id, type, e.target.checked);
  };

  useEffect(() => {
    setOpen(expandAll);
  }, [expandAll]);

  return (
    
    <Box>
      <ListItemButton>
        <Box className="w-full">
          <Box className="flex items-center justify-between ">
            <Box className="flex items-center ">
              {hasChildren &&
                renderToggleIcon(open, AddIcon, RemoveIcon, setOpen)}
              <Box className={!hasChildren ? "pl-5" : ""}>
                <Checkbox
                  checked={item.checked  ||  false}
                  onChange={handleCheckboxChange}
                />
              </Box>
              <Typography>{item.menuName}</Typography>
              <Box>
                <FormGroup row={true}>
                  {menuAccessArr.map((menu) => {
                    return (
                      <FormControlLabel
                        key={menu}
                        control={<Checkbox checked={item["is" + menu]  ||  false} />}
                        label={menu}
                        onChange={(e) =>
                          handleCheckboxAccessChange(e, "is" + menu)
                        }
                      />
                    );
                  })}
                </FormGroup>
              </Box>
            </Box>
            {hasChildren &&
              renderToggleIcon(
                open,
                ExpandMoreOutlinedIcon,
                ExpandLessOutlinedIcon,
                setOpen
              )}
          </Box>
        </Box>
      </ListItemButton>
      {hasChildren && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding sx={{ pl: 6 }}>
            {item.children.map((child) => (
              <RecursiveMenu
                key={child.id}
                item={child}
                onCheckChange={onCheckChange}
                onCheckAccessChange={onCheckAccessChange}
                expandAll={expandAll}
              />
            ))}
          </List>
        </Collapse>
      )}
    </Box>
  );
};
