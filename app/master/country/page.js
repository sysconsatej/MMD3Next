"use client";

import { useState } from "react";
import { ThemeProvider, Box } from "@mui/material";
import data from "./countryData";
import { CustomInput } from "@/components/customInput";
import { theme } from "@/styles";
import { toast, ToastContainer } from "react-toastify";
import CustomButton from "@/components/button/button";
import { createMaster } from "@/apis";

export default function Country() {
  const [formData, setFormData] = useState({
    containerDetails: [],
  });

  const [fieldsMode, setFieldsMode] = useState("");

  const [jsonData, setJsonData] = useState(data);

  const submitHandler = async (event) => {
    event.preventDefault();
    const obj = {
      json: '{"routeName":"mastervalue","tableName":"tblCountry","tblState":[],"code":"t4","name":"testing4","countryPhoneCode":null,"activeInactive":true,"attachment":[],"menuID":930,"isNoGenerate":null,"clientId":1,"loginCompany":"6403","loginBranch":"5299","loginfinYear":"7","companyId":"6403","companyBranchId":"5299","financialYearId":"7"}',
      formId: 930,
      clientId: 1,
      createdBy: 98,
      loginCompanyId: "6403",
      loginCompanyBranchId: "5299",
      finYearId: "7",
    };
    const res = await createMaster(obj);
    console.log("res", res);
    toast.success("working!");
  };

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
            <Box className="sm:grid sm:grid-cols-4 gap-2 flex flex-col p-1 border-b border-b-solid border-b-black ">
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
