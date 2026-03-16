"use client";

import { useState, useEffect, useCallback } from "react";
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
import data, { cfsGridButtons } from "./invoiceUploadData";
import {
  getDataWithCondition,
  fetchForm,
  insertUpdateForm,
  updateStatusRows,
  sendInvoiceEmail,
} from "@/apis";
import {
  formatFormData,
  formatDataWithForm,
  formatDataWithFormThirdLevel,
  formatFetchForm,
  getUserByCookies,
} from "@/utils";
import { useSearchParams } from "next/navigation";
import MultiFileUpload from "@/components/customInput/multiFileUpload";
import { extractTextFromPdfs } from "@/helper/pdfTextExtractor";

function CustomTabPanel({ children, value, index }) {
  return value === index ? <Box className="pt-2">{children}</Box> : null;
}
async function matchDropdownValue(masterListName, rawValue) {
  if (!rawValue) return null;
  const payload = {
    columns: "id, name",
    tableName: "tblMasterData m",
    whereCondition: `m.masterListName='${masterListName}'`,
  };

  const { success, data } = await getDataWithCondition(payload);
  if (!success || !Array.isArray(data)) return null;

  const clean = String(rawValue).trim().toLowerCase();

  const list = data.map((row) => ({
    Id: row.id,
    Name: row.name,
    clean: row.name.toLowerCase().trim(),
  }));
  let found = list.find((x) => x.clean === clean);
  if (found) return { Id: found.Id, Name: found.Name };
  found = list.find((x) => clean.includes(x.clean));
  if (found) return { Id: found.Id, Name: found.Name };
  found = list.find((x) => x.clean.includes(clean));
  if (found) return { Id: found.Id, Name: found.Name };

  return null;
}

