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
  handleChangeEventFunctions,
  formData,
  mode,
}) => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const skipNextFocus = useRef(null);
  const debouncedSearch = useDebounce(search, 500);

  const isView = mode === "view";

  const arrConds = Array.isArray(field?.selectedConditions) ? field.selectedConditions : [];
  const depKey1 = field?.selectedCondition || field?.selectedCondition1 || arrConds[0] || null;
  const depKey2 = field?.selectedCondition2 || arrConds[1] || null;

  const resolveId = (v) => (v && typeof v === "object" ? v.Id ?? v.id ?? null : v ?? null);
  const dep1Id = depKey1 ? resolveId(formData?.[depKey1]) : null;
  const dep2Id = depKey2 ? resolveId(formData?.[depKey2]) : null;

  const depsReady = isView ? true : (!depKey1 || !!dep1Id) && (!depKey2 || !!dep2Id);

  const handleScroll = (event) => {
    if (!depsReady || isView) return;
    const { scrollHeight, scrollTop, clientHeight } = event.target;
    const nearBottom = scrollHeight - (scrollTop + clientHeight) <= 1;
    if (nearBottom) {
      const nextPage = page + 1;
      setPage(nextPage);
      getData(field, commonProps.name, nextPage, search, field?.selectedCondition);
    }
  };

  const handleInputChange = (_event, value) => {
    setSearch(value ?? "");
    setPage(1);
  };

  const handleInputFocus = () => {
    if (!depsReady) return;
    if (skipNextFocus.current) {
      skipNextFocus.current = false;
      return;
    }
    if (!isView) {
      setPage(1);
      getData(field, commonProps.name, 1, "", field?.selectedCondition);
    }
  };

  useEffect(() => {
    if (!depsReady || isView) return;
    if (debouncedSearch !== "") {
      getData(field, commonProps.name, 1, debouncedSearch, field?.selectedCondition);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, depsReady, isView]);

  useEffect(() => {
    if (!depsReady) return;
    setPage(1);
    setSearch("");
    if (!isView && (depKey1 || depKey2)) {
      // edit mode: clear on parent change + fetch fresh
      changeHandler({ target: { name: commonProps.name, value: null } }, containerIndex);
      getData(field, commonProps.name, 1, "", field?.selectedCondition);
    }
    // view mode: keep current value; no fetch required here
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dep1Id, dep2Id, depsReady, isView]);

  const list = dropdowns?.[field?.name] || [];
  const map = new Map(list.map((i) => [String(i.Id), i]));

  if (fieldValue != null) {
    const fvId = resolveId(fieldValue);
    if (fvId != null && !map.has(String(fvId))) {
      map.set(String(fvId), {
        Id: fvId,
        Name:
          (fieldValue && (fieldValue.Name || fieldValue.name || fieldValue.description)) ||
          String(fvId),
      });
    }
  }

  const options =
    map.size > 0
      ? Array.from(map.values())
      : isView
        ? fieldValue && resolveId(fieldValue) != null
          ? [
            {
              Id: resolveId(fieldValue),
              Name:
                fieldValue.Name || fieldValue.name || fieldValue.description || String(resolveId(fieldValue)),
            },
          ]
          : [{ Id: 0, Name: "—" }]
        : [{ Id: 0, Name: "Loading..." }];

  return (
    <Box className={`flex items-end gap-2 ${field.style || ""}`}>
      {field.label && (
        <InputLabel>
          {commonProps.required && <span className="text-red-600 font-bold">┃</span>}
          {field.label}
        </InputLabel>
      )}

      <Autocomplete
        key={commonProps.key}
        className={commonProps.className}
        value={fieldValue || null}
        sx={commonProps.sx}
        disabled={commonProps.disabled}
        options={options}
        filterOptions={(x) => x}
        isOptionEqualToValue={(opt, val) =>
          opt && val ? String(opt.Id) === String(resolveId(val)) : opt === val
        }
        getOptionLabel={(option) => option?.Name || ""}
        renderOption={(props, option) => (
          <Box component="li" {...props} key={`${option.Id}-${option.Name}`}>
            {option.Name}
          </Box>
        )}
        renderInput={(params) => (
          <TextField {...params} label={null} variant="standard" required={commonProps.required} />
        )}
        onInputChange={(event, newInputValue, reason) => {
          if (!depsReady || isView) return;
          if (reason === "clear") {
            skipNextFocus.current = true;
            setSearch("");
            setPage(1);
            getData(field, commonProps.name, 1, "", field?.selectedCondition);
            return;
          }
          if (reason === "input") handleInputChange(event, newInputValue);
        }}
        onFocus={handleInputFocus}
        onChange={(event, value) => {
          if (value?.Id === 0) return;
          changeHandler({ target: { name: commonProps.name, value } }, containerIndex);
          if (field.changeFun && handleChangeEventFunctions) {
            handleChangeEventFunctions[field.changeFun](
              commonProps.name,
              value,
              containerIndex
            );
          }
        }}
        onKeyDown={(event) => {
          if (event.key === "Tab") {
            keyTabHandler({ target: { name: commonProps.name, value: event.target.value } }, containerIndex);
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
