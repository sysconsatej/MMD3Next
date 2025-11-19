"use client";

import { useState, useCallback, useEffect } from "react";
import { ThemeProvider, Box, Tabs, Tab, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import { theme } from "@/styles";
import { ToastContainer, toast } from "react-toastify";
import { CustomInput } from "@/components/customInput";
import CustomButton from "@/components/button/button";
import FormHeading from "@/components/formHeading/formHeading";
import TableGrid from "@/components/tableGrid/tableGrid";
import { formStore } from "@/store";
import data, { cfsGridButtons, containerObj } from "./invoicePaymentData";
import {
  getDataWithCondition,
  fetchForm,
  insertUpdateForm,
  updateStatusRows, // ✅ used for soft delete
} from "@/apis";
import {
  formatFormData,
  formatDataWithForm,
  formatDataWithFormThirdLevel,
  formatFetchForm,
} from "@/utils";
import { useRouter } from "next/navigation"; // ✅ for redirect
import MultiFileUpload from "@/components/customInput/multiFileUpload";
import { extractTextFromPdfs } from "@/helper/pdfTextExtractor";

function CustomTabPanel({ children, value, index, ...other }) {
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box className="pt-2">{children}</Box>}
    </div>
  );
}

const a11yProps = (index) => ({
  id: `inv-tab-${index}`,
  "aria-controls": `inv-tabpanel-${index}`,
});

