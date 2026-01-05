import { fetchForm, getDataWithCondition, updateStatusRows } from "@/apis";
import {
  formatDataWithForm,
  formatFetchForm,
  getUserByCookies,
  setInputValue,
  setVoyageBasedonVessel,
  validateContainerForMBL,
  validatePanCard,
  validPinCode,
} from "@/utils";
import { useEffect } from "react";
import { toast } from "react-toastify";

const userData = getUserByCookies();

export function useTotalGrossAndPack(formData, setTotals) {
  useEffect(() => {
    if (Array.isArray(formData?.tblBl)) {
      const totalVal = formData?.tblBl?.reduce(
        (tSum, item) => {
          const totalContainer = item?.tblBlContainer?.reduce(
            (sum, c) => {
              sum.gross += Number(c?.grossWt) || 0;
              sum.pack += Number(c?.noOfPackages) || 0;
              return sum;
            },
            {
              gross: 0,
              pack: 0,
            }
          );

          tSum.tGross += totalContainer?.gross || 0;
          tSum.tPack += totalContainer?.pack || 0;

          return tSum;
        },
        { tGross: 0, tPack: 0 }
      );

      setTotals({
        grossWt: totalVal.tGross || 0,
        packages: totalVal.tPack || 0,
      });
    }
  }, [formData?.tblBl]);
}

export function advanceSearchFilter(advanceSearch) {
  if (Object.keys(advanceSearch).length <= 0) return null;
  const condition = [];

  if (advanceSearch.mblNo) {
    condition.push(`b.mblNo = '${advanceSearch.mblNo}'`);
  }

  if (advanceSearch.hblNo) {
    condition.push(`b.hblNo = '${advanceSearch.hblNo}'`);
  }

  if (advanceSearch.hblRequestStatus) {
    condition.push(
      `b.hblRequestStatus in (${advanceSearch.hblRequestStatus
        .map((item) => item.Id)
        .join(",")})`
    );
  }

  if (advanceSearch.podvesselId) {
    condition.push(
      `b.podvesselId in (${advanceSearch.podvesselId
        .map((item) => item.Id)
        .join(",")})`
    );
  }

  if (advanceSearch.cargoTypeId) {
    condition.push(
      `b.cargoTypeId in (${advanceSearch.cargoTypeId
        .map((item) => item.Id)
        .join(",")})`
    );
  }

  if (advanceSearch.fromDate && advanceSearch.toDate) {
    condition.push(
      `b.mblDate between '${advanceSearch.fromDate}' and '${advanceSearch.toDate}'`
    );
  }

  return condition.length > 0 ? condition.join(" and ") : null;
}

