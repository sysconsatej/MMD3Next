"use client";

import { useState, useEffect } from "react";
import { ThemeProvider, Box } from "@mui/material";
import { fieldData } from "./updateCsnData";
import { CustomInput } from "@/components/customInput";
import { theme } from "@/styles";
import { toast, ToastContainer } from "react-toastify";
import CustomButton from "@/components/button/button";
import { fetchForm, insertUpdateForm } from "@/apis";
import {
  formatDataWithForm,
  formatFetchForm,
  formatFormData,
  getUserByCookies,
} from "@/utils";
import { formStore } from "@/store";
import { createBlurFunc, createHandleChangeFunc, requestHandler } from "./utils";
import { useGetUserAccessUtils } from "@/utils/getUserAccessUtils";

export default function Cfs() {
  const [formData, setFormData] = useState({});
  const [fieldsMode, setFieldsMode] = useState("");
  const [jsonData, setJsonData] = useState(fieldData);
  const [disableSubmit, setDisableSubmit] = useState(false);
  const [disableRequest, setDisableRequest] = useState(true);
  const { mode, setMode } = formStore();
  const userData = getUserByCookies();
  const userAccess = useGetUserAccessUtils()?.data || {};

  const submitHandler = async (event) => {
    event.preventDefault();
    let userCommonData = {};
    if (userData.roleCode === "customer") {
      userCommonData = {
        locationId: userData?.location,
        companyId: userData?.companyId,
      };
    }
    const format = formatFormData(
      "tblCsn",
      { ...formData, ...userCommonData },
      mode.formId,
    );
    const { success, error, message } = await insertUpdateForm(format);
    if (success) {
      toast.success(message);
      setDisableSubmit(true);
      setDisableRequest(false);
    } else {
      toast.error(error || message);
    }
  };

  const handleChangeEventFunctions = createHandleChangeFunc({
    setFormData,
    formData,
  });

  const handleBlurEventFunctions = createBlurFunc({
    setFormData,
    setJsonData,
    jsonData,
  });

  useEffect(() => {
    async function fetchFormHandler() {
      if (mode.formId) {
        setFieldsMode(mode.mode);
        const format = formatFetchForm(jsonData, "tblCsn", mode.formId);
        const { success, result, message, error } = await fetchForm(format);
        if (success) {
          const getData = formatDataWithForm(result, jsonData);
          setFormData({ ...getData });
        } else {
          toast.error(error || message);
        }
      }
    }

    fetchFormHandler();
  }, [mode.formId]);

  return (
    <ThemeProvider theme={theme}>
      <form onSubmit={submitHandler}>
        <section className="py-1 px-4">
          <Box className="flex justify-between items-end py-1">
            <h1 className="text-left text-base flex items-end m-0 ">
              Update CSN
            </h1>
            {userData?.roleCode === "customer" && (
              <CustomButton
                text="Back"
                href="/bl/updateCsn/list"
                onClick={() => setMode({ mode: null, formId: null })}
              />
            )}
            {userData?.roleCode === "shipping" && (
              <CustomButton
                text="Back"
                href="/bl/updateCsn/liner"
                onClick={() => setMode({ mode: null, formId: null })}
              />
            )}
            {userData?.roleCode === "admin" && (
              <CustomButton
                text="Back"
                href={`/bl/updateCsn/${mode?.path}`}
                onClick={() => setMode({ mode: null, formId: null })}
              />
            )}
          </Box>
          <Box className="border border-solid border-black rounded-[4px] ">
            <Box className="sm:grid sm:grid-cols-4 gap-2 flex flex-col p-1 border-b border-b-solid border-b-black ">
              <CustomInput
                fields={jsonData.mblFields}
                formData={formData}
                setFormData={setFormData}
                fieldsMode={fieldsMode}
                handleChangeEventFunctions={handleChangeEventFunctions}
                handleBlurEventFunctions={handleBlurEventFunctions}
              />
            </Box>
          </Box>
          <Box className="w-full flex mt-2 gap-3 ">
            {mode?.mode !== "view" &&
              (userData?.roleCode === "customer" ||
                userData?.roleCode === "admin") && (
                <CustomButton
                  text={"Submit"}
                  type="submit"
                  disabled={disableSubmit}
                />
              )}
            {(userData?.roleCode === "customer" ||
              userData?.roleCode === "admin") &&
              userAccess?.["request"] && (
                <CustomButton
                  text={"Request"}
                  onClick={() => requestHandler(formData, setDisableRequest)}
                  disabled={disableRequest}
                />
              )}
          </Box>
        </section>
      </form>
      <ToastContainer />
    </ThemeProvider>
  );
}
