import { getNextPrevData } from "@/apis";
import { useCallback, useEffect, useState } from "react";
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
  stateData,
  formId,
  parentColumnName = null
) {
  const formData = new FormData();
  const data = {};

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

  for (let key in stateData) {
    if (Array.isArray(stateData[key])) {
      data[key] = stateData[key].map((item) => {
        const arrItems = {};
        for (let arrKey in item) {
          if (item[arrKey] instanceof File) {
            formData.append("attachments", item[arrKey]);
            arrItems[arrKey] = item[arrKey].name;
          } else if (
            typeof item[arrKey] === "object" &&
            arrItems[arrKey] !== null
          ) {
            arrItems[arrKey] = item[arrKey].Id;
          } else {
            arrItems[arrKey] = item[arrKey];
          }
        }

        if (item.id) {
          return { ...arrItems, ...updateObj };
        }

        return { ...arrItems, ...insertObj };
      });
    } else if (stateData[key] instanceof File) {
      formData.append("attachments", stateData[key]);
      data[key] = stateData[key].name;
    } else if (typeof stateData[key] === "object" && stateData[key] !== null) {
      data[key] = stateData[key].Id;
    } else {
      data[key] = stateData[key];
    }
  }

  if (formId) {
    formData.append("tableName", tableName);
    formData.append("formId", formId);
    formData.append("submitJson", JSON.stringify({ ...data, ...updateObj }));
    formData.append("parentColumnName", parentColumnName);
    return formData;
  }

  formData.append("tableName", tableName);
  formData.append("submitJson", JSON.stringify({ ...data, ...insertObj }));
  formData.append("parentColumnName", parentColumnName);
  return formData;
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

export function useNextPrevData({
  currentId,
  tableName = "tblUser",
  labelField = "status",
  orderBy = "id",
  groupBy = "",
}) {
  const [neighbors, setNeighbors] = useState({});

  const refresh = useCallback(async () => {
    if (currentId == null) return;

    try {
      const getDataObj = {
        formId: currentId,
        columnNames: labelField,
        tableName: tableName,
        orderBy: orderBy,
        groupBy: groupBy,
      };

      const { data } = await getNextPrevData(getDataObj);

      setNeighbors(data);
    } catch (err) {
      console.error("useRecordNavigator error:", err);
      setNeighbors({});
    }
  }, [currentId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    prevId: neighbors?.prevId,
    nextId: neighbors?.nextId,
    prevLabel: neighbors?.prevName,
    nextLabel: neighbors?.nextName,
    canPrev: neighbors?.prevId,
    canNext: neighbors?.nextId,
  };
}

export function formatExcelDataWithForm(data, format) {
  return Object.values(data).reduce((result, row) => {
    const obj = format.reduce((acc, { name, label }) => {
      if (
        row[label] !== null &&
        row[label] !== undefined &&
        row[label] !== ""
      ) {
        acc[name] = row[label];
      }

      return acc;
    }, {});

    if (Object.keys(obj).length > 0) {
      result.push(obj);
    }

    return result;
  }, []);
}

export function formFormatThirdLevel(data) {
  let result = [];
  let commonData = {};

  for (const [key, value] of Object.entries(data)) {
    if (Array.isArray(value)) {
      for (const subSection of value) {
        const tempData = {};
        for (const [fieldKey, fieldValue] of Object.entries(subSection)) {
          if (Array.isArray(fieldValue)) {
            const nestArray = fieldValue.map((item) => {
              const formatter = {};
              for (const [innerKey, innerValue] of Object.entries(item)) {
                formatter[innerKey] = innerValue?.Id ?? innerValue;
              }

              return formatter;
            });
            tempData[fieldKey] = nestArray;
          } else {
            tempData[fieldKey] = fieldValue?.Id ?? fieldValue;
          }
        }

        result.push({
          ...tempData,
          ...commonData,
        });
      }
    } else {
      commonData[key] = value?.Id ?? value;
    }
  }

  return result;
}

export function formatDataWithFormThirdLevel(data, common, tabTable) {
  let commonKeysArray = common.map((item) => item.name);
  let commonKeys = {};

  const updatedData = data.map((item) => {
    const resData = {
      ...item,
    };
    commonKeysArray.forEach((key) => {
      commonKeys[key] = resData[key];
      delete resData[key];
    });

    return resData;
  });

  return {
    ...commonKeys,
    [tabTable]: updatedData,
  };
}
