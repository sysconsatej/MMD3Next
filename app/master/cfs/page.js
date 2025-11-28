"use client";

import { useState, useEffect } from "react";
import { ThemeProvider, Box } from "@mui/material";
import data from "./cfsData";
import { CustomInput } from "@/components/customInput";
import { theme } from "@/styles";
import { toast, ToastContainer } from "react-toastify";
import CustomButton from "@/components/button/button";
import { fetchForm, getDataWithCondition, insertUpdateForm } from "@/apis";
import { formatDataWithForm, formatFetchForm, formatFormData } from "@/utils";
import { formStore } from "@/store";

export default function Cfs() {
  const [formData, setFormData] = useState({});
  const [fieldsMode, setFieldsMode] = useState("");
  const [jsonData, setJsonData] = useState(data);
  const { mode, setMode } = formStore();
  const [errorState, setErrorState] = useState({});

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
      const { name, value } = event.target;
      const normalized = String(value ?? "").trim();

      if (!normalized) return true;

      const literal = normalized.replace(/'/g, "''");

      let whereDup = `
      UPPER(${name}) = '${literal.toUpperCase()}'
      AND portTypeId IN (
        SELECT id FROM tblMasterData WHERE name = 'CONTAINER FREIGHT STATION'
      )
      AND status = 1
    `;

      if (mode?.formId) {
        whereDup += ` AND id <> ${mode.formId}`;
      }

      const obj = {
        columns: "id",
        tableName: "tblPort",
        whereCondition: whereDup,
      };

      const resp = await getDataWithCondition(obj);

      const isDuplicate =
        resp?.success === true ||
        (Array.isArray(resp?.data) && resp.data.length > 0);

      if (isDuplicate) {
        setErrorState((prev) => ({ ...prev, [name]: true }));
        setFormData((prev) => ({ ...prev, [name]: "" }));
        toast.error(`Duplicate ${name}!`);
        return false;
      }

      setFormData((prev) => ({ ...prev, [name]: normalized }));
      setErrorState((prev) => ({ ...prev, [name]: false }));
      return true;
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
          setFormData(getData);
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
        whereCondition: "name = 'CONTAINER FREIGHT STATION'",
      };

      const { data, message, error, success } = await getDataWithCondition(obj);
      if (success) {
        setFormData((prev) => ({
          ...prev,
          portTypeId: data[0].id,
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
