"use client";

import { useState } from "react";
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
import { exportText } from "@/utils";

export default function IGMEDI() {
  const [formData, setFormData] = useState({});
  const [fieldsMode, setFieldsMode] = useState("");
  const [jsonData, setJsonData] = useState(data);
  const { mode, setMode } = formStore();
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tableFormData, setTableFormData] = useState([]);
  const router = useRouter(); 

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
          clientId: 8,
          userId: 4,
        },
      }),
    });
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
              text="GENERATE FILE"
              onClick={handleUpdate}
              disabled={loading || !tableFormData.length}
              title={
                !tableFormData.length ? "Select & edit at least one row" : ""
              }
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
