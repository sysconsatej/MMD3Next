"use client";

import React, { useState } from "react";
import { inputLabelProps, textFieldStyles } from "@/styles";
import { fetchDropDownValues } from "@/apis";
import {
  TextAreaInput,
  CheckBoxInput,
  NumberInput,
  DropdownInput,
  DateInput,
  TextInput,
  RadioInput,
  MultiSelectInput,
  DateTimeInput,
} from "./index";

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
  const [dropdownTotalPage, setDropdownTotalPage] = useState([]);
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

  const getData = async (type, name, pageNum = 1, search = "") => {
    const objData = {
      masterName: type,
      pageNo: pageNum,
      search: search,
    };

    const shouldFetch =
      !dropdowns.hasOwnProperty(name) ||
      !dropdownTotalPage.hasOwnProperty(name) ||
      dropdownTotalPage[name] >= pageNum;

    if (!shouldFetch) return;

    try {
      const { data = [], totalPage = 1 } = await fetchDropDownValues(objData);

      setDropdowns((prev) => ({
        ...prev,
        [name]: [...(prev[name] || []), ...data],
      }));

      setDropdownTotalPage((prev) => ({
        ...prev,
        [name]: totalPage,
      }));
    } catch (error) {
      console.log(`Failed to fetch dropdown value of this name ${name}`, error);
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
      className: `text-black-500 font-normal text-xs w-[min(300px,100%)] ${field.style} `,
      onChange: (e) => changeHandler(e, containerIndex),
      sx: {
        ...textFieldStyles(),
        gridColumn: field.gridColumn,
      },
      InputLabelProps: inputLabelProps,
      disabled: isDisabled,
    };

    const inputProps = {
      commonProps,
      fieldValue,
      field,
      containerIndex,
      handleBlurEventFunctions,
      changeHandler,
    };

    switch (field.type) {
      case "textarea":
        return <TextAreaInput {...inputProps} />;

      case "checkbox":
        return <CheckBoxInput {...inputProps} />;

      case "radio":
        return <RadioInput {...inputProps} />;

      case "number":
        return <NumberInput {...inputProps} />;

      case "dropdown":
        return (
          <DropdownInput
            {...inputProps}
            dropdowns={dropdowns}
            getData={getData}
            keyTabHandler={keyTabHandler}
          />
        );

      case "multiselect":
        return (
          <MultiSelectInput
            {...inputProps}
            dropdowns={dropdowns}
            getData={getData}
          />
        );

      case "date":
        return <DateInput {...inputProps} />;

      case "datetime":
        return <DateTimeInput {...inputProps} />;

      default:
        return <TextInput {...inputProps} />;
    }
  });
};

export default CustomInput;
