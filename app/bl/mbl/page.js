"use client";
import { useEffect, useState } from "react";
import { ThemeProvider, Box, Typography } from "@mui/material";
import {
  mappingConsigneeToNotify,
  mappingConsigneeToNotifyNoPan,
  totalFieldData,
  gridButtons,
  fieldData,
} from "./mblData";
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
  getUserByCookies,
  setInputValue,
  useNextPrevData,
  validatePanCard,
  validPinCode,
} from "@/utils";
import { fetchForm, getDataWithCondition, insertUpdateForm } from "@/apis";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import {
  checkNoPackages,
  craeateHandleChangeEventFunction,
  createdHandleBlurEventFunctions,
  getPortBasedOnCountry,
  removePrevInputName,
  storeApiResult,
  useTotalGrossAndPack,
} from "./utils";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";

export default function Home() {
  const { mode, setMode } = formStore();
  const [formData, setFormData] = useState({
    blStatus: mode?.mode === null ? "D" : "",
  });
  const [fieldsMode, setFieldsMode] = useState("");
  const [jsonData, setJsonData] = useState(fieldData);
  const [totals, setTotals] = useState({});
  const [packTypeState, setPackTypeState] = useState(null);
  const [submitBtn, setSubmitBtn] = useState(false);
  const userData = getUserByCookies();

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
    const packageMismatchError = checkNoPackages({
      formData: formData,
      hblType: "MBL",
    });
    if (packageMismatchError) {
      toast.error(packageMismatchError);
      return;
    }

    const format = formatFormData(
      "tblBl",
      {
        ...formData,
        mblHblFlag: "MBL",
        locationId: userData?.location || null,
      },
      mode.formId,
      "blId"
    );

    const { success, error, message } = await insertUpdateForm(format);
    if (success) {
      toast.success(message);
      if (mode.mode !== "edit") {
        setSubmitBtn(true);
      }
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

  const handleChangeEventFunctions = craeateHandleChangeEventFunction({
    setFormData,
    formData,
  });

  const handleBlurEventFunctions = createdHandleBlurEventFunctions({
    setFormData,
    formData,
  });

  useEffect(() => {
    if (formData?.tblBlContainer) {
      let packType = formData?.tblBlContainer?.[0]?.packageId;
      const totalGrossAndPack = formData?.tblBlContainer?.reduce(
        (sum, cur) => {
          sum.grossWt += Number(cur?.grossWt || 0);
          sum.netWt += Number(cur?.netWt || 0);
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
        { grossWt: 0, noOfPackages: 0, packType: packType, netWt: 0 }
      );
      const updateForm = {
        ...formData,
        grossWt: totalGrossAndPack?.grossWt,
        netWt: totalGrossAndPack?.netWt,
        noOfPackages: totalGrossAndPack?.noOfPackages,
        packageId: totalGrossAndPack?.packType,
      };
      setFormData(updateForm);
    }
  }, [formData?.tblBlContainer]);

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
      } else {
        toast.error(error || message);
      }
    }
    fetchFormHandler();
  }, [mode.formId]);

  //  this useEffect is used for Auto set values
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      companyId: {
        Id: userData.companyId,
        Name: userData.companyName,
      },
      companyBranchId: {
        Id: userData.branchId,
        Name: userData.branchName,
      },
      ...(!mode?.formId
        ? {
            // set only if empty, for safety
            ...(!prev?.shippingLineId && {
              shippingLineId: {
                Id: userData.companyId,
                Name: userData.companyName,
              },
            }),
            ...(!prev?.mloId && {
              mloId: {
                Id: userData.companyId,
                Name: userData.companyName,
              },
            }),
          }
        : {}),
    }));
    if (mode?.formId) return;

    let cancelled = false;

    async function getMblData() {
      try {
        const itemTypeObj = {
          columns:
            "m.id as Id, ISNULL(m.code,'') + ' - ' + ISNULL(m.name,'') as Name",
          tableName: "tblMasterData m",
          whereCondition: `
          m.masterListName = 'tblItemType'
          AND ISNULL(m.code,'') + ' - ' + ISNULL(m.name,'') = 'OT - Other Cargo'
        `,
        };

        const itemTypeRes = await getDataWithCondition(itemTypeObj);
        if (
          !cancelled &&
          itemTypeRes?.success &&
          Array.isArray(itemTypeRes.data) &&
          itemTypeRes.data.length > 0
        ) {
          setFormData((prev) =>
            // don't override if something already set later by user/fetch
            prev?.blTypeId ? prev : { ...prev, blTypeId: itemTypeRes.data[0] }
          );
        }
        const natureObj = {
          columns:
            "m.id as Id, ISNULL(m.code,'') + ' - ' + ISNULL(m.name,'') as Name",
          tableName: "tblMasterData m",
          whereCondition: `
          m.masterListName = 'tblTypeOfShipment'
          AND ISNULL(m.code,'') + ' - ' + ISNULL(m.name,'') = 'C - Containerised Cargo'
        `,
        };
        const natureRes = await getDataWithCondition(natureObj);
        if (
          !cancelled &&
          natureRes?.success &&
          Array.isArray(natureRes.data) &&
          natureRes.data.length > 0
        ) {
          setFormData((prev) =>
            prev?.natureOfCargoId
              ? prev
              : { ...prev, natureOfCargoId: natureRes.data[0] }
          );
        }
        const cinObj = {
          columns: "m.id as Id, m.name as Name",
          tableName: "tblMasterData m",
          whereCondition: `
          m.masterListName = 'tblCINType'
          AND m.name = 'PCIN'
        `,
        };

        const cinRes = await getDataWithCondition(cinObj);
        if (
          !cancelled &&
          cinRes?.success &&
          Array.isArray(cinRes.data) &&
          cinRes.data.length > 0
        ) {
          setFormData((prev) =>
            // don't override if user / fetch already set
            prev?.cinType ? prev : { ...prev, cinType: cinRes.data[0] }
          );
        }

        const obj = {
          columns: "id as Id, name as Name",
          tableName: "tblMasterData",
          whereCondition: `masterListName = 'tblPackage' and name = 'PACKAGES' and status = 1`,
        };
        const { data, success } = await getDataWithCondition(obj);
        if (success) {
          setPackTypeState(data[0]);
        }
      } catch (e) {
        if (!cancelled) {
          console.error("Error in getMblData:", e);
        }
      }
    }
    getMblData();
  }, []);



  return (
    <ThemeProvider theme={theme}>
      <form onSubmit={submitHandler}>
        <section className="py-2 px-4">
          <Box className="flex justify-between items-center mb-2">
            <h1 className="text-left text-base m-0">MBL</h1>
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
            <Box className="grid grid-cols-4 items-end gap-2 p-2 ">
              <CustomInput
                fields={jsonData.mblFields}
                formData={formData}
                setFormData={setFormData}
                fieldsMode={fieldsMode}
                handleChangeEventFunctions={handleChangeEventFunctions}
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
                    handleChangeEventFunctions={handleChangeEventFunctions}
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
              <FormHeading text="Bond Details">
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
                        mappingConsigneeToNotify,
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
                    handleBlurEventFunctions={handleBlurEventFunctions}
                  />
                </Box>
              </FormHeading>
              <FormHeading
                text="Notify Details"
                buttons={[
                  {
                    text: "Copy Consignee Details",
                    onClick: () => {
                      const consigneeTypeName = formData?.consigneeTypeId?.Name;

                      const mapping =
                        consigneeTypeName === "PAN"
                          ? mappingConsigneeToNotify
                          : mappingConsigneeToNotifyNoPan;

                      copyHandler(
                        formData,
                        setFormData,
                        "right",
                        mapping,
                        "Consignee details copied to Notify!"
                      );
                    },
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
                    handleBlurEventFunctions={handleBlurEventFunctions}
                  />
                </Box>
              </FormHeading>

              <Box className="grid grid-cols-5 gap-2 p-2 ">
                <CustomInput
                  fields={jsonData.hblBottomFields}
                  formData={formData}
                  setFormData={setFormData}
                  fieldsMode={fieldsMode}
                  handleBlurEventFunctions={handleBlurEventFunctions}
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
                buttons={gridButtons}
                handleBlurEventFunctions={handleBlurEventFunctions}
              />
            </Box>
            {/* <Box display="flex" justifyContent="center" mt={2}>
              {fieldsMode === "" && <AgreeTerms />}
            </Box> */}
          </Box>
          <Box className="w-full flex mt-2">
            {fieldsMode !== "view" && (
              <CustomButton
                text={"Submit"}
                type="submit"
                disabled={submitBtn}
              />
            )}
          </Box>
        </section>
      </form>
      <ToastContainer />
    </ThemeProvider>
  );
}
