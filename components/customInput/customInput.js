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
  FileInput,
} from "./index";

const CustomInput = ({
  fields,
  formData,
  setFormData,
  gridName = null,
  containerIndex = null,
  handleBlurEventFunctions = null,
  handleChangeEventFunctions = null,
  popUp = true,
  fieldsMode,
  errors = {},
  handleBlur = () => {},
  setErrors, // add this to allow updating errors
}) => {
  const [dropdowns, setDropdowns] = useState([]);
  const [dropdownTotalPage, setDropdownTotalPage] = useState([]);
  const [isChange, setIsChange] = useState(false);

  // Live change handler for validation
  const handleChange = (field, value, containerIndex = null) => {
    if (gridName === null) {
      setFormData((prev) => ({ ...prev, [field.name]: value }));
    } else {
      setFormData((prev) => {
        const updatedContainers = [...prev[gridName]];
        updatedContainers[containerIndex] = {
          ...updatedContainers[containerIndex],
          [field.name]: value,
        };
        return { ...prev, [gridName]: updatedContainers };
      });
    }

    // Live validation
    if (field.required) {
      if (!value) {
        setErrors((prev) => ({
          ...prev,
          [field.name]: `${field.label} is required.`,
        }));
      } else {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field.name];
          return newErrors;
        });
      }
    }
  };

  const keyTabHandler = (e, containerIndex) => {
    const { name, value } = e.target;
    const isInclude = dropdowns[name].filter((items) => items.Name === value);
    if (isInclude) {
      if (gridName === null) {
        setFormData((prevData) => ({ ...prevData, [name]: isInclude[0] }));
      } else {
        setFormData((prevData) => {
          const updatedContainers = [...prevData[gridName]];
          updatedContainers[containerIndex] = {
            ...updatedContainers[containerIndex],
            [name]: isInclude[0],
          };
          return { ...prevData, [gridName]: updatedContainers };
        });
      }
    }
  };

  const getData = async (
    type,
    name,
    pageNum = 1,
    search = "",
    selectedCondition = null
  ) => {
    const objData = {
      masterName: type,
      pageNo: pageNum,
      search,
      selectedCondition: formData[selectedCondition]?.Id || null,
    };

    const shouldFetch =
      !dropdownTotalPage.hasOwnProperty(name) ||
      dropdownTotalPage[name] == 0 ||
      dropdownTotalPage[name] >= pageNum;

    if (!shouldFetch) return;

    try {
      const { data = [], totalPage = 1 } = await fetchDropDownValues(objData);

      setDropdowns((prev) => ({
        ...prev,
        [name]: pageNum == 1 ? data : [...(prev[name] || []), ...data],
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
      gridName === null
        ? formData[field.name] || ""
        : formData?.[gridName]?.[containerIndex]?.[field.name] || "";

    let isDisabled =
      fieldsMode === "view" ||
      (fieldsMode === "edit" && !field.isEdit) ||
      field.disabled;

    const commonProps = {
      key: index,
      label: field.label,
      name: field.name,
      className: `text-black-500 font-normal text-xs w-[min(300px,100%)] ${field.style} `,
      value: fieldValue,
      onChange: (e) => handleChange(field, e.target.value, containerIndex), // ✅ updated
      onBlur: (e) => handleBlur(field, e.target.value),
      sx: {
        ...textFieldStyles(),
        gridColumn: field.gridColumn,
      },
      InputLabelProps: inputLabelProps,
      disabled: isDisabled,
      error: Boolean(errors?.[field.name]),
      //helperText: errors?.[field.name] || "",
    };

    const inputProps = {
      commonProps,
      fieldValue,
      field,
      containerIndex,
      handleBlurEventFunctions,
      changeHandler: handleChange,
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
            handleChangeEventFunctions={handleChangeEventFunctions}
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
      case "fileupload":
        return (
          <FileInput
            key={field.name}
            commonProps={commonProps}
            fieldValue={formData[field.name]}
            field={field}
            handleBlurEventFunctions={handleBlurEventFunctions}
            setFormData={setFormData}
            formData={formData}
          />
        );
      default:
        return (
          <TextInput
            commonProps={commonProps}
            fieldValue={fieldValue}
            field={field}
            handleBlur={handleBlur}
            handleChange={handleChange} // ✅ live validation
            errors={errors}
          />
        );
    }
  });
};

export default CustomInput;
