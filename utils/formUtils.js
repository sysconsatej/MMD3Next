import { useEffect, useState } from "react";

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

export function formatFormData(tableName, data, recordId) {
  const insertObj = {
    createdBy: 4,
    clientId: 1,
    createdDate: new Date(),
  };
  const updateObj = {
    updatedBy: 4,
    clientId: 1,
    updatedDate: new Date(),
  };

  for (let key in data) {
    if (typeof data[key] === "object" && data[key] !== null) {
      data[key] = data[key].Id;
    }
  }

  if (recordId) {
    return { tableName, recordId, data: [{ ...data, ...updateObj }] };
  }

  return { tableName, data: [{ ...data, ...insertObj }] };
}

export function formatFetchForm(data, parentTableName, recordId) {
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
        dropdownFields.push(obj);
      }
    }
  }

  return { dropdownFields, parentTableName, recordId };
}

export function formatDataWithForm(data, format) {
  const result = {};
  for (let key in format) {
    for (let key1 in format[key]) {
      result[format[key][key1].name] = data[format[key][key1].name];
    }
  }

  return result;
}
