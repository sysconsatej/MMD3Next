"use client";

import { useState, useEffect } from "react";
import { ThemeProvider, Box } from "@mui/material";
import data from "./isoCodeData";
import { CustomInput } from "@/components/customInput";
import { theme } from "@/styles";
import { toast, ToastContainer } from "react-toastify";
import CustomButton from "@/components/button/button";
import { fetchForm, insertUpdateForm } from "@/apis";
import { formatDataWithForm, formatFetchForm, formatFormData } from "@/utils";
import { formStore } from "@/store";

export default function IscCode() {
  const [formData, setFormData] = useState({});
  const [fieldsMode, setFieldsMode] = useState("");
  const [jsonData, setJsonData] = useState(data);
  const { mode, setMode } = formStore();
  const [errorState, setErrorState] = useState({});

  const submitHandler = async (event) => {
    event.preventDefault();
    const format = formatFormData("tblIsocode", formData, mode.formId);
    const { success, error, message } = await insertUpdateForm(format);
    if (success) {
      toast.success(message);
      setFormData({});
    } else {
      toast.error(error || message);
    }
  };
  const handleBlurEventFunctions = {
    isoCodeSizeGate: (event) => {
      const fieldName = event.target.name || "isocode";
      const iso = String(event.target.value ?? "")
        .trim()
        .toUpperCase();

      setFormData((p) => ({ ...p, [fieldName]: iso }));

      const sel = formData?.sizeId;
      const sizeText =
        (sel && (sel.Name || sel.name)) ?? (sel != null ? String(sel) : "");

      if (!sizeText) {
        toast.error("Please select a Size before entering ISO Code.");
        setErrorState?.((p) => ({ ...p, [fieldName]: true }));
        setTimeout(() => {
          setFormData((p) => ({ ...p, [fieldName]: "" }));
        }, 0);
        return false;
      }

      if (!iso) {
        toast.error("ISO Code is required.");
        setErrorState?.((p) => ({ ...p, [fieldName]: true }));
        return false;
      }

      const firstDigit = (sizeText.trim().match(/\d/) || [])[0];
      if (!firstDigit) {
        setErrorState?.((p) => ({ ...p, [fieldName]: false }));
        return true;
      }

      if (!iso.startsWith(firstDigit)) {
        toast.error(
          `Invalid ISO Code for Size ${sizeText}. It must start with '${firstDigit}'.`
        );
        setErrorState?.((p) => ({ ...p, [fieldName]: true }));
        setTimeout(() => {
          setFormData((p) => ({ ...p, [fieldName]: "" }));
        }, 0);
        return false;
      }

      setErrorState?.((p) => ({ ...p, [fieldName]: false }));
      return true;
    },
  };

  useEffect(() => {
    async function fetchFormHandler() {
      if (mode.formId) {
        setFieldsMode(mode.mode);
        const format = formatFetchForm(data, "tblIsocode", mode.formId);
        const { success, result, message, error } = await fetchForm(format);
        if (success) {
          const getData = formatDataWithForm(result, data);
          setFormData(getData);
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
              ISO Code
            </h1>
            <CustomButton
              text="Back"
              href="/master/isoCode/list"
              onClick={() => setMode({ mode: null, formId: null })}
            />
          </Box>
          <Box className="border border-solid border-black rounded-[4px] ">
            <Box className="sm:grid sm:grid-cols-3 gap-2 flex flex-col p-1 border-b border-b-solid border-b-black ">
              <CustomInput
                fields={jsonData.isoCodeFields}
                formData={formData}
                setFormData={setFormData}
                fieldsMode={fieldsMode}
                handleBlurEventFunctions={handleBlurEventFunctions}
                errorState={errorState}
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
