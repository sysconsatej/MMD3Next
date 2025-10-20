"use client";
import { useMemo, useState, useEffect } from "react";
import { ThemeProvider, Box } from "@mui/material";
import data, { cfsGridButtons } from "./invoiceRequestData";
import { CustomInput } from "@/components/customInput";
import { theme } from "@/styles";
import { toast, ToastContainer } from "react-toastify";
import CustomButton from "@/components/button/button";
import FormHeading from "@/components/formHeading/formHeading";
import TableGrid from "@/components/tableGrid/tableGrid";

export default function InvoiceRequest() {
  const [formData, setFormData] = useState({});
  const [fieldsMode, setFieldsMode] = useState("");
  const [jsonData] = useState(data);
  const [loading, setLoading] = useState(false);

  const submitHandler = async (event) => {
    event.preventDefault();
    toast.success("working!");
  };

  // Hide the container panel when Free Days is checked
  const hideContainers = !!formData?.freeDays;

  // Hide "Valid Till" when Do Extension is checked
  const igmFieldsToRender = useMemo(() => {
    const fields = Array.isArray(jsonData?.igmFields) ? jsonData.igmFields : [];
    if (formData?.doExtension) {
      return fields.filter((f) => f?.name !== "validTill");
    }
    return fields;
  }, [jsonData?.igmFields, formData?.doExtension]);

  useEffect(() => {
    const v = formData?.validTill ?? null;
    if (!v) return;

    setFormData((prev) => {
      const rows = Array.isArray(prev?.tblContainer) ? prev.tblContainer : [];
      if (!rows.length) return prev;

      let changed = false;
      const updated = rows.map((r) => {
        if (r?.validTill === v) return r;
        changed = true;
        return { ...r, validTill: v };
      });

      return changed ? { ...prev, tblContainer: updated } : prev;
    });
  }, [formData?.validTill]);

  useEffect(() => {
    const v = formData?.validTill ?? null;
    if (!v) return;

    setFormData((prev) => {
      const rows = Array.isArray(prev?.tblContainer) ? prev.tblContainer : [];
      if (!rows.length) return prev;

      let changed = false;
      const updated = rows.map((r) => {
        if (r?.validTill) return r;
        changed = true;
        return { ...r, validTill: v };
      });

      return changed ? { ...prev, tblContainer: updated } : prev;
    });
  }, [formData?.tblContainer?.length]);

  return (
    <ThemeProvider theme={theme}>
      <form onSubmit={submitHandler}>
        <section className="py-2 px-4">
          <Box className="flex justify-between items-end mb-2">
            <h1 className="text-left text-base flex items-end m-0 ">
              Invoice Request
            </h1>
            <Box>
              <CustomButton text="Back" href="/request/invoiceRequest/list" />
            </Box>
          </Box>

          <Box>
            <FormHeading
              text="BL Information"
              variant="body2"
              style="!mx-3 border-b-2 border-solid border-[#03bafc] flex"
            />
            <Box className="grid grid-cols-4 gap-2 p-2 ">
              <CustomInput
                fields={igmFieldsToRender}
                formData={formData}
                setFormData={setFormData}
                fieldsMode={fieldsMode}
              />
            </Box>

            <FormHeading text="Invoice In Name Of">
              <Box className="grid grid-cols-4 gap-2 p-2 ">
                <CustomInput
                  fields={jsonData.invoiceFields}
                  formData={formData}
                  setFormData={setFormData}
                  fieldsMode={fieldsMode}
                />
              </Box>
            </FormHeading>

            <Box
              className={`grid grid-cols-1 ${
                hideContainers ? "" : "lg:grid-cols-2"
              } gap-4`}
            >
              <Box>
                <FormHeading
                  text="Attachment Details"
                  variant="body2"
                  style="!mx-3 !mt-2 border-b-2 border-solid border-[#03bafc] flex"
                />
                <TableGrid
                  fields={jsonData.attachmentFields}
                  formData={formData}
                  setFormData={setFormData}
                  fieldsMode={fieldsMode}
                  gridName="tblVoyage"
                  buttons={cfsGridButtons}
                />
              </Box>

              {!hideContainers && (
                <Box>
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
                    gridName="tblContainer"
                    buttons={cfsGridButtons}
                  />
                </Box>
              )}
            </Box>
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
