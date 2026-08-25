"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { ThemeProvider, Box } from "@mui/material";
import data, { metaData } from "./scmtSdaData";
import { CustomInput } from "@/components/customInput";
import { theme } from "@/styles";
import { toast, ToastContainer } from "react-toastify";
import CustomButton from "@/components/button/button";
import { formStore } from "@/store";
import { fetchDynamicReportData, updateDynamicReportData } from "@/apis";
import DynamicReportTable from "@/components/dynamicReport/dynamicReportEditable";
import { useRouter } from "next/navigation"; // ⬅️ import router
import { getUserByCookies, jsonExport } from "@/utils";
import { createHandleChangeEventFunction } from "@/utils/dropdownUtils";
import { company } from "@/app/master/company/companyData";

export default function CSN() {
  const [formData, setFormData] = useState({});
  const [fieldsMode, setFieldsMode] = useState("");
  const [jsonData, setJsonData] = useState(data);
  const { mode, setMode } = formStore();
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [goLoading, setGoLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tableFormData, setTableFormData] = useState([]);
  const selectedRowsRef = useRef([]);
  const [selectionResetKey, setSelectionResetKey] = useState(0);
  const router = useRouter(); // ⬅️ initialize router
  const userData = getUserByCookies();

  const handleSelectedRowsChange = useCallback((rows) => {
    const selectedRows = Array.isArray(rows) ? rows : [];
    selectedRowsRef.current = selectedRows;
    setTableFormData(selectedRows);
  }, []);

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

  const handleUpdate = () => {
    console.log("formData:", formData);
    const selectedRows = selectedRowsRef.current;
    console.log("tableFormData:", selectedRows);

    if (!formData?.csnAmendmentId) {
      toast.warning("Please select Amendment Type.");
      return;
    }

    if (!formData?.csnNumber?.toString().trim()) {
      toast.warning("Please enter CSN Number.");
      return;
    }

    if (!formData?.csnDate) {
      toast.warning("Please select CSN Date.");
      return;
    }

    jsonExport({
      tableFormData: selectedRows,
      updateFn: updateDynamicReportData,
      filenamePrefix: "scmtrsca",
      toast,
      setLoading,
      filterDirty: false,
      buildBody: (rows) => ({
        spName: "scmtSca",
        jsonData: {
          ...transformed,
          clientId: 1,
          userId: userData.userId,
          data: rows,
        },
      }),
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setGoLoading(true);
    setError(null);

    const requestBody = {
      spName: "ImportMBlSelection",
      jsonData: {
        ...transformed,
        userId: userData.userId,
        companyId: userData.companyId,
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

          const isDeleteAll =
            formData?.csnAmendmentId?.code === "X" &&
            formData?.csnAmendmentId?.name === "Delete All";

          if (isDeleteAll) {
            handleSelectedRowsChange(rows);
          } else {
            handleSelectedRowsChange([]);
          }
        } else {
          setTableData([]);
          handleSelectedRowsChange([]);
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
            errText || `Request failed${res.status ? ` (${res.status})` : ""}.`,
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
  const handleChangeEventFunctions = useMemo(() => {
    const defaultFunctions = createHandleChangeEventFunction({
      setFormData,
      fields: jsonData.igmEdiFields,
    });

    return {
      ...defaultFunctions,

      handleCsnAmendmentChange: (name, value) => {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
        }));

        const isDeleteAll = value?.Name === "X - Delete All";

        if (isDeleteAll) {
          handleSelectedRowsChange(tableData);
        } else {
          handleSelectedRowsChange([]);
          setSelectionResetKey((current) => current + 1);
        }
      },
    };
  }, [handleSelectedRowsChange, setFormData, jsonData.igmEdiFields, tableData]);
  const isDeleteAll = formData?.csnAmendmentId?.Name === "X - Delete All";
  return (
    <ThemeProvider theme={theme}>
      <form>
        <section className="py-1 px-4">
          <Box className="flex justify-between items-end py-1">
            <h1 className="text-left text-base flex items-end m-0 ">
              SCMTR-SCA
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
              text={goLoading ? "Loading..." : "GO"}
              type="submit"
              onClick={handleSubmit}
              disabled={loading}
            />
            <CustomButton
              text={loading ? "Loading..." : "GENERATE REPORT"}
              onClick={handleUpdate}
              title={
                !tableFormData.length ? "Select & edit at least one row" : ""
              }
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
          onSelectedEditedChange={handleSelectedRowsChange}
          disableSelection={isDeleteAll}
          selectionResetKey={selectionResetKey}
        />
      </Box>
      <ToastContainer />
    </ThemeProvider>
  );
}
