"use client";

import { useEffect, useState, useMemo } from "react";
import { ThemeProvider, Box } from "@mui/material";
import data, { metaData } from "./bulkUpdateLineNo";
import { CustomInput } from "@/components/customInput";
import { theme } from "@/styles";
import { toast, ToastContainer } from "react-toastify";
import CustomButton from "@/components/button/button";
import { formStore } from "@/store";
import { fetchDynamicReportData, updateDynamicReportData } from "@/apis";
import DynamicReportTable from "@/components/dynamicReport/dynamicReportEditable";
import { useRouter } from "next/navigation";
import { createHandleChangeEventFunction } from "@/utils/dropdownUtils";
import { getUserByCookies } from "@/utils";

export default function IGM() {
  const [formData, setFormData] = useState({});
  const [fieldsMode, setFieldsMode] = useState("");
  const [jsonData, setJsonData] = useState(data);
  const { mode, setMode } = formStore();
  const [tableData, setTableData] = useState([]);
  const [goLoading, setGoLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
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

  const handleTableBlur = ({ rowUid, name, value, row, updateCell }) => {
    if (name !== "From") return;

    const from = Number(value) || 0;
    const blCount = Number(String(row["BLCount"] ?? "").replace(/,/g, ""));

    if (!Number.isFinite(blCount)) return;

    updateCell(rowUid, "To", from + blCount - 1);
  };
  const valuesOnly = (rows = []) =>
    rows.map(({ __dirty, ...row }) =>
      Object.fromEntries(Object.entries(row).map(([k, v]) => [k, onlyVal(v)]))
    );

  const onlyVal = (v) => {
    if (Array.isArray(v)) {
      const vals = v.map(onlyVal).filter((x) => x !== null && x !== undefined);
      return vals.length === 0 ? null : vals.length === 1 ? vals[0] : vals;
    }
    if (v && typeof v === "object") {
      if ("value" in v) return v.value;
      if ("Id" in v) return v.Id;
      if ("id" in v) return v.id;
    }
    return v;
  };

  const handleUpdate = async () => {
    if (!Array.isArray(tableFormData) || tableFormData.length === 0) {
      toast.info("Select & edit at least one row to update.");
      return;
    }

    const cleaned = valuesOnly(tableFormData);

    const body = {
      spName: "updateBlLineNoDetails",
      jsonData: {
        clientId: 1,
        ...transformed,
        companyId: userData.companyId,
        branchId: userData.branchId,
        userId: userData.userId,
        data: cleaned,
      },
    };

    setUpdateLoading(true);
    setError(null);

    try {
      const resp = await updateDynamicReportData(body);
      const api = resp?.data ?? resp;

      if (api?.success) {
        toast.success(api?.message || "Update successful.");
      } else {
        const errText = api?.error || api?.message || "Update failed.";
        setError(errText);
        toast.error(errText);
      }
    } catch (err) {
      const errText =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "Network/Server error.";
      setError(errText);
      toast.error(errText);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGoLoading(true);
    setError(null);

    const requestBody = {
      spName: "getBlLineNoDetails",
      jsonData: {
        clientId: 1,
        ...transformed,
      },
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
      <form>
        <section className="py-1 px-4">
          <Box className="flex justify-between items-end py-1">
            <h1 className="text-left text-base flex items-end m-0 ">
              Bulk Update Line No
            </h1>
          </Box>
          <Box className="border border-solid border-black rounded-[4px] ">
            <Box className="sm:grid sm:grid-cols-4 gap-2 flex flex-col p-1 border-b border-b-solid border-b-black ">
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
              disabled={goLoading || updateLoading}
            />
            <CustomButton
              text={updateLoading ? "Loading..." : "UPDATE LINE NO"}
              type="button"
              onClick={handleUpdate}
              disabled={goLoading || updateLoading}
            />
            <CustomButton
              text="Cancel"
              buttonStyles="!text-[white] !bg-[#f5554a] !text-[11px]"
              onClick={() => router.push("/home")}
              type="button"
              disabled={goLoading || updateLoading}
            />
          </Box>
        </section>
      </form>
      <Box className="p-0">
        <DynamicReportTable
          data={tableData}
          metaData={metaData}
          onSelectedEditedChange={setTableFormData}
          handleBlur={handleTableBlur}
        />
      </Box>
      <ToastContainer />
    </ThemeProvider>
  );
}
