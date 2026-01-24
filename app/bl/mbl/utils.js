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
  const seen = new Set();

  for (const obj of arr) {
    if (!obj?.Id) continue;
    if (seen.has(obj.Id)) return true;
    seen.add(obj.Id);
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
        0,
      );
      packages += formData.tblBlContainer.reduce(
        (sum, c) => sum + (Number(c.noOfPackages) || 0),
        0,
      );
    }

    if (formData?.item && Array.isArray(formData.item)) {
      packages += formData.item.reduce(
        (sum, i) => sum + (Number(i.itemNoOfPackages) || 0),
        0,
      );
    }

    setTotals({ grossWt, packages });
  }, [formData.tblBlContainer, formData.item]);
}

export function advanceSearchFilter(advanceSearch) {
  if (Object.keys(advanceSearch).length <= 0) return null;
  const condition = [];

  if (advanceSearch?.blNo) {
    condition.push(
      `(b.mblNo = '${advanceSearch.blNo}') or (b.hblNo = '${advanceSearch.blNo}')`,
    );
  }

  if (advanceSearch?.mblDate) {
    condition.push(`b.mblDate = '${advanceSearch.mblDate}'`);
  }

  if (advanceSearch?.podVesselId) {
    condition.push(`v1.name = '${advanceSearch.podVesselId}'`);
  }

  if (advanceSearch?.podVoyageId) {
    condition.push(`v.voyageNo = '${advanceSearch?.podVoyageId}'`);
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
            0,
          )
        : 0;

      if (parentPackages !== childTotal) {
        errors.push(
          `${row?.hblNo} Total No of Packages (${childTotal}) in Item Details does not match  No of Packages (${parentPackages})`,
        );
      }
    });

    return errors.length > 0 ? errors : "";
  }

  const totalPackages = Array.isArray(formData?.tblBlPackingList)
    ? formData.tblBlPackingList.reduce(
        (sum, cur) => sum + Number(cur?.noOfPackages || 0),
        0,
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
    (item) => item.inputName === inputName,
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
  const handler = {
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
          }),
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
          }),
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
          }),
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
          }),
        );
      }
    },
    handleChangeOnPOL: async (name, value) => {
      const updates = {};

      // POL → PLR mapping
      if (name === "polId") {
        updates.plrId = value ? { Id: value.Id, Name: value.Name } : {};
      }

      // Fetch port-based country data
      await getPortBasedOnCountry({
        portId: value?.Id,
        inputName: name,
      });

      // Map storeApiResult → { polId, podId, fpdId }
      const countryMap = storeApiResult.reduce((acc, item) => {
        acc[item.inputName] = item.countryCategory;
        return acc;
      }, {});

      const { polId, podId, fpdId } = countryMap;

      // Fetch movement + cargo master data
      const payload = {
        columns: "m.id Id, name Name, m.code code, m.masterListName",
        tableName: "tblMasterData m",
        whereCondition:
          "(m.masterListName = 'tblServiceType' OR m.masterListName = 'tblMovementType' OR m.masterListName = 'tblMode') AND m.status = 1",
      };

      const res = await getDataWithCondition(payload);
      const data = res?.data;

      if (!Array.isArray(data)) return;

      // Create lookup maps
      const cargoMap = {};
      const movementMap = {};
      const modeMap = {};

      data.forEach((item) => {
        if (item.masterListName === "tblServiceType") {
          cargoMap[item.code] = item;
        }
        if (item.masterListName === "tblMovementType") {
          movementMap[item.code] = item;
        }
        if (item.masterListName === "tblMode") {
          modeMap[item.code] = item;
        }
      });

      /* -------------------- Cargo Type Rules -------------------- */

      if (polId === "IN" && podId === "IN") {
        updates.cargoTypeId = cargoMap.CG && {
          Id: cargoMap.CG.Id,
          Name: cargoMap.CG.code,
        };
      }

      if (polId === "F" && podId === "F") {
        updates.cargoTypeId = cargoMap.TR && {
          Id: cargoMap.TR.Id,
          Name: cargoMap.TR.code,
        };
      }

      if (polId === "F" && podId === "IN") {
        updates.cargoTypeId = cargoMap.IM && {
          Id: cargoMap.IM.Id,
          Name: cargoMap.IM.code,
        };
      }

      /* -------------------- Movement Type Rules -------------------- */

      if (podId === "F") {
        updates.movementTypeId = movementMap.TC && {
          Id: movementMap.TC.Id,
          Name: movementMap.TC.code,
        };
      }

      let setPostCarriageId = null;

      if (podId === "IN" && fpdId === "IN") {
        const filtered = storeApiResult.filter(
          (i) => i.inputName === "podId" || i.inputName === "fpdId",
        );

        const isSamePort = hasDuplicateId(filtered);

        updates.movementTypeId = isSamePort
          ? movementMap.LC && {
              Id: movementMap.LC.Id,
              Name: movementMap.LC.code,
            }
          : movementMap.TI && {
              Id: movementMap.TI.Id,
              Name: movementMap.TI.code,
            };

        if (isSamePort && modeMap?.L) {
          setPostCarriageId = {
            Id: modeMap.L.Id,
            Name: modeMap.L.Name,
          };
        }
      }
      setFormData((prev) => ({
        ...prev,
        ...updates,
      }));

      if (name === "podId" || name === "fpdId") {
        let setWhere = null;
        if (name === "podId") {
          setWhere = `podId = ${value?.Id} and fpdId = ${formData?.fpdId?.Id} and defaultCfs = 'Y' and status = 1`;
        } else {
          setWhere = `podId = ${formData?.podId?.Id} and fpdId = ${value?.Id} and defaultCfs = 'Y' and status = 1`;
        }
        const payload = {
          columns: "id, name",
          tableName: "tblCarrierPort",
          whereCondition: setWhere,
        };
        const { data, success } = await getDataWithCondition(payload);
        if (success && data?.length > 0) {
          setFormData((prev) => ({
            ...prev,
            movementCarrierId: { Id: data?.[0]?.id, Name: data?.[0]?.name },
          }));
          await handler.setCarrierBondAndCode("movementCarrierId", {
            Id: data?.[0]?.id,
          });
        } else {
          setFormData((prev) => ({
            ...prev,
            movementCarrierId: null,
            carrierBondNo: null,
            carrierPanNo: null,
            scmtrBondNo: null,
            postCarriageId: setPostCarriageId,
          }));
        }
      }
    },
    setCarrierBondAndCode: async (name, value) => {
      const obj = {
        columns: `
      t.bondNo,
      t.panNo,
      t.scmtrBondNo,
      json_query((select m.id as Id, m.name as Name for json path, without_array_wrapper)) as postCarriageId
    `,
        tableName: "tblCarrierPort t",
        joins: "left join tblMasterData m on m.id = t.modeId",
        whereCondition: `t.id = ${value?.Id} and t.defaultCfs = 'Y' and t.status = 1`,
      };

      const { data, success } = await getDataWithCondition(obj);

      if (data?.length > 0 && success) {
        setFormData((prev) => {
          return {
            ...prev,
            carrierBondNo: data?.[0]?.bondNo ?? null,
            carrierPanNo: data?.[0]?.panNo ?? null,
            scmtrBondNo: data?.[0]?.scmtrBondNo ?? null,
            postCarriageId: data?.[0]?.postCarriageId ?? null,
          };
        });
      } else {
        setFormData((prev) => {
          return {
            ...prev,
            carrierBondNo: null,
            carrierPanNo: null,
            scmtrBondNo: null,
            postCarriageId: null,
          };
        });
      }
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
        }),
      );

      if (!vesselId) return;

      try {
        const obj = {
          columns: "t.id as Id, t.voyageNo as Name",
          tableName: "tblVoyage t",
          whereCondition: `t.vesselId = ${vesselId} and t.status = 1 and t.companyid = ${userData?.companyId}`,
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
            }),
          );
        }
      } catch (e) {
        console.error("handleChangeOnVessel error:", e);
      }
    },
    setAgentCode: async (name, value, { containerIndex }) => {
      if (value) {
        setFormData((prevData) =>
          setInputValue({
            prevData,
            tabName: null,
            gridName: "tblBlContainer",
            tabIndex: null,
            containerIndex: containerIndex,
            name: "containerAgentCode",
            value: null,
          }),
        );
      } else {
        const objAgentCode = {
          columns: "panNo",
          tableName: "tblCompany",
          whereCondition: `id = ${userData?.companyId} and status = 1`,
        };
        const { data: dataAgentCode } =
          await getDataWithCondition(objAgentCode);
        setFormData((prevData) =>
          setInputValue({
            prevData,
            tabName: null,
            gridName: "tblBlContainer",
            tabIndex: null,
            containerIndex: containerIndex,
            name: "containerAgentCode",
            value: dataAgentCode?.[0]?.panNo,
          }),
        );
      }
    },
  };
  return handler;
};

