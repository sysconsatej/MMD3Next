import { getDataWithCondition } from "@/apis";
import {
  getUserByCookies,
  setInputValue,
  validatePanCard,
  validPinCode,
} from "@/utils";
import { useEffect } from "react";
import { toast } from "react-toastify";
export const storeApiResult = [];

function hasDuplicateId(arr) {
  const seenIds = new Set();

  for (const obj of arr) {
    const uniqueKey = `${obj.id}-${obj.name}`;
    if (seenIds.has(uniqueKey)) {
      return true;
    }
    seenIds.add(uniqueKey);
  }

  return false;
}

const userData = getUserByCookies();
export function useTotalGrossAndPack(formData, setTotals) {
  useEffect(() => {
    let grossWt = 0;
    let packages = 0;

    if (formData?.tblBlContainer && Array.isArray(formData.tblBlContainer)) {
      grossWt += formData.tblBlContainer.reduce(
        (sum, c) => sum + (Number(c.grossWt) || 0),
        0
      );
      packages += formData.tblBlContainer.reduce(
        (sum, c) => sum + (Number(c.noOfPackages) || 0),
        0
      );
    }

    if (formData?.item && Array.isArray(formData.item)) {
      packages += formData.item.reduce(
        (sum, i) => sum + (Number(i.itemNoOfPackages) || 0),
        0
      );
    }

    setTotals({ grossWt, packages });
  }, [formData.tblBlContainer, formData.item]);
}

export function advanceSearchFilter(advanceSearch) {
  if (Object.keys(advanceSearch).length <= 0) return null;
  const condition = [];

  if (advanceSearch.blNo) {
    condition.push(
      `(b.mblNo = '${advanceSearch.blNo}') or (b.hblNo = '${advanceSearch.blNo}')`
    );
  }

  if (advanceSearch.mblDate) {
    condition.push(`b.mblDate = '${advanceSearch.mblDate}'`);
  }

  return condition.length > 0 ? condition.join(" and ") : null;
}

export const checkNoPackages = ({ formData, hblType }) => {
  if (hblType === "HBL") {
    if (!Array.isArray(formData?.tblBl)) return "";

    const errors = [];

    formData.tblBl.forEach((row, idx) => {
      const parentPackages = Number(row?.noOfPackages || 0);

      const childTotal = Array.isArray(row?.tblBlPackingList)
        ? row.tblBlPackingList.reduce(
            (sum, cur) => sum + Number(cur?.noOfPackages || 0),
            0
          )
        : 0;

      if (parentPackages !== childTotal) {
        errors.push(
          `${row?.hblNo} Total No of Packages (${childTotal}) in Item Details does not match  No of Packages (${parentPackages})`
        );
      }
    });

    return errors.length > 0 ? errors : "";
  }

  const totalPackages = Array.isArray(formData?.tblBlPackingList)
    ? formData.tblBlPackingList.reduce(
        (sum, cur) => sum + Number(cur?.noOfPackages || 0),
        0
      )
    : 0;

  return totalPackages === Number(formData?.noOfPackages)
    ? ""
    : `Total No of Packages does not match with  No of Packages (${formData?.noOfPackages})`;
};

export const getPortBasedOnCountry = async ({ portId, inputName }) => {
  const obj = {
    columns: `
    p.id AS Id,
    p.name AS PortName,
    CASE 
      WHEN c.name = 'India' THEN 'IN'
      ELSE 'F'
    END AS countryCategory
  `,
    tableName: `
    tblPort p 
    LEFT JOIN tblCountry c ON c.id = p.countryId
  `,
    whereCondition: `p.id = ${portId}`,
  };
  const result = await getDataWithCondition(obj);
  const newEntry = {
    ...result?.data[0],
    inputName: inputName,
  };
  const existingIndex = storeApiResult.findIndex(
    (item) => item.inputName === inputName
  );
  if (existingIndex > -1) {
    storeApiResult[existingIndex] = newEntry;
  } else {
    storeApiResult.push(newEntry);
  }

  return result?.data[0];
};
export const getMasterByCode = async (code, masterListName) => {
  if (!code) return null;

  const obj = {
    columns: `id AS Id, code AS Name`,
    tableName: `tblMasterData`,
    whereCondition: `
      code = '${code}'
      AND masterListName = '${masterListName}'
      AND status = 1
    `,
  };

  const res = await getDataWithCondition(obj);
  return res?.data?.[0] || null; // ✅ {Id, Name}
};

