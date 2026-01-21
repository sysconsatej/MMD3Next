"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  ThemeProvider,
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  CircularProgress,
  Button,
  Checkbox,
  TextField,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { ToastContainer, toast } from "react-toastify";
import { theme } from "@/styles";
import {
  getDataWithCondition,
  insertUpdateForm,
  updateStatusRows,
} from "@/apis"; // ✅ add updateStatusRows
import { payment } from "@/apis/payment";
import { formatFormData, getUserByCookies } from "@/utils";
import { CustomInput } from "@/components/customInput";
import CustomButton from "@/components/button/button";
import FormHeading from "@/components/formHeading/formHeading";
import data from "./paymentData";
import TableGrid from "@/components/tableGrid/tableGrid";
import { cfsGridButtons } from "@/app/master/user/userData";

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const blNo = searchParams.get("blNo");

  const [tabValue, setTabValue] = useState(0);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({});
  const [fieldsMode, setFieldsMode] = useState("new");
  const [statusList, setStatusList] = useState([]);
  const userData = getUserByCookies();

  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState([]);
  const [invoiceEdits, setInvoiceEdits] = useState({});

  const [paying, setPaying] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [payUrl, setPayUrl] = useState(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeError, setIframeError] = useState(false);

  const handleChangeTab = (_, newValue) => setTabValue(newValue);

  // fetch payment status id
  useEffect(() => {
    async function fetchStatus() {
      const obj = {
        columns: "id as Id, name as Name",
        tableName: "tblMasterData",
        whereCondition: "masterListName = 'tblPaymentStatus' AND status = 1",
      };

      const { success, data } = await getDataWithCondition(obj);
      if (success) setStatusList(data || []);
    }
    fetchStatus();
  }, []);

  // default Instrument Date = today
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    setFormData((prev) =>
      prev.referenceDate ? prev : { ...prev, referenceDate: today },
    );
  }, []);

  // default Payment Type = NEFT
  useEffect(() => {
    async function setDefaultPaymentType() {
      try {
        const obj = {
          columns: "id as Id, name as Name",
          tableName: "tblMasterData",
          whereCondition: "masterListName = 'tblPaymentType' AND status = 1",
        };

        const { success, data } = await getDataWithCondition(obj);
        if (success && Array.isArray(data)) {
          const neftRow = data.find(
            (x) =>
              String(x.Name || "")
                .toLowerCase()
                .trim() === "neft",
          );
          if (neftRow) {
            setFormData((prev) =>
              prev.paymentTypeId
                ? prev
                : {
                    ...prev,
                    paymentTypeId: { Id: neftRow.Id, Name: neftRow.Name },
                  },
            );
          }
        }
      } catch (err) {
        console.error("Error setting default payment type:", err);
      }
    }
    setDefaultPaymentType();
  }, []);

  // Fetch invoices
  useEffect(() => {
    async function fetchInvoices() {
      if (!blNo) {
        toast.error("BL not found.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const query = {
          columns: `
            i.id AS invoiceId,
            i.invoiceNo,
            CONVERT(VARCHAR, i.invoiceDate, 103) AS invoiceDate,
            i.totalInvoiceAmount,
            i.remarks,
            cat.name AS invoiceCategory,
            i.blNo AS blNo,
            c.name AS beneficiaryName,
            i.blId AS blId,
            i.shippingLineId as beneficiaryId,
            i.invoiceRequestId as invoiceRequestId,
            ISNULL(i.tdsAmount, 0) AS tdsAmount,
            ISNULL(i.invoicePayableAmount, 0) AS invoicePayableAmount
          `,
          tableName: "tblInvoice i",
          joins: `
            LEFT JOIN tblCompany c ON c.id = i.shippingLineId
            LEFT JOIN tblMasterData cat ON cat.id = i.invoiceCategoryId
          `,
          whereCondition: `i.blNo = '${blNo}' AND i.invoicePaymentId IS NULL AND ISNULL(i.status,1)=1`,
        };

        const res = await getDataWithCondition(query);
        const { data, success } = res || {};

        if (success && Array.isArray(data) && data.length > 0) {
          const sorted = data.sort((a, b) => b.invoiceId - a.invoiceId);
          setInvoices(sorted);
          setSelectedInvoiceIds(sorted.map((inv) => inv.invoiceId));

          const nextEdits = {};
          sorted.forEach((inv) => {
            const total = Number(inv.totalInvoiceAmount || 0);
            const dbTds = Number(inv.tdsAmount || 0);
            const dbPayable = Number(inv.invoicePayableAmount || 0);

            let payable = dbPayable;
            let tds = dbTds;

            if (!dbPayable && total > 0) payable = Math.max(0, total - dbTds);
            if (dbPayable && total >= 0) tds = Math.max(0, total - dbPayable);

            nextEdits[inv.invoiceId] = {
              tdsAmount: Number.isFinite(tds) ? tds : 0,
              payableAmount: Number.isFinite(payable) ? payable : total,
            };
          });

          setInvoiceEdits(nextEdits);
        } else {
          setInvoices([]);
          setSelectedInvoiceIds([]);
          setInvoiceEdits({});
          toast.warn("No invoices found for this BL.");
        }
      } catch (err) {
        console.error(err);
        toast.error("Error fetching invoice details.");
      } finally {
        setLoading(false);
      }
    }

    fetchInvoices();
  }, [blNo]);

  const getRequestedStatusId = () => {
    if (!statusList || statusList.length === 0) return null;

    const row = statusList.find(
      (s) =>
        String(s.Name || "")
          .toLowerCase()
          .trim() === "payment confirmation requested".toLowerCase(),
    );
    return row?.Id || null;
  };

  // Checkbox helpers
  const toggleInvoice = (invoiceId) => {
    setSelectedInvoiceIds((prev) =>
      prev.includes(invoiceId)
        ? prev.filter((id) => id !== invoiceId)
        : [...prev, invoiceId],
    );
  };

  const allSelectedOnPage =
    invoices.length > 0 &&
    selectedInvoiceIds.length === invoices.length &&
    invoices.every((inv) => selectedInvoiceIds.includes(inv.invoiceId));

  const someSelectedOnPage =
    selectedInvoiceIds.length > 0 && !allSelectedOnPage;

  const toggleAllOnPage = () => {
    if (allSelectedOnPage) setSelectedInvoiceIds([]);
    else setSelectedInvoiceIds(invoices.map((inv) => inv.invoiceId));
  };

  const safeNum = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  const setInvoiceRowEdit = (invoiceId, patch) => {
    setInvoiceEdits((prev) => ({
      ...prev,
      [invoiceId]: {
        ...(prev[invoiceId] || { tdsAmount: 0, payableAmount: 0 }),
        ...patch,
      },
    }));
  };

  const onTdsChange = (invoiceId, rawValue) => {
    const inv = invoices.find((x) => x.invoiceId === invoiceId);
    const total = safeNum(inv?.totalInvoiceAmount);
    let tds = safeNum(rawValue);

    if (tds < 0) tds = 0;
    if (tds > total) tds = total;

    const payable = Math.max(0, total - tds);
    setInvoiceRowEdit(invoiceId, { tdsAmount: tds, payableAmount: payable });
  };

  const onPayableChange = (invoiceId, rawValue) => {
    const inv = invoices.find((x) => x.invoiceId === invoiceId);
    const total = safeNum(inv?.totalInvoiceAmount);
    let payable = safeNum(rawValue);

    if (payable < 0) payable = 0;
    if (payable > total) payable = total;

    const tds = Math.max(0, total - payable);
    setInvoiceRowEdit(invoiceId, { payableAmount: payable, tdsAmount: tds });
  };

  const totals = useMemo(() => {
    const selected = invoices.filter((inv) =>
      selectedInvoiceIds.includes(inv.invoiceId),
    );

    const totalInvoiceAmount = selected.reduce(
      (sum, inv) => sum + safeNum(inv.totalInvoiceAmount),
      0,
    );

    const totalTds = selected.reduce((sum, inv) => {
      const row = invoiceEdits[inv.invoiceId];
      return sum + safeNum(row?.tdsAmount);
    }, 0);

    const totalPayable = selected.reduce((sum, inv) => {
      const row = invoiceEdits[inv.invoiceId];
      const payable = row
        ? safeNum(row.payableAmount)
        : safeNum(inv.totalInvoiceAmount);
      return sum + payable;
    }, 0);

    return { totalInvoiceAmount, totalTds, totalPayable };
  }, [invoices, selectedInvoiceIds, invoiceEdits]);

  // keep offline form Amount + tdsAmount synced
  useEffect(() => {
    const nextAmount = Number(totals.totalPayable || 0).toFixed(2);
    const nextTds = Number(totals.totalTds || 0).toFixed(2);

    setFormData((prev) => {
      const curAmt = String(prev?.Amount ?? "");
      const curTds = String(prev?.tdsAmount ?? "");
      if (curAmt === nextAmount && curTds === nextTds) return prev;
      return { ...prev, Amount: nextAmount, tdsAmount: nextTds };
    });
  }, [totals.totalPayable, totals.totalTds]);

  // modal close
  const handleClosePay = () => {
    setPayOpen(false);
    setPayUrl(null);
    setIframeLoaded(false);
    setIframeError(false);
  };

  // ✅ validate edits
  const validateSelectedInvoices = (selectedInvoices) => {
    for (const inv of selectedInvoices) {
      const total = safeNum(inv.totalInvoiceAmount);
      const row = invoiceEdits[inv.invoiceId] || {};
      const tds = safeNum(row.tdsAmount);
      const payable = safeNum(row.payableAmount);

      if (tds > total) {
        toast.error(
          `TDS cannot be greater than Total for invoice ${inv.invoiceNo}`,
        );
        return false;
      }
      if (payable < 0 || payable > total) {
        toast.error(`Payable invalid for invoice ${inv.invoiceNo}`);
        return false;
      }
    }
    return true;
  };

  // ✅ IMPORTANT: persist edits to tblInvoice using updateStatusRows
  const persistInvoiceEdits = async (selectedInvoices) => {
    const rows = selectedInvoices.map((inv) => {
      const row = invoiceEdits[inv.invoiceId] || {};
      return {
        id: inv.invoiceId, // keyColumn = id
        tdsAmount: Number(safeNum(row.tdsAmount)).toFixed(2),
        invoicePayableAmount: Number(safeNum(row.payableAmount)).toFixed(2),
      };
    });

    const res = await updateStatusRows({
      tableName: "tblInvoice",
      rows,
      keyColumn: "id",
    });

    if (!res?.success) {
      toast.error(res?.error || res?.message || "Failed to update invoices.");
      return false;
    }
    return true;
  };

  // ✅ ONLINE: update tblInvoice then create payment link
  const quickPayHandler = async () => {
    try {
      const selectedInvoices = invoices.filter((inv) =>
        selectedInvoiceIds.includes(inv.invoiceId),
      );

      if (!selectedInvoices.length) {
        toast.warn("Please select at least one invoice for payment.");
        return;
      }

      if (!validateSelectedInvoices(selectedInvoices)) return;

      setPaying(true);
      setIframeLoaded(false);
      setIframeError(false);

      // ✅ 1) update tblInvoice first
      const ok = await persistInvoiceEdits(selectedInvoices);
      if (!ok) return;

      // ✅ 2) start online payment with PAYABLE total
      const payableTotal = totals.totalPayable || 0;
      const res = await payment(Number(payableTotal).toFixed(2));

      const link =
        res?.data?.link || res?.data?.url || res?.link || res?.url || null;

      if (link) {
        setPayUrl(link);
        setPayOpen(true);
      } else {
        toast.error("Payment link not received from server.");
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "Payment initialization failed.");
    } finally {
      setPaying(false);
    }
  };

  // ✅ OFFLINE: update tblInvoice then insert tblInvoicePayment
  const handleOfflineSubmit = async (e) => {
    e.preventDefault();

    const selectedInvoices = invoices.filter((inv) =>
      selectedInvoiceIds.includes(inv.invoiceId),
    );

    if (!selectedInvoices.length) {
      toast.warn("Please select at least one invoice for offline payment.");
      return;
    }

    const requiredFields = data.paymentOfflineFields.filter((f) => f.required);
    const emptyFields = requiredFields.filter((f) => {
      const val = formData[f.name];
      return val === undefined || val === null || val === "";
    });

    if (emptyFields.length > 0) {
      toast.error("Please fill all required fields");
      return;
    }

    if (!validateSelectedInvoices(selectedInvoices)) return;

    const paymentStatusId = getRequestedStatusId();
    if (!paymentStatusId) {
      toast.error("Payment status not found in master data.");
      return;
    }

    try {
      setLoading(true);

      // ✅ 1) update tblInvoice first
      const ok = await persistInvoiceEdits(selectedInvoices);
      if (!ok) return;

      // ✅ 2) insert tblInvoicePayment
      const invoiceIds = selectedInvoices.map((inv) => inv.invoiceId).join(",");

      const normalized = {
        ...formData,
        blId: selectedInvoices[0]?.blId || null,
        shippingLineId: selectedInvoices[0]?.beneficiaryId || null,
        blNo: blNo,
        invoiceIds,
        paymentStatusId,
        companyId: userData?.companyId,
        companyBranchId: userData?.branchId,
        locationId: userData?.location || null,
        invoiceRequestId: selectedInvoices[0]?.invoiceRequestId || null,
      };

      const payload = formatFormData(
        "tblInvoicePayment",
        normalized,
        null,
        "invoicePaymentId",
      );

      const { success, message, error } = await insertUpdateForm(payload);

      if (success) {
        toast.success(message || "Offline payment submitted!");
        setFormData({});
        setSelectedInvoiceIds([]);
      } else {
        toast.error(error || message || "Failed to submit offline payment.");
      }
    } catch (err) {
      console.error("Offline Payment Submit Error:", err);
      toast.error(err?.message || "Unexpected error during submission.");
    } finally {
      setLoading(false);
    }
  };

  const renderInvoiceTable = () => {
    return (
      <Box className="overflow-x-auto mt-3">
        <table className="w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-3 py-2 text-center">
                <Checkbox
                  size="small"
                  checked={allSelectedOnPage}
                  indeterminate={someSelectedOnPage}
                  onChange={toggleAllOnPage}
                />
              </th>
              <th className="border px-3 py-2 text-left">Invoice No</th>
              <th className="border px-3 py-2 text-left">Date</th>
              <th className="border px-3 py-2 text-left">Category</th>
              <th className="border px-3 py-2 text-right">Total (INR)</th>
              <th className="border px-3 py-2 text-right">TDS (INR)</th>
              <th className="border px-3 py-2 text-right">Payable (INR)</th>
              <th className="border px-3 py-2 text-left">Remarks</th>
            </tr>
          </thead>

          <tbody>
            {invoices.map((inv) => {
              const row = invoiceEdits[inv.invoiceId] || {
                tdsAmount: 0,
                payableAmount: safeNum(inv.totalInvoiceAmount),
              };

              const isSelected = selectedInvoiceIds.includes(inv.invoiceId);
              const total = safeNum(inv.totalInvoiceAmount);

              return (
                <tr
                  key={inv.invoiceId}
                  className={isSelected ? "bg-blue-50/40" : ""}
                >
                  <td className="border px-3 py-2 text-center">
                    <Checkbox
                      size="small"
                      checked={isSelected}
                      onChange={() => toggleInvoice(inv.invoiceId)}
                    />
                  </td>

                  <td className="border px-3 py-2">{inv.invoiceNo}</td>
                  <td className="border px-3 py-2">{inv.invoiceDate}</td>
                  <td className="border px-3 py-2">{inv.invoiceCategory}</td>
                  <td className="border px-3 py-2 text-right">
                    ₹{total.toFixed(2)}
                  </td>

                  <td className="border px-3 py-2 text-right">
                    <TextField
                      size="small"
                      type="number"
                      value={row.tdsAmount}
                      onChange={(e) =>
                        onTdsChange(inv.invoiceId, e.target.value)
                      }
                      inputProps={{ min: 0, step: "0.01" }}
                      sx={{
                        width: 130,
                        "& input": { textAlign: "right", padding: "6px 10px" },
                      }}
                      disabled={!isSelected}
                    />
                  </td>

                  <td className="border px-3 py-2 text-right">
                    <TextField
                      size="small"
                      type="number"
                      value={row.payableAmount}
                      onChange={(e) =>
                        onPayableChange(inv.invoiceId, e.target.value)
                      }
                      inputProps={{ min: 0, step: "0.01" }}
                      sx={{
                        width: 140,
                        "& input": { textAlign: "right", padding: "6px 10px" },
                      }}
                      disabled={!isSelected}
                    />
                  </td>

                  <td className="border px-3 py-2">{inv.remarks || "-"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Box>
    );
  };

  return (
    <ThemeProvider theme={theme}>
      <Box className="p-6">
        <Typography
          variant="h6"
          className="text-[#1976d2] font-semibold mb-4 uppercase"
        >
          Payment Portal
        </Typography>

        {!blNo ? (
          <Typography color="error">Invalid or missing BL ID.</Typography>
        ) : loading ? (
          <Typography>Loading invoice details...</Typography>
        ) : invoices.length === 0 ? (
          <Typography>No invoices available for this BL.</Typography>
        ) : (
          <>
            <Paper className="border rounded-md p-4 mb-4 bg-gray-50">
              <Typography variant="body2" className="mb-1">
                <b>BL No:</b> {invoices[0].blNo}
              </Typography>
              <Typography variant="body2" className="mb-1">
                <b>Beneficiary:</b> {invoices[0].beneficiaryName}
              </Typography>

              <Typography variant="body2" className="mb-1">
                <b>Total (Selected):</b> ₹
                {Number(totals.totalInvoiceAmount || 0).toFixed(2)}
              </Typography>
              <Typography variant="body2" className="mb-1">
                <b>TDS (Selected):</b> ₹
                {Number(totals.totalTds || 0).toFixed(2)}
              </Typography>
              <Typography variant="body2">
                <b>Payable (Selected):</b> ₹
                {Number(totals.totalPayable || 0).toFixed(2)}
              </Typography>
            </Paper>

            <Tabs value={tabValue} onChange={handleChangeTab}>
              <Tab label="Pay Online" />
              <Tab label="Pay Offline" />
            </Tabs>

            {tabValue === 0 && (
              <Box className="mt-4 border rounded-md bg-white shadow-sm p-4">
                <FormHeading text="Pay Online" variant="body2" />

                {renderInvoiceTable()}

                <Typography
                  variant="body1"
                  className="font-semibold mt-3 text-right"
                >
                  Payable Total: ₹{Number(totals.totalPayable || 0).toFixed(2)}
                </Typography>

                <Box className="mt-6 flex justify-center gap-3">
                  <CustomButton
                    text={paying ? "Processing…" : "Continue to Pay Online"}
                    onClick={quickPayHandler}
                    disabled={paying}
                  />
                  <CustomButton
                    text="Back"
                    href="/invoice/invoicePayment/list"
                  />
                </Box>
              </Box>
            )}

            {tabValue === 1 && (
              <Box className="mt-4 border rounded-md bg-white shadow-sm p-4">
                <FormHeading text="Pay Offline" variant="body2" />

                {renderInvoiceTable()}

                <Typography
                  variant="body1"
                  className="font-semibold mt-3 text-right"
                >
                  Payable Total: ₹{Number(totals.totalPayable || 0).toFixed(2)}
                </Typography>

                <FormHeading text="Offline Payment Details" variant="body2" />

                <Box className="grid grid-cols-3 gap-2 p-2 mt-1">
                  <CustomInput
                    fields={data.paymentOfflineFields}
                    formData={formData}
                    setFormData={setFormData}
                    fieldsMode={fieldsMode}
                  />
                </Box>

                <Box className="mt-2">
                  <TableGrid
                    fields={data.tblAttachment}
                    formData={formData}
                    setFormData={setFormData}
                    fieldsMode={fieldsMode}
                    gridName="tblAttachment"
                    buttons={cfsGridButtons}
                  />
                </Box>

                <Box className="mt-6 flex justify-center gap-3">
                  <CustomButton
                    text="Submit Offline Payment"
                    onClick={handleOfflineSubmit}
                  />
                  <CustomButton
                    text="Back"
                    href="/invoice/invoicePayment/list"
                  />
                </Box>
              </Box>
            )}
          </>
        )}

        <Dialog open={payOpen} onClose={handleClosePay} fullWidth maxWidth="xl">
          <DialogTitle
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            Payment
            <IconButton
              aria-label="close"
              onClick={handleClosePay}
              size="small"
            >
              <CloseRoundedIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent dividers>
            {!payUrl ? (
              <Box
                className="flex items-center justify-center"
                sx={{ height: "60vh" }}
              >
                <Typography variant="body2">
                  No payment link available.
                </Typography>
              </Box>
            ) : (
              <Box sx={{ position: "relative", height: "80vh", width: "100%" }}>
                {!iframeLoaded && !iframeError && (
                  <Box
                    sx={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      zIndex: 1,
                      background: "rgba(255,255,255,0.6)",
                    }}
                  >
                    <CircularProgress size={28} />
                  </Box>
                )}

                {iframeError && (
                  <Box
                    sx={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexDirection: "column",
                      gap: 1.5,
                    }}
                  >
                    <Typography variant="body2" align="center">
                      The payment page refused to load inside a modal
                      (X-Frame-Options).
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={() =>
                        window.open(payUrl, "_blank", "noopener,noreferrer")
                      }
                    >
                      Open in new tab
                    </Button>
                  </Box>
                )}

                <iframe
                  src={payUrl}
                  title="Payment"
                  style={{ border: 0, width: "100%", height: "100%" }}
                  onLoad={() => setIframeLoaded(true)}
                  onError={() => setIframeError(true)}
                  allow="payment *; geolocation *; camera *; microphone *;"
                />
              </Box>
            )}
          </DialogContent>
        </Dialog>

        <ToastContainer />
      </Box>
    </ThemeProvider>
  );
}