"use client";
import { useState, useEffect } from "react";
import { ThemeProvider, Box } from "@mui/material";
import { fieldData } from "./termsAndConditionData";
import { CustomInput } from "@/components/customInput";
import { theme } from "@/styles";
import { toast, ToastContainer } from "react-toastify";
import CustomButton from "@/components/button/button";
import { fetchForm, getDataWithCondition, insertUpdateForm } from "@/apis";
import { formatDataWithForm, formatFetchForm, formatFormData } from "@/utils";
import { formStore } from "@/store";

export default function BerthAgent() {
  const [formData, setFormData] = useState({});
  const [fieldsMode, setFieldsMode] = useState("");
  const [jsonData, setJsonData] = useState(fieldData);
  const [errorState, setErrorState] = useState({});
  const { mode, setMode } = formStore();

  const submitHandler = async (event) => {
    event.preventDefault();
    const format = formatFormData(
      "tblTermsAndCondition",
      formData,
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
    async function fetchFormHandler() {
      if (mode.formId) {
        setFieldsMode(mode.mode);
        const format = formatFetchForm(
          fieldData,
          "tblTermsAndCondition",
          mode.formId,
        );
        const { success, result, message, error } = await fetchForm(format);
        if (success) {
          const getData = formatDataWithForm(result, fieldData);
          setFormData(getData);
        } else {
          toast.error(error || message);
        }
      }
    }

    fetchFormHandler();
  }, [mode.formId]);
  const handleChangeEventFunctions = {
    duplicateReportCheck: async (name, value) => {
      let shippingLineId = null;
      let reportsId = null;

      if (name === "shippingLineId") {
        shippingLineId = value?.Id;
        reportsId = formData?.reportsId?.Id;
      } else if (name === "reportsId") {
        shippingLineId = formData?.shippingLineId?.Id;
        reportsId = value?.Id;
      }

      if (!shippingLineId || !reportsId) return;

      const obj = {
        tableName: "tbltermsAndCondition",
        columns: "id",
        whereCondition: `
        shippingLineId = '${shippingLineId}'
        AND reportsId = '${reportsId}'
        AND status = 1
        ${mode?.formId ? `AND id <> ${mode.formId}` : ""}
      `,
      };

      const resp = await getDataWithCondition(obj);
      const isDuplicate = Array.isArray(resp?.data) && resp.data.length > 0;

      if (isDuplicate) {
        toast.error(
          "Terms and Condition already exists for this Report",
        );

        setFormData((prev) => ({
          ...prev,
          [name]: null,
        }));
      }
    },
  };

  const handleBlurEventFunctions = {};

  return (
    <ThemeProvider theme={theme}>
      <form onSubmit={submitHandler}>
        <section className="py-1 px-4">
          <Box className="flex justify-between items-end py-1">
            <h1 className="text-left text-base flex items-end m-0 ">
              Terms And Condition
            </h1>
            <CustomButton
              text="Back"
              href="/master/termsAndCondition/list"
              onClick={() => setMode({ mode: null, formId: null })}
            />
          </Box>
          <Box className="border border-solid border-black rounded-[4px] ">
            <Box className="sm:grid sm:grid-cols-3 gap-2 flex flex-col p-1 ">
              <CustomInput
                fields={jsonData.berthAgentFields}
                formData={formData}
                setFormData={setFormData}
                fieldsMode={fieldsMode}
                handleBlurEventFunctions={handleBlurEventFunctions}
                handleChangeEventFunctions={handleChangeEventFunctions}
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
