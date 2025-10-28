"use client";

import { useEffect, useState } from "react";
import { ThemeProvider, Box } from "@mui/material";
import data from "./stateData";
import { CustomInput } from "@/components/customInput";
import { theme } from "@/styles";
import { toast, ToastContainer } from "react-toastify";
import CustomButton from "@/components/button/button";
import { formStore } from "@/store";
import { fetchForm, insertUpdateForm } from "@/apis";
import { formatDataWithForm, formatFetchForm, formatFormData } from "@/utils";

export default function State() {
  const [formData, setFormData] = useState({});
  const [fieldsMode, setFieldsMode] = useState("");
  const [jsonData, setJsonData] = useState(data);
  const { mode, setMode } = formStore();

  const submitHandler = async (event) => {
    event.preventDefault();
    const format = formatFormData("tblState", formData, mode.formId);
    const { success, error, message } = await insertUpdateForm(format);
    if (success) {
      toast.success(message);
      setFormData({});
    } else {
      toast.error(error || message);
    }
  };
  const VALID_TAX_CODES = new Set([
    "01",
    "02",
    "03",
    "04",
    "05",
    "06",
    "07",
    "08",
    "09",
    "10",
    "11",
    "12",
    "13",
    "14",
    "15",
    "16",
    "17",
    "18",
    "19",
    "20",
    "21",
    "22",
    "23",
    "24",
    "25",
    "26",
    "27",
    "28",
    "29",
    "30",
    "31",
    "32",
    "33",
    "34",
    "35",
    "36",
    "37",
    "38",
    "97", 
  ]);

  const handleBlurEventFunctions = {
    // already added earlier
    validateStateCode: (e) => {
      const name = e.target.name || "code";
      const raw = String(e.target.value ?? "");
      const val = raw.toUpperCase().replace(/\s+/g, "");
      setFormData((prev) => ({ ...prev, [name]: val }));

      if (!/^[A-Z]{2}$/.test(val)) {
        setFormData((prev) => ({ ...prev, [name]: "" }));
        setErrorState?.((prev) => ({ ...prev, [name]: true }));
        return toast.error(
          "State Code must be exactly two letters (e.g., MH)."
        );
      }
      setErrorState?.((prev) => ({ ...prev, [name]: false }));
      return true;
    },

    // NEW: GST "Tax State Code" validation (must be a valid 2-digit code)
    validateTaxStateCode: (e) => {
      const name = e.target.name || "taxStateCode";
      const raw = String(e.target.value ?? "").trim();

      // keep only digits; auto-pad single digit to 2 digits (e.g., "9" -> "09")
      if (!/^\d{1,2}$/.test(raw)) {
        setFormData((prev) => ({ ...prev, [name]: "" }));
        setErrorState?.((prev) => ({ ...prev, [name]: true }));
        return toast.error("Enter a 1–2 digit code (e.g., 27, 09).");
      }
      const val = raw.padStart(2, "0");

      // must be one of the official GST state/UT codes (01–38, 97)
      if (!VALID_TAX_CODES.has(val)) {
        setFormData((prev) => ({ ...prev, [name]: "" }));
        setErrorState?.((prev) => ({ ...prev, [name]: true }));
        return toast.error(
          "Invalid Tax State Code. Use a valid code like 27 (MH) or 09 (UP)."
        );
      }

      // reflect normalized 2-digit value back
      setFormData((prev) => ({ ...prev, [name]: val }));
      setErrorState?.((prev) => ({ ...prev, [name]: false }));
      return true;
    },
  };

  useEffect(() => {
    async function fetchFormHandler() {
      if (mode.formId) {
        setFieldsMode(mode.mode);
        const format = formatFetchForm(data, "tblState", mode.formId);
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
            <h1 className="text-left text-base flex items-end m-0 ">State</h1>
            <CustomButton
              text="Back"
              href="/master/state/list"
              onClick={() => setMode({ mode: null, formId: null })}
            />
          </Box>
          <Box className="border border-solid border-black rounded-[4px] ">
            <Box className="sm:grid sm:grid-cols-4 gap-2 flex flex-col p-1 border-b border-b-solid border-b-black ">
              <CustomInput
                fields={jsonData.stateFields}
                formData={formData}
                setFormData={setFormData}
                fieldsMode={fieldsMode}
                handleBlurEventFunctions={handleBlurEventFunctions}
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
