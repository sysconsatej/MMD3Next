import React, { forwardRef, useEffect, useRef, useState } from "react";
import { Autocomplete, Box, TextField } from "@mui/material";
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
  handleChangeEventFunctions,
}) => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const skipNextFocus = useRef(null);
  const debouncedSearch = useDebounce(search, 500);

  const handleScroll = (event) => {
    const { scrollHeight, scrollTop, clientHeight } = event.target;
    const bottom = scrollHeight - scrollTop === clientHeight;

    if (bottom) {
      const nextPage = page + 1;
      setPage(nextPage);
      getData(
        field?.labelType,
        commonProps.name,
        nextPage,
        search,
        field?.selectedCondition
      );
    }
  };

  const handleInputChange = (event, value) => {
    setSearch(value);
    setPage(1);
  };

  const handleInputFocus = (event) => {
    if (skipNextFocus.current) {
      skipNextFocus.current = false;
      return;
    }
    setPage(1);
    getData(
      field?.labelType,
      commonProps.name,
      1,
      "",
      field?.selectedCondition
    );
  };

  useEffect(() => {
    if (debouncedSearch !== "") {
      getData(
        field?.labelType,
        commonProps.name,
        1,
        debouncedSearch,
        field?.selectedCondition
      );
    }
  }, [debouncedSearch]);

  return (
    <Autocomplete
      key={commonProps.key}
      className={commonProps.className}
      value={fieldValue ? fieldValue : null}
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
      renderInput={(params) => <TextField {...params} label={field.label} />}
      onInputChange={(event, newInputValue, reason) => {
        if (reason === "clear") {
          skipNextFocus.current = true;
          return;
        }
        if (reason === "input") {
          handleInputChange(event, newInputValue);
        }
      }}
      onFocus={(event) => handleInputFocus(event)}
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
      ListboxComponent={ListboxComponent}
      disableListWrap
      ListboxProps={{ onScroll: handleScroll }}
    />
  );
};

export default DropdownInput;