export const craeateHandleChangeEventFunction = ({ setFormData, formData }) => {
  return {
    setCountryAndState: async (name, value) => {
      const setName = name.replace("City", "");

      const obj = {
        columns: `(select id from tblState s where s.id = ci.stateId and s.status = 1) stateId,
                  (select name from tblState s where s.id = ci.stateId and s.status = 1) stateName,
                  (select id from tblCountry c where c.id = ci.countryId and c.status = 1) countyId,
                  (select concat(code, ' - ', name) from tblCountry c where c.id = ci.countryId and c.status = 1) countryName`,
        tableName: "tblCity ci",
        whereCondition: `ci.id = ${value.Id} and ci.status = 1`,
      };
      const { data } = await getDataWithCondition(obj);
      setFormData((prev) => {
        if (setName === "shipper") {
          return {
            ...prev,
            [`${setName}Country`]: {
              Id: data[0].countyId,
              Name: data[0].countryName,
            },
          };
        } else {
          return {
            ...prev,
            [`${setName}State`]: {
              Id: data[0].stateId,
              Name: data[0].stateName,
            },
            [`${setName}Country`]: {
              Id: data[0].countyId,
              Name: data[0].countryName,
            },
          };
        }
      });
    },
    setISOBySize: async (name, value, { containerIndex, tabIndex }) => {
      const typeId = formData?.tblBlContainer[containerIndex]?.typeId?.Id;
      const obj = {
        columns: `s.id Id, s.isocode Name`,
        tableName: "tblIsocode s",
        joins:
          "join tblMasterData d on d.id = s.sizeId join tblMasterData d1 on d1.id = s.typeId",
        whereCondition: `d.id = ${value.Id} and d1.id = ${typeId}`,
      };
      const { data, success } = await getDataWithCondition(obj);
      if (success) {
        setFormData((prevData) =>
          setInputValue({
            prevData,
            tabName: null,
            gridName: "tblBlContainer",
            tabIndex: null,
            containerIndex,
            name: "isoCode",
            value: data[0],
          })
        );
      } else {
        setFormData((prevData) =>
          setInputValue({
            prevData,
            tabName: null,
            gridName: "tblBlContainer",
            tabIndex: null,
            containerIndex,
            name: "isoCode",
            value: null,
          })
        );
      }
    },
    setISOByType: async (name, value, { containerIndex, tabIndex }) => {
      const sizeId = formData?.tblBlContainer[containerIndex]?.sizeId?.Id;
      const obj = {
        columns: `s.id Id, s.isocode Name`,
        tableName: "tblIsocode s",
        joins:
          "join tblMasterData d on d.id = s.sizeId join tblMasterData d1 on d1.id = s.typeId",
        whereCondition: `d.id = ${sizeId} and d1.id = ${value.Id}`,
      };
      const { data, success } = await getDataWithCondition(obj);
      if (success) {
        setFormData((prevData) =>
          setInputValue({
            prevData,
            tabName: null,
            gridName: "tblBlContainer",
            tabIndex: null,
            containerIndex,
            name: "isoCode",
            value: data[0],
          })
        );
      } else {
        setFormData((prevData) =>
          setInputValue({
            prevData,
            tabName: null,
            gridName: "tblBlContainer",
            tabIndex: null,
            containerIndex,
            name: "isoCode",
            value: null,
          })
        );
      }
    },
    handleChangeOnPOL: async (name, value) => {
      if (name === "polId") {
        setFormData((prev) => {
          return {
            ...prev,
            plrId: value ? { Id: value?.Id, Name: value?.Name } : {},
          };
        });
      }

      await getPortBasedOnCountry({
        portId: value?.Id,
        inputName: name,
      });

      const mappedObj = storeApiResult.reduce((acc, item) => {
        acc[item.inputName] = item.countryCategory; // "F" / "IN" / "IN(ICD)"
        return acc;
      }, {});

      const polId = mappedObj.polId;
      const podId = mappedObj.podId;
      const fpdId = mappedObj.fpdId;

      const payload = {
        columns: `m.id Id  , name  Name , m.code code , m.masterListName `,
        tableName: `tblMasterData  m`,
        whereCondition:
          "(m.masterListName  =  'tblServiceType'  OR m.masterListName  =  'tblMovementType') AND m.status  = 1",
      };

      const res = await getDataWithCondition(payload);
      const data = res && res?.data;
      console.log(data);
      if (!data) {
        return;
      }
      const tblMovementType =
        data &&
        Array.isArray(data) &&
        data.filter((info) => info?.masterListName === "tblMovementType");
      const cargoType =
        data &&
        Array.isArray(data) &&
        data.filter((info) => info.masterListName === "tblServiceType");

      if (!tblMovementType || !cargoType) {
        return;
      }

      //  for type of cargo
      if (polId === "IN" && podId === "IN") {
        const updatedData = cargoType?.filter((info) => info?.code === "CG");

        setFormData((prev) => {
          return {
            ...prev,
            cargoTypeId: { Id: updatedData[0]?.Id, Name: updatedData[0]?.code },
          };
        });
      }

      if (polId === "F" && podId === "F") {
        const updatedData = cargoType?.filter((info) => info?.code === "TR");
        setFormData((prev) => {
          return {
            ...prev,
            cargoTypeId: { Id: updatedData[0]?.Id, Name: updatedData[0]?.code },
          };
        });
      }

      if (polId === "F" && podId === "IN") {
        const updatedData = cargoType?.filter((info) => info?.code === "IM");
        setFormData((prev) => {
          return {
            ...prev,
            cargoTypeId: { Id: updatedData[0]?.Id, Name: updatedData[0]?.code },
          };
        });
      }

      // for cargo movement

      if (podId === "F") {
        const updateMovementData = tblMovementType.filter(
          (info) => info?.code === "TC"
        );
        setFormData((prev) => {
          return {
            ...prev,
            movementTypeId: {
              Id: updateMovementData[0]?.Id,
              Name: updateMovementData[0]?.code,
            },
          };
        });
      }

      if (podId === "IN" && fpdId === "IN") {
        const flteredData = storeApiResult.filter(
          (i) => i?.inputName === "polId" || i?.inputName === "podId"
        );
        const sameData = hasDuplicateId(flteredData);
        if (sameData) {
          const updateMovementData = tblMovementType.filter(
            (info) => info?.code === "LC"
          );
          setFormData((prev) => {
            return {
              ...prev,
              movementTypeId: {
                Id: updateMovementData[0]?.Id,
                Name: updateMovementData[0]?.code,
              },
            };
          });
        } else {
          const updateMovementData = tblMovementType.filter(
            (info) => info?.code === "TI"
          );
          setFormData((prev) => {
            return {
              ...prev,
              movementTypeId: {
                Id: updateMovementData[0]?.Id,
                Name: updateMovementData[0]?.code,
              },
            };
          });
        }
      }
    },
    setCarrierBondAndCode: async (name, value, { tabIndex }) => {
      if (!value?.Id) return;

      const obj = {
        columns: `
      t.bondNo,
      t.panNo
    `,
        tableName: "tblCarrierPort t",
        whereCondition: `t.id = ${value.Id}`,
      };

      const { data } = await getDataWithCondition(obj);

      setFormData((prev) => {
        return {
          ...prev,
          carrierBondNo: data?.[0]?.bondNo ?? null,
          carrierPanNo: data?.[0]?.panNo ?? null,
        };
      });
    },

    handleChangeOnVessel: async (name, value) => {
      const vesselId = value?.Id || null;

      setFormData((prevData) =>
        setInputValue({
          prevData,
          tabName: null,
          gridName: null,
          tabIndex: null,
          containerIndex: null,
          name: "podVoyageId",
          value: null,
        })
      );

      if (!vesselId) return;

      try {
        const obj = {
          columns: "t.id as Id, t.voyageNo as Name",
          tableName: "tblVoyage t",
          whereCondition: `t.vesselId = ${vesselId} and t.status = 1`,
          orderBy: "t.voyageNo",
        };

        const { data, success } = await getDataWithCondition(obj);

        if (success && Array.isArray(data) && data.length === 1) {
          setFormData((prevData) =>
            setInputValue({
              prevData,
              tabName: null,
              gridName: null,
              tabIndex: null,
              containerIndex: null,
              name: "podVoyageId",
              value: data[0],
            })
          );
        }
      } catch (e) {
        console.error("handleChangeOnVessel error:", e);
      }
    },
  };
};

