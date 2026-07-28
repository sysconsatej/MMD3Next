"use client";

import { useState, useMemo } from "react";
import { ThemeProvider, Box } from "@mui/material";
import data, { metaData } from "./jobReportData";
import { CustomInput } from "@/components/customInput";
import { theme } from "@/styles";
import { toast, ToastContainer } from "react-toastify";
import CustomButton from "@/components/button/button";
import { formStore } from "@/store";
import { fetchDynamicReportData } from "@/apis";
import DynamicReportTable from "@/components/dynamicReport/dynamicReportEditable";
import { useRouter } from "next/navigation";
import { createHandleChangeEventFunction } from "@/utils/dropdownUtils";
import { getUserByCookies } from "@/utils";
import * as XLSX from "xlsx";
import DynamicReportDownloadExcelButton from "@/components/dynamicReportExcel/page";

export default function IGM() {
  const [formData, setFormData] = useState({});
  const [fieldsMode, setFieldsMode] = useState("");
  const [jsonData, setJsonData] = useState(data);
  const { mode, setMode } = formStore();
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [goLoading, setGoLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tableFormData, setTableFormData] = useState([]);
  const userData = getUserByCookies();
  const router = useRouter();

  const transformToIds = (data) => {
    return Object.fromEntries(
      Object.entries(data).map(([key, value]) => {
        if (value && typeof value === "object" && "Id" in value) {
          return [key, value.Id];
        }
        return [key, value];
      }),
    );
  };
  const transformed = transformToIds(formData);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGoLoading(true);
    setError(null);

    const transformed = transformToIds(formData);

    const requestBody = {
      spName: "igmForm",
      jsonData: { ...transformed, companyId: userData?.companyId },
    };

    console.log("requestBody:", requestBody);

    const getErr = (src) =>
      (src?.error && String(src.error)) ||
      (src?.message && String(src.message)) ||
      "";

    const isNoDataError = (txt = "") =>
      txt.toLowerCase().includes("did not return valid json text");

    try {
      const res = await fetchDynamicReportData(requestBody);

      console.log("Response:", res);
      console.log("Response Data:", res?.data);

      if (res?.success) {
        const responseData = res?.data;

        // CASE 1: API returns normal array
        if (Array.isArray(responseData)) {
          if (responseData.length > 0) {
            setTableData(responseData);
            setError(null);
          } else {
            setTableData([]);
            setError(null);
            toast.info("No data found.");
          }

          return;
        }

        // CASE 2: API returns object containing multiple arrays/sheets
        if (responseData && typeof responseData === "object") {
          const sheetEntries = Object.entries(responseData).filter(
            ([key, value]) => Array.isArray(value) && value.length > 0,
          );

          if (!sheetEntries.length) {
            setTableData([]);
            setError(null);
            toast.info("No data found.");
            return;
          }

          // Show first sheet in DynamicReportTable
          setTableData(sheetEntries[0][1]);

          // If you also want Excel export
          // exportObjectArraysToExcel(responseData, "Job Report.xlsx");

          setError(null);
          return;
        }

        setTableData([]);
        setError(null);
        toast.info("No data found.");
      } else {
        const errText = getErr(res);

        setTableData([]);

        if (isNoDataError(errText)) {
          setError(null);
          toast.info("No data found.");
        } else {
          setError(errText || "Request failed.");
          toast.error(
            errText ||
              `Request failed${res?.status ? ` (${res.status})` : ""}.`,
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
      setGoLoading(false);
    }
  };

  function exportObjectArraysToExcel(dataObj, fileName = "report.xlsx") {
    if (!dataObj || typeof dataObj !== "object") return;

    const wb = XLSX.utils.book_new();

    for (const [sheetNameRaw, rowsRaw] of Object.entries(dataObj)) {
      const sheetName = String(sheetNameRaw).slice(0, 31); // Excel sheet name limit
      const rows = Array.isArray(rowsRaw) ? rowsRaw : [];

      // Build a stable header list = union of keys across all rows (keeps first-seen order)
      const headers = [];
      const headerSet = new Set();
      for (const r of rows) {
        if (!r || typeof r !== "object") continue;
        for (const k of Object.keys(r)) {
          if (!headerSet.has(k)) {
            headerSet.add(k);
            headers.push(k);
          }
        }
      }

      // Convert to AoA so we can control header order
      const aoa = [
        headers, // header row
        ...rows.map((r) => headers.map((h) => r?.[h] ?? "")),
      ];

      const ws = XLSX.utils.aoa_to_sheet(aoa);

      // Optional: auto column widths
      const colWidths = headers.map((h, ci) => {
        let maxLen = String(h).length;
        for (let ri = 0; ri < rows.length; ri++) {
          const v = rows[ri]?.[h];
          const s =
            v === null || v === undefined
              ? ""
              : typeof v === "string"
                ? v
                : String(v);
          if (s.length > maxLen) maxLen = s.length;
        }
        return { wch: Math.min(60, maxLen + 2) };
      });
      ws["!cols"] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, sheetName || "Sheet1");
    }

    XLSX.writeFile(wb, fileName);
  }

  const handleChangeEventFunctions = useMemo(
    () =>
      createHandleChangeEventFunction({
        setFormData,
        fields: jsonData.jobReportFields,
      }),
    [setFormData, jsonData.jobReportFields],
  );
  return (
    <ThemeProvider theme={theme}>
      <form>
        <section className="py-1 px-4">
          <Box className="flex justify-between items-end py-1">
            <h1 className="text-left text-base flex items-end m-0 ">
              IGM REPORT FORM
            </h1>
          </Box>
          <Box className="border border-solid border-black rounded-[4px] ">
            <Box className="sm:grid sm:grid-cols-3 gap-2 flex flex-col p-1 border-b border-b-solid border-b-black ">
              <CustomInput
                fields={jsonData.jobReportFields}
                formData={formData}
                setFormData={setFormData}
                fieldsMode={fieldsMode}
                handleChangeEventFunctions={handleChangeEventFunctions}
              />
            </Box>
          </Box>
          <Box className="w-full flex mt-2  gap-2">
            <CustomButton
              text={goLoading ? "Loading..." : "GO"}
              type="submit"
              onClick={handleSubmit}
              disabled={loading}
            />

            <DynamicReportDownloadExcelButton
              rows={tableFormData}
              metaData={metaData}
              fileName={`IGMFORMREPORT_${new Date().toISOString().slice(0, 10)}.xlsx`}
              text="DOWNLOAD EXCEL"
              buttonStyles="custom-btn"
              disabled={!tableFormData.length}
            />
            <CustomButton
              text="Cancel"
              buttonStyles="!text-[white] !bg-[#f5554a] !text-[11px]"
              onClick={() => router.push("/home")}
              type="button"
            />
          </Box>
        </section>
      </form>

      <Box className="p-0">
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
