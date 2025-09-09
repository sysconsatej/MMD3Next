"use client";
import { useState } from "react";
import { ThemeProvider, Box } from "@mui/material";
import data from "./hblData";
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
            <h1 className="text-left text-base flex items-end m-0 ">
              HBL Request
            </h1>
            <Box>
              <CustomButton text="Back" href="/bl/hbl/list" />
            </Box>
          </Box>
          <Box>
            <FormHeading
              text="MBL Details"
              variant="body2"
              style="!mx-3 border-b-2 border-solid border-[#03bafc] flex"
            />
            <Box className="grid grid-cols-5 items-end gap-2 p-2 ">
              <CustomInput
                fields={jsonData.mblFields}
                formData={formData}
                setFormData={setFormData}
                fieldsMode={fieldsMode}
              />
            </Box>
            <FormHeading text="CSN" />
            <Box className="grid grid-cols-6 gap-2 p-2 ">
              <CustomInput
                fields={jsonData.csnFields}
                formData={formData}
                setFormData={setFormData}
                fieldsMode={fieldsMode}
              />
            </Box>
            <FormHeading
              text="HBL Details"
              variant="body2"
              style="!mx-3 border-b-2 border-solid border-[#03bafc] flex"
            />
            <Box className="grid grid-cols-6 gap-2 p-2 ">
              <CustomInput
                fields={jsonData.hblFields}
                formData={formData}
                setFormData={setFormData}
                fieldsMode={fieldsMode}
              />
            </Box>
            <FormHeading text="Transit Bond Details(Required if HBLs POD is different than MBLs POD)" />
            <Box className="grid grid-cols-6 gap-2 p-2 ">
              <CustomInput
                fields={jsonData.transitFields}
                formData={formData}
                setFormData={setFormData}
                fieldsMode={fieldsMode}
              />
            </Box>
            <FormHeading text="Consignor Details" />
            <Box className="grid grid-cols-6 gap-2 p-2 ">
              <CustomInput
                fields={jsonData.consignorFields}
                formData={formData}
                setFormData={setFormData}
                fieldsMode={fieldsMode}
              />
            </Box>
            <FormHeading text="Consignee Details" />
            <Box className="grid grid-cols-6 gap-2 p-2 ">
              <CustomInput
                fields={jsonData.consigneeFields}
                formData={formData}
                setFormData={setFormData}
                fieldsMode={fieldsMode}
              />
            </Box>
            <FormHeading text="Notify Details" />
            <Box className="grid grid-cols-6 gap-2 p-2 ">
              <CustomInput
                fields={jsonData.notifyFields}
                formData={formData}
                setFormData={setFormData}
                fieldsMode={fieldsMode}
              />
            </Box>
            <FormHeading text="Invoicing Instructions" />
            <Box className="grid grid-cols-6 gap-2 p-2 ">
              <CustomInput
                fields={jsonData.invoiceFields}
                formData={formData}
                setFormData={setFormData}
                fieldsMode={fieldsMode}
              />
            </Box>
            <FormHeading
              text="Item Details"
              variant="body2"
              style="!mx-3 border-b-2 border-solid border-[#03bafc] flex"
            />
            <TableGrid
              fields={jsonData.itemFields}
              formData={formData}
              setFormData={setFormData}
              fieldsMode={fieldsMode}
              gridName="item"
            />
            <FormHeading
              text="Container Details"
              variant="body2"
              style="!mx-3 !mt-2 border-b-2 border-solid border-[#03bafc] flex"
            />
            <TableGrid
              fields={jsonData.containerFields}
              formData={formData}
              setFormData={setFormData}
              fieldsMode={fieldsMode}
              gridName="container"
            />
            <FormHeading
              text="Itinerary Details"
              variant="body2"
              style="!mx-3 !mt-2 border-b-2 border-solid border-[#03bafc] flex"
            />
            <TableGrid
              fields={jsonData.itineraryFields}
              formData={formData}
              setFormData={setFormData}
              fieldsMode={fieldsMode}
              gridName="itinerary"
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
