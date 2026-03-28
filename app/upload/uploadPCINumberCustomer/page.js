"use client";
/* eslint-disable */
import React, { useState, useEffect, useMemo } from "react";
import CustomButton from "@/components/button/button";
import { CustomInput } from "@/components/customInput";
import { ThemeProvider } from "@emotion/react";
import { Box } from "@mui/material";
import { theme } from "@/styles";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import fieldData from "./uploadData";
import { uploads } from "@/apis";
import { getUserByCookies } from "@/utils";
import ErrorList from "@/components/errorTable/errorList";
import { createHandleChangeEventFunction } from "@/utils/dropdownUtils";

const getFirstFile = (val) => {
  if (!val) return null;
  if (val instanceof File) return val;
  if (Array.isArray(val)) return val.find((x) => x instanceof File) || null;
  if (val?.file instanceof File) return val.file;
  if (val?.files?.[0] instanceof File) return val.files[0];
  if (val?.target?.files?.[0] instanceof File) return val.target.files[0];
  return null;
};

const extractRequiredData = (json) => {
  const result = [];

  const reportingEvent = json?.headerField?.reportingEvent ?? "";
  const accpStatus = json?.headerField?.accpStatus ?? "";
  const uniqueId = json?.headerField?.uniqueId ?? "";

  const csnDt = json?.master?.decRef?.csnDt ?? "";
  const csnNmbr = json?.master?.decRef?.csnNmbr ?? "";

  const masters = json?.master?.mastrCnsgmtDec ?? [];

  masters.forEach((m) => {
    const mblNo = m?.MCRef?.mstrBlNo ?? "";

    // ---- MBL
    if (m?.mcResponse?.cinTyp && m?.mcResponse?.mcinPcin) {
      result.push({
        reportingEvent,
        accpStatus,
        mblNo,
        cinTyp: m.mcResponse.cinTyp,
        mcinPcin: m.mcResponse.mcinPcin,
        csnDt,
        csnNmbr,
        uniqueId,
        hblNo: null,
        Flag: "MBL",
      });
    }

    // ---- HBL
    (m?.houseCargoDec ?? []).forEach((h) => {
      if (h?.hcResponse?.cinTyp && h?.hcResponse?.mcinPcin) {
        result.push({
          reportingEvent,
          accpStatus,
          mblNo,
          cinTyp: h.hcResponse.cinTyp,
          mcinPcin: h.hcResponse.mcinPcin,
          csnDt,
          csnNmbr,
          uniqueId,
          hblNo: h?.HCRef?.blNo ?? null,
          Flag: "HBL",
        });
      }
    });
  });

  return result;
};

export default function xlUpload() {
  const [formData, setFormData] = useState({});
  const [busy, setBusy] = useState(false);
  const userData = getUserByCookies();
  const [errorGrid, setErrorGrid] = useState([]);

  const handleUpload = async (e) => {
    e.preventDefault();

    const file = getFirstFile(formData.upload);
    if (!file) {
      toast.warn("Please choose JSON file");
      return;
    }

    if (!file.name.toLowerCase().endsWith(".json")) {
      toast.warn("Only JSON file allowed");
      return;
    }

    setBusy(true);

    try {
      const text = await file.text();
      const json = JSON.parse(text);

      const dataForSp = extractRequiredData(json);

      if (!dataForSp.length) {
        toast.warn("No valid records found in file.");
        return;
      }

      const payload = {
        spName: "updatePcinNo", // <-- your new SP
        json: {
          ...userData,
          vesselId: formData.vessel?.Id,
          voyageId: formData.voyage?.Id,
          podId: formData.pod?.Id,
          data: dataForSp,
        },
      };
      console.log("Payload for SP:", payload);
      const resp = await uploads(payload);

      if (resp?.success) {
        toast.success(resp?.message || "Uploaded successfully");
        setFormData((prev) => ({ ...prev, upload: null }));
        setErrorGrid([]);
      } else {
        toast.error(resp?.message || "Upload failed");
        setErrorGrid(resp.data);
      }
    } catch (err) {
      toast.error("Invalid JSON structure.");
    } finally {
      setBusy(false);
    }
  };
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      upload: null,
    }));
    setErrorGrid([]);
  }, [formData?.template]);
  const handleChangeEventFunctions = useMemo(
    () =>
      createHandleChangeEventFunction({
        setFormData,
        fields: fieldData.mblFields,
      }),
    [setFormData, fieldData.mblFields],
  );

  return (
    <ThemeProvider theme={theme}>
      <form>
        <section className="py-1 px-4">
          <Box className="flex justify-between items-end py-1">
            <h1 className="text-left text-base flex items-end m-0">
              Upload PCI Number Customer
            </h1>
            {/* <CustomButton text="Back" href="/bl/mbl/list" /> */}
          </Box>

          <Box className="border border-solid border-black rounded-[4px]">
            <Box className="sm:grid sm:grid-cols-4 gap-2 flex flex-col p-1 border-b border-b-solid border-b-black">
              <CustomInput
                fields={fieldData.mblFields}
                formData={formData}
                setFormData={setFormData}
                disabled={busy}
                handleChangeEventFunctions={handleChangeEventFunctions}
              />
            </Box>
          </Box>

          <Box className="w-full flex mt-2 gap-2 items-center">
            <CustomButton
              text={busy ? "Uploading…" : "Upload"}
              onClick={handleUpload}
              disabled={busy}
            />
          </Box>
          <ErrorList errorGrid={errorGrid} fileName={"MBL-Upload"} />
        </section>
      </form>
      <ToastContainer position="top-right" autoClose={3500} />
    </ThemeProvider>
  );
}