export default function InvoiceUpload() {
  const searchParams = useSearchParams();
  const blIdFromQS = searchParams.get("blId");
  const invoiceRequestIdFromQS = searchParams.get("invoiceRequestId");
  const userData = getUserByCookies();

  const { mode } = formStore();
  const initialMode = mode.mode || "";

  const [formData, setFormData] = useState({});
  const [fieldsMode, setFieldsMode] = useState(initialMode);
  const [blNo, setBlNo] = useState("");

  const [tabValue, setTabValue] = useState(0);
  const [containerData, setContainerData] = useState([]);
  const [statusList, setStatusList] = useState([]);
  const [invoiceReqId, setInvoiceReqId] = useState(null);

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const containerFields = data?.tblInvoiceRequestContainer || [];
  const tblAttachment = data?.tblAttachment || data?.tblAttachmentDetails || [];

  const invoices = formData.tblInvoice || [];

  const handleTabChange = (_e, v) => setTabValue(v);

  const handleAddInvoice = () => {
    const nextInvoices = [
      ...invoices,
      { tblInvoiceRequestContainer: containerData, tblAttachment: [] },
    ];
    setFormData((prev) => ({ ...prev, tblInvoice: nextInvoices }));
    setTabValue(nextInvoices.length - 1);
  };

  const handleRemove = (index) => {
    const nextInvoices = invoices.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, tblInvoice: nextInvoices }));

    if (nextInvoices.length === 0) {
      setTabValue(0);
    } else if (tabValue >= nextInvoices.length) {
      setTabValue(nextInvoices.length - 1);
    }
  };

  const loadBlContainersByBlId = useCallback(async (blId) => {
    if (!blId) return;

    const contObj = {
      columns:
        "c.containerNo, c.sizeId, (SELECT name FROM tblMasterData m WHERE m.id = c.sizeId) AS sizeName",
      tableName: "tblBlContainer c",
      whereCondition: `c.blId = ${blId} AND ISNULL(c.status,1) = 1`,
    };

    const {
      data: contRows,
      success,
      message,
      error,
    } = await getDataWithCondition(contObj);

    if (!success) {
      toast.error(error || message || "Failed to fetch BL containers.");
      return;
    }

    const containers = (contRows || []).map((row) => ({
      containerNo: row.containerNo,
      sizeId: row.sizeId
        ? { Id: row.sizeId, Name: row.sizeName || String(row.sizeId) }
        : null,
    }));

    setContainerData(containers);
  }, []);

  const fetchInvoiceRequestIdByBlNo = useCallback(async (currentBlNo) => {
    if (!currentBlNo) return null;

    const literal = String(currentBlNo).replace(/'/g, "''");

    const obj = {
      columns: "id",
      tableName: "tblInvoiceRequest",
      whereCondition: `blNo = '${literal}' AND status = 1 and createdDate = (select max(createdDate) from tblInvoiceRequest where blNo = '${literal}' AND status = 1 )`,
    };

    const { success, data } = await getDataWithCondition(obj);
    if (success && Array.isArray(data) && data.length > 0) {
      const id = data[0].id;
      setInvoiceReqId(id);
      return id;
    } else {
      setInvoiceReqId(null);
      return null;
    }
  }, []);
  const handleSendInvoice = async () => {
    try {
      if (!invoiceReqId) {
        toast.error("Invoice Request Id missing.");
        return;
      }

      if (!Array.isArray(invoices) || invoices.length === 0) {
        toast.error("Please add at least one invoice.");
        return;
      }

      setEmailLoading(true);

      const emailObj = {
        columns: "ir.billingPartyEmailId as emailId,ir.billingPartyName as name",
        tableName: "tblInvoiceRequest ir",
        whereCondition: `ir.id = ${invoiceReqId}`,
      };

      const emailRes = await getDataWithCondition(emailObj);

      if (!emailRes?.success) {
        toast.error(
          emailRes?.error || emailRes?.message || "Failed to fetch email id.",
        );
        return;
      }

      const to = emailRes?.data?.[0]?.emailId || "";

      if (!to) {
        toast.error("Recipient email id not found.");
        return;
      }

      const getAttachmentPath = (att) => {
        if (!att) return "";

        const directValues = [
          att?.path,
          att?.uploadInvoice,
          att?.filePath,
          att?.url,
          att?.name,
          att?.filename,
        ];

        for (const val of directValues) {
          if (typeof val === "string" && val.trim()) {
            return val.trim();
          }

          if (val && typeof val === "object") {
            const nestedValues = [
              val?.path,
              val?.filePath,
              val?.url,
              val?.name,
              val?.filename,
            ];

            for (const nested of nestedValues) {
              if (typeof nested === "string" && nested.trim()) {
                return nested.trim();
              }
            }
          }
        }

        return "";
      };

      const attachmentPaths = Array.from(
        new Set(
          invoices
            .flatMap((inv) => inv?.tblAttachment || [])
            .map((att) => getAttachmentPath(att))
            .filter((x) => typeof x === "string" && x.trim()),
        ),
      );

      console.log("Invoices:", invoices);
      console.log(
        "All attachments:",
        invoices.flatMap((inv) => inv?.tblAttachment || []),
      );
      console.log("attachmentPaths:", attachmentPaths);

      if (attachmentPaths.length === 0) {
        toast.error("No valid invoice attachment found.");
        return;
      }

      const payload = {
        to,
        subject: `Invoice / ${blNo || ""}`,
        emailHtml: `
        <div>
          <p>Dear ${emailRes?.data?.[0]?.name || "Sir/ Madam"},</p>
          <p>Please find attached invoice(s) for BL No: <b>${blNo || ""}</b>.</p>
          <p>Regards,</p>
        </div>
      `,
        emailText: `Please find attached invoice for BL No: ${blNo || ""}.`,
        attachmentPaths,
      };


      const resp = await sendInvoiceEmail(payload);

      if (resp?.success) {
        toast.success("Invoice email sent successfully!");
      } else {
        toast.error(resp?.message || "Failed to send invoice email.");
      }
    } catch (error) {
      toast.error(error?.message || "Failed to send invoice email.");
    } finally {
      setEmailLoading(false);
    }
  };

  useEffect(() => {
    async function init() {
      // 🔑 InvoiceRequestId is mandatory
      if (!invoiceRequestIdFromQS) {
        toast.error("Invoice Request Id missing.");
        return;
      }

      const reqId = Number(invoiceRequestIdFromQS);
      setInvoiceReqId(reqId);

      /* ✅ 1. Get BL No from InvoiceRequest (SOURCE OF TRUTH) */
      const reqQ = {
        columns: "blNo",
        tableName: "tblInvoiceRequest",
        whereCondition: `id=${reqId} AND ISNULL(status,1)=1`,
      };

      const { success, data } = await getDataWithCondition(reqQ);
      const requestBlNo = success && data?.length ? data[0].blNo : "";

      setBlNo(requestBlNo);

      /* ✅ 2. EXISTING BL FLOW (containers only) */
      if (blIdFromQS) {
        const blIdNum = Number(blIdFromQS);

        await loadBlContainersByBlId(blIdNum);

        setFormData((p) => ({
          ...p,
          blId: blIdNum,
        }));
      } else {
        /* ✅ 3. NO-BL FLOW */
        setContainerData([]);
        setFormData((p) => ({
          ...p,
          blId: null,
        }));
      }
    }

    init();
  }, [blIdFromQS, invoiceRequestIdFromQS, loadBlContainersByBlId]);

  /* ⭐ CHANGE 2 — Edit mode BL No using ISNULL(hblNo, mblNo) */
  // useEffect(() => {
  //   async function loadExisting() {
  //     if (!mode?.formId) return;

  //     const invoiceId = mode.formId;

  //     const q = {
  //       columns: `b.id AS blId, ISNULL(b.hblNo, b.mblNo) AS blNo`,
  //       tableName: "tblInvoice i",
  //       joins: "LEFT JOIN tblBl b ON b.id=i.blId",
  //       whereCondition: `i.id=${invoiceId}`,
  //     };

  //     const { success, data: blData } = await getDataWithCondition(q);
  //     if (!success || !blData?.length) return;

  //     const blId = blData[0].blId;
  //     const currentBlNo = blData[0].blNo;

  //     setBlNo(currentBlNo);
  //     await fetchInvoiceRequestIdByBlNo(currentBlNo);
  //     await loadBlContainersByBlId(blId);

  //     const listQ = {
  //       columns: "id",
  //       tableName: "tblInvoice",
  //       whereCondition: `blId=${blId} AND ISNULL(status,1)=1`,
  //     };

  //     const { data: invoiceList, success: listSuccess } =
  //       await getDataWithCondition(listQ);
  //     if (!listSuccess || !invoiceList?.length) return;

  //     const ids = invoiceList.map((r) => r.id);

  //     const out = [];
  //     await Promise.allSettled(
  //       ids.map(async (id) => {
  //         const fmt = formatFetchForm(
  //           data,
  //           "tblInvoice",
  //           id,
  //           '["tblInvoiceRequestContainer","tblAttachment"]',
  //           "invoiceRequestId",
  //         );
  //         const { success, result } = await fetchForm(fmt);
  //         if (success) out.push(formatDataWithForm(result, data));
  //       }),
  //     );

  //     const combined = formatDataWithFormThirdLevel(
  //       out,
  //       [...data.igmFields],
  //       "tblInvoice",
  //     );

  //     setFormData({
  //       ...combined,
  //       blId,
  //     });

  //     setFieldsMode(mode.mode || "");
  //     setTabValue(0);
  //   }

  //   loadExisting();
  // }, [
  //   mode.formId,
  //   mode.mode,
  //   fetchInvoiceRequestIdByBlNo,
  //   loadBlContainersByBlId,
  // ]);

  useEffect(() => {
    async function fetchStatus() {
      const obj = {
        columns: "id as Id, name as Name",
        tableName: "tblMasterData",
        whereCondition: "masterListName = 'tblInvoiceRequest' AND status = 1",
      };

      const { success, data } = await getDataWithCondition(obj);
      if (success) setStatusList(data || []);
    }
    fetchStatus();
  }, []);

  const handleFilesChange = async (fileList) => {
    try {
      const filesArr = Array.from(fileList || []);
      if (!filesArr.length) return;

      const parsed = await extractTextFromPdfs(filesArr);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        toast.warn("No invoice data found in uploaded file(s).");
        return;
      }

      const containers = containerData || [];

      const fromPdf = await Promise.all(
        parsed.map(async (row, idx) => {
          const file = filesArr[idx] || filesArr[0];

          const invoiceTypeRaw = row.invoiceTypeId || "";

          const invoiceCategoryRaw = row.invoiceCategoryId || "";

          const invoiceTypeObj = await matchDropdownValue(
            "tblInvoiceType",
            invoiceTypeRaw,
          );

          const invoiceCategoryObj = await matchDropdownValue(
            "tblInvoiceCategory",
            invoiceCategoryRaw,
          );
          const defaultAttachment = row.tblAttachment?.length
            ? row.tblAttachment
            : file
              ? [{ uploadInvoice: file.name, path: file.name }]
              : [];

          const { id: _ignore, ...restRow } = row;

          return {
            ...restRow,
            invoiceTypeId: invoiceTypeObj,
            invoiceCategoryId: invoiceCategoryObj,
            tblInvoiceRequestContainer: containers,
            tblAttachment: defaultAttachment,
          };
        }),
      );

      setFormData((prev) => ({
        ...prev,
        tblInvoice: [...(prev?.tblInvoice || []), ...fromPdf],
      }));

      setTabValue(fromPdf.length - 1);

      toast.success("Invoices created from PDF(s).");
    } catch (err) {
      console.error("Error processing uploaded PDFs:", err);
      toast.error("Error processing PDF files.");
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if (isSubmitted) return;
    setIsSubmitted(true);

    if (!invoiceReqId) {
      toast.error("Invoice Request Id missing.");
      return;
    }

    if (!invoices.length) {
      toast.error("Please add at least one invoice.");
      return;
    }

    let ok = true;

    await Promise.allSettled(
      invoices.map(async (row, idx) => {
        const id = row.id ?? null;

        const payload = formatFormData(
          "tblInvoice",
          {
            ...row,
            invoiceRequestId: invoiceReqId, // 🔑 PRIMARY LINK
            blId: formData.blId || null, // 🔑 OPTIONAL
            blNo: blNo || null, // 🔑 ALWAYS STORE
            shippingLineId: userData.companyId,
            companyId: userData.companyId,
            companyBranchId: userData.branchId,
            locationId: userData.location,
            tblInvoiceRequestContainer: row.tblInvoiceRequestContainer || [],
            tblAttachment: row.tblAttachment || [],
          },
          id,
          "invoiceId",
        );
        const res = await insertUpdateForm(payload);

        if (!res?.success) {
          ok = false;
          toast.error(res.message || `Invoice ${idx + 1} failed`);
        }
      }),
    );

    if (!ok) {
      setIsSubmitted(false);
      return;
    }

    /* Known good status update */
    const releasedId = statusList.find((x) => x.Name === "Released")?.Id;

    if (releasedId) {
      await updateStatusRows({
        tableName: "tblInvoiceRequest",
        keyColumn: "id",
        rows: [
          {
            id: invoiceReqId,
            invoiceRequestStatusId: releasedId,
            updatedBy: userData.userId,
            updatedDate: new Date(),
          },
        ],
      });
    }

    toast.success("Invoices uploaded successfully!");
    setIsSubmitted(true);
  };

  return (
    <ThemeProvider theme={theme}>
      <form onSubmit={submitHandler}>
        <section className="py-2 px-4">
          <Box className="flex justify-between items-end mb-2">
            <Typography variant="h6">Invoice Upload</Typography>
            <CustomButton text="Back" href="/invoice/invoiceRelease/list" />
          </Box>

          <Typography sx={{ fontWeight: 600, mb: 1 }}>
            BL No: <b>{blNo || "—"}</b>
          </Typography>

          <FormHeading text="Upload Invoice PDF(s)" />
          <Box className="border border-gray-300 p-3 mt-2 flex flex-col gap-1">
            <Box sx={{ p: 2 }}>
              <MultiFileUpload
                label="Attach invoice PDFs"
                helperText="Select one or more PDF files to auto-create invoice tabs."
                accept=".pdf,application/pdf"
                onChange={handleFilesChange}
              />
            </Box>
          </Box>

          <Box sx={{ mt: 2 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
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

          {invoices.map((_, i) => (
            <CustomTabPanel key={i} value={tabValue} index={i}>
              <Box className="border p-3 mt-2">
                <Box className="grid grid-cols-4 gap-2 p-2">
                  <CustomInput
                    fields={data.invoiceFieldsTop}
                    formData={formData}
                    setFormData={setFormData}
                    fieldsMode={fieldsMode}
                    tabName="tblInvoice"
                    tabIndex={i}
                  />
                </Box>

                <FormHeading text="Container Details" />
                <TableGrid
                  fields={containerFields}
                  formData={formData}
                  setFormData={setFormData}
                  fieldsMode={fieldsMode}
                  gridName="tblInvoiceRequestContainer"
                  buttons={cfsGridButtons}
                  tabName="tblInvoice"
                  tabIndex={i}
                />

                <FormHeading text="Attachment Details" />
                <TableGrid
                  fields={tblAttachment}
                  formData={formData}
                  setFormData={setFormData}
                  fieldsMode={fieldsMode}
                  gridName="tblAttachment"
                  buttons={cfsGridButtons}
                  tabName="tblInvoice"
                  tabIndex={i}
                />
              </Box>
            </CustomTabPanel>
          ))}

          {fieldsMode !== "view" && (
            <Box className="flex justify-center mt-3 gap-2">
              <CustomButton
                text="Submit"
                type="submit"
                disabled={isSubmitted}
              />
              <CustomButton
                text={emailLoading ? "Sending..." : "Send Invoice"}
                type="button"
                onClick={handleSendInvoice}
                disabled={emailLoading || !invoices.length}
              />
            </Box>
          )}
        </section>
      </form>

      <ToastContainer />
    </ThemeProvider>
  );
}