export const copyHandler = (
  formData,
  setFormData,
  direction,
  mapping,
  toastMessage,
  tabIndex
) => {
  const updatedFormData = { ...formData };
  updatedFormData.tblBl = [...(formData.tblBl || [])];
  updatedFormData.tblBl[tabIndex] = { ...(formData.tblBl[tabIndex] || {}) };

  const fieldMapping =
    direction === "left"
      ? mapping
      : Object.fromEntries(Object.entries(mapping).map(([k, v]) => [v, k]));

  Object.entries(fieldMapping).forEach(([sourceKey, targetKey]) => {
    if (formData?.tblBl?.[tabIndex][sourceKey]) {
      updatedFormData.tblBl[tabIndex][targetKey] =
        formData.tblBl[tabIndex][sourceKey];
    }
  });

  setFormData(updatedFormData);
  toast.success(toastMessage);
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

export function checkAttachment(formData) {
  const isAttachment = formData.tblBl.map((item) => {
    return Boolean(item.tblAttachment?.[0]?.path);
  });

  return isAttachment.some((item) => item === false);
}

export const requestStatusFun = {
  requestHandler: async (mblNo, hblStatus) => {
    const userData = getUserByCookies();
    const obj1 = {
      columns: "id",
      tableName: "tblBl",
      whereCondition: `mblNo = '${mblNo}' and mblHblFlag = 'HBL' and status = 1`,
    };
    const { data, success } = await getDataWithCondition(obj1);
    if (success) {
      const hblIds = data.map((item) => item.id).join(",");
      const requestStatus = hblStatus.filter((item) => item.Name === "Request");
      const rowsPayload = hblIds.split(",").map((id) => {
        return {
          id: id,
          hblRequestStatus: requestStatus[0].Id,
          hblRequestRemarks: null,
          updatedBy: userData.userId,
          updatedDate: new Date(),
        };
      });
      const res = await updateStatusRows({
        tableName: "tblBl",
        rows: rowsPayload,
        keyColumn: "id",
      });
      const { success, message } = res || {};
      if (!success) {
        toast.error(message || "Update failed");
        return;
      }
      toast.success("Request updated successfully!");
    }
  },
  verifyHandler: async (mode, hblStatus) => {
    const userData = getUserByCookies();
    const verifyStatus = hblStatus.filter((item) => item.Name === "Confirm");
    const rowsPayload = mode.formId.split(",").map((id) => {
      return {
        id: id,
        hblRequestStatus: verifyStatus[0].Id,
        hblRequestRemarks: null,
        updatedBy: userData.userId,
        updatedDate: new Date(),
      };
    });
    const res = await updateStatusRows({
      tableName: "tblBl",
      rows: rowsPayload,
      keyColumn: "id",
    });
    const { success, message } = res || {};
    if (!success) {
      toast.error(message || "Update failed");
      return;
    }
    toast.success("Request updated successfully!");
  },
  rejectHandler: async (mode, hblStatus, rejectState, setRejectState) => {
    const userData = getUserByCookies();
    const verifyStatus = hblStatus.filter((item) => item.Name === "Reject");
    const rowsPayload = mode.formId.split(",").map((id) => {
      return {
        id: id,
        hblRequestStatus: verifyStatus[0].Id,
        hblRequestRemarks: rejectState.value,
        updatedBy: userData.userId,
        updatedDate: new Date(),
      };
    });
    const res = await updateStatusRows({
      tableName: "tblBl",
      rows: rowsPayload,
      keyColumn: "id",
    });
    const { success, message } = res || {};
    if (!success) {
      toast.error(message || "Update failed");
      return;
    }
    toast.success("Rejected updated successfully!");
    setRejectState((prev) => ({ ...prev, toggle: false, value: null }));
  },
  requestForAmendmentHandler: async (mode, hblStatus) => {
    const userData = getUserByCookies();
    const verifyStatus = hblStatus.filter(
      (item) => item.Name === "Request for Amendment"
    );
    const rowsPayload = mode.formId.split(",").map((id) => {
      return {
        id: id,
        hblRequestStatus: verifyStatus[0].Id,
        hblRequestRemarks: null,
        updatedBy: userData.userId,
        updatedDate: new Date(),
      };
    });
    const res = await updateStatusRows({
      tableName: "tblBl",
      rows: rowsPayload,
      keyColumn: "id",
    });
    const { success, message } = res || {};
    if (!success) {
      toast.error(message || "Update failed");
      return;
    }
    toast.success("Request updated successfully!");
  },
  confirmForAmendmentHandler: async (mode, hblStatus) => {
    const userData = getUserByCookies();
    const verifyStatus = hblStatus.filter(
      (item) => item.Name === "Approved for Amendment"
    );
    const rowsPayload = mode.formId.split(",").map((id) => {
      return {
        id: id,
        hblRequestStatus: verifyStatus[0].Id,
        hblRequestRemarks: null,
        updatedBy: userData.userId,
        updatedDate: new Date(),
      };
    });
    const res = await updateStatusRows({
      tableName: "tblBl",
      rows: rowsPayload,
      keyColumn: "id",
    });
    const { success, message } = res || {};
    if (!success) {
      toast.error(message || "Update failed");
      return;
    }
    toast.success("Request updated successfully!");
  },
  rejectForAmendmentHandler: async (
    mode,
    hblStatus,
    rejectState,
    setRejectState
  ) => {
    const userData = getUserByCookies();
    const verifyStatus = hblStatus.filter(
      (item) => item.Name === "Reject for Amendment"
    );
    const rowsPayload = mode.formId.split(",").map((id) => {
      return {
        id: id,
        hblRequestStatus: verifyStatus[0].Id,
        hblRequestRemarks: rejectState.value,
        updatedBy: userData.userId,
        updatedDate: new Date(),
      };
    });
    const res = await updateStatusRows({
      tableName: "tblBl",
      rows: rowsPayload,
      keyColumn: "id",
    });
    const { success, message } = res || {};
    if (!success) {
      toast.error(message || "Update failed");
      return;
    }
    toast.success("Rejected updated successfully!");
    setRejectState((prev) => ({ ...prev, toggle: false, value: null }));
  },
};

export const createBlurFunc = ({
  setFormData,
  formData,
  setJsonData,
  fieldData,
}) => {
  return {
    getMblHandler: async (event) => {
      const { value, name } = event.target;
      const obj = {
        columns: "id",
        tableName: "tblBl",
        whereCondition: `mblNo = '${value}' and mblHblFlag = 'MBL' and status = 1`,
      };
      const { success, data } = await getDataWithCondition(obj);
      if (success) {
        const format = formatFetchForm(
          {
            mblFields: fieldData.mblFields,
          },
          "tblBl",
          data[0].id
        );
        const { result } = await fetchForm(format);
        const excludeFields = ["companyId", "companyBranchId"];
        const filterMblFields = fieldData.mblFields.filter(
          (item) => !excludeFields.includes(item.name)
        );
        const getData = formatDataWithForm(result, {
          mblFields: filterMblFields,
        });
        setFormData((prev) => ({ ...prev, ...getData }));
        setJsonData((prev) => {
          const prevMblFields = prev.mblFields;
          const disableMbl = prevMblFields.map((item) => {
            if (item.name === "mblNo") {
              return { ...item, disabled: true };
            }
            return item;
          });
          return {
            ...prev,
            mblFields: disableMbl,
          };
        });
      }
    },
    containerNumberHandler: async (event, { containerIndex, tabIndex }) => {
      const { name, value } = event?.target || {};
      const pattern = /^[A-Za-z]{4}[0-9]{7}$/;
      if (!pattern.test(value)) {
        toast.error(
          "Invalid Container Number format. It should be 4 letters followed by 7 digits."
        );

        setFormData((prevData) =>
          setInputValue({
            prevData,
            tabName: "tblBl",
            gridName: "tblBlContainer",
            tabIndex,
            containerIndex,
            name,
            value: null,
          })
        );

        return "";
      }

      // validation for containers
      const result = await validateContainerForMBL(value, formData?.mblNo);

      if (!result.valid) {
        toast.error(result.message);
        return "";
      }

      return "";
    },
    panCardValid: (event, { containerIndex, tabIndex }) => {
      const { value, name } = event.target;
      if (value?.length === 0) return "";
      const result = validatePanCard(value);

      if (result?.error) {
        setFormData((prevData) =>
          setInputValue({
            prevData,
            tabName: "tblBl",
            gridName: "tblBlContainer",
            tabIndex,
            containerIndex,
            name,
            value: null,
          })
        );
        return toast.error(result.error);
      }
    },
    checkPinCode: (event) => {
      const { name, value } = event.target;
      const result = validPinCode(value);
      if (result.error) {
        setFormData((prevData) =>
          setInputValue({
            prevData,
            tabName: "tblBl",
            name,
            value: null,
          })
        );
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
    checkMobileValidation: (event) => {
      const { name, value } = event.target;
      if (value.length > 10) {
        setFormData((prevData) => ({ ...prevData, [name]: null }));
        toast.warn("Mobile number maximum should be 10 digit!");
      } else if (value.length < 3) {
        setFormData((prevData) => ({ ...prevData, [name]: null }));
        toast.warn("Mobile number minimum should be 3 digit!");
      }
    },
  };
};

export const createHandleChangeFunc = ({
  setFormData,
  formData,
  setJsonData,
}) => {
  return {
    setCountryAndState: async (name, value, { containerIndex, tabIndex }) => {
      const setName = name.replace("City", "");
      const obj = {
        columns: `(select id from tblState s where s.id = ci.stateId and s.status = 1) stateId,
                    (select name from tblState s where s.id = ci.stateId and s.status = 1) stateName,
                    (select id from tblCountry c where c.id = ci.countryId and c.status = 1) countyId,
                    (select concat(code, ' - ', name) from tblCountry c where c.id = ci.countryId and c.status = 1) countryName`,
        tableName: "tblCity ci",
        whereCondition: `ci.id = ${value?.Id} and ci.status = 1`,
      };
      const { data } = await getDataWithCondition(obj);
      setFormData((prev) => {
        const prevTblBl = [...(prev.tblBl || [])];
        if (setName === "shipper") {
          prevTblBl[tabIndex] = {
            ...prevTblBl[tabIndex],
            [`${setName}Country`]: {
              Id: data[0].countyId,
              Name: data[0].countryName,
            },
          };
        } else {
          prevTblBl[tabIndex] = {
            ...prevTblBl[tabIndex],
            [`${setName}State`]: data?.[0]?.stateId
              ? {
                  Id: data[0].stateId,
                  Name: data[0].stateName,
                }
              : null,
            [`${setName}Country`]: data?.[0]?.countyId
              ? {
                  Id: data[0].countyId,
                  Name: data[0].countryName,
                }
              : null,
          };
        }

        return {
          ...prev,
          tblBl: prevTblBl,
        };
      });
    },
    setISOBySize: async (name, value, { containerIndex, tabIndex }) => {
      const typeId =
        formData?.tblBl[tabIndex]?.tblBlContainer[containerIndex]?.typeId?.Id;
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
            tabName: "tblBl",
            gridName: "tblBlContainer",
            tabIndex,
            containerIndex,
            name: "isoCode",
            value: data[0],
          })
        );
      } else {
        setFormData((prevData) =>
          setInputValue({
            prevData,
            tabName: "tblBl",
            gridName: "tblBlContainer",
            tabIndex,
            containerIndex,
            name: "isoCode",
            value: null,
          })
        );
      }
    },
    setISOByType: async (name, value, { containerIndex, tabIndex }) => {
      const sizeId =
        formData?.tblBl[tabIndex]?.tblBlContainer[containerIndex]?.sizeId?.Id;
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
            tabName: "tblBl",
            gridName: "tblBlContainer",
            tabIndex,
            containerIndex,
            name: "isoCode",
            value: data[0],
          })
        );
      } else {
        setFormData((prevData) =>
          setInputValue({
            prevData,
            tabName: "tblBl",
            gridName: "tblBlContainer",
            tabIndex,
            containerIndex,
            name: "isoCode",
            value: null,
          })
        );
      }
    },
    cargoTypeHandler: async (name, value) => {
      const isHazardous = value?.Name === "HAZ - HAZARDOUS";
      setJsonData((prev) => {
        const itemContainer = prev.tblBlPackingList;
        const requiredUno = itemContainer.map((item) => {
          if (item.name === "imoCode" || item.name == "unNo") {
            return { ...item, required: isHazardous };
          }

          return item;
        });

        return {
          ...prev,
          tblBlPackingList: requiredUno,
        };
      });
    },
    setTelePhoneNoBasedOnLinerId: async (name, value) => {
      const obj = {
        columns: "telephoneNo, panNo",
        tableName: "tblCompany",
        whereCondition: `id = ${value?.Id}`,
      };
      const { data: dataLinerTelNoAndPan } = await getDataWithCondition(obj);

      setFormData((prev) => {
        const updateTblBl = prev?.tblBl?.map((item) => {
          const updateContainer = item?.tblBlContainer?.map((subItem) => {
            if (!subItem?.soc) {
              return {
                ...subItem,
                containerAgentCode: dataLinerTelNoAndPan?.[0]?.panNo || null,
              };
            }
            return subItem;
          });

          return { ...item, tblBlContainer: updateContainer };
        });

        return {
          ...prev,
          podVoyageId: null,
          shippingLineTelNo: dataLinerTelNoAndPan?.[0]?.telephoneNo || null,
          tblBl: updateTblBl,
        };
      });
    },
    selectVoyageNoBasedOnVessel: async (name, value) => {
      const linerId =
        (userData?.roleCode === "shipper" &&
          formData?.shippingLineId === userData?.companyId) ||
        (userData?.roleCode === "customer" && formData?.shippingLineId);

      if (!linerId) {
        return toast.error("Pls Select Liner");
      }

      if (!value?.Id) {
        setFormData((prev) => {
          return {
            ...prev,
            podVoyageId: {},
          };
        });

        return;
      }

      // cha is there then selected and shipper is their then login
      const { data } = await setVoyageBasedonVessel({
        vesselId: value?.Id,
        companyId: formData?.shippingLineId?.Id,
      });

      if (Array.isArray(data)) {
        if (data.length === 1) {
          setFormData((prevData) =>
            setInputValue({
              prevData,
              name: "podVoyageId",
              value: data[0] || {},
            })
          );
        }

        if (data.length > 1) {
          setFormData((prevData) =>
            setInputValue({
              prevData,
              name: "podVoyageId",
              value: {},
            })
          );
        }
      }
    },
    setAgentCode: async (name, value, { containerIndex, tabIndex }) => {
      if (value) {
        setFormData((prevData) =>
          setInputValue({
            prevData,
            tabName: "tblBl",
            gridName: "tblBlContainer",
            tabIndex: tabIndex,
            containerIndex: containerIndex,
            name: "containerAgentCode",
            value: null,
          })
        );
      } else {
        const objAgentCode = {
          columns: "panNo",
          tableName: "tblCompany",
          whereCondition: `id = ${formData?.shippingLineId?.Id} and status = 1`,
        };
        const { data: dataAgentCode } = await getDataWithCondition(
          objAgentCode
        );
        setFormData((prevData) =>
          setInputValue({
            prevData,
            tabName: "tblBl",
            gridName: "tblBlContainer",
            tabIndex: tabIndex,
            containerIndex: containerIndex,
            name: "containerAgentCode",
            value: dataAgentCode?.[0]?.panNo,
          })
        );
      }
    },
  };
};

