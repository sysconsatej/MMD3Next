"use client";
import { useState } from "react";
import { ThemeProvider, Box } from "@mui/material";
import data, { metaData } from "./doRegisterData";
import { CustomInput } from "@/components/customInput";
import { theme } from "@/styles";
import { toast, ToastContainer } from "react-toastify";
import CustomButton from "@/components/button/button";
import DynamicReportTable from "@/components/dynamicReport/dynamicReportEditable";
import { fetchDynamicReportData } from "@/apis/dynamicReport";
import { useRouter } from "next/navigation";
import { getUserByCookies } from "@/utils";
import { createHandleChangeEventFunction } from "@/utils/dropdownUtils";
import DynamicReportDownloadExcelButton from "@/components/dynamicReportExcel/page";
import dayjs from "dayjs";

export default function IgmGeneration() {
  const [formData, setFormData] = useState({});
  const [fieldsMode, setFieldsMode] = useState("");
  const [tableData, setTableData] = useState([]);
  const [tableFormData, setTableFormData] = useState([]);
  const [goLoading, setGoLoading] = useState(false);

  const router = useRouter();
  const userData = getUserByCookies();

  // ✅ Convert dropdown objects to Ids
  const transformToIds = (data) => {
    const result = {};

    for (const key in data) {
      const value = data[key];

      if (Array.isArray(value)) {
        result[key] = value.length ? value.map((v) => v).join(",") : null;
      } else if (value && typeof value === "object" && "Id" in value) {
        result[key] = value.Id;
      } else {
        result[key] = value ?? null;
      }
    }

    return result;
  };

  const REPORT_SP_MAP = {
    "Unreleased DO Report": "doUnReleasedLinerRegister",
    "Do Request": "doRequestLinerRegister",
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGoLoading(true);

    try {
      // ✅ 1. Get selected report BEFORE transform
      const selectedReport =
        formData?.selReportId?.Name || formData?.selReportId?.name;
      //   console.log("selReportId:", formData.selReportId);
      const spName = REPORT_SP_MAP[selectedReport];

      if (!spName) {
        toast.error("Please select a Report.");
        return;
      }

      // ✅ 2. Remove selReportId from payload
      const { selReportId, ...filteredFormData } = formData;

      // ✅ 3. Convert dropdown objects
      const transformed = transformToIds(filteredFormData);

      // ✅ 4. Correct date formatting (no wrong parsing)
      const formattedForApi = {
        ...transformed,
        fromDate: transformed.fromDate
          ? dayjs(transformed.fromDate).format("DD/MM/YYYY")
          : null,
        toDate: transformed.toDate
          ? dayjs(transformed.toDate).format("DD/MM/YYYY")
          : null,
      };

      // ✅ 5. Dynamic SP
      const requestBody = {
        spName,
        jsonData: {
          ...formattedForApi,
          shippingLineId: userData.companyId,
        },
      };

      const res = await fetchDynamicReportData(requestBody);

      if (res?.success) {
        const rows = Array.isArray(res.data) ? res.data : [];
        setTableData(rows);
        if (!rows.length) toast.info("No data found.");
      } else {
        setTableData([]);
        toast.error(res?.error || res?.message || "Request failed.");
      }
    } catch (err) {
      setTableData([]);
      toast.error(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          err?.message ||
          "Network/Server error.",
      );
    } finally {
      setGoLoading(false);
    }
  };

  const handleChangeEventFunctions = createHandleChangeEventFunction({
    setFormData,
    fields: data.igmGenerationFields,
  });

  return (
    <ThemeProvider theme={theme}>
      <form onSubmit={handleSubmit}>
        <section className="py-1 px-4">
          <Box className="flex justify-between items-end py-1">
            <h1 className="text-left text-base m-0">Do Register</h1>
          </Box>

          <Box className="border border-black rounded-[4px]">
            <Box className="sm:grid sm:grid-cols-4 gap-2 flex flex-col p-1 border-b border-black">
              <CustomInput
                fields={data.igmGenerationFields}
                formData={formData}
                setFormData={setFormData}
                fieldsMode={fieldsMode}
                handleChangeEventFunctions={handleChangeEventFunctions}
              />
            </Box>
          </Box>

          <Box className="w-full flex mt-2 gap-2">
            <CustomButton
              text={goLoading ? "Loading..." : "GO"}
              type="submit"
              disabled={goLoading}
            />

            <DynamicReportDownloadExcelButton
              rows={tableFormData}
              metaData={metaData}
              fileName={`DoRegisterReport_${new Date()
                .toISOString()
                .slice(0, 10)}.xlsx`}
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
