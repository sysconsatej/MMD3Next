"use client";
import { useState ,useMemo} from "react";
import { ThemeProvider, Box } from "@mui/material";
import data, { metaData } from "./invoiceRegisterCustomerData";
import { CustomInput } from "@/components/customInput";
import { theme } from "@/styles";
import { toast, ToastContainer } from "react-toastify";
import CustomButton from "@/components/button/button";
import DynamicReportTable from "@/components/dynamicReport/dynamicReportEditable";
import { fetchDynamicReportData } from "@/apis/dynamicReport";
import { useRouter } from "next/navigation";
import { getUserByCookies } from "@/utils";
import { jsonToExcelFile } from "@/utils/helper";
import { createHandleChangeEventFunction } from "@/utils/dropdownUtils";

export default function invoiceRegisterCustomer() {
    const [formData, setFormData] = useState({});
    const [fieldsMode, setFieldsMode] = useState("");
    const [tableData, setTableData] = useState([]);
    const [jsonData, setJsonData] = useState(data);
    const [goLoading, setGoLoading] = useState(false);
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setGoLoading(true);

        const transformed = transformToIds(formData);

        const requestBody = {
            spName: "",
            jsonData: transformed,
            companyId: userData.companyId,
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
                    toast.info("No data found.");
                } else {
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
                toast.info("No data found.");
            } else {
                toast.error(errText);
            }
        } finally {
            setGoLoading(false);
        }
    };
    const handleGenerateReport = () => {
        if (!tableData || !tableData.length) {
            toast.info("No data to export.");
            return;
        }
        jsonToExcelFile(tableData, "Released Do Tat");
    };
    const handleChangeEventFunctions = useMemo(
    () =>
      createHandleChangeEventFunction({
        setFormData,
        fields: jsonData.invoiceRegisterFields,
      }),
    [setFormData, jsonData.invoiceRegisterFields]
  );
    return (
        <ThemeProvider theme={theme}>
            <form onSubmit={handleSubmit}>
                <section className="py-1 px-4">
                    <Box className="flex justify-between items-end py-1">
                        <h1 className="text-left text-base flex items-end m-0">
                            Invoice Register Customer
                        </h1>
                    </Box>

                    <Box className="border border-solid border-black rounded-[4px]">
                        <Box className="sm:grid sm:grid-cols-5 gap-2 flex flex-col p-1 border-b border-b-solid border-b-black">
                            <CustomInput
                                fields={data.invoiceRegisterFields}
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
                        <CustomButton
                            text="GENERATE REPORT"
                            type="button"
                            onClick={handleGenerateReport}
                            title={!tableData.length ? "No data to export" : ""}
                        />
                        <CustomButton
                            text="Cancel"
                            onClick={() => router.push("/")}
                            type="button"
                        />
                    </Box>
                </section>
            </form>

            <Box className="p-0">
                <DynamicReportTable data={tableData} metaData={metaData} />
            </Box>

            <ToastContainer />
        </ThemeProvider>
    );
}
