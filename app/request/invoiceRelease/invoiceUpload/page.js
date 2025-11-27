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

export default function InvoiceUpload() {
  const searchParams = useSearchParams();
  const blIdFromQS = searchParams.get("blId");
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
      whereCondition: `blNo = '${literal}' AND ISNULL(status,1)=1 and createdDate = (select max(createdDate) from tblInvoiceRequest where blNo = '${literal}')`,
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

  /* ⭐ CHANGE 1 — Load BL No using ISNULL(hblNo, mblNo) */
  useEffect(() => {
    async function loadBL() {
      if (!blIdFromQS) return;

      const blIdNum = Number(blIdFromQS);

      const q = {
        columns: "ISNULL(hblNo, mblNo) AS blNo",
        tableName: "tblBl",
        whereCondition: `id=${blIdNum}`,
      };

      const { success, data: blData } = await getDataWithCondition(q);
      if (success && blData.length) {
        const currentBlNo = blData[0].blNo; // ← correct field now
        setBlNo(currentBlNo);
        await fetchInvoiceRequestIdByBlNo(currentBlNo);
      }

      await loadBlContainersByBlId(blIdNum);

      setFormData((p) => ({
        ...p,
        blId: blIdNum,
      }));
    }

    loadBL();
  }, [blIdFromQS, fetchInvoiceRequestIdByBlNo, loadBlContainersByBlId]);

  /* ⭐ CHANGE 2 — Edit mode BL No using ISNULL(hblNo, mblNo) */
  useEffect(() => {
    async function loadExisting() {
      if (!mode?.formId) return;

      const invoiceId = mode.formId;

      const q = {
        columns: `b.id AS blId, ISNULL(b.hblNo, b.mblNo) AS blNo`,
        tableName: "tblInvoice i",
        joins: "LEFT JOIN tblBl b ON b.id=i.blId",
        whereCondition: `i.id=${invoiceId}`,
      };

      const { success, data: blData } = await getDataWithCondition(q);
      if (!success || !blData?.length) return;

      const blId = blData[0].blId;
      const currentBlNo = blData[0].blNo; // ← changed from mblNo to blNo

      setBlNo(currentBlNo);
      await fetchInvoiceRequestIdByBlNo(currentBlNo);
      await loadBlContainersByBlId(blId);

      const listQ = {
        columns: "id",
        tableName: "tblInvoice",
        whereCondition: `blId=${blId} AND ISNULL(status,1)=1`,
      };

      const { data: invoiceList, success: listSuccess } =
        await getDataWithCondition(listQ);
      if (!listSuccess || !invoiceList?.length) return;

      const ids = invoiceList.map((r) => r.id);

      const out = [];
      await Promise.allSettled(
        ids.map(async (id) => {
          const fmt = formatFetchForm(
            data,
            "tblInvoice",
            id,
            '["tblInvoiceRequestContainer","tblAttachment"]',
            "invoiceRequestId"
          );
          const { success, result } = await fetchForm(fmt);
          if (success) out.push(formatDataWithForm(result, data));
        })
      );

      const combined = formatDataWithFormThirdLevel(
        out,
        [...data.igmFields],
        "tblInvoice"
      );

      setFormData({
        ...combined,
        blId,
      });

      setFieldsMode(mode.mode || "");
      setTabValue(0);
    }

    loadExisting();
  }, [
    mode.formId,
    mode.mode,
    fetchInvoiceRequestIdByBlNo,
    loadBlContainersByBlId,
  ]);

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

        return {
          ...row,
          tblInvoiceRequestContainer: containers,
          tblAttachment: defaultAttachment,
        };
      });

      setFormData((prev) => ({
        ...prev,
        tblInvoice: fromPdf,
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

    const blId = formData.blId;
    if (!blId) return toast.error("BL ID missing!");

    if (!invoices.length)
      return toast.error("Please add at least one invoice.");

    let currentInvoiceReqId = invoiceReqId;
    if (!currentInvoiceReqId && blNo) {
      currentInvoiceReqId = await fetchInvoiceRequestIdByBlNo(blNo);
    }

    if (!currentInvoiceReqId) {
      toast.error(
        "Invoice Request not found for this BL (invoiceReqId missing)."
      );
      return;
    }

    let ok = true;

    await Promise.allSettled(
      invoices.map(async (row, idx) => {
        const id = row.id ?? null;

        const formatted = formatFormData(
          "tblInvoice",
          {
            ...row,
            blId,
            invoiceRequestId: currentInvoiceReqId,
            companyId: userData?.companyId,
            companyBranchId: userData?.companyBranchId,
            tblInvoiceRequestContainer: row.tblInvoiceRequestContainer || [],
            tblAttachment: row.tblAttachment || [],
          },
          id,
          "invoiceRequestId"
        );

        const res = await insertUpdateForm(formatted);
        if (!res.success) {
          ok = false;
          toast.error(res.error || res.message || `Invoice ${idx + 1} failed.`);
        }
      })
    );

    if (!ok) return;

    try {
      const releasedStatusId = statusList.find(
        (x) => x.Name === "Released"
      )?.Id;

      if (!releasedStatusId) {
        toast.error("Released status not found in tblMasterData.");
        return;
      }

      const payload = {
        tableName: "tblInvoiceRequest",
        keyColumn: "id",
        rows: [
          {
            id: currentInvoiceReqId,
            invoiceRequestStatusId: releasedStatusId,
          },
        ],
      };

      const res2 = await updateStatusRows(payload);

      if (!res2.success) {
        toast.error(res2.message || "Status update failed.");
        return;
      }
    } catch (err) {
      console.error(err);
      toast.error("Error updating invoice request status.");
      return;
    }

    setIsSubmitted(true);

    toast.success("Invoices uploaded & status updated successfully!");
  };

  return (
    <ThemeProvider theme={theme}>
      <form onSubmit={submitHandler}>
        <section className="py-2 px-4">
          <Box className="flex justify-between items-end mb-2">
            <Typography variant="h6">Invoice Upload</Typography>
            <CustomButton text="Back" href="/request/invoiceRelease/list" />
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
            <Box className="flex justify-center mt-3">
              <CustomButton
                text="Submit"
                type="submit"
                disabled={isSubmitted}
              />
            </Box>
          )}
        </section>
      </form>

      <ToastContainer />
    </ThemeProvider>
  );
}
