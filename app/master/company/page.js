"use client";
import { useState, useEffect } from "react";
import { ThemeProvider, Box } from "@mui/material";
import data, { branchGridButtons } from "./companyData";
import { CustomInput } from "@/components/customInput";
import { theme } from "@/styles";
import { toast, ToastContainer } from "react-toastify";
import CustomButton from "@/components/button/button";
import { fetchForm, insertUpdateForm } from "@/apis";
import { formatDataWithForm, formatFetchForm, formatFormData } from "@/utils";
import FormHeading from "@/components/formHeading/formHeading";
import TableGrid from "@/components/tableGrid/tableGrid";
import { formStore } from "@/store";

export default function Company() {
  const [formData, setFormData] = useState({});
  const [fieldsMode, setFieldsMode] = useState("");
  const [jsonData, setJsonData] = useState(data);
  const { mode, setMode } = formStore();

  const submitHandler = async (event) => {
    event.preventDefault();
    const format = formatFormData(
      "tblCompany",
      formData,
      mode.formId,
      "companyId"
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
          data,
          "tblCompany",
          mode.formId,
          '["tblCompanyBranch"]',
          "companyId"
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
            <h1 className="text-left text-base flex items-end m-0 ">Company</h1>
            <CustomButton
              text="Back"
              href="/master/company/list"
              onClick={() => setMode({ mode: null, formId: null })}
            />
          </Box>
          <Box className="border border-solid border-black rounded-[4px] ">
            <Box className="sm:grid sm:grid-cols-5 gap-2 flex flex-col p-1 ">
              <CustomInput
                fields={jsonData.companyFields}
                formData={formData}
                setFormData={setFormData}
                fieldsMode={fieldsMode}
              />
            </Box>
            <FormHeading
              text="Company Branch"
              variant="body2"
              style="!mx-3 border-b-2 border-solid border-[#03bafc] flex"
            />
            <TableGrid
              fields={jsonData.tblCompanyBranch}
              formData={formData}
              setFormData={setFormData}
              fieldsMode={fieldsMode}
              gridName="tblCompanyBranch"
              buttons={branchGridButtons}
            />
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
