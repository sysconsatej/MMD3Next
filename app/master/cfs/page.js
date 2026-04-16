"use client";

import { useState, useEffect } from "react";
import { ThemeProvider, Box } from "@mui/material";
import data, { branchGridButtons } from "./cfsData";
import { CustomInput } from "@/components/customInput";
import { theme } from "@/styles";
import { toast, ToastContainer } from "react-toastify";
import CustomButton from "@/components/button/button";
import { fetchForm, getDataWithCondition, insertUpdateForm } from "@/apis";
import {
  formatDataWithForm,
  formatFetchForm,
  formatFormData,
  getUserByCookies,
} from "@/utils";
import { formStore } from "@/store";
import TableGrid from "@/components/tableGrid/tableGrid";
import { handleBlur, handleChange, initialHandler } from "./utils";

export default function Cfs() {
  const [formData, setFormData] = useState({});
  const [fieldsMode, setFieldsMode] = useState("");
  const [jsonData, setJsonData] = useState(data);
  const { mode, setMode } = formStore();
  const [errorState, setErrorState] = useState({});
  const userData = getUserByCookies();
  const isAdmin = userData?.roleCode === "admin";

  const submitHandler = async (event) => {
    event.preventDefault();
    const payload = { ...formData };

    if (isAdmin) {
      delete payload.companyId;
    } else {
      payload.companyId = userData?.companyId;
    }

    const format = formatFormData("tblPort", payload, mode.formId, "portId");
    const { success, error, message } = await insertUpdateForm(format);
    if (success) {
      toast.success(message);
      setFormData({});
    } else {
      toast.error(error || message);
    }
  };

  const handleBlurEventFunctions = handleBlur({
    mode,
    setErrorState,
    setFormData,
    formData,
  });

  const handleChangeEventFunctions = handleChange({ setJsonData });

  useEffect(() => {
    async function fetchFormHandler() {
      if (mode.formId) {
        setFieldsMode(mode.mode);
        const format = formatFetchForm(
          data,
          "tblPort",
          mode.formId,
          '["tblPortDetails"]',
          "portId",
        );
        const { success, result, message, error } = await fetchForm(format);
        if (success) {
          const getData = formatDataWithForm(result, data);
          setFormData(
            isAdmin
              ? { ...getData }
              : { ...getData, companyId: userData?.companyId },
          );
        } else {
          toast.error(error || message);
        }
      }
    }

    fetchFormHandler();
  }, [mode.formId]);

  useEffect(() => {
    async function renderInit() {
      await initialHandler({ setFormData, mode });
    }
    renderInit();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <form onSubmit={submitHandler}>
        <section className="py-1 px-4">
          <Box className="flex justify-between items-end py-1">
            <h1 className="text-left text-base flex items-end m-0 ">
              Container Freight Station
            </h1>
            <CustomButton
              text="Back"
              href="/master/cfs/list"
              onClick={() => setMode({ mode: null, formId: null })}
            />
          </Box>
          <Box className="border border-solid border-black rounded-[4px] ">
            <Box className="sm:grid sm:grid-cols-4 gap-2 flex flex-col p-1 border-b border-b-solid border-b-black ">
              <CustomInput
                fields={jsonData.cfsFields}
                formData={formData}
                setFormData={setFormData}
                fieldsMode={fieldsMode}
                handleBlurEventFunctions={handleBlurEventFunctions}
                handleChangeEventFunctions={handleChangeEventFunctions}
                errorState={errorState}
              />
            </Box>
            <Box className="p-1">
              <TableGrid
                fields={jsonData.tblPortDetails}
                formData={formData}
                setFormData={setFormData}
                fieldsMode={mode.mode}
                gridName="tblPortDetails"
                buttons={branchGridButtons}
              />
            </Box>
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
