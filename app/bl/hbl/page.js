"use client";
import { useEffect, useState } from "react";
import { ThemeProvider, Box, Tab, Tabs } from "@mui/material";
import {
  mapping,
  totalFieldData,
  gridButtons,
  fieldData,
  gridButtonsWithoutExcel,
} from "./hblData";
import { CustomInput } from "@/components/customInput";
import { theme } from "@/styles";
import { toast, ToastContainer } from "react-toastify";
import CustomButton from "@/components/button/button";
import TableGrid from "@/components/tableGrid/tableGrid";
import FormHeading from "@/components/formHeading/formHeading";
import { formStore } from "@/store";
import {
  formatDataWithForm,
  formatDataWithFormThirdLevel,
  formatFetchForm,
  formatFormData,
  formFormatThirdLevel,
  getUserByCookies,
  setInputValue,
  setVoyageBasedonVessel,
  useNextPrevData,
  validateContainerForMBL,
  validatePanCard,
  validPinCode,
} from "@/utils";
import {
  deleteRecord,
  fetchForm,
  getDataWithCondition,
  insertUpdateForm,
} from "@/apis";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import {
  checkAttachment,
  copyHandler,
  requestStatusFun,
  useTotalGrossAndPack,
} from "./utils";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import AgreeTerms from "@/components/agreeTerms/agreeTerms";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import { RejectModal } from "./modal";
import { checkNoPackages } from "../mbl/utils";

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

