import React from "react";
import { Autocomplete, Box, InputLabel, TextField } from "@mui/material";

const MultiSelectInput = ({
  commonProps,
  fieldValue,
  dropdowns,
  field,
  getData,
  changeHandler,
  containerIndex,
  fieldHighLight
}) => {
  return (
    <Box className="flex items-end gap-2">
      <InputLabel className={`${fieldHighLight && "bg-[#FDACAC]"}`}>
        {commonProps.required && (
          <span className="text-red-600 font-bold ">┃</span>
        )}
        {field.label}
      </InputLabel>
      <Autocomplete
        key={commonProps.key}
        multiple
        limitTags={1}
        className={`${commonProps.className} multiSelect`}
        value={fieldValue ? fieldValue : []}
        sx={commonProps.sx}
        disabled={commonProps.disabled}
        options={
          dropdowns[field?.name]
            ? dropdowns[field?.name]
            : [{ Name: "Loading..." }]
        }
        getOptionLabel={(option) => option?.Name || ""}
        filterSelectedOptions
        renderOption={(props, option) => (
          <Box component="li" {...props} key={option.Id}>
            {option.Name}
          </Box>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            label={null}
            variant="standard"
            required={commonProps.required && fieldValue.length === 0}
          />
        )}
        onFocus={() => getData(field, commonProps.name)}
        onChange={(event, value) => {
          changeHandler(
            { target: { name: commonProps.name, value } },
            containerIndex
          );
        }}
      />
    </Box>
  );
};

export default MultiSelectInput;
