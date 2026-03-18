"use client";

import { useEffect, useState } from "react";
import { ThemeProvider, Box } from "@mui/material";
import data from "./moduleEmailRecipientData";
import { CustomInput } from "@/components/customInput";
import { theme } from "@/styles";
import { toast, ToastContainer } from "react-toastify";
import CustomButton from "@/components/button/button";
import { fetchForm, getDataWithCondition, insertUpdateForm } from "@/apis";
import { formatDataWithForm, formatFetchForm, formatFormData } from "@/utils";
import { formStore } from "@/store";
import { getUserByCookies } from "@/utils";

export default function IsoCodeLineMapping() {
  const [formData, setFormData] = useState({});
  const [fieldsMode, setFieldsMode] = useState("");
  const [jsonData, setJsonData] = useState(data);
  const { mode, setMode } = formStore();
  const userData = getUserByCookies();
  const submitHandler = async (event) => {
    event.preventDefault();

    let normalized = {};
    if (userData?.roleCode === "admin") {
      normalized = {
        ...formData,
      };
    } else {
      normalized = {
        ...formData,
        locationId: userData?.location,
      };
    }

    const format = formatFormData(
      "tblModuleEmailRecipient",
      normalized,
      mode.formId,
    );

    const { success, error, message } = await insertUpdateForm(format);

    if (success) {
      toast.success(message);
      setFormData({});
    } else {
      toast.error(error || message);
    }
  };
  useEffect(() => {
    if (!mode.formId && userData?.companyId) {
      setFormData((prev) => ({
        ...prev,
        shippingLineId: {
          Id: userData.companyId,
          Name: userData.companyName,
        },
      }));
    }
  }, [mode.formId]);
  useEffect(() => {
    async function fetchFormHandler() {
      if (mode.formId) {
        setFieldsMode(mode.mode);
        const format = formatFetchForm(
          data,
          "tblModuleEmailRecipient",
          mode.formId,
        );
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
              Email Configuration
            </h1>
            <CustomButton
              text="Back"
              href="/master/moduleEmailRecipient/list"
              onClick={() => setMode({ mode: null, formId: null })}
            />
          </Box>
          <Box className="border border-solid border-black rounded-[4px] ">
            <Box className="sm:grid sm:grid-cols-3 gap-2 flex flex-col p-1 border-b border-b-solid border-b-black ">
              <CustomInput
                fields={jsonData.countryFields}
                formData={formData}
                setFormData={setFormData}
                fieldsMode={fieldsMode}
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
