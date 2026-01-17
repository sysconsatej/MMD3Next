"use client";

import { useState, useMemo } from "react";
import { ThemeProvider, Box } from "@mui/material";
import data, { metaData } from "./igmData";
import { CustomInput } from "@/components/customInput";
import { theme } from "@/styles";
import { toast, ToastContainer } from "react-toastify";
import CustomButton from "@/components/button/button";
import { formStore } from "@/store";
import DynamicReportTable from "@/components/dynamicReport/dynamicReportEditable";
import { useRouter } from "next/navigation";
import {
  fetchDynamicReportData,
  updateDynamicReportData,
} from "@/apis/dynamicReport";
import { exportText, getUserByCookies } from "@/utils";
import { createHandleChangeEventFunction } from "@/utils/dropdownUtils";
import DynamicReportDownloadCsvButton from "@/components/dynamicReportExcelDownload/page";
import { company } from "faker/lib/locales/az";

export default function IGMEDI() {
  const [formData, setFormData] = useState({});
  const [fieldsMode, setFieldsMode] = useState("");
  const [jsonData, setJsonData] = useState(data);
  const { mode, setMode } = formStore();
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [goLoading, setGoLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tableFormData, setTableFormData] = useState([]);
  const router = useRouter();
  const userData = getUserByCookies();

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

  const handleUpdate = () =>
    exportText({
      tableFormData,
      updateFn: updateDynamicReportData,
      filenamePrefix: "IGMEdi",
      toast,
      setLoading,
      filterDirty: false,
      join: "\r\n",
      buildBody: (rows) => ({
        spName: "IGMEdi",
        jsonData: {
          ...transformed,
          data: rows,
          clientId: 1,
          userId: userData.userId,
          companyId: userData.companyId,
        },
      }),
    });
  const handleSubmit = async (e) => {
    e.preventDefault();
    setGoLoading(true);
    setError(null);

    const requestBody = {
      spName: "importBlSelection",
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
      setGoLoading(false);
    }
  };
  const handleChangeEventFunctions = useMemo(
    () =>
      createHandleChangeEventFunction({
        setFormData,
        fields: jsonData.igmEdiFields,
      }),
    [setFormData, jsonData.igmEdiFields]
  );
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
            <CustomButton
              text={loading ? "Loading..." : "GENERATE FILE"}
              onClick={handleUpdate}
              disabled={loading || !tableFormData.length}
              title={
                !tableFormData.length ? "Select & edit at least one row" : ""
              }
            />
            <DynamicReportDownloadCsvButton
              rows={tableFormData} // ✅ ONLY checked rows
              metaData={metaData}
              fileName={`IGMEdi_Selected_${new Date().toISOString().slice(0, 10)}.csv`}
              text="DOWNLOAD EXCEL"
              buttonStyles="custom-btn"
              disabled={!tableFormData.length} // ✅ disabled until at least 1 row checked
            />
            <CustomButton
              text="Cancel"
              buttonStyles="!text-[white] !bg-[#f5554a] !text-[11px]"
              onClick={() => router.push("/")}
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
