"use client";

import { useState } from "react";
import { ThemeProvider, Box, CssBaseline } from "@mui/material";
import data from "./HBLData";
import { CustomInput } from "@/components/customInput";
import { theme } from "@/styles";
import { toast, ToastContainer } from "react-toastify";
import CustomButton from "@/components/button/button";

export default function HBL() {
  const [formData, setFormData] = useState({
    containerDetails: [],
  });

  const [fieldsMode, setFieldsMode] = useState("");

  const [jsonData, setJsonData] = useState(data);

  const submitHandler = async (event) => {
    event.preventDefault();
    toast.success("working!");
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <form onSubmit={submitHandler}>
        <section className="py-1 px-4">
          <Box className="flex justify-between items-end py-1">
            <h1 className="text-left text-base flex items-end m-0 ">HBL Form</h1>
            <CustomButton
              text="Back"
              href="/hbl/list"
              buttonStyles="!text-[12px] !text-black !py-0.5 !px-2 !min-h-0 !h-auto !min-w-0 !w-[50px] !bg-[#fadb0f]"
            />

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
            <Box className="sm:grid sm:grid-cols-4 gap-2 flex flex-col p-2 border-b border-b-solid border-b-black ">
              <Box className="flex flex-col gap-2">
                <CustomInput
                  fields={jsonData.consignorFields}
                  formData={formData}
                  setFormData={setFormData}
                  fieldsMode={fieldsMode}
                />
              </Box>
              <Box className="flex flex-col gap-2">
                <CustomInput
                  fields={jsonData.consigneeFields}
                  formData={formData}
                  setFormData={setFormData}
                  fieldsMode={fieldsMode}
                />
              </Box>
              <Box className="flex flex-col gap-2">
                <CustomInput
                  fields={jsonData.notifyFields}
                  formData={formData}
                  setFormData={setFormData}
                  fieldsMode={fieldsMode}
                />
              </Box>
              <Box className="flex flex-col gap-2">
                <CustomInput
                  fields={jsonData.deliveryAgentFields}
                  formData={formData}
                  setFormData={setFormData}
                  fieldsMode={fieldsMode}
                />
              </Box>
            </Box>
            <Box className="sm:grid sm:grid-cols-4 gap-2 flex flex-col p-2 border-b border-b-solid border-b-black ">
              <CustomInput
                fields={jsonData.receiptFields}
                formData={formData}
                setFormData={setFormData}
                fieldsMode={fieldsMode}
              />
            </Box>
            <Box className="sm:grid sm:grid-cols-6 gap-2 flex flex-col p-2 border-b border-b-solid border-b-black ">
              <CustomInput
                fields={jsonData.cargoFields}
                formData={formData}
                setFormData={setFormData}
                fieldsMode={fieldsMode}
              />
            </Box>
          </Box>
          <Box className="w-full flex mt-2 ">
            <CustomButton text={"Submit"} type="submit" buttonStyles="!text-[12px] !text-black !py-0.5 !px-2 !min-h-0 !h-auto !min-w-0 !w-[50px] !bg-[#fadb0f]"
            />
          </Box>
        </section>
      </form>
      <ToastContainer />
    </ThemeProvider>
  );
}
