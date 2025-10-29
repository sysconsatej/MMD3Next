"use client";
import React, { useState } from "react";
import CustomButton from "@/components/button/button";
import { CustomInput } from "@/components/customInput";
import { ThemeProvider } from "@emotion/react";
import { Box } from "@mui/material";
import data from "./uploadData";
import { theme } from "@/styles";
import { ToastContainer } from "react-toastify";

const hblUpload = () => {
  const [formData, setFormData] = useState({});
  const [jsonData, setJsonData] = useState(data);

  return (
    <ThemeProvider theme={theme}>
      <form>
        <section className="py-1 px-4">
          <Box className="flex justify-between items-end py-1">
            <h1 className="text-left text-base flex items-end m-0 ">
              HBL Upload
            </h1>
            <CustomButton text="Back" href="/bl/hbl/list" />
          </Box>
          <Box className="border border-solid border-black rounded-[4px] ">
            <Box className="sm:grid sm:grid-cols-3 gap-2 flex flex-col p-1 border-b border-b-solid border-b-black ">
              <CustomInput
                fields={jsonData.hblFields}
                formData={formData}
                setFormData={setFormData}
              />
            </Box>
          </Box>
          <Box className="w-full flex mt-2 gap-2 ">
            <CustomButton text={"Upload"} />
            <CustomButton text={"Export Template"} />
          </Box>
        </section>
      </form>
      <ToastContainer />
    </ThemeProvider>
  );
};

export default hblUpload;
