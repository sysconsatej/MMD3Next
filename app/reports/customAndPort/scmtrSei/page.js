"use client";

import { useEffect, useState } from "react";
import { ThemeProvider, Box } from "@mui/material";
import data, { metaData } from "./scmtrSeiData";
import { CustomInput } from "@/components/customInput";
import { theme } from "@/styles";
import { toast, ToastContainer } from "react-toastify";
import CustomButton from "@/components/button/button";
import { formStore } from "@/store";
import { fetchDynamicReportData, updateDynamicReportData } from "@/apis";
import DynamicReportTable from "@/components/dynamicReport/dynamicReportEditable";

export default function SEI() {
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
          return [key, value.Id];
        }
        return [key, value];
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
      const cleanedRows = tableFormData.map(({ __dirty, ID, id, ...rest }) => ({
        id: ID ?? id, 
      }));

      const body = {
        spName: "scmtSei",
        jsonData: {
          ...transformed,
          terminal: null, 
          clientId: 8,
          userId: 4,
          data: cleanedRows,
        },
      };

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
        toast.info("Nothing to export.");
        return;
      }

      const exportData = {
        results: okRows,
        failed: failedRows,
        generatedAt: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const url = window.URL.createObjectURL(blob);

      const ts = new Date();
      const pad = (n) => String(n).padStart(2, "0");
      const stamp = `${ts.getFullYear()}-${pad(ts.getMonth() + 1)}-${pad(
        ts.getDate()
      )}_${pad(ts.getHours())}-${pad(ts.getMinutes())}-${pad(ts.getSeconds())}`;
      const filename = `ScmtrSei ${stamp}.json`;

      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);

      toast.success("Update completed. JSON file downloaded.");
    } catch (e) {
      toast.error(e?.message || "Update failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      <form >
        <section className="py-1 px-4">
          <Box className="flex justify-between items-end py-1">
            <h1 className="text-left text-base flex items-end m-0 ">
              SCMTR-SEI
            </h1>
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
              text="GENERATE FILE"
              onClick={handleUpdate}
              title={
                !tableFormData.length ? "Select & edit at least one row" : ""
              }
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
