"use client";
import { useState, useEffect, useMemo } from "react";
import { ThemeProvider, Box } from "@mui/material";
import { cfsData, cfsGridButtons, fieldData } from "./fieldsData";
import { CustomInput } from "@/components/customInput";
import { theme } from "@/styles";
import { toast, ToastContainer } from "react-toastify";
import CustomButton from "@/components/button/button";
import { fetchForm, getDataWithCondition, insertUpdateForm } from "@/apis";
import {
  formatDataWithForm,
  formatFetchForm,
  formatFormData,
  setInputValue,
} from "@/utils";
import FormHeading from "@/components/formHeading/formHeading";
import TableGrid from "@/components/tableGrid/tableGrid";
import { formStore } from "@/store";
import { handleBlur, handleChange } from "./utils";
import { getUserByCookies } from "@/utils";
import { useSetDefault } from "./hooks";

export default function Company() {
  const { mode, setMode } = formStore();
  const [formData, setFormData] = useState({});
  const [fieldsMode, setFieldsMode] = useState("");
  const [errorState, setErrorState] = useState({});
  const userData = getUserByCookies();
  const [mlblId, setMblId] = useState(null);

  const submitHandler = async (event) => {
    event.preventDefault();
    const format = formatFormData("tblBl", formData, mode.formId, "tblBl");
    const { success, error, message } = await insertUpdateForm(format);
    if (success) {
      toast.success(message);
      setFormData({});
    } else {
      toast.error(error || message);
    }
  };

  //  to set default values on 1st render
  useSetDefault({ userData, setFormData });

  useEffect(() => {
    async function fetchFormHandler() {
      if (!mlblId) return;

      setFieldsMode(mode?.mode);
      const format = formatFetchForm(
        fieldData,
        "tblBl",
        mlblId,
        '["tblAttachment"]',
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
  }, [mlblId, mode?.mode]);
  const handleChangeEventFunctions = handleChange({ setFormData, formData });

  const handleBlurEventFunctions = handleBlur({
    setFormData,
    formData,
    setMblId,
  });

  return (
    <ThemeProvider theme={theme}>
      <form onSubmit={submitHandler}>
        <section className="py-1 px-4">
          <Box className="flex justify-between items-end py-1">
            <h1 className="text-left text-base flex items-end m-0 ">
              Create Request For CFS
            </h1>
            <CustomButton
              text="Back"
              href="/bl/cfs-request/list"
              onClick={() => setMode({ mode: null, formId: null })}
            />
          </Box>
          <FormHeading text="MBL Details" />
          <Box className="grid grid-cols-4 items-end gap-2 p-2 ">
            <CustomInput
              fields={fieldData.fields}
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
              fields={fieldData.tblAttachment}
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
          <Box className="w-full flex mt-2 ">
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