export default function InvoicePayment() {
  const { mode } = formStore();
  const initialMode = mode.mode || ""; // ✅ ensures correct initial state

  const [formData, setFormData] = useState({});
  const [fieldsMode, setFieldsMode] = useState(initialMode);
  const [jsonData] = useState(data);
  const router = useRouter();

  const [invoiceArray, setInvoiceArray] = useState([0]);
  const [tabValue, setTabValue] = useState(0);
  const [errorState, setErrorState] = useState({});
  const [containerData, setContainerData] = useState([]);

  // ✅ store IDs of invoices as they originally came from DB
  const [initialInvoiceIds, setInitialInvoiceIds] = useState([]);

  const handleChangeTab = (_e, newValue) => setTabValue(newValue);

  const handleAddInvoice = () => {
    setInvoiceArray((prev) => {
      const nextIndex = (prev.at(-1) ?? -1) + 1;
      const next = [...prev, nextIndex];
      setTabValue(next.length - 1);
      return next;
    });
    setFormData((prev) => ({
      ...prev,
      tblInvoice: [
        ...(prev?.tblInvoice || []),
        { tblInvoiceRequestContainer: containerData },
      ],
    }));
  };

  // ✅ remove tab + its data; deleted IDs will be detected at submit
  const handleRemove = (index) => {
    setInvoiceArray((prev) => {
      const next = prev.filter((_, i) => i !== index);

      // fix active tab index
      if (next.length === 0) {
        setTabValue(0);
      } else if (tabValue >= next.length) {
        setTabValue(next.length - 1);
      } else if (tabValue > index) {
        setTabValue((old) => old - 1);
      }

      return next;
    });

    setFormData((prev) => ({
      ...prev,
      tblInvoice: (prev.tblInvoice || []).filter((_, i) => i !== index),
    }));
  };

  const extractId = useCallback((v) => {
    if (v && typeof v === "object") {
      return v.id ?? v.value ?? v.companyId ?? v.Id ?? null;
    }
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }, []);

  const sqlEscape = useCallback((s = "") => String(s).replace(/'/g, "''"), []);

  async function setBlContainer(blId) {
    const format = formatFetchForm(
      containerObj,
      "tblBl",
      blId,
      '["tblBlContainer"]',
      "blId"
    );
    const { success, result, message, error } = await fetchForm(format);
    if (success) {
      const getData = formatDataWithForm(result, {
        tblBlContainer: jsonData.tblInvoiceRequestContainer,
      });
      const filterContainer = getData.tblBlContainer.map((item) => {
        return { containerNo: item.containerNo, sizeId: item.sizeId };
      });
      setContainerData(filterContainer);
      setFormData((prev) => ({
        ...prev,
        tblInvoice: [
          ...(prev?.tblInvoice || []),
          {
            tblInvoiceRequestContainer: filterContainer,
          },
        ],
      }));
    } else {
      toast.error(error || message);
    }
  }

  const checkBlForCompany = useCallback(
    async (event) => {
      const { value, name } = event.target;
      const typed = (value || "").trim();
      if (!typed) return;

      const companyId =
        extractId(formData?.beneficiaryName) ??
        extractId(formData?.companyId) ??
        extractId(formData?.beneficiaryId);

      const errKey = name || "blNo";

      if (!companyId) {
        setErrorState((p) => ({ ...p, [errKey]: true }));
        toast.warn("Please select Beneficiary Name first.");
        return;
      }

      const payload = {
        columns: "TOP 1 b.id, b.mblNo",
        tableName: "tblBl b",
        whereCondition: `
          b.mblNo = '${sqlEscape(typed)}'
          AND b.shippingLineId = ${companyId}
          AND ISNULL(b.status, 1) = 1`,
      };

      try {
        const { success, data } = await getDataWithCondition(payload);
        if (success && Array.isArray(data) && data.length > 0) {
          toast.success("BL found for this Beneficiary.");
          setFormData((p) => ({ ...p, blId: data[0].id }));
          setErrorState((p) => ({ ...p, [errKey]: false }));
          await setBlContainer(data[0].id);
        } else {
          toast.error("BL not found for this Beneficiary.");
          setErrorState((p) => ({ ...p, [errKey]: true }));
        }
      } catch (e) {
        console.error(e);
        toast.error("Error checking BL/MBL.");
      }
    },
    [formData, extractId, sqlEscape]
  );

  const handleBlurEventFunctions = {
    checkBlForCompany,
  };

  useEffect(() => {
    async function fetchInvoiceData() {
      if (!mode?.formId) return;

      try {
        const blQuery = {
          columns: `
            b.id AS blId,
            b.mblNo AS blNo,
            c.name AS beneficiaryName,
            c.id AS beneficiaryId
          `,
          tableName: "tblInvoice i",
          joins: `
            LEFT JOIN tblBl b ON b.id = i.blId
            LEFT JOIN tblCompany c ON c.id = b.companyId
          `,
          whereCondition: `i.id = ${mode.formId}`,
        };

        const { data: blData, success: blSuccess } = await getDataWithCondition(
          blQuery
        );
        if (!blSuccess || !blData?.length) return;

        const blId = blData[0].blId;

        const allInvoicesQuery = {
          columns: "id",
          tableName: "tblInvoice",
          whereCondition: `blId = ${blId} AND ISNULL(status,1)=1`,
        };
        const { data: invoiceList, success: invSuccess } =
          await getDataWithCondition(allInvoicesQuery);
        if (!invSuccess || !invoiceList?.length) return;

        const invoiceIds = invoiceList.map((r) => r.id);
        setInitialInvoiceIds(invoiceIds); // ✅ keep original ids

        const resArray = [];

        const promises = invoiceIds.map(async (id) => {
          const format = formatFetchForm(
            data,
            "tblInvoice",
            id,
            '["tblInvoiceRequestContainer","tblAttachment"]',
            "invoiceRequestId"
          );
          const { success, result } = await fetchForm(format);
          if (success) resArray.push(formatDataWithForm(result, data));
        });

        await Promise.allSettled(promises);
        if (!resArray.length) return;

        const formattedState = formatDataWithFormThirdLevel(
          resArray,
          [...data.igmFields],
          "tblInvoice"
        );

        setFormData({
          ...formattedState,
          blId: blData[0].blId,
          blNo: blData[0].blNo,
          beneficiaryName: {
            Id: blData[0].beneficiaryId,
            Name: blData[0].beneficiaryName,
          },
        });

        setInvoiceArray(
          Array.from({ length: formattedState.tblInvoice.length }, (_, i) => i)
        );
        setFieldsMode(mode.mode || "");
      } catch (err) {
        console.error("❌ Error fetching Invoice Payment:", err);
        toast.error("Error loading invoice data.");
      }
    }

    fetchInvoiceData();
  }, [mode.formId, mode.mode, data]);

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      const blId = formData?.blId;
      if (!blId) {
        toast.error("BL not found. Please check BL No first.");
        return;
      }

      const invoiceTabs = formData?.tblInvoice || [];

      // for ADD mode: must have at least one invoice
      if (invoiceTabs.length === 0 && !mode.formId) {
        toast.warn("Please add at least one invoice before submitting.");
        return;
      }

      let allSuccess = true;

      // ✅ 1) Save current (visible) invoices
      const savePromises = invoiceTabs.map(async (invoice, index) => {
        const invoiceId = invoice?.id ?? null;
        const { blNo, beneficiaryName, companyName, ...cleanInvoice } = invoice;

        const formatted = formatFormData(
          "tblInvoice",
          {
            ...cleanInvoice,
            blId,
            tblInvoiceRequestContainer:
              invoice.tblInvoiceRequestContainer || [],
          },
          invoiceId,
          "invoiceRequestId"
        );

        const { success, message, error } = await insertUpdateForm(formatted);
        if (success) {
          toast.success(`Invoice ${index + 1} saved successfully.`);
        } else {
          allSuccess = false;
          toast.error(error || message);
        }
      });

      await Promise.allSettled(savePromises);

      // ✅ 2) Soft delete invoices that were removed (status = 0)
      const currentIds = (formData.tblInvoice || [])
        .map((inv) => inv?.id)
        .filter(Boolean);

      const deletedIds = initialInvoiceIds.filter(
        (id) => !currentIds.includes(id)
      );

      if (deletedIds.length > 0) {
        const rowsPayload = deletedIds.map((id) => ({
          id,
          status: 0,
        }));

        const { success, message, error } = await updateStatusRows({
          tableName: "tblInvoice",
          rows: rowsPayload,
          keyColumn: "id",
        });

        if (!success) {
          allSuccess = false;
          toast.error(error || message || "Failed to delete removed invoices.");
        }
      }

      if (allSuccess) {
        toast.success("Payment invoice(s) saved successfully.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error submitting invoices.");
    }
  };

  /* ✅ Quick Pay Redirect */
  const quickPayHandler = () => {
    const blId = formData?.blId;
    if (!blId) {
      toast.error("Please select a BL first!");
      return;
    }
    router.push(`/request/invoicePayment/payment?blId=${blId}`);
  };

  const handleFilesChange = async (fileList) => {
    try {
      setFiles(fileList || []);
      const userId = 181; // e.g. from cookies / store / props
      const payload = await extractTextFromPdfs(fileList, userId);
      console.log("PDF → JSON payload for SP:", payload);
      setAttachData(payload);
    } catch (err) {
      console.error("Error processing uploaded PDFs:", err);
      toast.error("Error processing PDF files.");
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <form onSubmit={submitHandler}>
        <section className="py-2 px-4">
          <Box className="flex justify-between items-end mb-2">
            <h1 className="text-left text-base m-0">Payment New Invoice</h1>
            <Box className="flex gap-2">
              <CustomButton text="Back" href="/request/invoicePayment/list" />
            </Box>
          </Box>

          <FormHeading text="BL Information" variant="body2" />
          <Box className="grid grid-cols-4 gap-2 p-2">
            <CustomInput
              fields={jsonData.igmFields}
              formData={formData}
              setFormData={setFormData}
              fieldsMode={fieldsMode}
              handleBlurEventFunctions={{ checkBlForCompany }}
              errorState={errorState}
            />
          </Box>

          <FormHeading text="Invoice Details" variant="body2" />
          <Box className="border border-gray-300 p-3 mt-2 flex flex-col gap-1">
            <Box sx={{ p: 2 }}>
              <MultiFileUpload
                label="Attach documents"
                helperText="You can select multiple PDFs/images."
                accept="image/*,.pdf"
                onChange={handleFilesChange}
              />
            </Box>
          </Box>

          {/* Tabs */}
          <Box className="px-3">
            <Tabs
              value={tabValue}
              onChange={handleChangeTab}
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
              <Box className="border p-3 mt-2">
                <Box className="grid grid-cols-4 gap-2 p-2">
                  <CustomInput
                    fields={jsonData.invoiceFieldsTop}
                    formData={formData}
                    setFormData={setFormData}
                    fieldsMode={fieldsMode}
                    tabName="tblInvoice"
                    tabIndex={index}
                    handleBlurEventFunctions={{ checkBlForCompany }}
                    errorState={errorState}
                  />
                </Box>

                <FormHeading text="Container Details" variant="body2" />
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

          {/* Footer Buttons */}
          {fieldsMode !== "view" && (
            <Box className="w-full flex justify-center gap-2 mt-4">
              <CustomButton text="Quick Pay" onClick={quickPayHandler} />
              <CustomButton text="Save" type="submit" />
            </Box>
          )}
        </section>
      </form>

      <ToastContainer />
    </ThemeProvider>
  );
}
