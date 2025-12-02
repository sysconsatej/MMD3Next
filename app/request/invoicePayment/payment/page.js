"use client";

import { useEffect, useState } from "react";
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
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { ToastContainer, toast } from "react-toastify";
import { theme } from "@/styles";
import { getDataWithCondition, insertUpdateForm } from "@/apis";
import { payment } from "@/apis/payment";
import { formatFormData } from "@/utils";
import { CustomInput } from "@/components/customInput";
import CustomButton from "@/components/button/button";
import FormHeading from "@/components/formHeading/formHeading";
import data from "./paymentData";
import TableGrid from "@/components/tableGrid/tableGrid";
import { cfsGridButtons } from "@/app/master/user/userData";

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const blId = searchParams.get("blId");

  const [tabValue, setTabValue] = useState(0);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({});
  const [fieldsMode, setFieldsMode] = useState("new");
  const [statusList, setStatusList] = useState([]);

  // ✅ selected invoices for payment
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState([]);

  // 🟢 Payment Modal States
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
      if (success) setStatusList(data);
    }
    fetchStatus();
  }, []);

  // 🔹 NEW: set default Instrument Date = today on first load
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10); // yyyy-mm-dd
    setFormData((prev) =>
      prev.referenceDate ? prev : { ...prev, referenceDate: today }
    );
  }, []);

  // 🔹 NEW: set default Payment Type = NEFT
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
            (x) => String(x.Name || "").toLowerCase() === "neft"
          );
          if (neftRow) {
            setFormData((prev) =>
              prev.paymentTypeId
                ? prev
                : {
                    ...prev,
                    paymentTypeId: { Id: neftRow.Id, Name: neftRow.Name },
                  }
            );
          }
        }
      } catch (err) {
        console.error("Error setting default payment type:", err);
      }
    }
    setDefaultPaymentType();
  }, []);

  // 🧭 Fetch all invoices for current BL ID
  useEffect(() => {
    async function fetchInvoices() {
      if (!blId) {
        toast.error("BL ID not found.");
        setLoading(false);
        return;
      }

      try {
        const query = {
          columns: `
            i.id AS invoiceId,
            i.invoiceNo,
            CONVERT(VARCHAR, i.invoiceDate, 103) AS invoiceDate,
            i.totalInvoiceAmount,
            i.remarks,
            cat.name AS invoiceCategory,
            ISNULL(hblNo, mblNo) AS blNo,
            c.name AS beneficiaryName
          `,
          tableName: "tblInvoice i",
          joins: `
            LEFT JOIN tblBl b ON b.id = i.blId
            LEFT JOIN tblCompany c ON c.id = b.companyId
            LEFT JOIN tblMasterData cat ON cat.id = i.invoiceCategoryId
          `,
          whereCondition: `i.blId = ${blId} AND i.invoicePaymentId is null AND ISNULL(i.status,1)=1 AND i.invoiceRequestId = (
              SELECT TOP 1 invoiceRequestId
              FROM tblInvoice
              WHERE blId = ${blId}
                AND ISNULL(status,1)=1
              ORDER BY id DESC
            )`,
        };

        const { data, success } = await getDataWithCondition(query);

        if (success && Array.isArray(data) && data.length > 0) {
          const sorted = data.sort((a, b) => b.invoiceId - a.invoiceId);
          setInvoices(sorted);
          // ✅ by default select all invoices
          setSelectedInvoiceIds(sorted.map((inv) => inv.invoiceId));
        } else {
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
  }, [blId]);

  const getRequestedStatusId = () => {
    if (!statusList || statusList.length === 0) return null;

    const row = statusList.find(
      (s) =>
        s.Name?.toLowerCase().trim() ===
        "Payment Confirmation Requested".toLowerCase()
    );

    return row?.Id || null;
  };

  // ✅ Checkbox helpers
  const toggleInvoice = (invoiceId) => {
    setSelectedInvoiceIds((prev) =>
      prev.includes(invoiceId)
        ? prev.filter((id) => id !== invoiceId)
        : [...prev, invoiceId]
    );
  };

  const allSelectedOnPage =
    invoices.length > 0 &&
    selectedInvoiceIds.length === invoices.length &&
    invoices.every((inv) => selectedInvoiceIds.includes(inv.invoiceId));

  const someSelectedOnPage =
    selectedInvoiceIds.length > 0 && !allSelectedOnPage;

  const toggleAllOnPage = () => {
    if (allSelectedOnPage) {
      setSelectedInvoiceIds([]);
    } else {
      setSelectedInvoiceIds(invoices.map((inv) => inv.invoiceId));
    }
  };

  // 🔹 NEW: keep Amount in formData = total of selected invoices
  useEffect(() => {
    const total = invoices
      .filter((inv) => selectedInvoiceIds.includes(inv.invoiceId))
      .reduce((sum, inv) => sum + Number(inv.totalInvoiceAmount || 0), 0);

    setFormData((prev) => ({
      ...prev,
      Amount: total.toFixed(2),
    }));
  }, [invoices, selectedInvoiceIds]);

  // 🟢 Handle modal close
  const handleClosePay = () => {
    setPayOpen(false);
    setPayUrl(null);
    setIframeLoaded(false);
    setIframeError(false);
  };

  // 🟢 Online payment logic
  const quickPayHandler = async () => {
    try {
      const selectedInvoices = invoices.filter((inv) =>
        selectedInvoiceIds.includes(inv.invoiceId)
      );

      if (!selectedInvoices.length) {
        toast.warn("Please select at least one invoice for payment.");
        return;
      }

      setPaying(true);
      setIframeLoaded(false);
      setIframeError(false);

      const totalAmount = selectedInvoices.reduce(
        (sum, inv) => sum + Number(inv.totalInvoiceAmount || 0),
        0
      );

      const res = await payment(totalAmount.toFixed(2));
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

  const handleOfflineSubmit = async (e) => {
    e.preventDefault();

    const selectedInvoices = invoices.filter((inv) =>
      selectedInvoiceIds.includes(inv.invoiceId)
    );

    if (selectedInvoices.length === 0) {
      toast.warn("Please select at least one invoice for offline payment.");
      return;
    }

    // Validate required offline payment fields
    const requiredFields = data.paymentOfflineFields.filter((f) => f.required);
    const emptyFields = requiredFields.filter((f) => {
      const val = formData[f.name];
      return val === undefined || val === null || val === "";
    });

    if (emptyFields.length > 0) {
      toast.error("Please fill all required fields");
      return;
    }

    // 🔥 Get Payment Confirmation Requested Status ID
    const paymentStatusId = getRequestedStatusId();

    if (!paymentStatusId) {
      toast.error("Payment status not found in master data.");
      return;
    }

    try {
      setLoading(true);

      const invoiceIds = selectedInvoices.map((inv) => inv.invoiceId).join(",");

      const normalized = {
        ...formData,
        blId: Number(blId),
        invoiceIds,
        paymentStatusId, // 🔥 status = Payment Confirmation Requested
      };

      const payload = formatFormData("tblInvoicePayment",  normalized, null, 'invoicePaymentId');

      const { success, message, error } = await insertUpdateForm(payload);

      if (success) {
        toast.success(message || "Offline payment submitted!");
        setFormData({});
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

  // ✅ Total only from selected invoices
  const grandTotal = invoices
    .filter((inv) => selectedInvoiceIds.includes(inv.invoiceId))
    .reduce((sum, inv) => sum + Number(inv.totalInvoiceAmount || 0), 0);

  return (
    <ThemeProvider theme={theme}>
      <Box className="p-6">
        <Typography
          variant="h6"
          className="text-[#1976d2] font-semibold mb-4 uppercase"
        >
          Payment Portal
        </Typography>

        {!blId ? (
          <Typography color="error">Invalid or missing BL ID.</Typography>
        ) : loading ? (
          <Typography>Loading invoice details...</Typography>
        ) : invoices.length === 0 ? (
          <Typography>No invoices available for this BL.</Typography>
        ) : (
          <>
            {/* 🔹 Header Info */}
            <Paper className="border rounded-md p-4 mb-4 bg-gray-50">
              <Typography variant="body2" className="mb-1">
                <b>BL No:</b> {invoices[0].blNo}
              </Typography>
              <Typography variant="body2" className="mb-1">
                <b>Beneficiary:</b> {invoices[0].beneficiaryName}
              </Typography>
              <Typography variant="body2">
                <b>Total Amount:</b> ₹{grandTotal.toFixed(2)}
              </Typography>
            </Paper>

            {/* 🔹 Tabs */}
            <Tabs value={tabValue} onChange={handleChangeTab}>
              <Tab label="Pay Online" />
              <Tab label="Pay Offline" />
            </Tabs>

            {/* === Pay Online Section === */}
            {tabValue === 0 && (
              <Box className="mt-4 border rounded-md bg-white shadow-sm p-4">
                <FormHeading text="Pay Online" variant="body2" />

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
                        <th className="border px-3 py-2 text-left">
                          Invoice No
                        </th>
                        <th className="border px-3 py-2 text-left">Date</th>
                        <th className="border px-3 py-2 text-left">Category</th>
                        <th className="border px-3 py-2 text-right">
                          Amount (INR)
                        </th>
                        <th className="border px-3 py-2 text-left">Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map((inv) => (
                        <tr key={inv.invoiceId}>
                          <td className="border px-3 py-2 text-center">
                            <Checkbox
                              size="small"
                              checked={selectedInvoiceIds.includes(
                                inv.invoiceId
                              )}
                              onChange={() => toggleInvoice(inv.invoiceId)}
                            />
                          </td>
                          <td className="border px-3 py-2">{inv.invoiceNo}</td>
                          <td className="border px-3 py-2">
                            {inv.invoiceDate}
                          </td>
                          <td className="border px-3 py-2">
                            {inv.invoiceCategory}
                          </td>
                          <td className="border px-3 py-2 text-right">
                            ₹{inv.totalInvoiceAmount}
                          </td>
                          <td className="border px-3 py-2">
                            {inv.remarks || "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Box>

                <Typography
                  variant="body1"
                  className="font-semibold mt-3 text-right"
                >
                  Grand Total: ₹{grandTotal.toFixed(2)}
                </Typography>

                <Box className="mt-6 flex justify-center gap-3">
                  <CustomButton
                    text={paying ? "Processing…" : "Continue to Pay Online"}
                    onClick={quickPayHandler}
                    disabled={paying}
                  />
                  <CustomButton
                    text="Back"
                    href="/request/invoicePayment/list"
                  />
                </Box>
              </Box>
            )}

            {/* === Pay Offline Section === */}
            {tabValue === 1 && (
              <Box className="mt-4 border rounded-md bg-white shadow-sm p-4">
                <FormHeading text="Pay Offline" variant="body2" />

                {/* Invoice List */}
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
                        <th className="border px-3 py-2 text-left">
                          Invoice No
                        </th>
                        <th className="border px-3 py-2 text-left">Date</th>
                        <th className="border px-3 py-2 text-left">Category</th>
                        <th className="border px-3 py-2 text-right">
                          Amount (INR)
                        </th>
                        <th className="border px-3 py-2 text-left">Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map((inv) => (
                        <tr key={inv.invoiceId}>
                          <td className="border px-3 py-2 text-center">
                            <Checkbox
                              size="small"
                              checked={selectedInvoiceIds.includes(
                                inv.invoiceId
                              )}
                              onChange={() => toggleInvoice(inv.invoiceId)}
                            />
                          </td>
                          <td className="border px-3 py-2">{inv.invoiceNo}</td>
                          <td className="border px-3 py-2">
                            {inv.invoiceDate}
                          </td>
                          <td className="border px-3 py-2">
                            {inv.invoiceCategory}
                          </td>
                          <td className="border px-3 py-2 text-right">
                            ₹{inv.totalInvoiceAmount}
                          </td>
                          <td className="border px-3 py-2">
                            {inv.remarks || "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Box>

                <Typography
                  variant="body1"
                  className="font-semibold mt-3 text-right"
                >
                  Grand Total: ₹{grandTotal.toFixed(2)}
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
                    href="/request/invoicePayment/list"
                  />
                </Box>
              </Box>
            )}
          </>
        )}

        {/* 🟢 Payment Modal */}
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
