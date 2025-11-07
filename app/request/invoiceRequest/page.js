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
import { fetchForm, insertUpdateForm } from "@/apis";
import { formatDataWithForm, formatFetchForm, formatFormData } from "@/utils";
import { formStore } from "@/store";

export default function InvoiceRequest() {
  const [formData, setFormData] = useState({});
  const [fieldsMode, setFieldsMode] = useState("");
  const [jsonData] = useState(data);
  const { mode, setMode } = formStore();
  const [loading, setLoading] = useState(false);

  // Default radio: set to "F" only if undefined on first mount
  useEffect(() => {
    setFormData((prev) =>
      typeof prev?.isFreeDays === "undefined"
        ? { ...prev, isFreeDays: "F" }
        : prev
    );
  }, [mode.formId, mode.mode]);

  // Normalize a fetched/stored value into our radio model: "F" | "D"
  const normalizeFD = (v) => {
    if (v === "F" || v === "D") return v;
    if (v === true || v === "Y" || v === 1) return "F";
    if (v === false || v === "N" || v === 0) return "D";
    return "F";
  };

  // Derived radio value (always "F"/"D")
  const radioFD = useMemo(
    () => normalizeFD(formData?.isFreeDays),
    [formData?.isFreeDays]
  );

  // UI logic: F = Free Days (hide containers), D = DO Extension (show)
  const hideContainers = radioFD === "F";

  // Hide "validTill" when DO Extension is selected ("D")
  const igmFieldsToRender = useMemo(() => {
    const fields = Array.isArray(jsonData?.igmFields) ? jsonData.igmFields : [];
    return radioFD === "D"
      ? fields.filter((f) => f?.name !== "validTill")
      : fields;
  }, [jsonData?.igmFields, radioFD]);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      // Normalize values for DB schema
      const normalized = {
        ...formData,
        isFreeDays: radioFD, // "F" | "D"
        isHighSealSale:
          formData?.isHighSealSale === true || formData?.isHighSealSale === "Y"
            ? "Y"
            : "N",
      };

      const payload = formatFormData(
        "tblInvoiceRequest",
        normalized,
        mode?.formId || undefined, // use formId for edit
        "invoiceRequestId" // FK name for child grid rows
      );

      const { success, error, message } = await insertUpdateForm(payload);
      if (success) {
        toast.success(message || "Saved");
        setFormData({});
        setMode({ mode: null, formId: null });
      } else {
        toast.error(error || message || "Save failed");
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  // Fetch for View/Edit
  useEffect(() => {
    async function fetchFormHandler() {
      if (!mode.formId) return;
      setFieldsMode(mode.mode || "");

      const format = formatFetchForm(
        data,
        "tblInvoiceRequest",
        mode.formId,
        '["tblInvoiceRequestContainer","tblAttachement"]',
        "invoiceRequestId" // keep aligned with your utils (child FK name)
      );
      const { success, result, message, error } = await fetchForm(format);
      if (success) {
        const getData = formatDataWithForm(result, data);

        // Normalize legacy shapes to our UI model
        getData.isFreeDays = normalizeFD(getData?.isFreeDays);
        if (getData?.isHighSealSale === "Y") getData.isHighSealSale = true;
        else if (getData?.isHighSealSale === "N")
          getData.isHighSealSale = false;

        setFormData(getData);
      } else {
        toast.error(error || message);
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
              Invoice Request
            </h1>
            <Box>
              <CustomButton
                text="Back"
                href="/request/invoiceRequest/list"
                onClick={() => setMode({ mode: null, formId: null })}
              />
            </Box>
          </Box>

          <Box>
            <FormHeading
              text="BL Information"
              variant="body2"
              style="!mx-3 border-b-2 border-solid border-[#03bafc] flex"
            />
            <Box className="grid grid-cols-3 gap-2 p-2 ">
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
                  fields={jsonData.tblAttachement}
                  formData={formData}
                  setFormData={setFormData}
                  fieldsMode={mode.mode}
                  gridName="tblAttachement"
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
                    fields={jsonData.tblInvoiceRequestContainer}
                    formData={formData}
                    setFormData={setFormData}
                    fieldsMode={mode.mode}
                    gridName="tblInvoiceRequestContainer"
                    buttons={cfsGridButtons}
                  />
                </Box>
              )}
            </Box>
          </Box>

          <Box className="w-full flex mt-2">
            {fieldsMode !== "view" && (
              <CustomButton
                text={loading ? "Saving..." : "Submit"}
                type="submit"
                disabled={loading}
              />
            )}
          </Box>
        </section>
      </form>
      <ToastContainer />
    </ThemeProvider>
  );
}
