"use client";

import { useState, useEffect } from "react";
import { ThemeProvider, Box } from "@mui/material";
import data from "./dpdData";
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

export default function DPD() {
  const [formData, setFormData] = useState({});
  const [fieldsMode, setFieldsMode] = useState("");
  const [jsonData, setJsonData] = useState(data);
  const { mode, setMode } = formStore();
  const [errorState, setErrorState] = useState({});
  const userData = getUserByCookies();

  const submitHandler = async (event) => {
    event.preventDefault();
    const format = formatFormData("tblPort", formData, mode.formId);
    const { success, error, message } = await insertUpdateForm(format);
    if (success) {
      toast.success(message);
      setFormData({});
    } else {
      toast.error(error || message);
    }
  };

  const handleBlurEventFunctions = {
    duplicateHandler: async (event) => {
      const { value, name } = event.target;
      const obj = {
        columns: name,
        tableName: "tblPort",
        whereCondition: ` ${name} = '${value}' and portTypeId IN (SELECT id FROM tblMasterData WHERE name = 'DIRECT PORT DELIVERY') and companyId = ${userData?.companyId} and status = 1`,
      };
      const { success } = await getDataWithCondition(obj);
      if (success) {
        setErrorState((prev) => ({ ...prev, [name]: true }));
        setFormData((prev) => ({ ...prev, [name]: "" }));
        toast.error(`Duplicate ${name}!`);
      } else {
        setErrorState((prev) => ({ ...prev, [name]: false }));
      }
    },
    validatePanCard: (e) => {
      const value = e.target.value;
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      if (value !== String(value).toUpperCase()) {
        setFormData((prev) => ({ ...prev, panNo: null }));
        return toast.error("Pan card should be always in caps");
      }

      if (panRegex.test(value)) {
        return true;
      } else {
        setFormData((prev) => ({ ...prev, panNo: null }));
        return toast.error("Pan Number is invalid ");
      }
    },
  };

  useEffect(() => {
    async function fetchFormHandler() {
      if (mode.formId) {
        setFieldsMode(mode.mode);
        const format = formatFetchForm(data, "tblPort", mode.formId);
        const { success, result, message, error } = await fetchForm(format);
        if (success) {
          const getData = formatDataWithForm(result, data);
          setFormData({ ...getData, companyId: userData?.companyId });
        } else {
          toast.error(error || message);
        }
      }
    }

    fetchFormHandler();
  }, [mode.formId]);

  useEffect(() => {
    async function initialHandler() {
      const obj = {
        columns: "id",
        tableName: "tblMasterData",
        whereCondition:
          "name = 'DIRECT PORT DELIVERY' and masterListName = 'tblPortType' and status = 1",
      };

      const { data, message, error, success } = await getDataWithCondition(obj);
      if (success) {
        setFormData((prev) => ({
          ...prev,
          portTypeId: data?.[0]?.id,
          companyId: userData?.companyId,
        }));
      } else {
        toast.error(error || message);
      }
    }

    initialHandler();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <form onSubmit={submitHandler}>
        <section className="py-1 px-4">
          <Box className="flex justify-between items-end py-1">
            <h1 className="text-left text-base flex items-end m-0 ">DPD</h1>
            <CustomButton
              text="Back"
              href="/master/dpd/list"
              onClick={() => setMode({ mode: null, formId: null })}
            />
          </Box>
          <Box className="border border-solid border-black rounded-[4px] ">
            <Box className="sm:grid sm:grid-cols-4 gap-2 flex flex-col p-1 border-b border-b-solid border-b-black ">
              <CustomInput
                fields={jsonData.dpdFields}
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
