"use client";
import { useEffect, useState } from "react";
import { ThemeProvider, Box, Tab, Tabs } from "@mui/material";
import {
  mapping,
  totalFieldData,
  gridButtons,
  fieldData,
  gridButtonsWithoutExcel,
  hblPrevNextObj,
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
  useNextPrevData,
} from "@/utils";
import {
  deleteRecord,
  fetchForm,
  fetchHblColumnsChanges,
  getDataWithCondition,
  insertUpdateForm,
} from "@/apis";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import {
  checkAttachment,
  checkMblActive,
  copyHandler,
  createBlurFunc,
  createGridEventFunctions,
  createHandleChangeFunc,
  filterColumnsUpdate,
  requestStatusFun,
  setTabDefaultVal,
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
  const [hightLightForm, setHightLightForm] = useState({});
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
    useNextPrevData(
      hblPrevNextObj(mode?.formId)?.[userData?.roleCode ?? "customer"],
    );

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
    const isMblActive = await checkMblActive(
      formData?.mblNo,
      formData?.shippingLineId,
    );
    if (isMblActive) {
      toast.warn("This Bl is not active!");
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
        {
          ...resData,
          mblHblFlag: "HBL",
          locationId: userData?.location || null,
          companyId: userData?.companyId,
          companyBranchId: userData?.branchId,
        },
        formId,
        "blId",
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
    (setHblArray((prev) => prev.filter((num, indexArr) => indexArr !== index)),
      setFormData((prev) => ({
        ...prev,
        tblBl: prev?.tblBl?.filter((num, indexArr) => indexArr !== index),
      })));

    if (formData?.tblBl?.[index]?.id) {
      setBlDelete((prev) => [...prev, formData?.tblBl?.[index]?.id]);
    }
  }

  const handleGridEventFunctions = createGridEventFunctions({
    formData,
    setFormData,
  });

  const handleChangeEventFunctions = createHandleChangeFunc({
    setFormData,
    formData,
    setJsonData,
  });

  const handleBlurEventFunctions = createBlurFunc({
    setFormData,
    formData,
    setJsonData,
    fieldData,
  });

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
        { grossWt: 0, noOfPackages: 0, packType: packType },
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
          "blId",
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
        "tblBl",
      );
      setFormData(formatState);
      setHblArray(
        Array.from({ length: formatState.tblBl.length }, (_, i) => i),
      );

      if (mode.status === "Request" && userData.roleCode === "shipping") {
        const { data } = await fetchHblColumnsChanges({ ids: mode.formId });
        const res = filterColumnsUpdate(data);
        const changeFormatState = formatDataWithFormThirdLevel(
          res,
          [...jsonData.mblFields],
          "tblBl",
        );
        setHightLightForm(changeFormatState);
      }
    }
    fetchFormHandler();
  }, [mode.formId]);

  useEffect(() => {
    async function initialize() {
      const obj1 = {
        columns: "id as Id, name as Name",
        tableName: "tblMasterData",
        whereCondition: `masterListName = 'tblPackage' and name = 'PACKAGES' and status = 1`,
      };
      const { data: data1, success: success1 } =
        await getDataWithCondition(obj1);
      if (success1) {
        setPackTypeState(data1[0]);
      }

      const obj = {
        columns: "id as Id, name as Name",
        tableName: "tblMasterData",
        whereCondition: `masterListName = 'tblHblStatus' and status = 1`,
      };
      const { data, success } = await getDataWithCondition(obj);
      if (success) {
        setHblStatus(data);
      }
    }

    initialize();
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
                hightLightForm={hightLightForm}
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
                      onClick={() => {
                        setHblArray((prev) => [
                          ...prev,
                          prev[prev.length - 1] + 1 || 0,
                        ]);
                        setTabDefaultVal(hblArray.length, setFormData, mode);
                      }}
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
                          hightLightForm={hightLightForm}
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
                            hightLightForm={hightLightForm}
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
                                index,
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
                            hightLightForm={hightLightForm}
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
                                index,
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
                            hightLightForm={hightLightForm}
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
                            hightLightForm={hightLightForm}
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
                          hightLightForm={hightLightForm}
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
                setRejectState,
              )
            : requestStatusFun.rejectHandler(
                mode,
                hblStatus,
                rejectState,
                setRejectState,
              )
        }
      />
    </ThemeProvider>
  );
}
