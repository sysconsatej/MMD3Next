/* eslint-disable */
"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { ThemeProvider, Box } from "@mui/material";
import { cfsGridButtons, fieldData } from "./doData";
import { CustomInput } from "@/components/customInput";
import { theme } from "@/styles";
import { toast, ToastContainer } from "react-toastify";
import CustomButton from "@/components/button/button";
import TableGrid from "@/components/tableGrid/tableGrid";
import FormHeading from "@/components/formHeading/formHeading";
import { formStore } from "@/store";
import { getDataWithCondition } from "@/apis";

export default function Home() {
  const [formData, setFormData] = useState({});
  const [fieldsMode, setFieldsMode] = useState("");
  const [jsonData] = useState(fieldData);
  const { mode } = formStore();

  const GRID_NAME = "tblInvoiceRequestContainer";

  const doRequestFieldsToRender = useMemo(() => {
    const fields = jsonData?.doRequestFields || [];

    return formData?.isFreeDays === "D"
      ? fields.filter((f) => f.name !== "validTill") // hide validTill
      : fields; // normal
  }, [jsonData?.doRequestFields, formData?.isFreeDays]);

  const fetchInvoicePaymentByBlAndLiner = useCallback(
    async (eventOrValue) => {
      const blNo =
        typeof eventOrValue === "string"
          ? eventOrValue.trim()
          : eventOrValue?.target?.value?.trim();

      if (!blNo) return;

      const linerId =
        formData?.shippingLineId?.Id ?? formData?.shippingLineId ?? null;

      if (!linerId) {
        toast.warn("Select Liner first.");
        return;
      }

      try {
        const blQuery = {
          columns: "TOP 1 id",
          tableName: "tblBl",
          whereCondition: `
            ISNULL(hblNo, mblNo) = '${blNo.replace(/'/g, "''")}'
            AND ISNULL(status,1) = 1
            AND shippingLineId = ${linerId}
          `,
        };

        const { success: blSuccess, data: blData } = await getDataWithCondition(
          blQuery
        );

        if (!blSuccess || !Array.isArray(blData) || !blData.length) {
          toast.error("BL not found for selected Liner.");
          setFormData((p) => ({
            ...p,
            blNo,
            blId: null,
            [GRID_NAME]: [],
          }));
          return;
        }

        const blId = blData[0].id;

        const payQuery = {
          columns: `
            p.id,
            p.paymentTypeId,
            m.name  AS paymentTypeName,
            p.Amount,
            p.bankName,
            p.bankBranchName,
            p.referenceNo,
            p.referenceDate,
            p.receiptNo,
            p.receiptDate,
            inv.invoiceNos AS invoiceNo,
            p.paymentStatusId,
            m1.name AS paymentStatusName
          `,
          tableName: `
            tblInvoicePayment p
            LEFT JOIN tblMasterData m  ON m.id  = p.paymentTypeId
            LEFT JOIN tblMasterData m1 ON m1.id = p.paymentStatusId
            OUTER APPLY (
              SELECT STRING_AGG(i.invoiceNo, ', ') AS invoiceNos
              FROM string_split(CAST(p.invoiceIds AS nvarchar(max)), ',') s
              JOIN tblInvoice i
                ON i.id = TRY_CAST(LTRIM(RTRIM(s.value)) AS int)
               AND ISNULL(i.status,1) = 1
            ) inv
          `,
          whereCondition: `
            p.blId = ${blId}
            AND ISNULL(p.status,1) = 1
            AND m1.name = 'Payment Confirmed'
          `,
          orderBy: "p.id DESC",
        };

        const { data: payData } = await getDataWithCondition(payQuery);

        const rows = (Array.isArray(payData) ? payData : []).map((r) => ({
          ...r,
          paymentTypeId: r.paymentTypeId
            ? { Id: r.paymentTypeId, Name: r.paymentTypeName }
            : null,
          paymentStatusId: r.paymentStatusId
            ? { Id: r.paymentStatusId, Name: r.paymentStatusName }
            : null,
        }));

        setFormData((p) => ({
          ...p,
          blNo,
          blId,
          [GRID_NAME]: rows,
        }));

        if (!rows.length) toast.info("No payment confirmed found for this BL.");
      } catch (e) {
        console.error(e);
        toast.error("Error fetching payment details.");
        setFormData((p) => ({ ...p, [GRID_NAME]: [] }));
      }
    },
    [formData?.shippingLineId]
  );

  const handleBlurEventFunctions = { fetchInvoicePaymentByBlAndLiner };

  useEffect(() => {
    if (formData?.shippingLineId && formData?.blNo) {
      fetchInvoicePaymentByBlAndLiner(formData.blNo);
    }
  }, [formData?.shippingLineId]);

  const submitHandler = async (e) => {
    e.preventDefault();
  };

  return (
    <ThemeProvider theme={theme}>
      <form onSubmit={submitHandler}>
        <section className="py-2 px-4">
          <Box className="flex justify-between items-center mb-2">
            <h1 className="text-left text-base m-0">Do Request</h1>
          </Box>

          <Box>
            <FormHeading text="Do Request" />

            <Box className="grid grid-cols-4 items-end gap-2 p-2 ">
              <CustomInput
                fields={doRequestFieldsToRender}
                formData={formData}
                setFormData={setFormData}
                fieldsMode={fieldsMode}
                handleBlurEventFunctions={handleBlurEventFunctions}
              />
            </Box>

            <Box className="mt-4 border">
              <FormHeading text="Payment Information" variant="body2" />

              <TableGrid
                fields={jsonData.tblInvoicePayment}
                formData={formData}
                setFormData={setFormData}
                fieldsMode={fieldsMode}
                gridName={GRID_NAME}
              />
            </Box>
            <Box className="mt-4 border">
              <FormHeading text="Document List" variant="body2" />

              <TableGrid
                fields={jsonData.tblAttachment}
                formData={formData}
                setFormData={setFormData}
                fieldsMode={fieldsMode}
                gridName={GRID_NAME}
                buttons={cfsGridButtons}
              />
            </Box>
          </Box>

          <Box className="w-full flex mt-2">
            {fieldsMode !== "view" && (
              <CustomButton text={"Print"} type="submit" />
            )}
          </Box>
        </section>
      </form>

      <ToastContainer />
    </ThemeProvider>
  );
}
