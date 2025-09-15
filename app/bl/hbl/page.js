"use client";
import { useEffect, useState } from "react";
import { ThemeProvider, Box } from "@mui/material";
import data from "./hblData";
import { CustomInput } from "@/components/customInput";
import { theme } from "@/styles";
import { toast, ToastContainer } from "react-toastify";
import CustomButton from "@/components/button/button";
import TableGrid from "@/components/tableGrid/tableGrid";
import FormHeading from "@/components/formHeading/formHeading";
import { formStore } from "@/store";
import { formatDataWithForm, formatFetchForm } from "@/utils";
import { fetchForm } from "@/apis";

export default function Home() {
  const [formData, setFormData] = useState({});
  const [fieldsMode, setFieldsMode] = useState("");
  const [jsonData, setJsonData] = useState(data);
  const { mode, setMode } = formStore();
  const [gridStatus, setGridStatus] = useState(null);

  const submitHandler = async (event) => {
    event.preventDefault();
    toast.success("working!");
  };

  useEffect(() => {
    async function fetchFormHandler() {
      if (mode.formId) {
        setFieldsMode(mode.mode);
        const format = formatFetchForm(
          data,
          "tblBl",
          mode.formId,
          '["tblBlContainer"]',
          "blId"
        );
        const { success, result, message, error } = await fetchForm(format);
        if (success) {
          const getData = formatDataWithForm(result, data);
          setFormData(getData);
          setGridStatus("fetchGrid");
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
        <section className="py-2 px-4">
          <Box className="flex justify-between items-end mb-2">
            <h1 className="text-left text-base flex items-end m-0 ">
              HBL Request
            </h1>
            <Box>
              <CustomButton
                text="Back"
                href="/bl/hbl/list"
                onClick={() => setMode({ mode: null, formId: null })}
              />
            </Box>
          </Box>
          <Box>
            <FormHeading text="MBL Details" />
            <Box className="grid grid-cols-5 items-end gap-2 p-2 ">
              <CustomInput
                fields={jsonData.mblFields}
                formData={formData}
                setFormData={setFormData}
                fieldsMode={fieldsMode}
              />
            </Box>
            <FormHeading text="CSN">
              <Box className="grid grid-cols-6 gap-2 p-2 ">
                <CustomInput
                  fields={jsonData.csnFields}
                  formData={formData}
                  setFormData={setFormData}
                  fieldsMode={fieldsMode}
                />
              </Box>
            </FormHeading>
            <FormHeading text="HBL Details" />
            <Box className="border-2 border-solid border-gray-300 p-3 mt-2 ">
              <Box className="grid grid-cols-6 gap-2 p-2 ">
                <CustomInput
                  fields={jsonData.hblFields}
                  formData={formData}
                  setFormData={setFormData}
                  fieldsMode={fieldsMode}
                />
              </Box>
              <FormHeading text="Transit Bond Details(Required if HBLs POD is different than MBLs POD)">
                <Box className="grid grid-cols-6 gap-2 p-2 ">
                  <CustomInput
                    fields={jsonData.transitFields}
                    formData={formData}
                    setFormData={setFormData}
                    fieldsMode={fieldsMode}
                  />
                </Box>
              </FormHeading>
              <FormHeading text="Consignor Details">
                <Box className="grid grid-cols-6 gap-2 p-2 ">
                  <CustomInput
                    fields={jsonData.consignorFields}
                    formData={formData}
                    setFormData={setFormData}
                    fieldsMode={fieldsMode}
                  />
                </Box>
              </FormHeading>
              <FormHeading text="Consignee Details">
                <Box className="grid grid-cols-6 gap-2 p-2 ">
                  <CustomInput
                    fields={jsonData.consigneeFields}
                    formData={formData}
                    setFormData={setFormData}
                    fieldsMode={fieldsMode}
                  />
                </Box>
              </FormHeading>
              <FormHeading text="Notify Details">
                <Box className="grid grid-cols-6 gap-2 p-2 ">
                  <CustomInput
                    fields={jsonData.notifyFields}
                    formData={formData}
                    setFormData={setFormData}
                    fieldsMode={fieldsMode}
                  />
                </Box>
              </FormHeading>
              <FormHeading text="Invoicing Instructions">
                <Box className="grid grid-cols-6 gap-2 p-2 ">
                  <CustomInput
                    fields={jsonData.invoiceFields}
                    formData={formData}
                    setFormData={setFormData}
                    fieldsMode={fieldsMode}
                  />
                </Box>
              </FormHeading>
              <Box className="grid grid-cols-6 gap-2 p-2 ">
                <CustomInput
                  fields={jsonData.hblBottomFields}
                  formData={formData}
                  setFormData={setFormData}
                  fieldsMode={fieldsMode}
                />
              </Box>
              <FormHeading text="Item Details" />
              <TableGrid
                fields={jsonData.itemFields}
                formData={formData}
                setFormData={setFormData}
                fieldsMode={fieldsMode}
                gridName="item"
              />
              <FormHeading text="Container Details" />
              <TableGrid
                fields={jsonData.tblBlContainer}
                formData={formData}
                setFormData={setFormData}
                fieldsMode={fieldsMode}
                gridName="tblBlContainer"
                gridStatus={gridStatus}
              />
              <FormHeading text="Itinerary Details" />
              <TableGrid
                fields={jsonData.itineraryFields}
                formData={formData}
                setFormData={setFormData}
                fieldsMode={fieldsMode}
                gridName="itinerary"
              />
            </Box>
          </Box>
          <Box className="w-full flex mt-2">
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
