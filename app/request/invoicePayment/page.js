"use client";

import { useState } from "react";
import { ThemeProvider, Box, Tabs, Tab, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";

import { theme } from "@/styles";
import { ToastContainer, toast } from "react-toastify";

import { CustomInput } from "@/components/customInput";
import CustomButton from "@/components/button/button";
import FormHeading from "@/components/formHeading/formHeading";
import TableGrid from "@/components/tableGrid/tableGrid";

import data, { cfsGridButtons } from "./invoicePaymentData";
import { payment } from "@/apis/payment";

function CustomTabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`inv-tabpanel-${index}`}
      {...other}
    >
      {value === index && <Box className="pt-2">{children}</Box>}
    </div>
  );
}
const a11yProps = (index) => ({
  id: `inv-tab-${index}`,
  "aria-controls": `inv-tabpanel-${index}`,
});

export default function InvoicePayment() {
  const [formData, setFormData] = useState({});
  const [fieldsMode] = useState("");
  const [jsonData] = useState(data);

  const [invoiceArray, setInvoiceArray] = useState([0]);
  const [tabValue, setTabValue] = useState(0);

  const [paying, setPaying] = useState(false);

  const handleChangeTab = (_e, newValue) => setTabValue(newValue);
  const handleAddInvoice = () => {
    setInvoiceArray((prev) => {
      const nextIndex = (prev.at(-1) ?? -1) + 1;
      const next = [...prev, nextIndex];
      setTabValue(next.length - 1);
      return next;
    });
  };
  const handleRemove = (index) => {
    setInvoiceArray((prev) => prev.filter((_, i) => i !== index));
    if (tabValue >= index && tabValue > 0) setTabValue(tabValue - 1);
  };

  const submitHandler = (e) => {
    e.preventDefault();
    toast.success("Saved!");
  };

  const quickPayHandler = async () => {
    try {
      setPaying(true);
      const res = await payment();
      const link =
        res?.data?.link || res?.data?.url || res?.link || res?.url || null;

      if (link) {
        window.location.assign(link);
      } else {
        toast.error("Payment link not received.");
      }
    } catch (err) {
      console.error(err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Payment initialization failed.";
      toast.error(msg);
    } finally {
      setPaying(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <form onSubmit={submitHandler}>
        <section className="py-2 px-4">
          <Box className="flex justify-between items-end mb-2">
            <h1 className="text-left text-base m-0">Payment New Invoice</h1>
            <Box className="flex gap-2">
              <CustomButton text="Back" href="/request/invoiceRequest/list" />
            </Box>
          </Box>

          <FormHeading
            text="BL Information"
            variant="body2"
            style="!mx-3 border-b-2 border-solid border-[#03bafc] flex"
          />
          <Box className="grid grid-cols-4 gap-2 p-2">
            <CustomInput
              fields={jsonData.igmFields}
              formData={formData}
              setFormData={setFormData}
              fieldsMode={fieldsMode}
            />
          </Box>

          <FormHeading
            text="Invoice Details"
            variant="body2"
            style="!mx-3 !mt-2 border-b-2 border-solid border-[#03bafc] flex"
          />
          <Box className="border border-gray-300 p-3 mt-2 flex flex-col gap-1">
            <Typography variant="caption" className="text-red-500">
              Total Attachment size should not exceed 3MB for the Request
            </Typography>
            <CustomInput
              fields={jsonData.attachmentFields}
              formData={formData}
              setFormData={setFormData}
              fieldsMode={fieldsMode}
            />
          </Box>

          <Box className="px-3">
            <Tabs
              value={tabValue}
              onChange={handleChangeTab}
              aria-label="Invoice Tabs"
              variant="scrollable"
            >
              {invoiceArray.map((_, index) => (
                <Tab
                  key={index}
                  label={`Invoice ${index + 1}`}
                  icon={<CloseIcon onClick={() => handleRemove(index)} />}
                  iconPosition="end"
                  {...a11yProps(index)}
                />
              ))}
              <Tab
                label="Add Invoice"
                icon={<AddIcon />}
                iconPosition="end"
                onClick={handleAddInvoice}
              />
            </Tabs>
          </Box>

          {invoiceArray.map((_, index) => (
            <CustomTabPanel key={index} value={tabValue} index={index}>
              <Box className="border-2 border-solid border-gray-300 p-3 mt-2 ">
                <Box className="grid grid-cols-4 gap-2 p-2">
                  <CustomInput
                    fields={jsonData.invoiceFieldsTop}
                    formData={formData}
                    setFormData={setFormData}
                    fieldsMode={fieldsMode}
                    tabName="tblInvoice"
                    tabIndex={index}
                  />
                </Box>

                <FormHeading text="Invoicing Instructions">
                  <Box className="grid grid-cols-3 gap-2 p-2 ">
                    <CustomInput
                      fields={jsonData.customerFields}
                      formData={formData}
                      setFormData={setFormData}
                      fieldsMode={fieldsMode}
                      tabName={"tblBl"}
                      tabIndex={index}
                    />
                  </Box>
                </FormHeading>

                <FormHeading
                  text="Container Details"
                  variant="body2"
                  style="!mx-3 !mt-2 border-b-2 border-solid border-[#03bafc] flex"
                />
                <TableGrid
                  fields={jsonData.tblInvoiceRequestContainer}
                  formData={formData}
                  setFormData={setFormData}
                  fieldsMode={fieldsMode}
                  gridName="tblInvoiceRequestContainer"
                  buttons={cfsGridButtons}
                  tabName="tblInvoice"
                  tabIndex={index}
                />
              </Box>
            </CustomTabPanel>
          ))}

          <Box className="w-full flex justify-center gap-2 mt-4">
            <CustomButton
              text={paying ? "Processing…" : "Quick Pay"}
              onClick={quickPayHandler}
              disabled={paying}
            />
            <CustomButton text="Save" type="submit" />
          </Box>
        </section>
      </form>
      <ToastContainer />
    </ThemeProvider>
  );
}
