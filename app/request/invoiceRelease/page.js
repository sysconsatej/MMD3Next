"use client";
import React, { useEffect, useState } from "react";
import {
  ThemeProvider,
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import { theme } from "@/styles";
import { ToastContainer, toast } from "react-toastify";
import FormHeading from "@/components/formHeading/formHeading";
import CustomButton from "@/components/button/button";
import TableGrid from "@/components/tableGrid/tableGrid";
import fieldData, { cfsGridButtons } from "./invoiceReleaseData";
import { CustomInput } from "@/components/customInput";
import { useSearchParams } from "next/navigation";
import { formStore } from "@/store";
import { getDataWithCondition, fetchForm } from "@/apis";
import {
  formatFetchForm,
  formatDataWithForm,
  formatDataWithFormThirdLevel,
} from "@/utils";
import invoiceRequestData from "../invoiceRequest/invoiceRequestData";

function CustomTabPanel({ children, value, index }) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box className="pt-2">{children}</Box>}
    </div>
  );
}

export default function InvoiceReleasePage() {
  const searchParams = useSearchParams();
  const { mode } = formStore();
  const blIdFromQS = searchParams.get("blId");
  const blIdFromStore = mode?.formId;
  const blIdResolved = blIdFromQS || blIdFromStore;

  const [formData, setFormData] = useState({});
  const [formDataRequest, setFormDataRequest] = useState({});
  const [fieldsMode, setFieldsMode] = useState("view");
  const [tabValue, setTabValue] = useState(0);
  const [invoiceArray, setInvoiceArray] = useState([0]);
  const [loading, setLoading] = useState(false);

  const handleChangeTab = (_e, newValue) => setTabValue(newValue);
  const handleAddInvoice = () => {
    setInvoiceArray((prev) => [...prev, prev.length]);
    setTabValue(invoiceArray.length);
  };
  const handleRemove = (index) => {
    setInvoiceArray((prev) => prev.filter((_, i) => i !== index));
    if (tabValue >= index && tabValue > 0) setTabValue(tabValue - 1);
  };

  useEffect(() => {
    async function loadByBl() {
      if (!blIdResolved) return;

      try {
        setLoading(true);

        // 1️⃣ BL Info
        const blQ = {
          columns: `
            b.id AS blId,
            b.mblNo AS blNo,
            c.id AS beneficiaryId,
            c.name AS beneficiaryName
          `,
          tableName: "tblBl b",
          joins: "LEFT JOIN tblCompany c ON c.id = b.companyId",
          whereCondition: `b.id = ${Number(
            blIdResolved
          )} AND ISNULL(b.status,1)=1`,
        };
        const { success: blOk, data: blRes } = await getDataWithCondition(blQ);
        if (!blOk || !blRes?.length) {
          toast.error("BL not found.");
          return;
        }

        const { blId, blNo, beneficiaryId, beneficiaryName } = blRes[0];

        // 2️⃣ Invoices for BL
        const invQ = {
          columns: "id",
          tableName: "tblInvoice",
          whereCondition: `blId = ${Number(blId)} AND ISNULL(status,1)=1`,
        };
        const { success: invOk, data: invRows } = await getDataWithCondition(
          invQ
        );
        const collected = [];

        if (invOk && invRows?.length) {
          const invoiceIds = invRows.map((r) => r.id);

          await Promise.allSettled(
            invoiceIds.map(async (invoiceId) => {
              const fmt = formatFetchForm(
                fieldData,
                "tblInvoice",
                invoiceId,
                '["tblInvoiceRequestContainer","tblAttachement"]',
                "invoiceRequestId"
              );
              const { success, result } = await fetchForm(fmt);
              if (success)
                collected.push(formatDataWithForm(result, fieldData));
            })
          );
        }

        const normalized = collected.length
          ? formatDataWithFormThirdLevel(
              collected,
              [...fieldData.igmFields],
              "tblInvoice"
            )
          : {};

        setFormData({
          ...normalized,
          blId,
          blNo,
          beneficiaryName: { Id: beneficiaryId, Name: beneficiaryName },
        });

        setInvoiceArray(
          Array.from(
            { length: (normalized.tblInvoice || []).length || 1 },
            (_, i) => i
          )
        );

        setFieldsMode("view");
        setTabValue(0);

        // 3️⃣ Fetch related Invoice Request
        const reqQ = {
          columns: "r.id",
          tableName: "tblInvoiceRequest r",
          joins: "JOIN tblBl b ON b.mblNo = r.blNo",
          whereCondition: `b.id = ${blId}`,
        };

        const { success: reqOk, data: reqRes } = await getDataWithCondition(
          reqQ
        );
        if (reqOk && reqRes?.length > 0) {
          const reqId = reqRes[0].id;
          const format = formatFetchForm(
            invoiceRequestData,
            "tblInvoiceRequest",
            reqId,
            '["tblInvoiceRequestContainer","tblAttachement"]',
            "invoiceRequestId"
          );

          const { success, result } = await fetchForm(format);
          if (success) {
            const reqData = formatDataWithForm(result, invoiceRequestData);
            setFormDataRequest(reqData);
          }
        } else {
          setFormDataRequest({});
          toast.info("No linked Invoice Request found for this BL.");
        }
      } catch (err) {
        console.error("InvoiceRelease load error:", err);
        toast.error("Error loading Invoice Release data.");
      } finally {
        setLoading(false);
      }
    }

    loadByBl();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blIdResolved]);

  return (
    <ThemeProvider theme={theme}>
      <Box className="p-4">
        {/* Title */}
        <Typography
          variant="h6"
          sx={{
            mb: 1,
            fontWeight: 600,
            background: "linear-gradient(90deg,#ff7e5f,#feb47b,#42a5f5)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Release Invoices
        </Typography>
        {/* Header Row: BL Info + Back Button */}
        <Box className="flex items-center justify-between mb-2">
          <Typography
            variant="body2"
            sx={{
              fontWeight: 500,
              fontSize: "0.95rem",
            }}
          >
            Invoice Details - <b>BL No. {formData?.blNo || "—"}</b>
          </Typography>

          <CustomButton text="Back" href="/request/invoiceRelease/list" />
        </Box>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={tabValue}
            onChange={handleChangeTab}
            variant="scrollable"
          >
            {invoiceArray.map((_, index) => (
              <Tab
                key={index}
                label={`Invoice ${index + 1}`}
                icon={
                  <CloseIcon
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(index);
                    }}
                    fontSize="small"
                  />
                }
                iconPosition="end"
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

        {/* Invoice Tabs */}
        {invoiceArray.map((_, index) => (
          <CustomTabPanel key={index} value={tabValue} index={index}>
            <Box className="border p-3 mt-2">
              <FormHeading text="Invoice Details" variant="body2" />
              <Box className="grid grid-cols-4 gap-2 p-2">
                <CustomInput
                  fields={fieldData.invoiceFieldsTop}
                  formData={formData}
                  setFormData={setFormData}
                  fieldsMode={fieldsMode}
                  tabName="tblInvoice"
                  tabIndex={index}
                />
              </Box>

              <Box className="grid grid-cols-2 gap-4 mt-3">
                <Box>
                  <FormHeading text="Attachment Details" variant="body2" />
                  <TableGrid
                    fields={fieldData.attachmentFields}
                    formData={formData}
                    setFormData={setFormData}
                    fieldsMode={fieldsMode}
                    gridName="tblAttachment"
                    buttons={cfsGridButtons}
                    tabName="tblInvoice"
                    tabIndex={index}
                  />
                </Box>
                <Box>
                  <FormHeading text="Container Details" variant="body2" />
                  <TableGrid
                    fields={fieldData.tblInvoiceRequestContainer}
                    formData={formData}
                    setFormData={setFormData}
                    fieldsMode={fieldsMode}
                    gridName="tblInvoiceRequestContainer"
                    buttons={cfsGridButtons}
                    tabName="tblInvoice"
                    tabIndex={index}
                  />
                </Box>
              </Box>
            </Box>
          </CustomTabPanel>
        ))}

        {/* 🔹 Lower Section: Invoice Request (BL Information) */}
        <Box className="border p-3 mt-3">
          <FormHeading
            text="BL Information (from Invoice Request)"
            variant="body2"
          />
          <Box className="grid grid-cols-3 gap-2 p-2">
            <CustomInput
              fields={invoiceRequestData.igmFields}
              formData={formDataRequest}
              setFormData={setFormDataRequest}
              fieldsMode="view"
            />
          </Box>

          <FormHeading text="Invoice In Name Of">
            <Box className="grid grid-cols-4 gap-2 p-2">
              <CustomInput
                fields={invoiceRequestData.invoiceFields}
                formData={formDataRequest}
                setFormData={setFormDataRequest}
                fieldsMode="view"
              />
            </Box>
          </FormHeading>

          <Box className="grid grid-cols-2 gap-4 mt-2">
            <Box>
              <FormHeading text="Attachment Details" variant="body2" />
              <TableGrid
                fields={invoiceRequestData.tblAttachement}
                formData={formDataRequest}
                setFormData={setFormDataRequest}
                fieldsMode="view"
                gridName="tblAttachement"
                buttons={cfsGridButtons}
              />
            </Box>
            <Box>
              <FormHeading text="Container Details" variant="body2" />
              <TableGrid
                fields={invoiceRequestData.tblInvoiceRequestContainer}
                formData={formDataRequest}
                setFormData={setFormDataRequest}
                fieldsMode="view"
                gridName="tblInvoiceRequestContainer"
                buttons={cfsGridButtons}
              />
            </Box>
          </Box>
        </Box>

        {/* Back Button */}

        <ToastContainer />
      </Box>
    </ThemeProvider>
  );
}
