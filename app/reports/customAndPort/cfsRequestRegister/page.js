"use client";
import { useState } from "react";
import { ThemeProvider, Box } from "@mui/material";
import data, { metaData } from "./cfsRequestRegisterData";
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
    return Object.fromEntries(
      Object.entries(data).map(([key, value]) => {
        if (value && typeof value === "object" && "Id" in value) {
          return [key, value.Id];
        }
        return [key, value];
      }),
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGoLoading(true);

    try {
      // 1️⃣ Convert dropdown objects
      const transformed = transformToIds(formData);

      // 2️⃣ Convert date format ONLY for API
      const formattedForApi = {
        ...transformed,
        fromDate: transformed.fromDate
          ? dayjs(transformed.fromDate, "YYYY/MM/DD").format("DD/MM/YYYY")
          : null,
        toDate: transformed.toDate
          ? dayjs(transformed.toDate, "YYYY/MM/DD").format("DD/MM/YYYY")
          : null,
      };

      const requestBody = {
        spName: "cfsRequestRegister",
        jsonData: {
          ...formattedForApi,
          locationId: userData.location,
          shippingLineId: userData.companyId,
        },
      };

      const res = await fetchDynamicReportData(requestBody);

      if (res?.success) {
        const rows = Array.isArray(res.data) ? res.data : [];
        if (rows.length) {
          setTableData(rows);
        } else {
          setTableData([]);
          toast.info("No data found.");
        }
      } else {
        const errText = res?.error || res?.message || "Request failed.";
        setTableData([]);
        toast.error(errText);
      }
    } catch (err) {
      const errText =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "Network/Server error.";

      setTableData([]);
      toast.error(errText);
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
            <h1 className="text-left text-base m-0">Line CFS Request</h1>
          </Box>

          <Box className="border border-black rounded-[4px]">
            <Box className="sm:grid sm:grid-cols-3 gap-2 flex flex-col p-1 border-b border-black">
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
              fileName={`CFSRequestLineReport_${new Date()
                .toISOString()
                .slice(0, 10)}.xlsx`}
              text="DOWNLOAD EXCEL"
              buttonStyles="custom-btn"
              disabled={!tableFormData.length}
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