export const createGridEventFunctions = ({ formData, setFormData }) => {
  return {
    addGrid: async ({ tabIndex, gridIndex }) => {
      const obj = {
        columns: "id as Id, name as Name",
        tableName: "tblMasterData",
        whereCondition: `masterListName = 'tblSealType' and name = 'BTSL' and status = 1`,
        orderBy: "id asc",
      };
      const { data: dataSealType } = await getDataWithCondition(obj);

      const objAgentCode = {
        columns: "panNo",
        tableName: "tblCompany",
        whereCondition: `id = ${formData?.shippingLineId?.Id} and status = 1`,
      };
      const { data: dataAgentCode } = await getDataWithCondition(objAgentCode);

      setFormData((prevData) =>
        setInputValue({
          prevData,
          tabName: "tblBl",
          gridName: "tblBlContainer",
          tabIndex: tabIndex,
          containerIndex: gridIndex,
          name: "sealTypeId",
          value: dataSealType?.[0],
        })
      );

      setFormData((prevData) =>
        setInputValue({
          prevData,
          tabName: "tblBl",
          gridName: "tblBlContainer",
          tabIndex: tabIndex,
          containerIndex: gridIndex,
          name: "containerAgentCode",
          value: dataAgentCode?.[0]?.panNo,
        })
      );
    },
  };
};

