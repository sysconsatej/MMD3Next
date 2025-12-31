"use client";
import { useState, useEffect, useMemo } from "react";
import { ThemeProvider, Box } from "@mui/material";
import { cfsGridButtons, fieldData } from "./fieldsData";
import { CustomInput } from "@/components/customInput";
import { theme } from "@/styles";
import { toast, ToastContainer } from "react-toastify";
import CustomButton from "@/components/button/button";
import {
  fetchForm,
  getDataWithCondition,
  insertUpdateForm,
  updateStatusRows,
} from "@/apis";
import { formatDataWithForm, formatFetchForm, formatFormData } from "@/utils";
import FormHeading from "@/components/formHeading/formHeading";
import TableGrid from "@/components/tableGrid/tableGrid";
import { formStore } from "@/store";
import { handleBlur, handleChange } from "./utils";
import { getUserByCookies } from "@/utils";
import { useSetDefault } from "./hooks";

export default function Company() {
  const { mode, setMode } = formStore();
  const [formData, setFormData] = useState({});
  const [jsonData, setJsonData] = useState(fieldData);
  const [fieldsMode, setFieldsMode] = useState("");
  const [errorState, setErrorState] = useState({});
  const userData = getUserByCookies();
  const [disableBtn, setDisableBtn] = useState(true);
  useSetDefault({ userData, setFormData, mode: mode });

  const submitHandler = async (event) => {
    event.preventDefault();
    const format = formatFormData(
      "tblBl",
      { ...formData, cfsRequestCreatedBy: userData?.userId },
      mode.formId,
      "blId"
    );
    const { success, error, message } = await insertUpdateForm(format);
    if (success) {
      toast.success(message);
      setDisableBtn((prev) => ({ ...prev, submit: true }));
      setJsonData((prev) => {
        return {
          ...prev,
          fields: prev.fields.map((r) => {
            return { ...r, disabled: true };
          }),
          tblAttachment: prev.tblAttachment.map((r) => {
            return { ...r, disabled: true };
          }),
        };
      });
    } else {
      toast.error(error || message);
    }
  };

  const handleChangeEventFunctions = handleChange({
    setFormData,
    formData,
    setJsonData,
  });

  const handleBlurEventFunctions = handleBlur({
    setFormData,
    formData,
    setMode,
  });

  const updateStatusToRequest = async (event) => {
    event.preventDefault();
    try {
      const payload = {
        columns: "m.id , m.name",
        tableName: "tblMasterData m",
        whereCondition: `m.masterListName = 'tblCfsStatusType' AND m.name = 'Request'`,
      };
      const getStatusId = await getDataWithCondition(payload);
      if (getStatusId) {
        const rowsPayload = [
          {
            id: mode?.formId,
            cfsRequestStatusId: getStatusId?.data[0]?.id,
            updatedBy: userData.userId,
            updatedDate: new Date(),
          },
        ];
        const res = await updateStatusRows({
          tableName: "tblBl",
          rows: rowsPayload,
          keyColumn: "id",
        });

        if (res?.success === true) {
          setFormData((prev) => {
            return {
              ...prev,
              cfsRequestStatusId: {
                Id: getStatusId?.data[0]?.id,
                Name: getStatusId?.data[0]?.name,
              },
            };
          });
          toast.success("This CFS is Requested");
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    async function fetchFormHandler() {
      if (!mode?.formId) return;

      setFieldsMode(mode?.mode);
      const format = formatFetchForm(
        fieldData,
        "tblBl",
        mode?.formId,
        '["tblAttachment"]',
        "blId"
      );
      const { success, result, message, error } = await fetchForm(format);
      if (success) {
        const getData = formatDataWithForm(result, fieldData);
        setFormData(getData);
        setDisableBtn(false);
        handleChangeEventFunctions?.setCfsAndDpd(
          "shippingLineId",
          getData?.shippingLineId
        );
      } else {
        toast.error(error || message);
      }
    }

    fetchFormHandler();
  }, [mode]);

  return (
    <ThemeProvider theme={theme}>
      <form onSubmit={submitHandler}>
        <section className="py-1 px-4">
          <Box className="flex justify-between items-end py-1">
            <h1 className="text-left text-base flex items-end m-0 ">
              Create Request For CFS
            </h1>
            {userData?.roleCode === "customer" && (
              <CustomButton
                text="Back"
                href="/bl/cfs-request/list"
                onClick={() => setMode({ mode: null, formId: null })}
              />
            )}
            {userData?.roleCode === "shipping" && (
              <CustomButton
                text="Back"
                href="/bl/cfs-request/liner"
                onClick={() => setMode({ mode: null, formId: null })}
              />
            )}
          </Box>
          <FormHeading text="MBL Details" />
          <Box className="grid grid-cols-4 items-end gap-2 p-2 ">
            <CustomInput
              fields={jsonData.fields}
              formData={formData}
              setFormData={setFormData}
              fieldsMode={fieldsMode}
              handleBlurEventFunctions={handleBlurEventFunctions}
              handleChangeEventFunctions={handleChangeEventFunctions}
            />
          </Box>
          <Box className="border-2 border-solid border-gray-300 p-3 mt-2 ">
            <FormHeading text="Attachment Details" />
            <TableGrid
              fields={jsonData.tblAttachment}
              formData={formData}
              setFormData={setFormData}
              fieldsMode={mode.mode}
              gridName="tblAttachment"
              tabName={""}
              buttons={cfsGridButtons}
              handleGridEventFunctions={{}}
              handleBlurEventFunctions={{}}
              handleChangeEventFunctions={{}}
            />
          </Box>
          <Box className="w-full flex mt-2 gap-3 ">
            {fieldsMode !== "view" && (
              <CustomButton
                text={"Submit"}
                type="submit"
                disabled={disableBtn}
              />
            )}
            <CustomButton
              text={"Request"}
              onClick={updateStatusToRequest}
              disabled={disableBtn}
            />
          </Box>
        </section>
      </form>
      <ToastContainer />
    </ThemeProvider>
  );
}