export default function Home() {
  const [formData, setFormData] = useState({});
  const [fieldsMode, setFieldsMode] = useState("");
  const [jsonData, setJsonData] = useState(fieldData);
  const { mode, setMode } = formStore();
  const [totals, setTotals] = useState({});
  const [tabValue, setTabValue] = useState(0);
  const [hblArray, setHblArray] = useState([]);
  const [blDelete, setBlDelete] = useState([]);
  const [packTypeState, setPackTypeState] = useState(null);
  const [hblStatus, setHblStatus] = useState(null);
  const userData = getUserByCookies();
  const [agreed, setAgreed] = useState(false);
  const [requestBtn, setRequestBtn] = useState(true);
  const [rejectState, setRejectState] = useState({
    toggle: false,
    value: null,
    amendment: false,
  });

  const handleChangeTab = (event, newValue) => {
    const form = document.querySelector("form");
    if (!form.reportValidity()) {
      toast.warn("Please fill required field first!");
      return;
    } else {
      setTabValue(newValue);
    }
  };

  useTotalGrossAndPack(formData, setTotals);
  const { prevId, nextId, prevLabel, nextLabel, canPrev, canNext } =
    useNextPrevData({
      currentId: mode.formId,
      tableName: "tblBl",
      labelField: `mblNo curName, string_agg(id, ',')  curId, lag(mblNo) over (order by max(createdDate) desc) as prevName, lag(string_agg(id, ',')) over (order by max(createdDate) desc) as prevId, lead(mblNo) over (order by max(createdDate) desc) as nextName, lead(string_agg(id, ',')) over (order by max(createdDate) desc) as nextId, max(createdDate) createdDate`,
      orderBy: "createdDate desc",
      groupBy: "group by mblNo",
    });

  const submitHandler = async (event) => {
    event.preventDefault();
    const packageMismatchError = checkNoPackages({
      formData: formData,
      hblType: "HBL",
    });
    if (packageMismatchError) {
      packageMismatchError?.map((err) => toast.error(err));
      return;
    }
    const isAttachment = checkAttachment(formData);
    if (isAttachment) {
      toast.error("Please upload attachment in all HBL tabs!");
      return;
    }
    let allSuccess = true;
    const format = formFormatThirdLevel(formData);
    const checkHblMap = format.map((item) => item.hblNo);
    const checkSameHbl = new Set(checkHblMap).size === checkHblMap.length;
    if (!checkSameHbl) {
      toast.error("HBL No should be unique in all tabs!");
      return;
    }
    const promises = format.map(async (item) => {
      const formId = item?.id ?? null;
      const { id, ...resData } = item;
      const formatItem = formatFormData(
        "tblBl",
        { ...resData, mblHblFlag: "HBL" },
        formId,
        "blId"
      );
      const { success, error, message } = await insertUpdateForm(formatItem);
      if (!success) {
        allSuccess = false;
        toast.error(error || message);
      }
    });
    await Promise.all(promises);
    if (blDelete.length > 0) {
      const deletePromises = blDelete.map(async (item) => {
        const obj = {
          recordId: item,
          tableName: "tblBl",
        };
        const { success, message, error } = await deleteRecord(obj);
        if (!success) {
          allSuccess = false;
          toast.error(error || message);
        }
      });
      await Promise.all(deletePromises);
    }

    if (allSuccess) {
      setRequestBtn(false);
      if (mode.formId) {
        toast.success("Form updated successfully!");
      } else {
        toast.success("Form submit successfully!");
      }
    }
  };

  function handleRemove(index) {
    setHblArray((prev) => prev.filter((num, indexArr) => indexArr !== index)),
      setFormData((prev) => ({
        ...prev,
        tblBl: prev?.tblBl?.filter((num, indexArr) => indexArr !== index),
      }));

    if (formData?.tblBl?.[index]?.id) {
      setBlDelete((prev) => [...prev, formData?.tblBl?.[index]?.id]);
    }
  }

  const handleGridEventFunctions = {
    addGrid: async ({ tabIndex, gridIndex }) => {
      const obj = {
        columns: "id as Id, name as Name , code as code , masterListName",
        tableName: "tblMasterData",
        whereCondition: `masterListName = 'tblSealType' and name = 'BTSL' and status = 1 OR  masterListName  =  'tblCINType' and name = 'PCIN'  OR masterListName =  'tblTypeOfShipment' and code  =  'C'  OR masterListName  =  'tblItemType' and code = 'OT' and status  = 1`,
        orderBy: "id asc",
      };
      const { data } = await getDataWithCondition(obj);

      const setValuesBasedOnColName = (colName, value) => {
        switch (colName) {
          case "tblSealType":
            return "sealTypeId";
          case "tblCINType":
            return "cinType";
          case "tblItemType":
            return "blTypeId";
          case "tblTypeOfShipment":
            return "natureOfCargoId";
          default:
            return "";
        }
      };

      if (Array.isArray(data)) {
        data.map((info) => {
          setFormData((prevData) =>
            setInputValue({
              prevData,
              tabName: "tblBl",
              gridName:
                info?.masterListName === "tblSealType" ? "tblBlContainer" : "",
              tabIndex,
              containerIndex: gridIndex,
              name: setValuesBasedOnColName(info?.masterListName),
              value: { Id: info?.Id, Name: info?.code + "-" + info?.Name },
            })
          );
        });
      } else {
        return [];
      }
    },
  };

  const handleChangeEventFunctions = {
    setCountryAndState: async (name, value, { containerIndex, tabIndex }) => {
      const setName = name.replace("City", "");
      const obj = {
        columns: `(select id from tblState s where s.id = ci.stateId and s.status = 1) stateId,
                  (select name from tblState s where s.id = ci.stateId and s.status = 1) stateName,
                  (select id from tblCountry c where c.id = ci.countryId and c.status = 1) countyId,
                  (select name from tblCountry c where c.id = ci.countryId and c.status = 1) countryName`,
        tableName: "tblCity ci",
        whereCondition: `ci.id = ${value.Id} and ci.status = 1`,
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
      const isHazardous = value.Name === "HAZ - HAZARDOUS";
      setJsonData((prev) => {
        const itemContainer = prev.tblBlPackingList;
        const requiredUno = itemContainer.map((item) => {
          if (item.name === "imoId") {
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
      // console.log(!val)

      //  if (!value?.Id) {
      //   console.log("hell")
      //   setFormData((prev) =>
      //     setInputValue({
      //       prev,
      //       name: "podVesselId",
      //       value: {},
      //     })
      //   );
      // }

      const obj = {
        columns: "c.telephoneNo , c.panNo",
        tableName: "tblCompany c",
        whereCondition: `c.id = ${value?.Id}`,
      };
      const result = await getDataWithCondition(obj);

      if (result.length > 0 && result?.data[0]?.telephoneNo === "") {
        setFormData((prevData) =>
          setInputValue({
            prevData,
            name: "shippingLineTelNo",
            value: "",
          })
        );
        return toast.error("For this Shipper PhoneNo do not exist pls add");
      }

      setFormData((prevData) =>
        setInputValue({
          prevData,
          name: "shippingLineTelNo",
          value: result?.data[0]?.telephoneNo || "",
        })
      );

      // if (result?.data[0]?.panNo) {
      //   const formatArray = formData?.tblBl
      //     ?.map((_, idx) =>
      //       _.tblBlContainer?.map((r) => {
      //         return { ...r, tabIndex: idx };
      //       })
      //     )
      //     ?.flat();

      //   const updatedArray =
      //     Array.isArray(formatArray) && formatArray.length > 0
      //       ? formatArray?.map((i) => {
      //           return { ...i, containerAgentCode: result?.data[0]?.panNo };
      //         })
      //       : [];

      //   setFormData((prev) => {
      //     return {
      //       ...prev,
      //       tblBl: prev.tblBl?.map((i, index) => {
      //         return {
      //           ...i,
      //           tblBlContainer: updatedArray?.filter(
      //             (r) => r?.tabIndex === index
      //           ),
      //         };
      //       }),
      //     };
      //   });
      // }

      return "";
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
        const clearValues = ["shippingLineId", "podVoyageId"];
        clearValues.map((info) => {
          setFormData((prev) =>
            setInputValue({
              prev,
              name: info,
              value: {},
            })
          );
        });

        return "";
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
  };

  const handleBlurEventFunctions = {
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
  };

  useEffect(() => {
    if (formData?.tblBl?.[tabValue]?.tblBlContainer) {
      let packType =
        formData?.tblBl?.[tabValue]?.tblBlContainer?.[0]?.packageId;
      const totalGrossAndPack = formData?.tblBl?.[
        tabValue
      ]?.tblBlContainer?.reduce(
        (sum, cur) => {
          sum.grossWt += Number(cur?.grossWt || 0);
          sum.noOfPackages += Number(cur?.noOfPackages || 0);
          if (
            (packType?.Name !== cur?.packageId?.Name &&
              cur?.packageId !== undefined) ||
            null
          ) {
            sum.packType = packTypeState;
          }
          return sum;
        },
        { grossWt: 0, noOfPackages: 0, packType: packType }
      );
      const updateForm = { ...formData };
      updateForm.tblBl = [...(updateForm?.tblBl || [])];
      updateForm.tblBl[tabValue] = {
        ...(updateForm.tblBl[tabValue] || {}),
        grossWt: totalGrossAndPack?.grossWt,
        noOfPackages: totalGrossAndPack?.noOfPackages,
        packageId: totalGrossAndPack?.packType,
      };
      setFormData(updateForm);
    }
  }, [formData?.tblBl?.[tabValue]?.tblBlContainer]);

  useEffect(() => {
    async function fetchFormHandler() {
      if (!mode.formId) return;
      setFieldsMode(mode.mode);
      const resArray = [];

      const promises = mode.formId.split(",").map(async (id) => {
        const format = formatFetchForm(
          fieldData,
          "tblBl",
          id,
          '["tblBlContainer", "tblBlPackingList", "tblAttachment"]',
          "blId"
        );
        const { success, result, message, error } = await fetchForm(format);
        if (success) {
          const getData = formatDataWithForm(result, fieldData);
          resArray.push({ ...getData, id });
        } else {
          toast.error(error || message);
        }
      });

      await Promise.allSettled(promises);

      const formatState = formatDataWithFormThirdLevel(
        resArray,
        [...jsonData.mblFields],
        "tblBl"
      );
      setFormData(formatState);
      setHblArray(
        Array.from({ length: formatState.tblBl.length }, (_, i) => i)
      );
    }
    fetchFormHandler();
  }, [mode.formId]);

  useEffect(() => {
    async function getHblStatus() {
      // 1) Default PACKAGES for package type
      const obj1 = {
        columns: "id as Id, name as Name",
        tableName: "tblMasterData",
        whereCondition: `masterListName = 'tblPackage' and name = 'PACKAGES'`,
      };
      const { data: data1, success: success1 } = await getDataWithCondition(
        obj1
      );
      if (success1) {
        setPackTypeState(data1[0]);
      }

      // 2) HBL status master
      const obj = {
        columns: "id as Id, name as Name",
        tableName: "tblMasterData",
        whereCondition: `masterListName = 'tblHblStatus' and status = 1`,
      };
      const { data, success } = await getDataWithCondition(obj);
      if (success) {
        setHblStatus(data);
      }

      // 3) Company + branch from logged-in user
      setFormData((prev) => {
        return {
          ...prev,
          companyId: {
            Id: userData.companyId,
            Name: userData.companyName,
          },
          companyBranchId: {
            Id: userData.branchId,
            Name: userData.branchName,
          },
        };
      });

      // 4) 🔹 Default CIN Type = "PCIN" for NEW requests only
      if (!mode.formId) {
        const cinObj = {
          columns: "m.id as Id, m.name as Name",
          tableName: "tblMasterData m",
          whereCondition: `
            m.masterListName = 'tblCINType'
            AND m.name = 'PCIN'
          `,
        };

        const { data: cinData, success: cinSuccess } =
          await getDataWithCondition(cinObj);

        if (cinSuccess && Array.isArray(cinData) && cinData.length > 0) {
          setFormData((prev) =>
            // don't override if already set (edit mode / user changed)
            prev?.cinType ? prev : { ...prev, cinType: cinData[0] }
          );
        }
      }
    }

    getHblStatus();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <form onSubmit={submitHandler}>
        <section className="py-2 px-4">
          <Box className="flex justify-between items-center mb-2">
            <h1 className="text-left text-base m-0">HBL Request</h1>
            <Box className="flex items-center gap-4">
              <CustomInput
                fields={totalFieldData.totalFields}
                formData={totals}
                setFormData={setTotals}
                fieldsMode={"view"}
              />
              {userData?.roleCode === "customer" && (
                <CustomButton
                  text="Back"
                  href="/bl/hbl/list"
                  onClick={() => setMode({ mode: null, formId: null })}
                />
              )}
              {userData?.roleCode === "shipping" && (
                <CustomButton
                  text="Back"
                  href="/bl/hbl/linerSearch"
                  onClick={() => setMode({ mode: null, formId: null })}
                />
              )}
            </Box>
          </Box>
          {(fieldsMode === "view" || fieldsMode === "edit") && (
            <Box className="flex justify-between items-center w-full">
              <CustomButton
                text={prevLabel ? `Prev (MBLno:${prevLabel})` : "Prev"}
                startIcon={<ArrowBackIosIcon />}
                onClick={() =>
                  prevId && setMode({ mode: fieldsMode, formId: prevId })
                }
                disabled={!canPrev}
              />
              <CustomButton
                text={nextLabel ? `Next (MBLno:${nextLabel})` : "Next"}
                endIcon={<ArrowForwardIosIcon />}
                onClick={() =>
                  nextId && setMode({ mode: fieldsMode, formId: nextId })
                }
                disabled={!canNext}
              />
            </Box>
          )}
          <Box>
            <FormHeading text="MBL Details" />
            <Box className="grid grid-cols-4 items-end gap-2 p-2 ">
              <CustomInput
                fields={jsonData.mblFields}
                formData={formData}
                setFormData={setFormData}
                fieldsMode={fieldsMode}
                handleBlurEventFunctions={handleBlurEventFunctions}
                handleChangeEventFunctions={handleChangeEventFunctions}
              />
            </Box>
            <FormHeading text="HBL Details" />
            <Box sx={{ width: "100%" }}>
              <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                <Tabs
                  value={tabValue}
                  onChange={handleChangeTab}
                  aria-label="basic tabs example"
                >
                  {hblArray.map((item, index) => {
                    return (
                      <Tab
                        key={index}
                        label={`${formData?.tblBl?.[index]?.hblNo || item + 1}`}
                        {...a11yProps(index)}
                        icon={<CloseIcon onClick={() => handleRemove(index)} />}
                        iconPosition="end"
                      />
                    );
                  })}
                  {mode.mode !== "view" && (
                    <Tab
                      label="Add HBL"
                      onClick={() =>
                        setHblArray((prev) => [
                          ...prev,
                          prev[prev.length - 1] + 1 || 0,
                        ])
                      }
                      icon={<AddIcon />}
                      iconPosition="end"
                    />
                  )}
                </Tabs>
              </Box>
              {hblArray.map((item, index) => {
                return (
                  <CustomTabPanel value={tabValue} index={index} key={index}>
                    <Box className="border-2 border-solid border-gray-300 p-3 mt-2 ">
                      <Box className="grid grid-cols-6 gap-2 p-2 ">
                        <CustomInput
                          fields={jsonData.hblFields}
                          formData={formData}
                          setFormData={setFormData}
                          fieldsMode={fieldsMode}
                          tabName={"tblBl"}
                          tabIndex={index}
                        />
                      </Box>
                      <FormHeading text="Consignor Details">
                        <Box className="grid grid-cols-6 gap-2 p-2 ">
                          <CustomInput
                            fields={jsonData.consignorFields}
                            formData={formData}
                            setFormData={setFormData}
                            fieldsMode={fieldsMode}
                            tabName={"tblBl"}
                            tabIndex={index}
                            handleChangeEventFunctions={
                              handleChangeEventFunctions
                            }
                          />
                        </Box>
                      </FormHeading>

                      <FormHeading
                        text="Consignee Details"
                        buttons={[
                          {
                            text: "Copy Notify Details",
                            onClick: () =>
                              copyHandler(
                                formData,
                                setFormData,
                                "left",
                                mapping,
                                "Notify details copied to Consignee!",
                                index
                              ),
                            icon: <ContentCopyIcon fontSize="small" />,
                          },
                        ]}
                      >
                        <Box className="grid grid-cols-6 gap-2 p-2 ">
                          <CustomInput
                            fields={jsonData.consigneeFields}
                            formData={formData}
                            setFormData={setFormData}
                            fieldsMode={fieldsMode}
                            tabName={"tblBl"}
                            tabIndex={index}
                            handleChangeEventFunctions={
                              handleChangeEventFunctions
                            }
                            handleBlurEventFunctions={handleBlurEventFunctions}
                          />
                        </Box>
                      </FormHeading>
                      <FormHeading
                        text="Notify Details"
                        buttons={[
                          {
                            text: "Copy Consignee Details",
                            onClick: () =>
                              copyHandler(
                                formData,
                                setFormData,
                                "right",
                                mapping,
                                "Consignee details copied to Notify!",
                                index
                              ),
                            icon: <ContentCopyIcon fontSize="small" />,
                          },
                        ]}
                      >
                        <Box className="grid grid-cols-5 gap-2 p-2 ">
                          <CustomInput
                            fields={jsonData.notifyFields}
                            formData={formData}
                            setFormData={setFormData}
                            fieldsMode={fieldsMode}
                            tabName={"tblBl"}
                            tabIndex={index}
                            handleChangeEventFunctions={
                              handleChangeEventFunctions
                            }
                            handleBlurEventFunctions={handleBlurEventFunctions}
                          />
                        </Box>
                      </FormHeading>
                      <FormHeading text="Invoicing Instructions">
                        <Box className="grid grid-cols-6 gap-2 p-2 ">
                          <CustomInput
                            fields={jsonData.invoiceFields}
                            formData={formData}
                            setFormData={setFormData}
                            fieldsMode={fieldsMode}
                            tabName={"tblBl"}
                            tabIndex={index}
                          />
                        </Box>
                      </FormHeading>
                      <Box className="grid grid-cols-6 gap-2 p-2 ">
                        <CustomInput
                          fields={jsonData.hblBottomFields}
                          formData={formData}
                          setFormData={setFormData}
                          fieldsMode={fieldsMode}
                          tabName={"tblBl"}
                          tabIndex={index}
                        />
                      </Box>
                      <FormHeading text="Container Details" />
                      <TableGrid
                        fields={jsonData.tblBlContainer}
                        formData={formData}
                        setFormData={setFormData}
                        fieldsMode={mode.mode}
                        gridName="tblBlContainer"
                        buttons={gridButtons}
                        tabName={"tblBl"}
                        tabIndex={index}
                        handleGridEventFunctions={handleGridEventFunctions}
                        handleChangeEventFunctions={handleChangeEventFunctions}
                        handleBlurEventFunctions={handleBlurEventFunctions}
                      />
                      <FormHeading text="Item Details" />
                      <TableGrid
                        fields={jsonData.tblBlPackingList}
                        formData={formData}
                        setFormData={setFormData}
                        fieldsMode={mode.mode}
                        gridName="tblBlPackingList"
                        buttons={gridButtonsWithoutExcel}
                        tabName={"tblBl"}
                        tabIndex={index}
                        handleBlurEventFunctions={handleBlurEventFunctions}
                      />
                      <FormHeading text="Attachment Details" />
                      <TableGrid
                        fields={jsonData.tblAttachment}
                        formData={formData}
                        setFormData={setFormData}
                        fieldsMode={mode.mode}
                        gridName="tblAttachment"
                        buttons={gridButtonsWithoutExcel}
                        tabName={"tblBl"}
                        tabIndex={index}
                      />
                    </Box>
                  </CustomTabPanel>
                );
              })}
            </Box>
            <Box display="flex" justifyContent="center" mt={2}>
              {fieldsMode === "" && (
                <AgreeTerms
                  required
                  checked={agreed}
                  onChange={setAgreed}
                  name="agreeTerms"
                />
              )}
            </Box>
          </Box>
          <Box className="w-full flex mt-2 gap-3">
            {fieldsMode !== "view" &&
              userData?.roleCode === "customer" &&
              mode.status !== "Request" &&
              mode.status !== "Confirm" && (
                <CustomButton
                  text={"Submit"}
                  type="submit"
                  disabled={!requestBtn}
                />
              )}
            {userData?.roleCode === "customer" &&
              mode.status !== "Confirm" &&
              mode.status !== "Request" &&
              mode.status !== "Reject for Amendment" && (
                <CustomButton
                  text={"Request"}
                  onClick={() =>
                    requestStatusFun.requestHandler(formData.mblNo, hblStatus)
                  }
                  disabled={
                    fieldsMode !== "view" && fieldsMode !== "edit" && requestBtn
                  }
                />
              )}

            {(fieldsMode === "edit" || fieldsMode === "view") &&
              mode.status === "Request" &&
              userData?.roleCode === "shipping" && (
                <CustomButton
                  text={"Verify"}
                  onClick={() =>
                    requestStatusFun.verifyHandler(mode, hblStatus)
                  }
                />
              )}

            {(fieldsMode === "edit" || fieldsMode === "view") &&
              mode.status === "Request" &&
              userData.roleCode === "shipping" && (
                <CustomButton
                  text={"Reject"}
                  onClick={() =>
                    setRejectState((prev) => ({ ...prev, toggle: true }))
                  }
                />
              )}

            {userData?.roleCode === "customer" && mode.status === "Confirm" && (
              <CustomButton
                text={"Request for Amendment"}
                onClick={() =>
                  requestStatusFun.requestForAmendmentHandler(mode, hblStatus)
                }
              />
            )}

            {(fieldsMode === "edit" || fieldsMode === "view") &&
              mode.status === "Request for Amendment" &&
              userData?.roleCode === "shipping" && (
                <CustomButton
                  text={"Approved for Amendment"}
                  onClick={() =>
                    requestStatusFun.confirmForAmendmentHandler(mode, hblStatus)
                  }
                />
              )}

            {(fieldsMode === "edit" || fieldsMode === "view") &&
              mode.status === "Request for Amendment" &&
              userData?.roleCode === "shipping" && (
                <CustomButton
                  text={"Reject for Amendment"}
                  onClick={() =>
                    setRejectState((prev) => ({
                      ...prev,
                      toggle: true,
                      amendment: true,
                    }))
                  }
                />
              )}
          </Box>
        </section>
      </form>
      <ToastContainer />
      <RejectModal
        rejectState={rejectState}
        setRejectState={setRejectState}
        rejectHandler={() =>
          rejectState?.amendment
            ? requestStatusFun.rejectForAmendmentHandler(
                mode,
                hblStatus,
                rejectState,
                setRejectState
              )
            : requestStatusFun.rejectHandler(
                mode,
                hblStatus,
                rejectState,
                setRejectState
              )
        }
      />
    </ThemeProvider>
  );
}
