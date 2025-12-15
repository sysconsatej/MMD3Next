"use client";

import { useEffect, useState, useCallback } from "react";
import { ThemeProvider, Box, Tabs, Tab } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";

import { theme } from "@/styles";
import { toast, ToastContainer } from "react-toastify";
import CustomButton from "@/components/button/button";
import { CustomInput } from "@/components/customInput";
import FormHeading from "@/components/formHeading/formHeading";
import TableGrid from "@/components/tableGrid/tableGrid";

import data, { receiptGridButtons } from "./blReceiptData";
import { getDataWithCondition, fetchForm, insertUpdateForm } from "@/apis";
import {
  formatFetchForm,
  formatDataWithForm,
  formatFormData,
  getUserByCookies,
} from "@/utils";
import { formStore, useBackLinksStore, useBlWorkFlowData } from "@/store";

function CustomTabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box className="pt-2">{children}</Box>}
    </div>
  );
}

export default function ReceiptForm() {
  const { mode } = formStore();
  const initialMode = mode?.mode || "";

  const [formData, setFormData] = useState({});
  const [fieldsMode, setFieldsMode] = useState(initialMode);
  const [jsonData] = useState(data);
  const [tabValue, setTabValue] = useState(0);

  const receipts = formData.tblReceipt || [];

  const { link } = useBackLinksStore();
  const  { setClearData } = useBlWorkFlowData();

  const handleAddReceipt = () => {
    const nextReceipts = [...receipts, { tblAttachment: [] }];
    setFormData((p) => ({ ...p, tblReceipt: nextReceipts }));
    setTabValue(nextReceipts.length - 1);
  };

  const handleRemove = (index) => {
    const updated = receipts.filter((_, i) => i !== index);
    setFormData((p) => ({ ...p, tblReceipt: updated }));

    if (updated.length === 0) setTabValue(0);
    else if (tabValue >= updated.length) setTabValue(updated.length - 1);
    else if (tabValue > index) setTabValue((old) => old - 1);
  };

  const fetchBlDetails = useCallback(
    async (event) => {
      const userData = getUserByCookies();
      const blNo = event?.target?.value?.trim();
      if (!blNo) return;

      try {
        const blQuery = {
          columns: "TOP 1 id",
          tableName: "tblBl",
          whereCondition: `ISNULL(hblNo, mblNo) = '${blNo}'
            AND ISNULL(status,1) = 1
            AND shippingLineId = ${userData?.companyId}`,
        };

        const { success: blSuccess, data: blData } = await getDataWithCondition(
          blQuery
        );

        if (!blSuccess || !blData?.length) {
          toast.error("BL not found.");
          return;
        }

        const blId = blData[0].id;

        const payQuery = {
          columns:
            "i.id, i.Amount, i.createdBy, i.receiptNo, i.receiptDate, i.createdDate",
          tableName:
            "tblInvoicePayment i LEFT JOIN tblMasterData m ON m.id = i.paymentStatusId",
          whereCondition: `m.name = 'Payment Confirmed'
            AND i.blId = ${blId}
            AND ISNULL(i.status,1) = 1`,
          orderBy: "i.id DESC",
        };

        const { data: payData } = await getDataWithCondition(payQuery);
        const payments = Array.isArray(payData) ? payData : [];

        if (!payments.length) {
          toast.warn("No Payment Confirmed found for this BL.");
          setFormData((prev) => ({
            ...prev,
            blId,
            blNo,
            payorName: null,
            tblReceipt: [],
          }));
          setTabValue(0);
          return;
        }

        const firstPayorId = payments[0]?.createdBy;
        let payorObj = null;

        if (firstPayorId) {
          const payorQuery = {
            columns: "TOP 1 id, name",
            tableName: "tblUser",
            whereCondition: `id = ${firstPayorId}`,
          };
          const { data: payorData } = await getDataWithCondition(payorQuery);
          if (Array.isArray(payorData) && payorData.length) {
            payorObj = { Id: payorData[0].id, Name: payorData[0].name };
          }
        }

        const attachmentMap = {};
        const promises = payments.map(async (p) => {
          try {
            const fmt = formatFetchForm(
              jsonData,
              "tblInvoicePayment",
              p.id,
              '["tblAttachment"]',
              "invoicePaymentId"
            );

            const { success, result } = await fetchForm(fmt);

            if (success && result) {
              const parsed = formatDataWithForm(result, jsonData);
              attachmentMap[p.id] = Array.isArray(parsed?.tblAttachment)
                ? parsed.tblAttachment
                : [];
            } else {
              attachmentMap[p.id] = [];
            }
          } catch (e) {
            attachmentMap[p.id] = [];
          }
        });

        await Promise.allSettled(promises);

        const nextReceipts = payments.map((p) => ({
          id: p.id,
          Amount: p.Amount || 0,
          receiptNo: p.receiptNo || "",
          receiptDate: p.receiptDate || "",
          tblAttachment: attachmentMap[p.id] || [],
        }));

        setFormData((prev) => ({
          ...prev,
          blId,
          blNo,
          payorName: payorObj,
          tblReceipt: nextReceipts,
        }));

        setTabValue(0);
      } catch (err) {
        toast.error("Error fetching BL details.");
      }
    },
    [jsonData]
  );

  const handleBlurEventFunctions = { fetchBlDetails };

  // -------------------------------
  // ⭐ NEW VIEW MODE LOGIC (ONLY CHANGE)
  // -------------------------------
  useEffect(() => {
    async function loadViewMode() {
      if (!mode?.formId || fieldsMode !== "view") return;

      try {
        const ids = mode.formId
          .split(",")
          .map((x) => Number(x.trim()))
          .filter(Boolean);

        if (!ids.length) return;

        const firstId = ids[0];

        // 1️⃣ Fetch BL No + Payor Name only once
        const headerQuery = {
          columns: `
            ISNULL(b.hblNo, b.mblNo) AS blNo,
            u.name AS payorName
          `,
          tableName: "tblInvoicePayment p",
          joins: `
            JOIN tblBl b ON b.id = p.blId
            JOIN tblUser u ON u.id = p.createdBy
          `,
          whereCondition: `p.id = ${firstId}`,
        };

        const { success: hdrSuccess, data: hdrData } =
          await getDataWithCondition(headerQuery);

        if (!hdrSuccess || !hdrData?.length) return;

        const blNo = hdrData[0].blNo;
        const payorName = hdrData[0].payorName;

        setFormData((prev) => ({
          ...prev,
          blNo,
          payorName: { Id: null, Name: payorName },
        }));

        // 2️⃣ Fetch individual receipts using fetchForm
        const receiptArr = [];

        const promises = ids.map(async (id) => {
          const fmt = formatFetchForm(
            jsonData,
            "tblInvoicePayment",
            id,
            '["tblAttachment"]',
            "invoicePaymentId"
          );

          const { success, result } = await fetchForm(fmt);
          if (!success) return;

          const mapped = formatDataWithForm(result, jsonData);

          receiptArr.push({
            id,
            receiptNo: mapped.receiptNo || "",
            receiptDate: mapped.receiptDate || "",
            Amount: mapped.Amount || 0,
            tblAttachment: mapped.tblAttachment || [],
          });
        });

        await Promise.all(promises);

        setFormData((prev) => ({
          ...prev,
          tblReceipt: receiptArr,
        }));

        setTabValue(0);
      } catch (e) {
        toast.error("Failed loading view mode data.");
      }
    }

    loadViewMode();
  }, [mode?.formId, fieldsMode]);
  // -------------------------------

  useEffect(() => {
    if (mode?.formId && fieldsMode !== "view") {
      setFieldsMode(mode?.mode || "");
      loadFromPaymentId(mode.formId);
    } else {
      setFieldsMode(initialMode);
    }
  }, [mode?.formId, mode?.mode]);

  const loadFromPaymentId = useCallback(
    async (paymentId) => {
      if (!paymentId) return;
      try {
        const q = {
          columns: `TOP 1 ISNULL(b.hblNo, b.mblNo) AS blNo`,
          tableName: "tblInvoicePayment i",
          joins: "JOIN tblBl b ON b.id = i.blId",
          whereCondition: `i.id = ${paymentId}`,
        };

        const { success, data } = await getDataWithCondition(q);
        if (!success || !Array.isArray(data) || !data.length) return;

        const blNo = data[0]?.blNo;
        if (!blNo) return;

        setFormData((p) => ({ ...p, blNo }));
        await fetchBlDetails({ target: { value: blNo } });
      } catch (e) {
        toast.error("Failed to load receipt by payment id.");
      }
    },
    [fetchBlDetails]
  );

  const handleSubmit = async () => {
    try {
      const rows = Array.isArray(formData?.tblReceipt)
        ? formData.tblReceipt
        : [];
      if (!rows.length) return toast.error("No receipt tabs found.");

      let allSuccess = true;

      const savePromises = rows.map(async (row, index) => {
        const invoicePaymentId = row?.id ?? null;
        if (!invoicePaymentId) {
          allSuccess = false;
          toast.error(`Payment id missing in Receipt ${index + 1}`);
          return;
        }

        const attachments = Array.isArray(row?.tblAttachment)
          ? row.tblAttachment
          : [];

        const cleanedAttachments = attachments.map((a) => {
          const { invoicePaymentId: _dup, ...rest } = a || {};
          return rest;
        });

        const normalized = {
          receiptNo: row?.receiptNo || "",
          receiptDate: row?.receiptDate || "",
          tblAttachment: cleanedAttachments,
        };

        const payload = formatFormData(
          "tblInvoicePayment",
          normalized,
          invoicePaymentId,
          "invoicePaymentId"
        );

        const res = await insertUpdateForm(payload);

        if (!res?.success) {
          allSuccess = false;
          toast.error(res?.message || `Failed to save Receipt ${index + 1}`);
        } else {
          toast.success(`Receipt ${index + 1} saved successfully.`);
        }
      });

      await Promise.allSettled(savePromises);

      if (allSuccess) toast.success("Receipt details saved successfully.");
    } catch (err) {
      toast.error("Error while saving receipt details.");
    }
  };


  const handleClick =  ()  =>  {
    setClearData([])
  }

  return (
    <ThemeProvider theme={theme}>
      <section className="p-5">
        <Box className="flex justify-between items-end mb-2">
          <h1 className="text-left text-base m-0">New Receipt</h1>
          <CustomButton
            text="Back"
            href={link?.blStatus ? "/bl-status" : "invoice/blReceipt/list"}
            onClick={handleClick}
          />
        </Box>

        <FormHeading text="BL Details" />
        <Box className="grid grid-cols-4 gap-2 p-2">
          <CustomInput
            fields={jsonData.blFields}
            formData={formData}
            setFormData={setFormData}
            fieldsMode={fieldsMode}
            errorState={{}}
            handleBlurEventFunctions={handleBlurEventFunctions}
          />
        </Box>

        <FormHeading text="Receipt Details" />

        <Box className="px-2 mt-4">
          <Tabs
            value={tabValue}
            onChange={(e, v) => setTabValue(v)}
            variant="scrollable"
          >
            {receipts.map((_, i) => (
              <Tab
                key={i}
                label={`Receipt ${i + 1}`}
                icon={
                  <CloseIcon
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(i);
                    }}
                  />
                }
                iconPosition="end"
              />
            ))}
            {fieldsMode !== "view" && (
              <Tab
                icon={<AddIcon />}
                iconPosition="end"
                label="Add Receipt"
                onClick={handleAddReceipt}
              />
            )}
          </Tabs>
        </Box>

        {receipts.map((_, index) => (
          <CustomTabPanel key={index} value={tabValue} index={index}>
            <Box className="border p-3 mt-2">
              <Box className="grid grid-cols-3 gap-2 p-2">
                <CustomInput
                  fields={jsonData.receiptFieldsTop}
                  formData={formData}
                  setFormData={setFormData}
                  tabName="tblReceipt"
                  tabIndex={index}
                  fieldsMode={fieldsMode}
                  errorState={{}}
                  handleBlurEventFunctions={handleBlurEventFunctions}
                />
              </Box>

              <FormHeading text="Attachment Details" />
              <TableGrid
                fields={jsonData.tblAttachment}
                formData={formData}
                setFormData={setFormData}
                fieldsMode={fieldsMode}
                gridName="tblAttachment"
                buttons={receiptGridButtons}
                tabName="tblReceipt"
                tabIndex={index}
              />
            </Box>
          </CustomTabPanel>
        ))}

        {fieldsMode !== "view" && (
          <Box className="mt-4 flex justify-center">
            <CustomButton text="Save" onClick={handleSubmit} />
          </Box>
        )}
      </section>

      <ToastContainer />
    </ThemeProvider>
  );
}
