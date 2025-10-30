"use client";

import { useState, useEffect, useMemo } from "react";
import { ThemeProvider, Box } from "@mui/material";
import data from "./imoData";
import { CustomInput } from "@/components/customInput";
import { theme } from "@/styles";
import { toast, ToastContainer } from "react-toastify";
import CustomButton from "@/components/button/button";
import { fetchForm, getDataWithCondition, insertUpdateForm } from "@/apis";
import { formatDataWithForm, formatFetchForm, formatFormData } from "@/utils";
import { formStore } from "@/store";

export default function IMO() {
  const [formData, setFormData] = useState({});
  const [fieldsMode, setFieldsMode] = useState("");
  const [errorState, setErrorState] = useState({});
  const jsonData = data;
  const { mode, setMode } = formStore();

  const hasErrors = useMemo(() => Object.values(errorState).some(Boolean), [errorState]);

  const handleBlurEventFunctions = {
    duplicateHandler: async (event) => {
      const { value, name } = event.target;
      let raw = String(value ?? "").trim();

      if (name === "unNo") {
        const digits = raw.replace(/\D/g, "");
        const normalized = digits.slice(0, 4);
        if (normalized !== formData.unNo) setFormData((p) => ({ ...p, unNo: normalized }));
        if (normalized.length !== 4) {
          setErrorState((p) => ({ ...p, [name]: true }));
          toast.error("UN No must be exactly 4 digits.");
          return;
        }
        raw = normalized;
      }

      const cleaned = raw.replace(/'/g, "''");
      const where = `${name} = '${cleaned}' and status = 1${mode?.formId ? ` AND id <> ${mode.formId}` : ""}`;
      const res = await getDataWithCondition({ columns: "id", tableName: "tblImo", whereCondition: where });

      const dup = Array.isArray(res?.data) ? res.data.length > 0 : !!res?.success;
      setErrorState((p) => ({ ...p, [name]: dup }));
      if (dup) toast.error(`Duplicate ${name}!`);
    },
  };

  async function validateBeforeSubmit() {
    const fields = jsonData?.imoFields || [];
    const nextErrors = {};

    for (const f of fields) {
      if (f.required) {
        const v = formData?.[f.name];
        if (v === undefined || v === null || String(v).trim() === "") nextErrors[f.name] = true;
      }
    }

    const un = String(formData?.unNo ?? "").replace(/\D/g, "");
    if (un.length !== 4) nextErrors.unNo = true;

    const excludeSelf = mode?.formId ? ` AND id <> ${mode.formId}` : "";
    if (un.length === 4) {
      const where = `[unNo] = '${un}' AND status = 1${excludeSelf}`;
      const res = await getDataWithCondition({ columns: "id", tableName: "tblImo", whereCondition: where });
      const dup = Array.isArray(res?.data) ? res.data.length > 0 : !!res?.success;
      if (dup) nextErrors.unNo = true;
      if (dup) toast.error("Duplicate unNo!");
    }

    if (Object.keys(nextErrors).length) {
      setErrorState((p) => ({ ...p, ...nextErrors }));
      if (nextErrors.unNo && !hasErrors) toast.error("Please fix UN No.");
      return false;
    }
    return true;
  }

  const submitHandler = async (event) => {
    event.preventDefault();

    if (hasErrors) {
      toast.error("Please fix highlighted fields.");
      return;
    }

    const ok = await validateBeforeSubmit();
    if (!ok) return;

    const format = formatFormData("tblImo", formData, mode.formId);
    const { success, error, message } = await insertUpdateForm(format);
    if (success) {
      toast.success(message);
      setFormData({});
      setErrorState({});
    } else {
      toast.error(error || message);
    }
  };

  useEffect(() => {
    async function fetchFormHandler() {
      if (mode.formId) {
        setFieldsMode(mode.mode);
        const fmt = formatFetchForm(data, "tblImo", mode.formId);
        const { success, result, message, error } = await fetchForm(fmt);
        if (success) setFormData(formatDataWithForm(result, data));
        else toast.error(error || message);
      } else {
        setFieldsMode(mode.mode || "");
      }
    }
    fetchFormHandler();
  }, [mode.formId, mode.mode]);

  return (
    <ThemeProvider theme={theme}>
      <form onSubmit={submitHandler}>
        <section className="py-1 px-4">
          <Box className="flex justify-between items-end py-1">
            <h1 className="text-left text-base flex items-end m-0 ">HAZ Details</h1>
            <CustomButton text="Back" href="/master/imo/list" onClick={() => setMode({ mode: null, formId: null })} />
          </Box>
          <Box className="border border-solid border-black rounded-[4px] ">
            <Box className="sm:grid sm:grid-cols-3 gap-2 flex flex-col p-1 border-b border-b-solid border-b-black ">
              <CustomInput
                fields={jsonData.imoFields}
                formData={formData}
                setFormData={setFormData}
                fieldsMode={fieldsMode}
                handleBlurEventFunctions={handleBlurEventFunctions}
                errorState={errorState}
              />
            </Box>
          </Box>
          <Box className="w-full flex mt-2 ">
            {fieldsMode !== "view" && <CustomButton text="Submit" type="submit" />}
          </Box>
        </section>
      </form>
      <ToastContainer />
    </ThemeProvider>
  );
}
