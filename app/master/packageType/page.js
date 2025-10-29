"use client";

import { useState, useEffect } from "react";
import { ThemeProvider, Box } from "@mui/material";
import data from "./packageData";
import { CustomInput } from "@/components/customInput";
import { theme } from "@/styles";
import { toast, ToastContainer } from "react-toastify";
import CustomButton from "@/components/button/button";
import { fetchForm, getDataWithCondition, insertUpdateForm } from "@/apis";
import { formatDataWithForm, formatFetchForm, formatFormData } from "@/utils";
import { formStore } from "@/store";

export default function Package() {
  const [formData, setFormData] = useState({});
  const [fieldsMode, setFieldsMode] = useState("");
  const [jsonData, setJsonData] = useState(data);
  const { mode, setMode } = formStore();
  const [errorState, setErrorState] = useState({});

  const submitHandler = async (event) => {
    event.preventDefault();
    const format = formatFormData("tblMasterData", formData, mode.formId);
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
      const SPECIAL_RE = /[@#$%&!`~*]/;
      const toSql = (s) => String(s).replace(/'/g, "''");
      const norm = (n, v) => {
        const t = String(v ?? "").trim();
        return n === "code" ? t.toUpperCase() : t;
      };
      const setField = (val) =>
        setFormData((prev) => ({ ...prev, [name]: val }));
      const setErr = (flag) =>
        setErrorState?.((prev) => ({ ...prev, [name]: flag }));
      const normalized = norm(name, value);
      setField(normalized);
      if (name === "code") {
        if (!/^[A-Z]{3}$/.test(normalized)) {
          setField("");
          setErr(true);
          toast.error("Code must be exactly two letters (e.g., LFT).");
          return false;
        }
      } else if (SPECIAL_RE.test(normalized)) {
        setField("");
        setErr(true);
        toast.error("Special characters are not allowed.");
        return false;
      }
      const literal = toSql(normalized.toUpperCase());
      const whereCondition = `UPPER(${name}) = '${literal}' and masterListName = 'tblPackage'  and status = 1`;

      const resp = await getDataWithCondition({
        columns: name,
        tableName: "tblMasterData",
        whereCondition,
      });

      const isDuplicate =
        resp?.success === true ||
        (Array.isArray(resp?.data) && resp.data.length > 0);

      if (isDuplicate) {
        setField("");
        setErr(true);
        toast.error(`Duplicate ${name}!`);
        return false;
      }

      setErr(false);
      return true;
    },
  };

  useEffect(() => {
    async function fetchFormHandler() {
      if (mode.formId) {
        setFieldsMode(mode.mode);
        const format = formatFetchForm(data, "tblMasterData", mode.formId);
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
        columns: "id, name",
        tableName: "tblMasterList",
        whereCondition: "name = 'tblPackage'",
      };

      const { data, message, error, success } = await getDataWithCondition(obj);
      if (success) {
        setFormData((prev) => ({
          ...prev,
          masterListId: data[0].id,
          masterListName: data[0].name,
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
              Package Type
            </h1>
            <CustomButton
              text="Back"
              href="/master/packageType/list"
              onClick={() => setMode({ mode: null, formId: null })}
            />
          </Box>
          <Box className="border border-solid border-black rounded-[4px] ">
            <Box className="sm:grid sm:grid-cols-3 gap-2 flex flex-col p-1 border-b border-b-solid border-b-black ">
              <CustomInput
                fields={jsonData.packageFields}
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
