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
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
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

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const blId = searchParams.get("blId");

  const [tabValue, setTabValue] = useState(0);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({});
  const [fieldsMode, setFieldsMode] = useState("new");

  // 🟢 Payment Modal States
  const [paying, setPaying] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [payUrl, setPayUrl] = useState(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeError, setIframeError] = useState(null);

  const handleChangeTab = (_,newValue) => setTabValue(newValue);

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
            b.mblNo AS blNo,
            c.name AS beneficiaryName
          `,
          tableName: "tblInvoice i",
          joins: `
            LEFT JOIN tblBl b ON b.id = i.blId
            LEFT JOIN tblCompany c ON c.id = b.companyId
            LEFT JOIN tblMasterData cat ON cat.id = i.invoiceCategoryId
          `,
          whereCondition: `i.blId = ${blId} AND ISNULL(i.status,1)=1`,
        };

        const { data, success } = await getDataWithCondition(query);

        if (success && Array.isArray(data) && data.length > 0) {
          const sorted = data.sort((a, b) => b.invoiceId - a.invoiceId);
          setInvoices(sorted);
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

  // 🔥 Remove invoice from list
  const handleRemoveInvoice = (invoiceId) => {
    setInvoices((prev) => prev.filter((inv) => inv.invoiceId !== invoiceId));
    toast.info(`Invoice ${invoiceId} removed from payment.`);
  };

  // 🟢 Handle modal close
  const handleClosePay = () => {
    setPayOpen(false);
    setPayUrl(null);
    setIframeLoaded(false);
    setIframeError(null);
  };

  // 🟢 Online payment logic
  const quickPayHandler = async () => {
    try {
      setPaying(true);
      setIframeLoaded(false);
      setIframeError(null);

      const totalAmount = invoices.reduce(
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

    if (invoices.length === 0) {
      toast.warn("No invoices selected for offline payment.");
      return;
    }

    try {
      setLoading(true);
      const invoiceIds = invoices.map((inv) => inv.invoiceId).join(",");
      const normalized = {
        ...formData,
        blId: Number(blId),
        invoiceIds,
        status: 1,
      };
      const payload = formatFormData("tblInvoicePayment", normalized);
      const { success, message, error } = await insertUpdateForm(payload);
      if (success) {
        toast.success(message || "Offline payment submitted successfully!");
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
  const grandTotal = invoices.reduce(
    (sum, inv) => sum + Number(inv.totalInvoiceAmount || 0),
    0
  );

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
                        <th className="border px-3 py-2 text-left">
                          Invoice No
                        </th>
                        <th className="border px-3 py-2 text-left">Date</th>
                        <th className="border px-3 py-2 text-left">Category</th>
                        <th className="border px-3 py-2 text-right">
                          Amount (INR)
                        </th>
                        <th className="border px-3 py-2 text-left">Remarks</th>
                        <th className="border px-3 py-2 text-center">Delete</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map((inv) => (
                        <tr key={inv.invoiceId}>
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
                          <td className="border px-3 py-2 text-center">
                            <IconButton
                              color="error"
                              onClick={() => handleRemoveInvoice(inv.invoiceId)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
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
                        <th className="border px-3 py-2 text-left">
                          Invoice No
                        </th>
                        <th className="border px-3 py-2 text-left">Date</th>
                        <th className="border px-3 py-2 text-left">Category</th>
                        <th className="border px-3 py-2 text-right">
                          Amount (INR)
                        </th>
                        <th className="border px-3 py-2 text-left">Remarks</th>
                        <th className="border px-3 py-2 text-center">Delete</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map((inv) => (
                        <tr key={inv.invoiceId}>
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
                          <td className="border px-3 py-2 text-center">
                            <IconButton
                              color="error"
                              onClick={() => handleRemoveInvoice(inv.invoiceId)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
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
