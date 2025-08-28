"use client";
import { useState } from "react";
import { ThemeProvider, Box, Typography } from "@mui/material";
import data from "./blData";
import { CustomInput } from "@/components/customInput";
import { theme } from "@/styles";
import { toast, ToastContainer } from "react-toastify";
import CustomButton from "@/components/button/button";
import TableGrid from "@/components/tableGrid/tableGrid";
import FormHeading from "@/components/formHeading/formHeading";

export default function Home() {
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
            <h1 className="text-left text-base flex items-end m-0 ">BL</h1>
            <Box>
              <CustomButton text="Back" href="/bl/list" />
            </Box>
          </Box>
          <Box className="border border-solid border-black rounded-[4px] ">
            <FormHeading text="B/L Details" />
            <Box className="grid grid-cols-6 gap-2  border-b border-b-solid border-b-black p-2 ">
              <CustomInput
                fields={jsonData.fields}
                formData={formData}
                setFormData={setFormData}
                fieldsMode={fieldsMode}
              />
            </Box>
            <FormHeading text="HBL Details" />
            <Box className="grid grid-cols-6 gap-2  border-b border-b-solid border-b-black p-2 ">
              <CustomInput
                fields={jsonData.hblfields}
                formData={formData}
                setFormData={setFormData}
                fieldsMode={fieldsMode}
              />
            </Box>
            <Typography
              variant="caption"
              className="!ml-3 border-b border-solid "
            >
              Consignor Details
            </Typography>
            <Box className="grid grid-cols-6 gap-2 border-b border-b-solid border-b-black p-2">
              <CustomInput
                fields={jsonData.consignorFields}
                formData={formData}
                setFormData={setFormData}
                fieldsMode={fieldsMode}
              />
            </Box>
            <Typography
              variant="caption"
              className="!ml-3 border-b border-solid "
            >
              Consignee Details
            </Typography>
            <Box className="grid grid-cols-6 gap-2 border-b border-b-solid border-b-black p-2">
              <CustomInput
                fields={jsonData.consigneeFields}
                formData={formData}
                setFormData={setFormData}
                fieldsMode={fieldsMode}
              />
            </Box>
            <Typography
              variant="caption"
              className="!ml-3 border-b border-solid "
            >
              Notify Party
            </Typography>
            <Box className="grid grid-cols-6 gap-2 border-b border-b-solid border-b-black p-2">
              <CustomInput
                fields={jsonData.notifyFields}
                formData={formData}
                setFormData={setFormData}
                fieldsMode={fieldsMode}
              />
            </Box>
            <Typography
              variant="caption"
              className="!ml-3 border-b border-solid "
            >
              Invoicing Instructions
            </Typography>
            <Box className="grid grid-cols-6 gap-2 border-b border-b-solid border-b-black p-2">
              <CustomInput
                fields={jsonData.invoicingFields}
                formData={formData}
                setFormData={setFormData}
                fieldsMode={fieldsMode}
              />
            </Box>
            <Typography
              variant="caption"
              className="!ml-3 border-b border-solid "
            >
              Container Details
            </Typography>
            <TableGrid
              fields={jsonData.containerFields}
              formData={formData}
              setFormData={setFormData}
              fieldsMode={fieldsMode}
              gridName="container"
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
