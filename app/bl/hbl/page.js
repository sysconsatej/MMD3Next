"use client";
import { useEffect, useState } from "react";
import { ThemeProvider, Box, Typography, Tab, Tabs } from "@mui/material";
import { mapping, totalFieldData, gridButtons, fieldData } from "./hblData";
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
  useNextPrevData,
} from "@/utils";
import { deleteRecord, fetchForm, insertUpdateForm } from "@/apis";
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

  const handleChangeTab = (event, newValue) => {
    setTabValue(newValue);
  };

  useTotalGrossAndPack(formData, setTotals);
  // const { prevId, nextId, prevLabel, nextLabel, canPrev, canNext } =
  //   useNextPrevData({
  //     currentId: mode.formId,
  //     tableName: "tblBl",
  //     labelField: "mblNo",
  //     orderBy: "createdDate desc",
  //   });

  const submitHandler = async (event) => {
    event.preventDefault();
    const format = formFormatThirdLevel(formData);
    const promises = format.map(async (item) => {
      const formId = item?.id ?? null;
      const { id, ...resData } = item;
      const formatItem = formatFormData("tblBl", resData, formId, "blId");
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
          '["tblBlContainer", "tblBlPackingList"]',
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
        [...jsonData.mblFields, ...jsonData.csnFields],
        "tblBl"
      );
      setFormData(formatState);
      setHblArray(
        Array.from({ length: formatState.tblBl.length }, (_, i) => i)
      );
    }
    fetchFormHandler();
  }, [mode.formId]);

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
          {/* {(fieldsMode === "view" || fieldsMode === "edit") && (
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
          )} */}

          <Box>
            <FormHeading text="MBL Details" />
            <Box className="grid grid-cols-5 items-end gap-2 p-2 ">
              <CustomInput
                fields={jsonData.mblFields}
                formData={formData}
                setFormData={setFormData}
                fieldsMode={fieldsMode}
              />
            </Box>
            <FormHeading text="CSN">
              <Box className="grid grid-cols-6 gap-2 p-2 ">
                <CustomInput
                  fields={jsonData.csnFields}
                  formData={formData}
                  setFormData={setFormData}
                  fieldsMode={fieldsMode}
                />
              </Box>
            </FormHeading>
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
                        label={`HBL (${
                          formData?.tblBl?.[index]?.hblNo || item + 1
                        })`}
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
                        <Box className="grid grid-cols-6 gap-2 p-2 ">
                          <CustomInput
                            fields={jsonData.notifyFields}
                            formData={formData}
                            setFormData={setFormData}
                            fieldsMode={fieldsMode}
                            tabName={"tblBl"}
                            tabIndex={index}
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
                        fieldsMode={fieldsMode}
                        gridName="tblBlContainer"
                        buttons={gridButtons}
                        tabName={"tblBl"}
                        tabIndex={index}
                      />
                      <FormHeading text="Item Details" />
                      <TableGrid
                        fields={jsonData.tblBlPackingList}
                        formData={formData}
                        setFormData={setFormData}
                        fieldsMode={fieldsMode}
                        gridName="tblBlPackingList"
                        buttons={gridButtons}
                        tabName={"tblBl"}
                        tabIndex={index}
                      />
                    </Box>
                  </CustomTabPanel>
                );
              })}
            </Box>
            <Box className="border border-gray-300 p-3 mt-2 flex flex-col gap-1">
              <Typography variant="caption" className="text-red-500">
                Total Attachment size should not exceed 3MB for the Request
              </Typography>
              <CustomInput
                fields={jsonData.attachmentFields}
                formData={formData}
                setFormData={setFormData}
                fieldsMode={fieldsMode}
              />
            </Box>
            <Box display="flex" justifyContent="center" mt={2}>
              {fieldsMode === "" && <AgreeTerms />}
            </Box>
          </Box>
          <Box className="w-full flex mt-2">
            {fieldsMode !== "view" && (
              <CustomButton text={"Submit"} type="submit" />
            )}
          </Box>
        </section>
      </form>
      <ToastContainer />
    </ThemeProvider>
  );
}
