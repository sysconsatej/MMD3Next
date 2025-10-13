"use client";

import { useEffect, useState } from "react";
import {
  ThemeProvider,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  RadioGroup,
  Radio,
  Checkbox,
  Divider,
} from "@mui/material";
import data, { metaData } from "./igmReportFormData";
import { CustomInput } from "@/components/customInput";
import { theme } from "@/styles";
import { toast, ToastContainer } from "react-toastify";
import CustomButton from "@/components/button/button";
import { formStore } from "@/store";
import { fetchDynamicReportData } from "@/apis";
import DynamicReportTable from "@/components/dynamicReport/dynamicReportEditable";
import { useRouter } from "next/navigation";

export default function IGM() {
  const [formData, setFormData] = useState({});
  const [fieldsMode, setFieldsMode] = useState("");
  const [jsonData, setJsonData] = useState(data);
  const { mode, setMode } = formStore();
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tableFormData, setTableFormData] = useState([]);

  const [reportOpen, setReportOpen] = useState(false);
  const [combineMode, setCombineMode] = useState("combined");
  const [selectAll, setSelectAll] = useState(false);
  const [reportChecks, setReportChecks] = useState({
    importGeneralManifest: false,
  });

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
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
      setLoading(false);
    }
  };

  const toggleSelectAll = (checked) => {
    setSelectAll(checked);
    setReportChecks({ importGeneralManifest: checked });
  };

  const toggleReport = (key) => (e) => {
    const checked = e.target.checked;
    setReportChecks((prev) => ({ ...prev, [key]: checked }));
    if (!checked) setSelectAll(false);
  };

  const handlePrint = () => {
    if (!tableFormData?.length)
      return toast.info("Select at least one row to print.");
    if (!reportChecks.importGeneralManifest)
      return toast.info("Select at least one report to print.");

    const ids = tableFormData
      .map(({ __dirty, ID, id }) => ID ?? id)
      .filter(Boolean)
      .map(String)
      .map((s) => s.trim());

    if (!ids.length) return toast.info("No valid IDs to print.");

    const body = {
      spName: "IGMEdi",
      jsonData: {
        ...transformed,
        clientId: 8,
        userId: 4,
        data: ids.map((id) => ({ id })),
      },
    };
    console.log("PRINT body =>", body);

    setReportOpen(false);

    const recordIdParam = ids.map(encodeURIComponent).join(",");
    router.push(`/htmlReports/igmReports?recordId=${recordIdParam}`);
  };

  return (
    <ThemeProvider theme={theme}>
      <form>
        <section className="py-1 px-4">
          <Box className="flex justify-between items-end py-1">
            <h1 className="text-left text-base flex items-end m-0 ">
              IGM REPORT FORM
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
              text={loading ? "Loading..." : "GET BL DETAILS"}
              type="submit"
              onClick={handleSubmit}
              disabled={loading}
            />
            <CustomButton
              text="GENERATE REPORT"
              type="button"
              onClick={() => {
                if (!tableFormData?.length) {
                  toast.info(
                    "Select at least one row before generating a report."
                  );
                  return;
                }
                setReportOpen(true);
              }}
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
          showTotalsRow={true} // show totals row
        />
      </Box>
      <Dialog
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogContent dividers sx={{ pt: 1.5, pb: 2 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 1,
            }}
          >
            <Box sx={{ fontWeight: 700, fontSize: 18 }}>Reports</Box>
            <RadioGroup
              row
              value={combineMode}
              onChange={(e) => setCombineMode(e.target.value)}
            >
              <FormControlLabel
                value="combined"
                control={<Radio size="small" color="success" />}
                label="Combined"
                sx={{ mr: 2 }}
              />
              <FormControlLabel
                value="separate"
                control={<Radio size="small" color="success" />}
                label="Separate"
              />
            </RadioGroup>
          </Box>
          <Divider sx={{ mb: 2 }} />
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              rowGap: 1.5,
            }}
          >
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={selectAll}
                  onChange={(e) => toggleSelectAll(e.target.checked)}
                />
              }
              label="Select All"
              sx={{ m: 0 }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={reportChecks.importGeneralManifest}
                  onChange={toggleReport("importGeneralManifest")}
                />
              }
              label="Import General Manifest"
              sx={{ m: 0 }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Box sx={{ display: "flex", gap: 2, ml: "auto" }}>
            <CustomButton text="Print" onClick={handlePrint} type="button" />
            <CustomButton
              text="Cancel"
              onClick={() => setReportOpen(false)}
              type="button"
            />
          </Box>
        </DialogActions>
      </Dialog>

      <ToastContainer />
    </ThemeProvider>
  );
}
