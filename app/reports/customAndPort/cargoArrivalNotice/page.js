"use client";

import { useEffect, useState } from "react";
import { ThemeProvider, Box } from "@mui/material";
import data, { metaData } from "./cargoArrivalNoticeData";
import { CustomInput } from "@/components/customInput";
import { theme } from "@/styles";
import { toast, ToastContainer } from "react-toastify";
import CustomButton from "@/components/button/button";
import { formStore } from "@/store";
import { fetchDynamicReportData } from "@/apis";
import DynamicReportTable from "@/components/dynamicReport/dynamicReportEditable";

export default function CargoArrivalNotice() {
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
  const handleUpdate = async () => {
    if (!tableFormData?.length) {
      toast.info("Select & edit at least one row to update.");
      return;
    }

    setLoading(true);
    try {
      // Just log the current tableFormData
      console.log("📦 Table Form Data:", tableFormData);

      // Optional: show quick confirmation
      toast.success(`Captured ${tableFormData.length} row(s).`);
    } catch (e) {
      toast.error(e?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
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
              onClick={handleUpdate}
              disabled={loading || !tableFormData.length}
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
