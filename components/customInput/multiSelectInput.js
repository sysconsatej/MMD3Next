import React, { forwardRef, useEffect, useState } from "react";
import { Autocomplete, Box, InputLabel, TextField } from "@mui/material";
import { useDebounce } from "@/utils";

const ListboxComponent = forwardRef(function ListboxComponent(props, ref) {
  const { onScroll, ...other } = props;
  return <ul ref={ref} {...other} onScroll={onScroll} />;
});

const MultiSelectInput = ({
  commonProps,
  fieldValue,
  dropdowns,
  field,
  getData,
  changeHandler,
  containerIndex,
  fieldHighLight,
}) => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
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

  const handleInputFocus = () => {
    setPage(1);
    getData(field, commonProps.name, 1, "");
  };

  useEffect(() => {
    if (debouncedSearch !== "") {
      getData(field, commonProps.name, 1, debouncedSearch);
    }
  }, [debouncedSearch]);

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
        inputValue={search}
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
        onInputChange={(event, newInputValue, reason) => {
          if (reason === "input") {
            setSearch(newInputValue);
            setPage(1);
          }
        }}
        onFocus={handleInputFocus}
        onChange={(event, value) => {
          setSearch("");
          setPage(1);
          changeHandler(
            { target: { name: commonProps.name, value } },
            containerIndex,
          );
        }}
        ListboxComponent={ListboxComponent}
        disableListWrap
        ListboxProps={{ onScroll: handleScroll }}
      />
    </Box>
  );
};

export default MultiSelectInput;
