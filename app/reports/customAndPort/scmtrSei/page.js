"use client";

import { useEffect, useState, useMemo } from "react";
import { ThemeProvider, Box } from "@mui/material";
import data, { metaData } from "./scmtrSeiData";
import { CustomInput } from "@/components/customInput";
import { theme } from "@/styles";
import { toast, ToastContainer } from "react-toastify";
import CustomButton from "@/components/button/button";
import { formStore } from "@/store";
import { fetchDynamicReportData, updateDynamicReportData } from "@/apis";
import DynamicReportTable from "@/components/dynamicReport/dynamicReportEditable";
import { useRouter } from "next/navigation";
import { getUserByCookies, jsonExport } from "@/utils";
import { createHandleChangeEventFunction } from "@/utils/dropdownUtils";
import { jsonExportDirect } from "@/utils/dynamicReportUtils";

export default function SEI() {
  const [formData, setFormData] = useState({});
  const [fieldsMode, setFieldsMode] = useState("");
  const [jsonData, setJsonData] = useState(data);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const userData = getUserByCookies();

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

  const handleUpdate = () =>
    jsonExportDirect({
      filenamePrefix: "ScmtrSei",
      updateFn: updateDynamicReportData,
      toast,
      setLoading,
      buildBody: () => ({
        spName: "scmtSei",
        jsonData: {
          ...transformed,
          clientId: 1,
          userId: userData.userId,
        },
      }),
    });
  const handleChangeEventFunctions = useMemo(
    () =>
      createHandleChangeEventFunction({
        setFormData,
        fields: jsonData.igmEdiFields,
      }),
    [setFormData, jsonData.igmEdiFields],
  );
  return (
    <ThemeProvider theme={theme}>
      <form>
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
                handleChangeEventFunctions={handleChangeEventFunctions}
              />
            </Box>
          </Box>
          <Box className="w-full flex mt-2  gap-2">
            <CustomButton
              text={loading ? "Loading..." : "GO"}
              type="button"
              onClick={handleUpdate}
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
      <ToastContainer />
    </ThemeProvider>
  );
}
