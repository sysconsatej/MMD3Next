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

    const fetchedData = await fetchDynamicReportData(requestBody);

    if (fetchedData.success) {
      setTableData(fetchedData.data);
    } else {
      setError(fetchedData.message);
    }

    setLoading(false);
  };

  const handleSendEmail = async () => {
    if (tableFormData?.length == 0) {
      toast.info("Please Select at least one Record");
      return;
    }
    setLoading(true);
    try {
      console.log("Table Form Data:", tableFormData);
      const generatedHtml = generatedHtmlReport(1);
      const obj = {
        tailwindLocalPath: "./assets/css/tailwind.min.css",
        to: "rohitanabhavane26@gmail.com,satyasharma4232@gmail.com,nilay@sysconinfotech.com,akash@sysconinfotech.com,tejas@sysconinfotech.com",
        htmlContent: generatedHtml,
      };
      const response = await sendEmail(obj);
      if (response?.success) {
        toast.success("Email sent successfully.");
      } else {
        toast.error(response?.message);
      }
    } catch (e) {
      toast.error(e?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const generatedHtmlReport = (data) => {
    const html = `<div style="width: 210mm; height: 297mm;background-color: white ">
   <div style="width: 210mm; height: 150px; overflow: hidden;">
   <img src=${headerImg}  
       alt="header" 
       style="width: 100%; height: 100%; object-fit: cover; display: block;" />
   </div>
   <div style="display: flex; padding: 20px;">
      <div style="width: 50%">
         <p style="font-size: 16px; font-weight: bold; margin: 0;">JN FREIGHT FORWARDERS PVT LTD</p>
         <p style="font-size: 11px; ; margin: 5px 0 0 0; width: 70%;">DOOR NO 39/3720C, 1ST FLOOR, SR COMPLEX
            CHITTOOR ROAD, RAVIPURAM, ERNAKULUMKOCHI 682016 IEC NO : 3200013087*
         </p>
      </div>
      <div style="width: 50%;">
         <p style="font-size: 16px; font-weight: bold; margin: 0; text-align: right;">CARGO ARRIVAL NOTICE</p>
         <p style="font-size: 11px; ; margin: 5px 0 0 0;text-align: right;">12/09/2025</p>
      </div>
   </div>
   <div style="padding: 0 20px;">
      <p style="font-size: 11px; ; margin: 0;">IEC: AABCJ1901B</p>
      <p style="font-size: 11px; ; margin: 0;">PAN: AABCJ1901B</p>
      <p style="font-size: 11px; ; margin: 0;">GSTN: 32AABCJ1901B1ZJ</p>
   </div>
   <div style="padding: 20px;">
      <p style="font-size: 11px; ; margin: 0;">Dear Sir/Madam</p>
      <p style="font-size: 11px; ; margin: 0; width: 70%;">This notice is to update your good office about the arrival of below mentioned shipment at destination.
         ETA: 17/09/2025 (Contact us and verify ETA as last-minute schedule change can happen)
         WAN HAI 515 - 102W
      </p>
   </div>
   <div style="padding: 0 20px; display: flex;">
      <div style="width: 40%;">
         <p style="font-size: 9px; ; margin: 0;  color: #7F7C82;">Shipper Name & Address</p>
         <p style="font-size: 11px; ; margin: 0; width: 90%; color: black;">RED LINE LOGISTICS VIETNAM CO.,LTD 01 PHO
            QUANG ST., TAN SON HOA WARD, HO CHI MINH
            CITY, VIETNAM.
         </p>
      </div>
      <div style="width: 60%; display: flex;">
         <div style="width: 50%;" >
            <div>
               <p style="font-size: 9px; ; margin: 0;  color: #7F7C82;">BL No</p>
               <p style="font-size: 11px; ; margin: 0; width: 90%; color: black;">039FX74532</p>
            </div>
            <div style="margin-top: 5px;">
               <p style="font-size: 9px; ; margin: 0;  color: #7F7C82;">Container</p>
               <p style="font-size: 11px; ; margin: 0; width: 90%; color: black;">1 X Dry-20'GP</p>
            </div>
         </div>
         <div style="width: 50%;" >
            <div>
               <p style="font-size: 9px; ; margin: 0;  color: #7F7C82;">BL Date</p>
               <p style="font-size: 11px; ; margin: 0; width: 90%; color: black;">13/08/2025</p>
            </div>
            <div style="margin-top: 5px;">
               <p style="font-size: 9px; ; margin: 0;  color: #7F7C82;">Gross Weight - Kg</p>
               <p style="font-size: 11px; ; margin: 0; width: 90%; color: black;">17400.00</p>
            </div>
         </div>
      </div>
   </div>
   <div style="padding: 0 20px; display: flex;">
      <div style="width: 20%;">
         <p style="font-size: 9px; margin: 0;  color: #7F7C82;">PLR</p>
         <p style="font-size: 11px; margin: 0; width: 90%; color: black;">VNCLP</p>
      </div>
      <div style="width: 20%;">
         <p style="font-size: 9px; margin: 0;  color: #7F7C82;">POL</p>
         <p style="font-size: 11px; margin: 0; width: 90%; color: black;">VNCLP</p>
      </div>
      <div style="width: 30%;">
         <p style="font-size: 9px; margin: 0;  color: #7F7C82;">POD</p>
         <p style="font-size: 11px; margin: 0; width: 90%; color: black;">ICTT VALLARPADAM</p>
      </div>
      <div style="width: 24%;">
         <p style="font-size: 9px; margin: 0;  color: #7F7C82;">PLD</p>
         <p style="font-size: 11px; margin: 0; width: 90%; color: black;">ICTT VALLARPADAM</p>
      </div>
   </div>
   <div style="padding: 0 20px; display: flex;">
      <div style="width: 40%; display: flex;">
         <div style="width: 100%;">
            <p style="font-size: 9px; ; margin: 0;  color: #7F7C82;">Marks & No</p>
            <p style="font-size: 11px; ; margin: 0; color: black;">CASHEW KERNELS WHOLES</p>
         </div>
      </div>
      <div style="width: 60%;">
         <p style="font-size: 9px; ; margin: 0;  color: #7F7C82;">Description</p>
         <p style="font-size: 11px; ; margin: 0; width: 100%; color: black;">750 CARTONS OF CASHEW KERNELS W HOLES (UNGRADED & UNSORTED) NW: 17,010.00 KGS
            (37,500.00 LB S) GW: 17,400.00 KGS (38,359.79 LB S) HS CODE: 080132
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
      <p style="color: black; font-size: 10px; font-weight: bold; margin-top: 20px;">For OMEGA SHIPPING AGENCIES PVT LTD</p>
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
              text={" SEND EMAIL"}
              onClick={async () => handleSendEmail()}
              //disabled={loading || !tableFormData.length}
            />
          </Box>
        </section>
      </form>
      <DynamicReportTable
        data={tableData}
        metaData={metaData}
        onSelectedEditedChange={setTableFormData}
      />
      <ToastContainer />
    </ThemeProvider>
  );
}