export const createdHandleBlurEventFunctions = ({ setFormData, formData }) => {
  return {
    containerNumberHandler: (event, { containerIndex, tabIndex }) => {
      const { name, value } = event?.target || {};
      const pattern = /^[A-Za-z]{4}[0-9]{7}$/;
      if (!pattern.test(value)) {
        toast.error(
          "Invalid Container Number format. It should be 4 letters followed by 7 digits."
        );

        setFormData((prevData) =>
          setInputValue({
            prevData,
            tabName: null,
            gridName: "tblBlContainer",
            tabIndex,
            containerIndex,
            name,
            value: null,
          })
        );

        return "";
      }

      return "";
    },
    panCardValid: (event, { containerIndex, tabIndex }) => {
      const { value, name } = event.target;
      const result = validatePanCard(value);

      if (result?.error) {
        // setFormData((prevData) =>
        //   setInputValue({
        //     prevData,
        //     tabName: "tblBl",
        //     gridName: "tblBlContainer",
        //     tabIndex,
        //     containerIndex,
        //     name,
        //     value: null,
        //   })
        // );
        return toast.error(result.error);
      }
    },
    checkPinCode: (event) => {
      const { name, value } = event.target;
      console.log(name, value);
      const result = validPinCode(value);
      if (result.error) {
        // setFormData((prevData) =>
        //   setInputValue({
        //     prevData,
        //     tabName: "tblBl",
        //     name,
        //     value: null,
        //   })
        // );
        return toast.error(result.error);
      }
    },

    validUnoImoCode: (event) => {
      const { value, name } = event.target;
      const v = String(value).trim();

      if (!v) return true;

      if (name === "unNo") {
        if (v.length !== 5) {
          toast.error("UNO Code must be exactly 5 characters.");
          return false;
        }
      }

      if (name === "imoCode") {
        if (v.length !== 3) {
          toast.error("IMO Code must be exactly 3 characters.");
          return false;
        }
      }
      return true;
    },
  };
};

export function statusColor(status) {
  const color = {
    Reject: "#DC0E0E",
    Request: "#4E61D3",
    Confirm: "green",
    RejectforAmendment: "#BF124D",
    RequestforAmendment: "#393D7E",
    ApprovedforAmendment: "#007E6E",
  };
  return color[status];
}
