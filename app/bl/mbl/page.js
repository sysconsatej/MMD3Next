"use client";
import { useEffect, useState } from "react";
import { ThemeProvider, Box, Typography } from "@mui/material";
import { mapping, totalFieldData, gridButtons, fieldData } from "./mblData";
import { CustomInput } from "@/components/customInput";
import { theme } from "@/styles";
import { toast, ToastContainer } from "react-toastify";
import CustomButton from "@/components/button/button";
import TableGrid from "@/components/tableGrid/tableGrid";
import FormHeading from "@/components/formHeading/formHeading";
import { formStore } from "@/store";
import {
  copyHandler,
  formatDataWithForm,
  formatFetchForm,
  formatFormData,
  setInputValue,
  useNextPrevData,
} from "@/utils";
import { fetchForm, getDataWithCondition, insertUpdateForm } from "@/apis";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { useTotalGrossAndPack } from "./utils";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
// import AgreeTerms from "@/components/agreeTerms/agreeTerms";

export default function Home() {
  const [formData, setFormData] = useState({});
  const [fieldsMode, setFieldsMode] = useState("");
  const [jsonData, setJsonData] = useState(fieldData);
  const { mode, setMode } = formStore();
  const [gridStatus, setGridStatus] = useState(null);
  const [totals, setTotals] = useState({});

  useTotalGrossAndPack(formData, setTotals);
  const { prevId, nextId, prevLabel, nextLabel, canPrev, canNext } =
    useNextPrevData({
      currentId: mode.formId,
      tableName: "tblBl",
      labelField: `mblNo curName, id  curId, lag(mblNo) over (order by createdDate desc) as prevName, lag(id) over (order by createdDate desc) as prevId, lead(mblNo) over (order by createdDate desc) as nextName, lead(id) over (order by createdDate desc) as nextId, createdDate createdDate`,
      orderBy: "createdDate desc",
    });

  const submitHandler = async (event) => {
    event.preventDefault();
    const format = formatFormData(
      "tblBl",
      { ...formData, mblHblFlag: "MBL" },
      mode.formId,
      "blId"
    );
    const { success, error, message } = await insertUpdateForm(format);
    if (success) {
      toast.success(message);
      setFormData({});
      setGridStatus("submit");
    } else {
      toast.error(error || message);
    }
  };

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
          tabName: null,
          gridName: "tblBlContainer",
          tabIndex: null,
          containerIndex: gridIndex,
          name: "sealTypeId",
          value: data[0],
        })
      );
    },
  };

  const handleChangeEventFunctions = {
    setCountryAndState: async (name, value) => {
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
  };

  useEffect(() => {
    async function fetchFormHandler() {
      if (!mode.formId) return;
      setFieldsMode(mode.mode);

      const format = formatFetchForm(
        fieldData,
        "tblBl",
        mode.formId,
        '["tblBlContainer","tblBlPackingList"]',
        "blId"
      );
      const { success, result, message, error } = await fetchForm(format);
      if (success) {
        const getData = formatDataWithForm(result, fieldData);
        setFormData(getData);
        setGridStatus("fetchGrid");
      } else {
        toast.error(error || message);
      }
    }
    fetchFormHandler();
  }, [mode.formId]);

  return (
    <ThemeProvider theme={theme}>
      <form onSubmit={submitHandler}>
        <section className="py-2 px-4">
          <Box className="flex justify-between items-center mb-2">
            <h1 className="text-left text-base m-0">MBL Request</h1>
            <Box className="flex items-center gap-4">
              <CustomInput
                fields={totalFieldData.totalFields}
                formData={totals}
                setFormData={setTotals}
                fieldsMode={"view"}
              />
              <CustomButton
                text="Back"
                href="/bl/mbl/list"
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
            <Box className="border-2 border-solid border-gray-300 p-3 mt-2 ">
              <FormHeading text="Route Details">
                <Box className="grid grid-cols-4 gap-2 p-2 ">
                  <CustomInput
                    fields={jsonData.routeDetails}
                    formData={formData}
                    setFormData={setFormData}
                    fieldsMode={fieldsMode}
                  />
                </Box>
              </FormHeading>
              {/* <FormHeading text="Transit Bond Details(Required if HBLs POD is different than MBLs POD)">
                <Box className="grid grid-cols-6 gap-2 p-2 ">
                  <CustomInput
                    fields={jsonData.transitFields}
                    formData={formData}
                    setFormData={setFormData}
                    fieldsMode={fieldsMode}
                  />
                </Box>
              </FormHeading> */}
              <FormHeading text="TG Bond Details">
                <Box className="grid grid-cols-3 gap-2 p-2 ">
                  <CustomInput
                    fields={jsonData.tgBondDetails}
                    formData={formData}
                    setFormData={setFormData}
                    fieldsMode={fieldsMode}
                  />
                </Box>
              </FormHeading>
              <FormHeading text="Consignor Details">
                <Box className="grid grid-cols-5 gap-2 p-2 ">
                  <CustomInput
                    fields={jsonData.consignorFields}
                    formData={formData}
                    setFormData={setFormData}
                    fieldsMode={fieldsMode}
                    handleChangeEventFunctions={handleChangeEventFunctions}
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
                        "Notify details copied to Consignee!"
                      ),
                    icon: <ContentCopyIcon fontSize="small" />,
                  },
                ]}
              >
                <Box className="grid grid-cols-4 gap-2 p-2 ">
                  <CustomInput
                    fields={jsonData.consigneeFields}
                    formData={formData}
                    setFormData={setFormData}
                    fieldsMode={fieldsMode}
                    handleChangeEventFunctions={handleChangeEventFunctions}
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
                        "Consignee details copied to Notify!"
                      ),
                    icon: <ContentCopyIcon fontSize="small" />,
                  },
                ]}
              >
                <Box className="grid grid-cols-4 gap-2 p-2 ">
                  <CustomInput
                    fields={jsonData.notifyFields}
                    formData={formData}
                    setFormData={setFormData}
                    fieldsMode={fieldsMode}
                    handleChangeEventFunctions={handleChangeEventFunctions}
                  />
                </Box>
              </FormHeading>

              <Box className="grid grid-cols-5 gap-2 p-2 ">
                <CustomInput
                  fields={jsonData.hblBottomFields}
                  formData={formData}
                  setFormData={setFormData}
                  fieldsMode={fieldsMode}
                />
              </Box>
              <FormHeading text="Container Details" />
              <TableGrid
                fields={jsonData.tblBlContainer}
                formData={formData}
                setFormData={setFormData}
                fieldsMode={fieldsMode}
                gridName="tblBlContainer"
                gridStatus={gridStatus}
                buttons={gridButtons}
                handleGridEventFunctions={handleGridEventFunctions}
                handleChangeEventFunctions={handleChangeEventFunctions}
              />
              <FormHeading text="Item Details" />
              <TableGrid
                fields={jsonData.tblBlPackingList}
                formData={formData}
                setFormData={setFormData}
                fieldsMode={fieldsMode}
                gridName="tblBlPackingList"
                buttons={gridButtons}
              />
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
            {/* <Box display="flex" justifyContent="center" mt={2}>
              {fieldsMode === "" && <AgreeTerms />}
            </Box> */}
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
