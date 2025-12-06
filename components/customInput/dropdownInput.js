import React, { forwardRef, useEffect, useRef, useState } from "react";
import { Autocomplete, Box, InputLabel, TextField } from "@mui/material";
import { useDebounce } from "@/utils";

const ListboxComponent = forwardRef(function ListboxComponent(props, ref) {
  const { onScroll, ...other } = props;
  return <ul ref={ref} {...other} onScroll={onScroll} />;
});

const DropdownInput = ({
  commonProps,
  fieldValue,
  dropdowns,
  field,
  getData,
  changeHandler,
  keyTabHandler,
  containerIndex,
  tabIndex,
  handleChangeEventFunctions,
  fieldHighLight,
}) => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const skipNextFocus = useRef(null);
  const debouncedSearch = useDebounce(search, 500);

  const handleScroll = (event) => {
    const { scrollHeight, scrollTop, clientHeight } = event.target;
    const nearBottom = scrollHeight - (scrollTop + clientHeight) <= 1;
    if (nearBottom) {
      const nextPage = page + 1;
      setPage(nextPage);
      getData(field, commonProps.name, nextPage, search);
    }
  };

  const handleInputChange = (_event, value) => {
    setSearch(value ?? "");
    setPage(1);
  };

  const handleInputFocus = () => {
    if (skipNextFocus.current) {
      skipNextFocus.current = false;
      return;
    }
    setPage(1);
    getData(field, commonProps.name, 1, "");
  };

  useEffect(() => {
    if (debouncedSearch !== "") {
      getData(field, commonProps.name, 1, debouncedSearch);
    }
  }, [debouncedSearch]);

  return (
    <Box className={`flex items-end gap-2 ${field.style}`}>
      {field.label && (
        <InputLabel className={`${fieldHighLight && 'bg-[#FDACAC]'}`}>
          {commonProps.required && (
            <span className="text-red-600 font-bold">┃</span>
          )}
          {field.label}
        </InputLabel>
      )}

      <Autocomplete
        key={commonProps.key}
        className={commonProps.className}
        value={fieldValue || null}
        sx={commonProps.sx}
        disabled={commonProps.disabled}
        options={
          dropdowns[field?.name]
            ? Array.from(
                new Map(
                  dropdowns[field?.name].map((item) => [item.Id, item])
                ).values()
              )
            : [{ Name: "Loading..." }]
        }
        getOptionLabel={(option) => option?.Name || ""}
        renderOption={(props, option) => (
          <Box component="li" {...props} key={`${option.Id}-${option.Name}`}>
            {option.Name}
          </Box>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            label={null}
            variant="standard"
            required={commonProps.required}
          />
        )}
        onInputChange={(event, newInputValue, reason) => {
          if (reason === "clear") {
            skipNextFocus.current = true;
            return;
          }
          if (reason === "input") handleInputChange(event, newInputValue);
        }}
        onFocus={handleInputFocus}
        onChange={(event, value) => {
          changeHandler(
            { target: { name: commonProps.name, value } },
            containerIndex
          );
          if (field.changeFun && handleChangeEventFunctions) {
            handleChangeEventFunctions[field.changeFun](
              commonProps.name,
              value,
              { containerIndex, tabIndex }
            );
          }
        }}
        onKeyDown={(event) => {
          if (event.key === "Tab") {
            keyTabHandler(
              { target: { name: commonProps.name, value: event.target.value } },
              containerIndex
            );
          }
        }}
        ListboxComponent={ListboxComponent}
        disableListWrap
        ListboxProps={{ onScroll: handleScroll }}
      />
    </Box>
  );
};

export default DropdownInput;
