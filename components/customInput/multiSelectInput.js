import React from "react";
import { Autocomplete, Box, TextField } from "@mui/material";

const MultiSelectInput = ({
  commonProps,
  fieldValue,
  dropdowns,
  field,
  getData,
  changeHandler,
  containerIndex,
}) => {
  return (
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
      renderInput={(params) => <TextField {...params} label={field.label} />}
      onFocus={() => getData(field?.labelType, commonProps.name)}
      onChange={(event, value) => {
        changeHandler(
          { target: { name: commonProps.name, value } },
          containerIndex
        );
      }}
    />
  );
};

export default MultiSelectInput;
