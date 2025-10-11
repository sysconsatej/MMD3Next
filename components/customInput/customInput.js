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

  const getData = async (
    typeOrField,
    name,
    pageNum = 1,
    search = "",
    selectedCondition = null
  ) => {
    const isView = fieldsMode === "view";

    const resolveId = (v) =>
      v && typeof v === "object" ? (v.Id ?? v.id ?? v.value ?? null) : (v ?? null);

    let objData;

    if (typeOrField && typeof typeOrField === "object") {
      const fc = typeOrField;

      const sc = isView ? null : (fc.selectedCondition ? resolveId(formData?.[fc.selectedCondition]) : (selectedCondition ? resolveId(formData?.[selectedCondition]) : null));
      const sc1 = isView ? null : (fc.selectedCondition1 ? resolveId(formData?.[fc.selectedCondition1]) : null);
      const sc2 = isView ? null : (fc.selectedCondition2 ? resolveId(formData?.[fc.selectedCondition2]) : null);

      let filtersJson = null;
      if (!isView && Array.isArray(fc.selectedConditions) && fc.selectedConditions.length) {
        const filters = fc.selectedConditions
          .map((key) => {
            const v = resolveId(formData?.[key]);
            return v != null ? { col: key, op: "=", val: v } : null;
          })
          .filter(Boolean);
        if (filters.length) filtersJson = JSON.stringify(filters);
      }

      objData = {
        ...(fc.tableName || fc.displayColumn
          ? {
            tableName: fc.tableName,
            displayColumn: fc.displayColumn || "name",
            pageNo: pageNum,
            pageSize: fc.pageSize ?? 50,
            search,
            idColumn: fc.idColumn ?? "id",
            joins: fc.joins || "",
            where: fc.where || "",
            searchColumn: fc.searchColumn ?? null,
            orderBy: fc.orderBy ?? null,
            selectedCondition: sc,
            selectedCondition1: sc1,
            selectedCondition2: sc2,
            ...(filtersJson ? { filtersJson } : {}),
          }
          : {
            masterName: fc.foreignTable || fc.labelType || "",
            pageNo: pageNum,
            pageSize: fc.pageSize ?? 50,
            search,
            selectedCondition: isView ? null : sc,
            joins: fc.joins || "",
            where: fc.where || "",
            searchColumn: fc.searchColumn ?? null,
            orderBy: fc.orderBy ?? null,
            idColumn: fc.idColumn ?? "id",
          }),
      };
    } else {
      objData = {
        masterName: typeOrField,
        pageNo: pageNum,
        search,
        selectedCondition: isView ? null : resolveId(formData[selectedCondition]),
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

    const canEdit = field.isEdit !== false;
    const isDisabled =
      fieldsMode === "view" ||
      (fieldsMode === "edit" && !canEdit) ||
      field.disabled === true;

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
      handleBlurEventFunctions,
      changeHandler,
    };

    switch (field.type) {
      case "textarea":
        return <TextAreaInput {...inputProps} key={index} />;

      case "checkbox":
        return <CheckBoxInput {...inputProps} key={index} />;

      case "radio":
        return <RadioInput {...inputProps} key={index} />;

      case "number":
        return <NumberInput {...inputProps} key={index} />;

      case "dropdown":
        return (
          <DropdownInput
            {...inputProps}
            dropdowns={dropdowns}
            getData={getData}
            keyTabHandler={keyTabHandler}
            handleChangeEventFunctions={handleChangeEventFunctions}
            formData={formData}
            key={index}
          />
        );

      case "multiselect":
        return (
          <MultiSelectInput
            {...inputProps}
            dropdowns={dropdowns}
            getData={getData}
            key={index}
          />
        );

      case "date":
        return <DateInput {...inputProps} key={index} />;

      case "datetime":
        return <DateTimeInput {...inputProps} key={index} />;

      case "fileupload":
        return <FileInput {...inputProps} key={index} />;

      default:
        return <TextInput {...inputProps}  key={index}/>;
    }
  });
};

export default CustomInput;
