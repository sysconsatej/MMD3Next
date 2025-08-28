"use client";
import { useState } from "react";
import { ThemeProvider, Box, Typography } from "@mui/material";
import data from "./cfsRequestData";
import { CustomInput } from "@/components/customInput";
import { theme } from "@/styles";
import { toast, ToastContainer } from "react-toastify";
import CustomButton from "@/components/button/button";
import FormHeading from "@/components/formHeading/formHeading";
import TableGrid from "@/components/tableGrid/tableGrid";
export default function cfsRequest() {
  const [formData, setFormData] = useState({});
  const [fieldsMode, setFieldsMode] = useState("");
  const [jsonData, setJsonData] = useState(data);
  const [loading, setLoading] = useState(false);

  const submitHandler = async (event) => {
    event.preventDefault();
    toast.success("working!");
  };
  return (
    <ThemeProvider theme={theme}>
      <form onSubmit={submitHandler}>
        <section className="py-2 px-4">
          <Box className="flex justify-between items-end mb-2">
            <h1 className="text-left text-base flex items-end m-0 ">
              Create Request For CFS
            </h1>
            <Box>
              <CustomButton text="Back" href="/request/cfsRequest/list" />
            </Box>
          </Box>
          <Box className="border border-solid border-black rounded-[4px] ">
            <FormHeading
              text="MBL Details"
              variant="body2"
              style="!mx-3 border-b-2 border-solid border-[#03bafc] flex"
            />
            <Box className="grid grid-cols-6 gap-2 p-2 ">
              <CustomInput
                fields={jsonData.mblFields}
                formData={formData}
                setFormData={setFormData}
                fieldsMode={fieldsMode}
              />
            </Box>
            <FormHeading
              text="Attachment Details"
              variant="body2"
              style="!mx-3 border-b-2 border-solid border-[#03bafc] flex"
            />
            <TableGrid
              fields={jsonData.attachmentFields}
              formData={formData}
              setFormData={setFormData}
              fieldsMode={fieldsMode}
              gridName="attachments"
            />
          </Box>
          <Box className="w-full flex mt-2">
            <CustomButton text={"Submit"} type="submit" />
          </Box>
        </section>
      </form>
      <ToastContainer />
    </ThemeProvider>
  );
}
