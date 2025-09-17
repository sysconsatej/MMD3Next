import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export function useDebounce(search = "", delay) {
  const [debounceValue, setDebounceValue] = useState(search);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebounceValue(search);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [search, delay]);

  return debounceValue;
}

export function formatFormData(
  tableName,
  data,
  formId,
  parentColumnName = null
) {
  const insertObj = {
    createdBy: 4,
    clientId: 1,
    status: 1,
    createdDate: new Date(),
  };
  const updateObj = {
    updatedBy: 4,
    clientId: 1,
    updatedDate: new Date(),
  };

  for (let key in data) {
    if (Array.isArray(data[key])) {
      data[key] = data[key].map((item) => {
        for (let arrKey in item) {
          if (typeof item[arrKey] === "object" && item[arrKey] !== null) {
            item[arrKey] = item[arrKey].Id;
          }
        }

        if (item.id) {
          return { ...item, ...updateObj };
        }

        return { ...item, ...insertObj };
      });
    } else if (typeof data[key] === "object" && data[key] !== null) {
      data[key] = data[key].Id;
    }
  }

  if (formId) {
    return {
      tableName,
      formId,
      submitJson: { ...data, ...updateObj },
      parentColumnName,
    };
  }

  return { tableName, submitJson: { ...data, ...insertObj }, parentColumnName };
}

export function formatFetchForm(
  data,
  parentTableName,
  recordId,
  childTableNames = null,
  parentTableColumnName = null
) {
  const dropdownFields = [];

  for (let key in data) {
    for (let key1 in data[key]) {
      if (data[key][key1].foreignTable) {
        const splitData = data[key][key1].foreignTable.split(",");
        const obj = {
          referenceColumn: splitData[0],
          referenceTable: splitData[1],
          fieldname: data[key][key1].name,
        };
        const exists = dropdownFields.some(
          (item) => item.fieldname === data[key][key1].name
        );
        if (!exists) dropdownFields.push(obj);
      }
    }
  }

  return {
    dropdownFields,
    parentTableName,
    recordId,
    childTableNames,
    parentTableColumnName,
  };
}

export function formatDataWithForm(data, format) {
  const result = {};
  for (let key in format) {
    if (Array.isArray(data[key])) {
      result[key] = data[key].map((item) => {
        let arrResult = {};
        const arrObj = {
          id: item.id,
          createdBy: item.createdBy,
          createdDate: item.createdDate,
          status: item.status,
        };
        for (let arrKey in format[key]) {
          arrResult[format[key][arrKey].name] = item[format[key][arrKey].name];
        }

        return { ...arrResult, ...arrObj };
      });
    } else {
      for (let key1 in format[key]) {
        result[format[key][key1].name] = data[format[key][key1].name];
      }
    }
  }

  return result;
}

export const copyHandler = (
  formData,
  setFormData,
  direction,
  mapping,
  toastMessage
) => {
  const updatedFormData = { ...formData };

  const fieldMapping =
    direction === "left"
      ? mapping
      : Object.fromEntries(Object.entries(mapping).map(([k, v]) => [v, k]));

  Object.entries(fieldMapping).forEach(([sourceKey, targetKey]) => {
    if (formData[sourceKey]) {
      updatedFormData[targetKey] = formData[sourceKey];
    }
  });

  setFormData(updatedFormData);
  toast.success(toastMessage);
};
