"use client";

import { useEffect, useState, useMemo } from "react";
import { ThemeProvider, Box } from "@mui/material";
import data, { metaData } from "./cargoArrivalNoticeData";
import { CustomInput } from "@/components/customInput";
import { theme } from "@/styles";
import { toast, ToastContainer } from "react-toastify";
import CustomButton from "@/components/button/button";
import { formStore } from "@/store";
import { fetchDynamicReportData, sendEmail } from "@/apis";
import DynamicReportTable from "@/components/dynamicReport/dynamicReportEditable";
import { createHandleChangeEventFunction } from "@/utils/dropdownUtils";

export default function CargoArrivalNotice() {
  const headerImg =
    "";
  const signImg =
    "";
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
          return [key, value.Id];
        }
        return [key, value];
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

    console.log('requestBody', requestBody);

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
    if (!Array.isArray(tableFormData) || tableFormData.length === 0) {
      toast.info("Please select at least one record");
      return;
    }

    setEmailLoading(true);
    try {
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
      const requestBody = {
        spName: "blData",
        jsonData: {
          ...transformed,
          data: cleanedRows,
        },
      };

      console.log(requestBody, '[][][]')

      const fetchedData = await fetchDynamicReportData(requestBody);
      const data = fetchedData?.data;
      console.log(fetchedData?.data, '[][][][')

      if (!Array.isArray(data) || data.length === 0) {
        toast.info("No data returned to email");
        return;
      }
      let successCount = 0;
      let failureCount = 0;
      let blNo = null;

      for (const item of data) {
        try {
          blNo = item?.blNo || "";
          const html = generatedHtmlReport(item);
          const emailPayload = {
            tailwindLocalPath: "./assets/css/tailwind.min.css",
            to: item?.emailTo || "",
            cc: item?.emailCC || "",
            htmlContent: html,
            pdfFilename: "Pre Cargo Arrival Notice",
            subject: "Pre Cargo Arrival Notice",
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
        }
      }

      if (successCount > 0) {
      }
      if (failureCount > 0) {
      }
    } catch (e) {
      toast.error(e?.message || "Something went wrong.");
    } finally {
      setEmailLoading(false);
    }
  };

  const formatBlData = (item) => {
    if (!item) return "";

    const dateObj = new Date(item);
    if (isNaN(dateObj)) return "";

    return dateObj.toLocaleDateString("en-GB");
  };

  const formatGrossWt = (grossWt) => {
    if (grossWt == null || grossWt === "") return "";
    const num = Number(grossWt);
    if (isNaN(num)) return "";
    return num.toFixed(2);
  };

  const generatedHtmlReport = (item) => {
    console.log("data", item);
    const html = `<div style="width: 210mm; height: 297mm;background-color: white ">
   <div style="width: 210mm; height: 150px; overflow: hidden;">
   <img src=${headerImg}  
       alt="header" 
       style="width: 100%; height: 100%; object-fit: cover; display: block;" />
   </div>
    <div className="flex justify-between w-full">
      <div className="flex items-end justify-start">
       <p className="text-black font-bold" style={{ fontSize: "10px" }}>
       To, <br />
        ${item?.consigneeName || ""}<br />
        ${item?.consigneeNameAndAddress || ""}<br />
      </p>
     </div>
     <div className="flex justify-between w-full">
        <p  className="text-black">
          Please find system generated Cargo Arrival Notice of your shipment.<br />
          Please arrange to pay all local charges and take delivery of your shipment once discharged.<br />
          Looking forward to your valuable support.<br />
        </p>
      </div>
   </div>
    <div style="display:flex; justify-content:space-between; align-items:flex-start; width:100%; margin-top:10px;">
       <div style="display:flex; gap:6px; width:30%; font-size:14px; line-height:1.2; color:#000;">
         <span style="font-weight:700;">B/L No.:</span>
         <span>${item?.blNo || ""}</span>
      </div>
         <div style="display:flex; gap:6px; width:70%; font-size:14px; line-height:1.2; color:#000;">
          <span style="font-weight:700;">B/L Date.:</span>
          <span>${formatBlData(item?.blData || "")}</span>
        </div>
    </div>
     <div style="display:flex; gap:6px; font-size:14px; line-height:1.2; color:#000;">
           <span style="font-weight:700;">Vessel - Voyage:</span>
           <span>${item?.podVessel || ""} - ${item?.podVoyage || ""}</span>
     </div>
    <div style="display:flex; gap:6px; font-size:14px; line-height:1.2; color:#000;">
           <span style="font-weight:700;">E.T.A:</span>
           <span>${item?.eta || ""}</span>
     </div>
      <div style="display:flex; gap:6px; font-size:14px; line-height:1.2; color:#000;">
           <span style="font-weight:700;">Port of Loading:</span>
           <span>${item?.pol || ""}</span>
     </div>
      <div style="display:flex; gap:6px; font-size:14px; line-height:1.2; color:#000;">
           <span style="font-weight:700;">Port of Discharge:</span>
           <span>${item?.pod || ""}</span>
     </div>
      <div style="display:flex; gap:6px; font-size:14px; line-height:1.2; color:#000;">
           <span style="font-weight:700;">Port of Delivery:</span>
           <span>${item?.fpd || ""}</span>
     </div>
      <div style="display:flex; gap:6px; font-size:14px; line-height:1.2; color:#000;">
     <div style="font-size:12px; line-height:1.35;">
    <span style="font-weight:700;">Description of Goods:</span>
    <span style="
      font-weight:400;
      margin-left:6px;
      white-space:normal;
      word-break:break-word;
      overflow-wrap:anywhere;
    ">
      ${String(item?.goodsDesc ?? "").replace(/\s+/g, " ").trim()}
    </span>
  </div>
</div>
  <div style="padding:10px 20px 0 20px;">
    <table cellpadding="0" cellspacing="0"
      style="width:100%; border-collapse:collapse; font-size:10px; color:#000;">
      <thead>
        <tr>
          <th style="border:1px solid #000; padding:5px; text-align:left;">Container No.</th>
          <th style="border:1px solid #000; padding:5px; text-align:left;">Size</th>
          <th style="border:1px solid #000; padding:5px; text-align:left;">Seal No.</th>
          <th style="border:1px solid #000; padding:5px; text-align:right;">No. of Packages</th>
          <th style="border:1px solid #000; padding:5px; text-align:left;">Package Type</th>
          <th style="border:1px solid #000; padding:5px; text-align:left;">Type</th>
          <th style="border:1px solid #000; padding:5px; text-align:right;">Gross Wt</th>
          <th style="border:1px solid #000; padding:5px; text-align:right;">Container Gross Wt</th>
        </tr>
      </thead>
      <tbody> 
        ${Array.isArray(item?.tblBlContainer) && item.tblBlContainer.length
        ? item.tblBlContainer.map((c) => `
              <tr>
                <td style="border:1px solid #000; padding:5px; text-align:left;">${c?.containerNo ?? ""}</td>
                <td style="border:1px solid #000; padding:5px; text-align:left;">${c?.size ?? ""}</td>
                <td style="border:1px solid #000; padding:5px; text-align:left;">${c?.agentSealNo ?? c?.customSealNo ?? ""}</td>
                <td style="border:1px solid #000; padding:5px; text-align:right;">${c?.noOfPackages ?? ""}</td>
                <td style="border:1px solid #000; padding:5px; text-align:left;">${c?.package ?? ""}</td>
                <td style="border:1px solid #000; padding:5px; text-align:left;">${c?.type ?? ""}</td>
                <td style="border:1px solid #000; padding:5px; text-align:right;">${c?.grossWt ?? ""}</td>
                <td style="border:1px solid #000; padding:5px; text-align:right;">${c?.grossWt ?? ""}</td>
              </tr>
            `).join("")
        : `
              <tr>
                <td colspan="8" style="border:1px solid #000; padding:8px; text-align:center;">
                  No container data
                </td>
              </tr>
            `
      }
      </tbody>
    </table>
  </div>
<div style="display:flex; gap:6px; font-size:14px; line-height:1.2; color:#000; margin-top:6px;">
  <span style="font-weight:700;">Remarks:</span>
  <span>${item?.remarks || ""}</span>
</div>
<div style="margin:8px 0; font-size:14px; line-height:1.35; color:#000;">
  <p style="margin:0;">
    This is to inform you that the above consignment is expected to arrive on above vessel.
    Kindly arrange to present original bills of lading duly discharged and obtain Delivery Order to clear the goods from the Port
    / CFS / ICD premises on payment of all relative charges as applicable with in normal / granted free days time of landing of
    container / cargo at Port / CFS / ICD or else detention charges will be applicable as per prevailing tariff.
    You are also requested to note that if you fail to take the delivery of cargo within 60 days of landing at Port / CFS / ICD,
    your cargo may be auctioned / de-stuffed under section 61 &amp; 62 of Major Port Trust Act, 1963 or TAMP or Section-48 of
    the Customs Act,1962.
  </p>
</div>
<div style="display:flex; gap:6px; font-size:14px; line-height:1.2; color:#000; margin-top:6px;">
  <span style="font-weight:700;">Disclaimer:</span>
  <span>NO responsibility shall be attached to the carrier or its Agents for failure to notify about shipment arrival.</span>
</div>
    </div>`;
    return html;
  };
  const handleChangeEventFunctions = useMemo(
    () =>
      createHandleChangeEventFunction({
        setFormData,
        fields: jsonData.cargoFields,
      }),
    [setFormData, jsonData.cargoFields]
  );
  return (
    <ThemeProvider theme={theme}>
      <form onSubmit={handleSubmit}>
        <section className="py-1 px-4">
          <Box className="flex justify-between items-end py-1">
            <h1 className="text-left text-base flex items-end m-0 ">
              Pre Cargo Arrival Notice
            </h1>
          </Box>
          <Box className="border border-solid border-black rounded-[4px] ">
            <Box className="sm:grid sm:grid-cols-4 gap-2 flex flex-col p-1 border-b border-b-solid border-b-black ">
              <CustomInput
                fields={jsonData.cargoFields}
                formData={formData}
                setFormData={setFormData}
                fieldsMode={fieldsMode}
                handleChangeEventFunctions={handleChangeEventFunctions}
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
