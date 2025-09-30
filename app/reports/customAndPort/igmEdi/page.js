"use client";

import { useEffect, useState } from "react";
import { ThemeProvider, Box } from "@mui/material";
import data, { metaData } from "./igmData";
import { CustomInput } from "@/components/customInput";
import { theme } from "@/styles";
import { toast, ToastContainer } from "react-toastify";
import CustomButton from "@/components/button/button";
import { formStore } from "@/store";
import GenerateReportButton from "@/components/dynamicReport/generateReport";
// import DynamicReportTable from "@/components/dynamicReport/dynamicReport";
import DynamicReportTable from "@/components/dynamicReport/dynamicReportEditable";

import {
  fetchDynamicReportData,
  updateDynamicReportData,
} from "@/apis/dynamicReport";

export default function IGMEDI() {
  const [formData, setFormData] = useState({});
  const [fieldsMode, setFieldsMode] = useState("");
  const [jsonData, setJsonData] = useState(data);
  const { mode, setMode } = formStore();
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tableFormData, setTableFormData] = useState([]);
  useEffect(() => {
    console.log("📦 tableFormData (live):", tableFormData);
  }, [tableFormData]);
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
  const handleUpdate = async () => {
    if (!tableFormData?.length) {
      toast.info("Select & edit at least one row to update.");
      return;
    }

    setLoading(true);
    try {
      const body = {
        spName: "ImportBlSelection",
        jsonData: tableFormData,
      };
      console.log("body", body);
      const resp = await updateDynamicReportData(body);
      if (!resp?.success) {
        toast.error(resp?.message || "Update failed.");
        return;
      }

      const api = resp.data;
      const results = api?.results || [];

      const stripCols = (obj) => {
        if (!obj || typeof obj !== "object") return { value: obj };
        const { index, status, ID, Id, id, ...rest } = obj;
        return rest;
      };
      const pushRowsFromData = (acc, data) => {
        if (Array.isArray(data))
          data.forEach((row) => acc.push(stripCols(row)));
        else if (data && typeof data === "object") acc.push(stripCols(data));
      };

      const okRows = [];
      const failedRows = []; 

      results.forEach((r) => {
        if (r?.ok) {
          if (r.data) {
            pushRowsFromData(okRows, r.data);
          } else if (Array.isArray(r?.recordsets?.[0])) {
            r.recordsets[0].forEach((row) => okRows.push(stripCols(row)));
          } else {
            okRows.push({}); 
          }
        } else {
          failedRows.push({ error: r?.error || "Failed" });
        }
      });

      if (!okRows.length && !failedRows.length) {
        toast.info("Update completed, but nothing to export.");
        return;
      }

      const XLSX = await import("xlsx");

      const wb = XLSX.utils.book_new();

      if (okRows.length) {
        const wsOK = XLSX.utils.json_to_sheet(okRows);
        XLSX.utils.book_append_sheet(wb, wsOK, "Results");
      }
      if (failedRows.length) {
        const wsFailed = XLSX.utils.json_to_sheet(failedRows);
        XLSX.utils.book_append_sheet(wb, wsFailed, "Failed");
      }

      const ts = new Date();
      const pad = (n) => String(n).padStart(2, "0");
      const stamp = `${ts.getFullYear()}-${pad(ts.getMonth() + 1)}-${pad(
        ts.getDate()
      )}_${pad(ts.getHours())}-${pad(ts.getMinutes())}-${pad(ts.getSeconds())}`;
      const filename = `Advance List(Excel)${stamp}.xlsx`;

      XLSX.writeFile(wb, filename);
      toast.success("Update completed. Excel downloaded.");
    } catch (e) {
      toast.error(e?.message || "Update failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const requestBody = {
      spName: "importBlSelection",
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

  return (
    <ThemeProvider theme={theme}>
      <form onSubmit={handleSubmit}>
        <section className="py-1 px-4">
          <Box className="flex justify-between items-end py-1">
            <h1 className="text-left text-base flex items-end m-0 ">IGM EDI</h1>
          </Box>
          <Box className="border border-solid border-black rounded-[4px] ">
            <Box className="sm:grid sm:grid-cols-3 gap-2 flex flex-col p-1 border-b border-b-solid border-b-black ">
              <CustomInput
                fields={jsonData.igmEdiFields}
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
              text="Update"
              onClick={handleUpdate}
              disabled={loading || !tableFormData.length}
              title={
                !tableFormData.length ? "Select & edit at least one row" : ""
              }
            />
            {/* <CustomButton
              text="Generate Report"
              onClick={() =>
                console.log("📝 tableFormData now:", tableFormData)
              }
            /> */}
            {/* <GenerateReportButton
              reportOptions={["Import General Manifest", "Other Report"]}
              onDownload={(ctx) => {
                console.log("DOWNLOAD clicked:", ctx);
                // 👉 put your CSV export logic here
              }}
              onPdf={(ctx) => {
                console.log("PDF clicked:", ctx);
                // 👉 call jsPDF or your PDF generator here
              }}
              onEmail={async (ctx) => {
                console.log("EMAIL clicked:", ctx);
                // 👉 call your email API here
              }}
            /> */}
          </Box>
        </section>
      </form>
      <Box className="p-0">
        <DynamicReportTable
          data={tableData}
          metaData={metaData}
          onSelectedEditedChange={setTableFormData}
        />
        {/* <DynamicReportTable data={tableData} /> */}
      </Box>
      <ToastContainer />
    </ThemeProvider>
  );
}