export const filterColumnsUpdate = (arr) => {
  const result = arr.reduce((acc, cur) => {
    const obj = {};
    cur.columnName.forEach(({ columnName }) => (obj[columnName] = true));
    acc.push({ ...obj, id: cur.blId });
    return acc;
  }, []);

  return result;
};

export const setTabDefaultVal = async (tabIndex, setFormData) => {
  const obj = {
    columns: `json_object(
     'cinType': json_object('Id':cin.id, 'Name':concat(cin.code, ' - ', cin.name)),
     'natureOfCargoId': json_object('Id':ship.id, 'Name':concat(ship.code, ' - ', ship.name)),
     'blTypeId': json_object('Id':itemType.id, 'Name':concat(itemType.code, ' - ', itemType.name))
  ) as data`,
    tableName: "tblMasterData cin",
    joins: `
     join tblMasterData ship on 1 = 1
     join tblMasterData itemType  on 1 = 1
    `,
    whereCondition: `
    cin.masterListName  =  'tblCINType' and cin.name = 'PCIN'  and  cin.status  = 1 and
    ship.masterListName =  'tblTypeOfShipment' and ship.code  =  'C'  and   ship.status  = 1 and
    itemType.masterListName  =  'tblItemType' and itemType.code = 'OT' and itemType.status  = 1`,
  };
  const { data } = await getDataWithCondition(obj);

  setFormData((prev) => {
    const updateTblBl = prev?.tblBl?.map((item, index) => {
      if (index === tabIndex) {
        return { ...item, ...data?.[0]?.data };
      }
      return item;
    });

    return {
      ...prev,
      tblBl: updateTblBl,
    };
  });
};
