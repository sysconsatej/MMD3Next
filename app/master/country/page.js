"use client";

import { useEffect, useState } from "react";
import { ThemeProvider, Box } from "@mui/material";
import data from "./countryData";
import { CustomInput } from "@/components/customInput";
import { theme } from "@/styles";
import { toast, ToastContainer } from "react-toastify";
import CustomButton from "@/components/button/button";
import { insertUpdateForm } from "@/apis";
import { formatFormData } from "@/utils";
import { formStore } from "@/store";

export default function Country() {
  const [formData, setFormData] = useState({});
  const [fieldsMode, setFieldsMode] = useState("");
  const [jsonData, setJsonData] = useState(data);
  const { mode } = formStore();

  const submitHandler = async (event) => {
    event.preventDefault();
    const format = formatFormData("tblCountry", formData);
    const { success, error, message } = await insertUpdateForm(format);
    if (success) {
      toast.success(message);
    } else {
      toast.error(error);
    }
  };

  useEffect(() => {
    setFieldsMode(mode.mode);
  }, [mode]);

  return (
    <ThemeProvider theme={theme}>
      <form onSubmit={submitHandler}>
        <section className="py-1 px-4">
          <Box className="flex justify-between items-end py-1">
            <h1 className="text-left text-base flex items-end m-0 ">
              Country Form
            </h1>
            <CustomButton text="Back" href="/master/country/list" />
          </Box>
          <Box className="border border-solid border-black rounded-[4px] ">
            <Box className="sm:grid sm:grid-cols-6 gap-2 flex flex-col p-1 border-b border-b-solid border-b-black ">
              <CustomInput
                fields={jsonData.countryFields}
                formData={formData}
                setFormData={setFormData}
                fieldsMode={fieldsMode}
              />
            </Box>
          </Box>
          <Box className="w-full flex mt-2 ">
            <CustomButton text={"Submit"} type="submit" />
          </Box>
        </section>
      </form>
      <ToastContainer />
    </ThemeProvider>
  );
}
