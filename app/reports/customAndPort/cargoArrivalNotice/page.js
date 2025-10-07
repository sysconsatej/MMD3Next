"use client";

import { useEffect, useState } from "react";
import { ThemeProvider, Box } from "@mui/material";
import data, { metaData } from "./cargoArrivalNoticeData";
import { CustomInput } from "@/components/customInput";
import { theme } from "@/styles";
import { toast, ToastContainer } from "react-toastify";
import CustomButton from "@/components/button/button";
import { formStore } from "@/store";
import { fetchDynamicReportData, sendEmail } from "@/apis";
import DynamicReportTable from "@/components/dynamicReport/dynamicReportEditable";

export default function CargoArrivalNotice() {
  const headerImg =
    "http://94.136.187.170:4000/uploads/cargo-arrival-header.png";
  const signImg =
    "http://94.136.187.170:4000/uploads/cargo-arrival-signature.png";
  const [formData, setFormData] = useState({});
  const [fieldsMode, setFieldsMode] = useState("");
  const [jsonData, setJsonData] = useState(data);
  const { mode, setMode } = formStore();
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tableFormData, setTableFormData] = useState([]);

  const transformToIds = (data) => {
    return Object.fromEntries(
      Object.entries(data).map(([key, value]) => {
        if (value && typeof value === "object" && "Id" in value) {
          return [key, value.Id]; // take only the Id
        }
        return [key, value]; // keep original if not object
      })
    );
  };

  const transformed = transformToIds(formData);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const requestBody = {
      spName: "CANIndiaImportBlSelection",
      jsonData: transformed,
    };

    const getErr = (src) =>
      (src?.error && String(src.error)) ||
      (src?.message && String(src.message)) ||
      "";

    const isNoDataError = (txt = "") =>
      txt.toLowerCase().includes("did not return valid json text");

    try {
      const res = await fetchDynamicReportData(requestBody);

      if (res.success) {
        const rows = Array.isArray(res.data) ? res.data : [];
        if (rows.length) {
          setTableData(rows);
        } else {
          setTableData([]);
          toast.info("No data found.");
        }
      } else {
        const errText = getErr(res);
        setTableData([]);

        if (isNoDataError(errText)) {
          setError(null);
          toast.info("No data found.");
        } else {
          setError(errText || "Request failed.");
          toast.error(
            errText || `Request failed${res.status ? ` (${res.status})` : ""}.`
          );
        }
      }
    } catch (err) {
      const body = err?.response?.data;
      const errText =
        (body && (body.error || body.message)) ||
        err?.message ||
        "Network/Server error.";

      setTableData([]);
      if (isNoDataError(errText)) {
        setError(null);
        toast.info("No data found.");
      } else {
        setError(errText);
        toast.error(errText);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = async () => {
    // 1) Validate selection
    if (!Array.isArray(tableFormData) || tableFormData.length === 0) {
      toast.info("Please select at least one record");
      return;
    }

    setEmailLoading(true);
    try {
      // 2) Build clean id list: prefer ID over id, remove empties, de-dupe
      const cleanedRows = Array.from(
        new Set(
          tableFormData
            .map((r) => r?.ID ?? r?.id)
            .filter((v) => v !== undefined && v !== null)
        )
      ).map((id) => ({ id }));

      if (cleanedRows.length === 0) {
        toast.info("No valid IDs found in selected rows");
        return;
      }

      // 3) Request payload
      const requestBody = {
        spName: "blData",
        jsonData: {
          ...transformed,
          data: cleanedRows,
        },
      };

      const fetchedData = await fetchDynamicReportData(requestBody);
      const data = fetchedData?.data?.data;

      if (!Array.isArray(data) || data.length === 0) {
        toast.info("No data returned to email");
        return;
      }

      // 5) Send emails one by one (sequential ensures simpler rate-limit handling)
      let successCount = 0;
      let failureCount = 0;
      let blNo = null;

      for (const item of data) {
        try {
          blNo = item?.blNo || "";
          const html = generatedHtmlReport(item); // assumes this never throws
          const emailPayload = {
            tailwindLocalPath: "./assets/css/tailwind.min.css", // optional
            to: "rohitanabhavane26@gmail.com", // TODO: replace with item-specific email if needed
            htmlContent: html,
          };

          const resp = await sendEmail(emailPayload);
          if (resp?.success) {
            successCount++;
            toast.success(`Email Send Successfully To BlNo: ${blNo}`);
          } else {
            failureCount++;
            toast.error(resp?.message || "Failed to send one email");
          }
        } catch (err) {
          failureCount++;
          //toast.error(err?.message || "Failed to send one email");
        }
      }

      // 6) Final summary
      if (successCount > 0) {
      }
      if (failureCount > 0) {
        //toast.error(`Failed: ${failureCount}`);
      }

      // (Optional) console logs for debugging
      console.log("Fetched Data:", data);
      console.log("Selected Rows:", tableFormData);
    } catch (e) {
      toast.error(e?.message || "Something went wrong.");
    } finally {
      setEmailLoading(false);
    }
  };

  const formatBlData = (item) => {
    if (!item) return ""; // if null/undefined return nothing

    const dateObj = new Date(item);
    if (isNaN(dateObj)) return ""; // not a valid date

    return dateObj.toLocaleDateString("en-GB"); // dd/MM/yyyy
  };

  const formatGrossWt = (grossWt) => {
    if (grossWt == null || grossWt === "") return ""; // handle null/empty
    const num = Number(grossWt);
    if (isNaN(num)) return ""; // safeguard
    return num.toFixed(2); // 2 decimals
  };

  const generatedHtmlReport = (item) => {
    console.log("data", item);
    const html = `<div style="width: 210mm; height: 297mm;background-color: white ">
   <div style="width: 210mm; height: 150px; overflow: hidden;">
   <img src=${headerImg}  
       alt="header" 
       style="width: 100%; height: 100%; object-fit: cover; display: block;" />
   </div>
   <div style="display: flex; padding: 20px;">
      <div style="width: 50%">
         <p style="font-size: 16px; font-weight: bold; margin: 0;">${
           item?.shipper || ""
         }</p>
         <p style="font-size: 11px; ; margin: 5px 0 0 0; width: 70%;">${
           item?.shipperAddress || ""
         }
         </p>
      </div>
      <div style="width: 50%;">
         <p style="font-size: 16px; font-weight: bold; margin: 0; text-align: right;">CARGO ARRIVAL NOTICE</p>
         <p style="font-size: 11px; ; margin: 5px 0 0 0;text-align: right;">12/09/2025</p>
      </div>
   </div>
   <div style="padding: 0 20px;">
      <p style="font-size: 11px; ; margin: 0;">IEC: </p>
      <p style="font-size: 11px; ; margin: 0;">PAN: </p>
      <p style="font-size: 11px; ; margin: 0;">GSTN: </p>
   </div>
   <div style="padding: 20px;">
      <p style="font-size: 11px; ; margin: 0;">Dear Sir/Madam</p>
      <p style="font-size: 11px; ; margin: 0; width: 70%;">This notice is to update your good office about the arrival of below mentioned shipment at destination.
         ETA: ${formatBlData(
           item?.arrivalDate
         )} (Contact us and verify ETA as last-minute schedule change can happen)
         ${formatBlData(item?.podVessel)} - ${formatBlData(item?.podVoyage)}
      </p>
   </div>
   <div style="padding: 0 20px; display: flex;">
      <div style="width: 40%;">
         <p style="font-size: 9px; ; margin: 0;  color: #7F7C82;">Shipper Name & Address</p>
         <p style="font-size: 11px; ; margin: 0; width: 90%; color: black;">${
           item?.shipper || ""
         }
            ${item?.shipperAddress || ""}
         </p>
      </div>
      <div style="width: 60%; display: flex;">
         <div style="width: 50%;" >
            <div>
               <p style="font-size: 9px; ; margin: 0;  color: #7F7C82;">BL No</p>
               <p style="font-size: 11px; ; margin: 0; width: 90%; color: black;">${
                 item?.blNo || ""
               }</p>
            </div>
            <div style="margin-top: 5px;">
               <p style="font-size: 9px; ; margin: 0;  color: #7F7C82;">Container</p>
               <p style="font-size: 11px; ; margin: 0; width: 90%; color: black;"></p>
            </div>
         </div>
         <div style="width: 50%;" >
            <div>
               <p style="font-size: 9px; ; margin: 0;  color: #7F7C82;">BL Date</p>
               <p style="font-size: 11px; ; margin: 0; width: 90%; color: black;">${formatBlData(
                 "2025-06-16"
               )}</p>
            </div>
            <div style="margin-top: 5px;">
               <p style="font-size: 9px; ; margin: 0;  color: #7F7C82;">Gross Weight - Kg</p>
               <p style="font-size: 11px; ; margin: 0; width: 90%; color: black;">${formatGrossWt(
                 item?.grossWt || ""
               )}</p>
            </div>
         </div>
      </div>
   </div>
   <div style="padding: 0 20px; display: flex;">
      <div style="width: 20%;">
         <p style="font-size: 9px; margin: 0;  color: #7F7C82;">PLR</p>
         <p style="font-size: 11px; margin: 0; width: 90%; color: black;">${
           item?.plrCode || ""
         }</p>
      </div>
      <div style="width: 20%;">
         <p style="font-size: 9px; margin: 0;  color: #7F7C82;">POL</p>
         <p style="font-size: 11px; margin: 0; width: 90%; color: black;">${
           item?.polCode || ""
         }</p>
      </div>
      <div style="width: 30%;">
         <p style="font-size: 9px; margin: 0;  color: #7F7C82;">POD</p>
         <p style="font-size: 11px; margin: 0; width: 90%; color: black;">${
           item?.podCode || ""
         }</p>
      </div>
      <div style="width: 24%;">
         <p style="font-size: 9px; margin: 0;  color: #7F7C82;">PLD</p>
         <p style="font-size: 11px; margin: 0; width: 90%; color: black;"></p>
      </div>
   </div>
   <div style="padding: 0 20px; display: flex;">
      <div style="width: 40%; display: flex;">
         <div style="width: 100%;">
            <p style="font-size: 9px; ; margin: 0;  color: #7F7C82;">Marks & No</p>
            <p style="font-size: 11px; ; margin: 0; color: black;">${
              item?.marksNos || ""
            }</p>
         </div>
      </div>
      <div style="width: 60%;">
         <p style="font-size: 9px; ; margin: 0;  color: #7F7C82;">Description</p>
         <p style="font-size: 11px; ; margin: 0; width: 100%; color: black;">${
           item?.goodsDesc || ""
         }
         </p>
      </div>
   </div>
   <div style="padding: 20px 20px;">
      <p style="color: black; font-size: 11px; font-weight: bold;"><u>Verify Charges / Generate Invoice</u></p>
      <p style="color: black; font-size: 9px; width: 95%;">Kindly open the customer portal https://customer.oasisdomain.net (New customers should register their KYC through the portal to access the billing
         module) and view/generate Invoices. Kindly arrange to obtain the Delivery Order from us on surrendering the original Bill of Lading duly endorsed in all
         respects and on payment of relevant charges as applicable. Consignees of Personal Effects should also submit a passport copy along with the original
         for verification. Copy of a photo ID card should be submitted at counter when collecting the Delivery Order. Kindly note the detention charges on the
         following page.</br></br>
         If the cargo is not cleared within 2 months from the date of arrival the container will be destuffed in accordance with the provisions of the port regulations
         and the cargo would be lying in the custody of port at your sole risk as to cost and consequences. For further clarification please contact our Counter
         office.
      </p>
   </div>
   <div style="padding: 20px 20px;">
      <p style="color: black; font-size: 9px;">Thanking you,</p>
      <p style="color: black; font-size: 9px;">Yours faithfully</p>
      <p style="color: black; font-size: 10px; font-weight: bold; margin-top: 20px;">For ${
        item?.company || ""
      }</p>
      <img src=${signImg}  alt="sign" height="100px" width="180px" />
      <p style="color: black; font-size: 12px;">(AUTHORISED SIGNATORY)</p>
      <hr style="border: 0.5px solid #7F7C82;">
   </div>
    </div>`;
    return html; // ✅ important
  };

  return (
    <ThemeProvider theme={theme}>
      <form onSubmit={handleSubmit}>
        <section className="py-1 px-4">
          <Box className="flex justify-between items-end py-1">
            <h1 className="text-left text-base flex items-end m-0 ">
              Cargo Arrival Notice
            </h1>
          </Box>
          <Box className="border border-solid border-black rounded-[4px] ">
            <Box className="sm:grid sm:grid-cols-4 gap-2 flex flex-col p-1 border-b border-b-solid border-b-black ">
              <CustomInput
                fields={jsonData.cargoFields}
                formData={formData}
                setFormData={setFormData}
                fieldsMode={fieldsMode}
              />
            </Box>
          </Box>
          <Box className="w-full flex mt-2  gap-2">
            <CustomButton
              text={loading ? "Loading..." : "GO"}
              type="submit"
              onClick={handleSubmit}
              disabled={loading}
            />
            <CustomButton
              text={emailLoading ? "Loading..." : "SEND EMAIL"}
              onClick={async () => handleSendEmail()}
              //disabled={loading || !tableFormData.length}
            />
          </Box>
        </section>
      </form>
      <Box className="!p-0">
        <DynamicReportTable
          data={tableData}
          metaData={metaData}
          onSelectedEditedChange={setTableFormData}
        />
      </Box>
      <ToastContainer />
    </ThemeProvider>
  );
}
