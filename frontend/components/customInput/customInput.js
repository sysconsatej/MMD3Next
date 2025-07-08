"use client";

import React, { useState } from "react";
import { Autocomplete, Box, TextField } from "@mui/material";
import { inputLabelProps, textFieldStyles } from "@/styles";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { fetchDropDownValues } from "@/apis";

const CustomInput = ({
  fields,
  formData,
  setFormData,
  containerIndex = null,
  handleBlurEventFunctions = null,
  handleChangeEventFunctions = null,
  popUp = true,
  fieldsMode,
}) => {
  const [dropdowns, setDropdowns] = useState([]);
  const [isChange, setIsChange] = useState(false);

  const changeHandler = (e, containerIndex) => {
    const { name, value } = e.target;
    if (containerIndex === null) {
      setFormData((prevData) => ({ ...prevData, [name]: value }));
    } else {
      setFormData((prevData) => {
        const updatedContainers = [...prevData.containerDetails];
        updatedContainers[containerIndex] = {
          ...updatedContainers[containerIndex],
          [name]: value,
        };
        return {
          ...prevData,
          containerDetails: updatedContainers,
        };
      });
    }
    if (!isChange && popUp) {
      localStorage.setItem("isChange", true);
      setIsChange(true);
    }
  };

  const keyTabHandler = (e, containerIndex) => {
    const { name, value } = e.target;
    const isInclude = dropdowns[name].filter((items) => items.Name === value);
    if (isInclude) {
      if (containerIndex === null) {
        setFormData((prevData) => ({ ...prevData, [name]: isInclude[0] }));
      } else {
        setFormData((prevData) => {
          const updatedContainers = [...prevData.containerDetails];
          updatedContainers[containerIndex] = {
            ...updatedContainers[containerIndex],
            [name]: isInclude[0],
          };
          return {
            ...prevData,
            containerDetails: updatedContainers,
          };
        });
      }
    }
  };

  const getData = async (type, name) => {
    const data = {
      masterName: type,
    };

    if (!dropdowns.hasOwnProperty(name)) {
      try {
        const res = await fetchDropDownValues(data);
        const isData = Array.isArray(res) ? res : [];
        setDropdowns((prev) => ({ ...prev, [name]: isData }));
      } catch (error) {
        console.log(
          `Failed to fetch dropdown value of this name ${name}`,
          error
        );
      }
    }
  };

  return fields?.map((field, index) => {
    const fieldValue =
      containerIndex === null
        ? formData[field.name] || ""
        : formData?.containerDetails[containerIndex]?.[field.name] || "";

    let isDisabled =
      fieldsMode === "view" ||
      (fieldsMode === "edit" && !field.isEdit) ||
      field.disabled;

    const commonProps = {
      key: index,
      label: field.label,
      name: field.name,
      className: `text-black-500 font-normal text-xs  ${field.style} `,
      onChange: (e) => changeHandler(e, containerIndex),
      sx: {
        ...textFieldStyles(),
        gridColumn: field.gridColumn,
      },
      InputLabelProps: inputLabelProps,
      disabled: isDisabled,
    };

    switch (field.type) {
      case "textarea":
        return (
          <Box
            className={`relative ${field.gridColumn} `}
            key={commonProps.key}
          >
            <textarea
              {...commonProps}
              value={fieldValue ? fieldValue : ""}
              className={`peer py-2 px-3 border border-solid border-[#0000003b] rounded-[4px] placeholder-[#000000a6] w-full hover:border-black focus:outline-[#1976d2] ${commonProps.className}`}
              rows={field.rows}
              key={commonProps.key}
            />
            <p
              className={`absolute top-0 transition-all duration-150 ease-in-out text-[#00000099] font-medium text-xs my-1 mx-3 peer-focus:text-[#1976d2] peer-focus:top-[-12px] peer-focus:px-1 peer-focus:bg-white peer-focus:text-[9px] ${
                fieldValue ? " px-1 top-[-12px] bg-white text-[9px]" : ""
              } `}
            >
              {commonProps.label}
            </p>
          </Box>
        );

      case "number":
        return (
          <TextField
            {...commonProps}
            value={fieldValue ? fieldValue : ""}
            type="number"
            variant="outlined"
            key={commonProps.key}
          />
        );

      case "dropdown":
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
            renderInput={(params) => (
              <TextField {...params} label={field.label} />
            )}
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

      case "date":
        return (
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              {...commonProps}
              className="datepicker"
              value={fieldValue ? dayjs(fieldValue, "DD/MM/YYYY") : null}
              onChange={(date) => {
                const formattedDate = date
                  ? dayjs(date).format("DD/MM/YYYY")
                  : null;
                changeHandler(
                  { target: { name: commonProps.name, value: formattedDate } },
                  containerIndex
                );
              }}
              slotProps={{
                textField: {
                  placeholder: "DD/MM/YYYY",
                  inputProps: { readOnly: false },
                },
              }}
              format="DD/MM/YYYY"
              key={commonProps.key}
            />
          </LocalizationProvider>
        );

      default:
        return (
          <TextField
            {...commonProps}
            value={fieldValue ? fieldValue : ""}
            variant="outlined"
            key={commonProps.key}
            onBlur={(event) =>
              field.blurFun
                ? handleBlurEventFunctions[field.blurFun](event)
                : null
            }
          />
        );
    }
  });
};

export default CustomInput;
