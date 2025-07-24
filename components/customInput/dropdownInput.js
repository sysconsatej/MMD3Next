import React from "react";
import { Autocomplete, Box, TextField } from "@mui/material";

const DropdownInput = ({
  commonProps,
  fieldValue,
  dropdowns,
  field,
  getData,
  changeHandler,
  keyTabHandler,
  containerIndex,
  handleChangeEventFunctions,
}) => {
  return (
    <Autocomplete
      key={commonProps.key}
      className={commonProps.className}
      value={fieldValue ? fieldValue : null}
      sx={commonProps.sx}
      disabled={commonProps.disabled}
      options={
        dropdowns[field?.name]
          ? dropdowns[field?.name]
          : [{ Name: "Loading..." }]
      }
      getOptionLabel={(option) => option?.Name || ""}
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
        field.changeFun
          ? handleChangeEventFunctions[field.changeFun](
              commonProps.name,
              value,
              containerIndex
            )
          : null;
      }}
      onKeyDown={(event) => {
        if (event.key === "Tab") {
          keyTabHandler(
            {
              target: {
                name: commonProps.name,
                value: event.target.value,
              },
            },
            containerIndex
          );
        }
      }}
    />
  );
};

export default DropdownInput;
