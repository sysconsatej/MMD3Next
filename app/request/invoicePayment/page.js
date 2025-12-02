"use client";

import { useState, useCallback, useEffect } from "react";
import { ThemeProvider, Box, Tabs, Tab } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import { theme } from "@/styles";
import { ToastContainer, toast } from "react-toastify";
import { CustomInput } from "@/components/customInput";
import CustomButton from "@/components/button/button";
import FormHeading from "@/components/formHeading/formHeading";
import TableGrid from "@/components/tableGrid/tableGrid";
import { formStore } from "@/store";
import data, { cfsGridButtons } from "./invoicePaymentData";
import {
  getDataWithCondition,
  fetchForm,
  insertUpdateForm,
  updateStatusRows,
} from "@/apis";
import {
  formatFormData,
  formatDataWithForm,
  formatDataWithFormThirdLevel,
  formatFetchForm,
  getUserByCookies,
} from "@/utils";
import { useRouter } from "next/navigation";
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
  const initialMode = mode.mode || "";

  const [formData, setFormData] = useState({});
  const [fieldsMode, setFieldsMode] = useState(initialMode);
  const [jsonData] = useState(data);
  const router = useRouter();

  const [tabValue, setTabValue] = useState(0);
  const [errorState, setErrorState] = useState({});
  const [containerData, setContainerData] = useState([]);
  const [invoiceReqId, setInvoiceReqId] = useState(null);

  const [initialInvoiceIds, setInitialInvoiceIds] = useState([]);
  const [deletedInvoiceIds, setDeletedInvoiceIds] = useState([]);

  const userData = getUserByCookies();
  const invoices = formData.tblInvoice || [];

  const handleChangeTab = (_e, newValue) => setTabValue(newValue);

  const handleAddInvoice = () => {
    const nextInvoices = [
      ...invoices,
      { tblInvoiceRequestContainer: containerData, tblAttachment: [] },
    ];
    setFormData((prev) => ({ ...prev, tblInvoice: nextInvoices }));
    setTabValue(nextInvoices.length - 1);
  };

  const handleRemove = (index) => {
    const toRemove = invoices[index];

    if (toRemove?.id) {
      setDeletedInvoiceIds((prev) =>
        prev.includes(toRemove.id) ? prev : [...prev, toRemove.id]
      );
    }

    const nextInvoices = invoices.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, tblInvoice: nextInvoices }));

    if (nextInvoices.length === 0) {
      setTabValue(0);
    } else if (tabValue >= nextInvoices.length) {
      setTabValue(nextInvoices.length - 1);
    } else if (tabValue > index) {
      setTabValue((old) => old - 1);
    }
  };

  const extractId = useCallback((v) => {
    if (v && typeof v === "object") {
      return v.id ?? v.value ?? v.companyId ?? v.Id ?? null;
    }
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }, []);

  const sqlEscape = useCallback((s = "") => String(s).replace(/'/g, "''"), []);

  // 🔹 Load containers by BL ID (used in BL check + edit mode)
  const loadBlContainersByBlId = useCallback(async (blId) => {
    if (!blId) return;

    const payload = {
      columns:
        "c.containerNo, c.sizeId, (SELECT name FROM tblMasterData m WHERE m.id = c.sizeId) AS sizeName",
      tableName: "tblBlContainer c",
      whereCondition: `c.blId = ${blId} AND ISNULL(c.status,1) = 1`,
    };

    try {
      const { success, data, message, error } = await getDataWithCondition(
        payload
      );
      if (!success) {
        toast.error(error || message || "Failed to fetch BL containers.");
        return;
      }

      const rows = (data || []).map((row) => ({
        containerNo: row.containerNo,
        sizeId: row.sizeId
          ? { Id: row.sizeId, Name: row.sizeName || String(row.sizeId) }
          : null,
      }));

      setContainerData(rows);
    } catch (e) {
      toast.error(e?.message || String(e));
    }
  }, []);

  async function setInvoiceRequestId(blNo) {
    const payload = {
      columns: "id",
      tableName: "tblInvoiceRequest",
      whereCondition: `blNo = '${blNo}' and companyId = ${userData.companyId} and status = 1 and createdDate = (select max(createdDate) from tblInvoiceRequest where blNo = '${blNo}' and companyId = ${userData.companyId} and status = 1 )`,
    };

    try {
      const { success, data } = await getDataWithCondition(payload);
      if (success && Array.isArray(data) && data.length) {
        setInvoiceReqId(data[0].id);
      } else {
        setInvoiceReqId(null);
      }
    } catch (e) {
      toast.error(e?.message || String(e));
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
        columns: `
          TOP 1 
            b.id, 
            ISNULL(b.hblNo, b.mblNo) AS blNo,
            b.fpdId,
            p.name AS fpdName
        `,
        tableName: "tblBl b",
        joins: "LEFT JOIN tblPort p ON p.id = b.fpdId",
        whereCondition: `
          ISNULL(b.hblNo,b.mblNo) = '${sqlEscape(typed)}'
          AND b.shippingLineId = ${companyId}
          AND ISNULL(b.status, 1) = 1`,
      };

      try {
        const { success, data } = await getDataWithCondition(payload);
        if (success && Array.isArray(data) && data.length > 0) {
          const row = data[0];

          toast.success("BL found for this Beneficiary.");
          setFormData((p) => ({
            ...p,
            blId: row.id,
            location: row.fpdId
              ? { Id: row.fpdId, Name: row.fpdName || "" }
              : null,
          }));
          setErrorState((p) => ({ ...p, [errKey]: false }));

          // 👉 Only set containerData, DON'T create invoice tab here
          await loadBlContainersByBlId(row.id);
          await setInvoiceRequestId(typed);
        } else {
          toast.error("BL not found for this Beneficiary.");
          setErrorState((p) => ({ ...p, [errKey]: true }));
        }
      } catch (e) {
        console.error(e);
        toast.error("Error checking BL/MBL.");
      }
    },
    [formData, extractId, sqlEscape, loadBlContainersByBlId]
  );

  const handleBlurEventFunctions = {
    checkBlForCompany,
  };

  // 🔹 Load existing invoices (EDIT mode)
  useEffect(() => {
    async function fetchInvoiceData() {
      if (!mode?.formId) return;

      try {
        const blQuery = {
          columns: `
            b.id AS blId,
            ISNULL(b.hblNo,b.mblNo) AS blNo,
            c.name AS beneficiaryName,
            c.id AS beneficiaryId,
            b.fpdId,
            p.name AS fpdName,
            i.invoicePaymentId as invoicePaymentId
          `,
          tableName: "tblInvoice i",
          joins: `
            LEFT JOIN tblBl b ON b.id = i.blId
            LEFT JOIN tblCompany c ON c.id = b.companyId
            LEFT JOIN tblPort p ON p.id = b.fpdId
          `,
          whereCondition: `i.id = ${mode.formId}`,
        };

        const { data: blData, success: blSuccess } = await getDataWithCondition(
          blQuery
        );
        if (!blSuccess || !blData?.length) return;

        const blId = blData[0].blId;

        // 👉 initialise containerData in edit mode
        await loadBlContainersByBlId(blId);
        await setInvoiceRequestId(blData?.[0]?.blNo)

        const allInvoicesQuery = {
          columns: "id",
          tableName: "tblInvoice",
          whereCondition: `blId = ${blId} and invoicePaymentId  ${
            blData?.[0]?.invoicePaymentId
              ? "= " + blData?.[0]?.invoicePaymentId
              : "is null"
          } AND status=1`,
        };
        const { data: invoiceList, success: invSuccess } =
          await getDataWithCondition(allInvoicesQuery);
        if (!invSuccess || !invoiceList?.length) return;

        const invoiceIds = invoiceList.map((r) => r.id);
        setInitialInvoiceIds(invoiceIds);

        const resArray = [];

        const promises = invoiceIds.map(async (id) => {
          const fmt = formatFetchForm(
            data,
            "tblInvoice",
            id,
            '["tblInvoiceRequestContainer","tblAttachment"]',
            "invoiceRequestId"
          );
          const { success, result } = await fetchForm(fmt);
          if (success) {
            const parsed = formatDataWithForm(result, data);
            resArray.push({ ...parsed, id });
          }
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
          location: blData[0].fpdId
            ? { Id: blData[0].fpdId, Name: blData[0].fpdName || "" }
            : null,
        });

        setFieldsMode(mode.mode || "");
        setTabValue(0);
      } catch (err) {
        console.error("❌ Error fetching Invoice Payment:", err);
        toast.error("Error loading invoice data.");
      }
    }

    fetchInvoiceData();
  }, [mode.formId, mode.mode, data, loadBlContainersByBlId]);

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      const blId = formData?.blId;
      if (!blId) {
        toast.error("BL not found. Please check BL No first.");
        return;
      }

      const invoiceTabs = formData?.tblInvoice || [];

      if (invoiceTabs.length === 0 && !mode.formId) {
        toast.warn("Please add at least one invoice before submitting.");
        return;
      }

      let allSuccess = true;

      const savePromises = invoiceTabs.map(async (invoice, index) => {
        const invoiceId = invoice?.id ?? null;

        const {
          blNo,
          beneficiaryName,
          companyName,
          id: _ignoreId,
          tblInvoiceRequestContainer,
          tblAttachment,
          ...cleanInvoice
        } = invoice || {};

        const formatted = formatFormData(
          "tblInvoice",
          {
            ...cleanInvoice,
            invoiceRequestId: invoiceReqId,
            blId,
            companyId: userData?.companyId,
            companyBranchId: userData?.companyBranchId,
            tblInvoiceRequestContainer: tblInvoiceRequestContainer || [],
            tblAttachment: tblAttachment || [],
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

      if (deletedInvoiceIds.length > 0) {
        const rowsPayload = deletedInvoiceIds.map((id) => ({
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

  const quickPayHandler = () => {
    const blId = formData?.blId;
    if (!blId) {
      toast.error("Please select a BL first!");
      return;
    }
    router.push(`/request/invoicePayment/payment?blId=${blId}`);
  };

  // 🔹 FIXED: do not double tabs in ADD mode
  const handleFilesChange = async (fileList) => {
    try {
      const filesArr = Array.from(fileList || []);
      if (!filesArr.length) return;

      const parsed = await extractTextFromPdfs(filesArr);
      console.log("Extracted invoice data from PDFs:", parsed);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        toast.warn("No invoice data found in uploaded file(s).");
        return;
      }

      const containers = containerData || [];

      const fromPdf = parsed.map((row, idx) => {
        const file = filesArr[idx] || filesArr[0];

        const defaultAttachment =
          row.tblAttachment && row.tblAttachment.length
            ? row.tblAttachment
            : file
            ? [
                {
                  uploadInvoice: file.name,
                  path: file.name,
                },
              ]
            : [];

        const { id: _ignoreId, ...restRow } = row || {};

        return {
          ...restRow,
          tblInvoiceRequestContainer: containers,
          tblAttachment: defaultAttachment,
        };
      });

      const isEditMode = !!mode?.formId;

      if (isEditMode) {
        // EDIT → keep existing invoices and append new ones
        const existingLen = invoices.length;

        setFormData((prev) => {
          const existing = Array.isArray(prev.tblInvoice)
            ? prev.tblInvoice
            : [];
          return {
            ...prev,
            tblInvoice: [...existing, ...fromPdf],
          };
        });

        const newTotal = existingLen + fromPdf.length;
        if (newTotal > 0) setTabValue(newTotal - 1);
      } else {
        // ADD → always REPLACE with current upload
        setFormData((prev) => ({
          ...prev,
          tblInvoice: [...(prev?.tblInvoice || []), ...fromPdf],
        }));

        if (fromPdf.length > 0) setTabValue(fromPdf.length - 1);
      }

      toast.success("Invoices created from PDF(s).");
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
          <Box className="grid grid-cols-3 gap-2 p-2">
            <CustomInput
              fields={jsonData.igmFields}
              formData={formData}
              setFormData={setFormData}
              fieldsMode={fieldsMode}
              handleBlurEventFunctions={handleBlurEventFunctions}
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

          <Box className="px-3">
            <Tabs
              value={tabValue}
              onChange={handleChangeTab}
              variant="scrollable"
            >
              {invoices.map((_, index) => (
                <Tab
                  key={index}
                  label={`Invoice No (${
                    formData?.tblInvoice?.[index]?.invoiceNo ?? index + 1
                  })`}
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

          {invoices.map((_, index) => (
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
                    handleBlurEventFunctions={handleBlurEventFunctions}
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

                <FormHeading text="Attachment Details" variant="body2" />
                <TableGrid
                  fields={jsonData.tblAttachment}
                  formData={formData}
                  setFormData={setFormData}
                  fieldsMode={fieldsMode}
                  gridName="tblAttachment"
                  buttons={[]}
                  tabName="tblInvoice"
                  tabIndex={index}
                />
              </Box>
            </CustomTabPanel>
          ))}

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
