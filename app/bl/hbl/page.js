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
import { auth, formStore } from "@/store";
import {
  formatDataWithForm,
  formatDataWithFormThirdLevel,
  formatFetchForm,
  formatFormData,
  formFormatThirdLevel,
  setInputValue,
  useNextPrevData,
} from "@/utils";
import {
  deleteRecord,
  fetchForm,
  getDataWithCondition,
  insertUpdateForm,
  updateStatusRows,
} from "@/apis";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { copyHandler, useTotalGrossAndPack } from "./utils";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import AgreeTerms from "@/components/agreeTerms/agreeTerms";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";

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
  const { userData } = auth();

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

  const [agreed, setAgreed] = useState(false);

  const submitHandler = async (event) => {
    event.preventDefault();
    const format = formFormatThirdLevel(formData);
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
      if (success) {
        toast.success(message);
        setFormData({});
      } else {
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
        if (success) {
          toast.success(message);
        } else {
          toast.error(error || message);
        }
      });
      await Promise.all(deletePromises);
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
        columns: "id as Id, name as Name",
        tableName: "tblMasterData",
        whereCondition: `masterListName = 'tblSealType' and name = 'BTSL' and status = 1`,
      };
      const { data } = await getDataWithCondition(obj);
      setFormData((prevData) =>
        setInputValue({
          prevData,
          tabName: "tblBl",
          gridName: "tblBlContainer",
          tabIndex,
          containerIndex: gridIndex,
          name: "sealTypeId",
          value: data[0],
        })
      );
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
        columns: `s.id id, s.isocode Name`,
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
        columns: `s.id id, s.isocode Name`,
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
        const getData = formatDataWithForm(result, {
          mblFields: fieldData.mblFields,
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
  };

  async function requestHandler() {
    const requestStatus = hblStatus.filter((item) => item.Name === "Request");
    const rowsPayload = mode.formId.split(",").map((id) => {
      return {
        id: id,
        hblRequestStatus: requestStatus[0].Id,
        hblRequestRemarks: null,
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
          '["tblBlContainer", "tblBlPackingList", "tblAttachement"]',
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
      const obj1 = {
        columns: "id as Id, name as Name",
        tableName: "tblMasterData",
        whereCondition: `masterListName = 'tblPackage' and name = 'PACKAGES'`,
      };
      const { data: data1, success } = await getDataWithCondition(obj1);
      if (success) {
        setPackTypeState(data1[0]);
      }

      const obj = {
        columns: "id as Id, name as Name",
        tableName: "tblMasterData",
        whereCondition: `masterListName = 'tblHblStatus' and status = 1`,
      };
      const { data } = await getDataWithCondition(obj);
      setHblStatus(data);

      setFormData((prev) => ({
        ...prev,
        companyId: {
          Id: userData?.data?.companyId,
          Name: userData.data?.companyName,
        },
        companyBranchId: {
          Id: userData?.data?.branchId,
          Name: userData?.data?.branchName,
        },
      }));
    }

    getHblStatus();
  }, [userData]);

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
              <CustomButton
                text="Back"
                href="/bl/hbl/list"
                onClick={() => setMode({ mode: null, formId: null })}
              />
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
              />
            </Box>
            {/* <FormHeading text="CSN">
              <Box className="grid grid-cols-6 gap-2 p-2 ">
                <CustomInput
                  fields={jsonData.csnFields}
                  formData={formData}
                  setFormData={setFormData}
                  fieldsMode={fieldsMode}
                />
              </Box>
            </FormHeading> */}
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
                      />
                      <FormHeading text="Attachment Details" />
                      <TableGrid
                        fields={jsonData.tblAttachement}
                        formData={formData}
                        setFormData={setFormData}
                        fieldsMode={mode.mode}
                        gridName="tblAttachement"
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
            {fieldsMode !== "view" && (
              <CustomButton text={"Submit"} type="submit" />
            )}
            {fieldsMode === "edit" && (
              <CustomButton text={"Request"} onClick={requestHandler} />
            )}
          </Box>
        </section>
      </form>
      <ToastContainer />
    </ThemeProvider>
  );
}
