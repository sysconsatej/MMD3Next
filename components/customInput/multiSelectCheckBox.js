import React, { useMemo, useCallback } from "react";
import {
  Box,
  Checkbox,
  Input,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
} from "@mui/material";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const MultiSelectCheckBox = ({
  commonProps,
  fieldValue = [],
  dropdowns,
  field,
  getData,
  changeHandler,
  containerIndex,
  fieldHighLight,
}) => {
  const options = dropdowns?.[field?.name] || [];

  const isAllSelected = useMemo(
    () => options.length > 0 && fieldValue.length === options.length,
    [options, fieldValue],
  );

  const selectedIds = useMemo(() => {
    return new Set((fieldValue || [])?.map((item) => item.Id));
  }, [fieldValue]);

  const handleInputFocus = useCallback(() => {
    getData(field, commonProps.name, 1, "");
  }, [field, commonProps.name, getData]);

  const handleChange = (event) => {
    const { value } = event.target;

    if (value[value.length - 1] === "all") {
      const newValue = isAllSelected ? [] : options;

      changeHandler(
        {
          target: {
            name: commonProps.name,
            value: newValue,
          },
        },
        containerIndex,
      );
      return;
    }

    changeHandler(
      {
        target: {
          name: commonProps.name,
          value,
        },
      },
      containerIndex,
    );
  };

  const renderSelectedValues = (selected) =>
    selected.map((item) => item.Name).join(", ");

  return (
    <Box className="flex items-end gap-2">
      <InputLabel className={fieldHighLight ? "bg-[#FDACAC]" : ""}>
        {commonProps.required && (
          <span className="text-red-600 font-bold">┃</span>
        )}
        {field.label}
      </InputLabel>

      <Select
        multiple
        value={fieldValue || []}
        className={`${commonProps.className} multiSelect`}
        sx={commonProps.sx}
        disabled={commonProps.disabled}
        onChange={handleChange}
        input={<Input />}
        renderValue={renderSelectedValues}
        MenuProps={MenuProps}
        onFocus={handleInputFocus}
      >
        <MenuItem value="all">
          <Checkbox
            checked={isAllSelected}
            indeterminate={
              fieldValue.length > 0 && fieldValue.length < options.length
            }
            size="small"
            sx={{ mr: 1 }}
          />
          <ListItemText primary="Select All" />
        </MenuItem>

        {options.map((item) => {
          const selected = selectedIds.has(item.Id);
          const Icon = selected ? CheckBoxIcon : CheckBoxOutlineBlankIcon;

          return (
            <MenuItem key={item.Id} value={item}>
              <Icon fontSize="small" style={{ marginRight: 8 }} />
              <ListItemText primary={item.Name} />
            </MenuItem>
          );
        })}
      </Select>
    </Box>
  );
};

export default MultiSelectCheckBox;
