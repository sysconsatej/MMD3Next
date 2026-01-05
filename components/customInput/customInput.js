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
import { getInputValue, setInputValue } from "@/utils";

const CustomInput = ({
  fields,
  formData,
  setFormData,
  gridName = null,
  containerIndex = null,
  tabName = null,
  tabIndex = null,
  handleBlurEventFunctions = null,
  handleChangeEventFunctions = null,
  popUp = true,
  fieldsMode,
  errorState = {},
  hightLightForm = {},
}) => {
  const [dropdowns, setDropdowns] = useState({});
  const [dropdownTotalPage, setDropdownTotalPage] = useState({});
  const [isChange, setIsChange] = useState(false);

  const changeHandler = (e, containerIndex) => {
    const { name, value } = e.target;
    setFormData((prevData) =>
      setInputValue({
        prevData,
        tabName,
        gridName,
        tabIndex,
        containerIndex,
        name,
        value,
      })
    );
    if (!isChange && popUp) {
      localStorage.setItem("isChange", true);
      setIsChange(true);
    }
  };

  const keyTabHandler = (e, containerIndex) => {
    const { name, value } = e.target;
    const match = (dropdowns?.[name] || []).find((i) => i.Name === value);
    if (match) {
      setFormData((prevData) =>
        setInputValue({
          prevData,
          tabName,
          gridName,
          tabIndex,
          containerIndex,
          name,
          value: match,
        })
      );
    }
  };

  const getData = async (typeOrField, name, pageNum = 1, search = "") => {
    let objData;

    if (typeOrField && typeof typeOrField === "object") {
      const fc = typeOrField;

      let filtersJson = null;
      if (
        Array.isArray(fc.selectedConditions) &&
        fc.selectedConditions.length
      ) {
        const filters = fc.selectedConditions
          .map((key) => {
            const [key1, val] = Object.entries(key)[0];
            const obj = {
              gridName,
              tabName,
              containerIndex,
              tabIndex,
              formData,
              name: key1,
            };
            const fieldValue = getInputValue(obj).Id;
            return fieldValue != null
              ? { col: val, op: "=", val: fieldValue }
              : null;
          })
          .filter(Boolean);
        if (filters.length <= 0) {
          setDropdowns((prev) => ({
            ...prev,
            [name]: [],
          }));
          setFormData((prevData) =>
            setInputValue({
              prevData,
              tabName,
              gridName,
              tabIndex,
              containerIndex,
              name,
              value: null,
            })
          );
          return;
        }
        filtersJson = JSON.stringify(filters);
      }

      objData = {
        tableName: fc.tableName,
        displayColumn: fc.displayColumn || "name",
        pageNo: pageNum,
        pageSize: fc.pageSize ?? 1000,
        search,
        idColumn: fc.idColumn ?? "id",
        joins: fc.joins || "",
        where: fc.where || "",
        searchColumn: fc.searchColumn ?? null,
        orderBy: fc.orderBy ?? null,
        filtersJson: filtersJson,
      };
    }

    const shouldFetch =
      !Object.prototype.hasOwnProperty.call(dropdownTotalPage, name) ||
      dropdownTotalPage[name] === 0 ||
      dropdownTotalPage[name] >= pageNum;

    if (!shouldFetch) return;

    try {
      const { data = [], totalPage = 1 } = await fetchDropDownValues(objData);

      setDropdowns((prev) => ({
        ...prev,
        [name]: pageNum === 1 ? data : [...(prev[name] || []), ...data],
      }));

      setDropdownTotalPage((prev) => ({
        ...prev,
        [name]: totalPage,
      }));
    } catch (error) {
      console.log(`Failed to fetch dropdown value of ${name}`, error);
    }
  };

  return fields?.map((field, index) => {
    const obj = {
      gridName,
      tabName,
      containerIndex,
      tabIndex,
      formData,
      name: field.name,
    };
    const fieldValue = getInputValue(obj);

    const highLightObj = {
      gridName,
      tabName,
      containerIndex,
      tabIndex,
      formData: hightLightForm,
      name: field.name,
    };
    const fieldHighLight = getInputValue(highLightObj);

    const isDisabled =
      fieldsMode === "view" ||
      (fieldsMode === "edit" && !field.isEdit) ||
      field.disabled;

    const commonProps = {
      key: index,
      label: field.label,
      name: field.name,
      className: `text-black-500 font-normal text-xs w-[min(300px,100%)]`,
      onChange: (e) => changeHandler(e, containerIndex),
      sx: {
        ...textFieldStyles(),
        gridColumn: field.gridColumn,
      },
      InputLabelProps: inputLabelProps,
      disabled: isDisabled,
      required: field.required,
      error: errorState[field.name],
    };

    const inputProps = {
      commonProps,
      fieldValue,
      field,
      containerIndex,
      tabIndex,
      handleBlurEventFunctions,
      changeHandler,
      fieldHighLight: fieldHighLight,
    };

    switch (field.type) {
      case "textarea":
        return <TextAreaInput {...inputProps} />;

      case "checkbox":
        return (
          <CheckBoxInput
            {...inputProps}
            handleChangeEventFunctions={handleChangeEventFunctions}
          />
        );

      case "radio":
        return (
          <RadioInput
            {...inputProps}
            handleChangeEventFunctions={handleChangeEventFunctions}
          />
        );

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
        return <FileInput {...inputProps} />;

      default:
        return <TextInput {...inputProps} />;
    }
  });
};

export default CustomInput;