export const createdHandleBlurEventFunctions = ({ setFormData, formData }) => {
  return {
    containerNumberHandler: (event, { containerIndex, tabIndex }) => {
      const { name, value } = event?.target || {};
      const pattern = /^[A-Za-z]{4}[0-9]{7}$/;
      if (!pattern.test(value)) {
        toast.error(
          "Invalid Container Number format. It should be 4 letters followed by 7 digits.",
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
          }),
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

export const createGridEventFunctions = ({ setFormData }) => {
  return {
    addGrid: async ({ tabIndex, gridIndex }) => {
      const objSealType = {
        columns: "id as Id, name as Name",
        tableName: "tblMasterData",
        whereCondition: `masterListName = 'tblSealType' and name = 'BTSL' and status = 1`,
      };
      const { data: dataSealType } = await getDataWithCondition(objSealType);

      const objAgentCode = {
        columns: "panNo",
        tableName: "tblCompany",
        whereCondition: `id = ${userData?.companyId} and status = 1`,
      };
      const { data: dataAgentCode } = await getDataWithCondition(objAgentCode);

      setFormData((prevData) =>
        setInputValue({
          prevData,
          tabName: null,
          gridName: "tblBlContainer",
          tabIndex: null,
          containerIndex: gridIndex,
          name: "sealTypeId",
          value: dataSealType?.[0],
        }),
      );

      setFormData((prevData) =>
        setInputValue({
          prevData,
          tabName: null,
          gridName: "tblBlContainer",
          tabIndex: null,
          containerIndex: gridIndex,
          name: "containerAgentCode",
          value: dataAgentCode?.[0]?.panNo,
        }),
      );

      setFormData((prevData) =>
        setInputValue({
          prevData,
          tabName: null,
          gridName: "tblBlContainer",
          tabIndex: null,
          containerIndex: gridIndex,
          name: "soc",
          value: false,
        }),
      );
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

export async function getDefaultVal(setFormData, setPackTypeState) {
  try {
    const { success, data } = await getDataWithCondition({
      columns: `json_object('cinType': json_object('Id':cin.id, 'Name':concat(cin.code, ' - ', cin.name)),
                   'natureOfCargoId': json_object('Id':ship.id, 'Name':concat(ship.code, ' - ', ship.name)),
                   'blTypeId':json_object('Id':item.id, 'Name':concat(item.code, ' - ', item.name)),
                   'packageId': json_object('Id':pkg.id, 'Name':concat(pkg.code, ' - ', pkg.name))
                   ) as data
          `,
      tableName: "tblMasterData cin",
      joins: `join tblMasterData ship on 1 = 1
                join tblMasterData item on 1 = 1
                join tblMasterData pkg on 1 = 1`,
      whereCondition: `cin.masterListName='tblCINType' and cin.name='PCIN' and cin.status=1
            and ship.masterListName='tblTypeOfShipment' and ship.name='Containerised Cargo' and ship.status=1
            and item.masterListName='tblItemType' and item.name='Other Cargo' and item.status=1
            and pkg.masterListName='tblPackage' and pkg.name='PACKAGES' and pkg.status=1`,
    });

    if (success) {
      const { packageId, ...restData } = data?.[0]?.data;
      setFormData((prev) => ({
        ...prev,
        companyId: { Id: userData.companyId, Name: userData.companyName },
        companyBranchId: { Id: userData.branchId, Name: userData.branchName },
        shippingLineId: { Id: userData.companyId, Name: userData.companyName },
        mloId: { Id: userData.companyId, Name: userData.companyName },
        ...restData,
      }));
      setPackTypeState(packageId);
    } else {
      setFormData((prev) => ({
        ...prev,
        companyId: { Id: userData.companyId, Name: userData.companyName },
        companyBranchId: { Id: userData.branchId, Name: userData.branchName },
        shippingLineId: { Id: userData.companyId, Name: userData.companyName },
        mloId: { Id: userData.companyId, Name: userData.companyName },
      }));
    }
  } catch (e) {
    console.error(e);
  }
}

export const createHandleChangeEventFunctionTrackPage = ({
  setAdvanceSearch,
  getData,
  rowPerPage,
  setFormData,
}) => {
  return {
    handleFilterVessel: async (name, value) => {
      const vesselId = value?.Id;

      if (!vesselId) {
        setAdvanceSearch((prev) => {
          const updateFilter = {};
          getData(1, rowPerPage, updateFilter);
          return updateFilter;
        });
        setFormData((prevData) =>
          setInputValue({
            prevData,
            tabName: null,
            gridName: null,
            tabIndex: null,
            containerIndex: null,
            name: "podVoyageId",
            value: null,
          }),
        );
        return;
      }

      let filterObj = {};
      try {
        const obj = {
          columns: "t.id as Id, t.voyageNo as Name",
          tableName: "tblVoyage t",
          whereCondition: `t.vesselId = ${vesselId} and t.status = 1 and t.companyid = ${userData?.companyId}`,
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
            }),
          );
          filterObj = { ...filterObj, podVoyageId: data?.[0]?.Name };
        }
      } catch (e) {
        console.error("handleFilterVessel error:", e);
      }
      setAdvanceSearch((prev) => {
        const updateFilter = { ...prev, ...filterObj, [name]: value?.Name };
        getData(1, rowPerPage, updateFilter);
        return updateFilter;
      });
    },
  };
};
