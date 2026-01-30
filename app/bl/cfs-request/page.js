"use client";
import { useState, useEffect, useMemo } from "react";
import { ThemeProvider, Box } from "@mui/material";
import { cfsGridButtons, fieldData } from "./fieldsData";
import { CustomInput } from "@/components/customInput";
import { theme } from "@/styles";
import { toast, ToastContainer } from "react-toastify";
import CustomButton from "@/components/button/button";
import {
  fetchForm,
  getDataWithCondition,
  insertUpdateForm,
  updateStatusRows,
} from "@/apis";
import { formatDataWithForm, formatFetchForm, formatFormData } from "@/utils";
import FormHeading from "@/components/formHeading/formHeading";
import TableGrid from "@/components/tableGrid/tableGrid";
import { formStore } from "@/store";
import { getBlIdIfExists, handleBlur, handleChange, requestHandler } from "./utils";
import { getUserByCookies } from "@/utils";
import { useSetDefault } from "./hooks";

export default function Company() {
  const { mode, setMode } = formStore();
  const [formData, setFormData] = useState({});
  const [jsonData, setJsonData] = useState(fieldData);
  const [fieldsMode, setFieldsMode] = useState("");
  const [errorState, setErrorState] = useState({});
  const userData = getUserByCookies();
  const [disableSubmit, setDisableSubmit] = useState(false);
  const [disableRequest, setDisableRequest] = useState(true);

  useSetDefault({ userData, setFormData, mode: mode });

  const submitHandler = async (event) => {
    event.preventDefault();

    const normalized = {
      ...formData,
      companyId: userData?.companyId,
      companyBranchId: userData?.branchId,
      blId: formData?.blId || null,
    };

    const format = formatFormData(
      "tblCfsRequest",
      normalized,
      mode?.formId || null,
      "cfsRequestId",
    );

    const { success, error, message } = await insertUpdateForm(format);

    if (success) {
      toast.success(message);
      setDisableSubmit(true);
      setDisableRequest(false);
    } else {
      toast.error(error || message);
    }
  };

  const handleChangeEventFunctions = handleChange({
    setFormData,
    formData,
    setJsonData,
  });
  const handleBlurEventFunctions = {
    duplicateHandler: async (event) => {
      const { name, value } = event.target;

      // only run for blNo
      if (name !== "blNo") return true;

      const normalized = String(value ?? "").trim();
      if (!normalized) return true;

      const literal = normalized.replace(/'/g, "''");

      let whereDup = `
      blNo = '${literal.toUpperCase()}'
      AND companyId = ${userData?.companyId}
      AND status = 1
    `;

      // exclude current record while edit
      if (mode?.formId) {
        whereDup += ` AND id <> ${mode.formId}`;
      }

      const obj = {
        columns: "id",
        tableName: "tblCfsRequest",
        whereCondition: whereDup,
      };

      const resp = await getDataWithCondition(obj);

      const isDuplicate = Array.isArray(resp?.data) && resp.data.length > 0;

      if (isDuplicate) {
        setErrorState((prev) => ({ ...prev, blNo: true }));
        setFormData((prev) => ({ ...prev, blNo: "" }));
        toast.error("Duplicate BL No!");
        return false;
      }

      setErrorState((prev) => ({ ...prev, blNo: false }));
      setFormData((prev) => ({ ...prev, blNo: normalized.toUpperCase() }));
      const blId = await getBlIdIfExists({
        blNo: normalized,
        shippingLineId: formData?.shippingLineId?.Id,
        locationId: userData?.location,
      });

      setFormData((prev) => ({
        ...prev,
        blId: blId,
      }));
      return true;
    },
  };

  useEffect(() => {
    async function fetchFormHandler() {
      if (!mode?.formId) return;

      setFieldsMode(mode?.mode);

      const format = formatFetchForm(
        fieldData,
        "tblCfsRequest",
        mode.formId,
        '["tblAttachment"]',
        "cfsRequestId",
      );

      const { success, result, message, error } = await fetchForm(format);

      if (!success) {
        toast.error(error || message || "Failed to fetch form");
        return;
      }

      const getData = formatDataWithForm(result, fieldData);
      setFormData(getData);

      let currentStatusName = "";

      try {
        const statusQuery = {
          columns: "m.name AS StatusName",
          tableName: "tblCfsRequest b",
          joins: "LEFT JOIN tblMasterData m ON m.id = b.cfsRequestStatusId",
          whereCondition: `b.id = ${mode.formId}`,
        };

        const { success: stSuccess, data: stData } =
          await getDataWithCondition(statusQuery);

        if (stSuccess && Array.isArray(stData) && stData.length > 0) {
          currentStatusName = String(stData[0].StatusName || "")
            .toLowerCase()
            .trim();
        }
      } catch (e) {
        console.error("Error fetching CFS status:", e);
      }

      if (mode.mode === "view") {
        setDisableSubmit(true);

        if (!currentStatusName || currentStatusName !== "request") {
          setDisableRequest(false);
        } else {
          setDisableRequest(true);
        }
        return;
      }

      setDisableSubmit(false);
      if (!currentStatusName || currentStatusName !== "request") {
        setDisableRequest(false);
      } else {
        setDisableRequest(true);
      }
    }

    fetchFormHandler();
  }, [mode]);

  return (
    <ThemeProvider theme={theme}>
      <form onSubmit={submitHandler}>
        <section className="py-1 px-4">
          <Box className="flex justify-between items-end py-1">
            <h1 className="text-left text-base flex items-end m-0 ">
              Create Request For CFS
            </h1>
            {userData?.roleCode === "customer" && (
              <CustomButton
                text="Back"
                href="/bl/cfs-request/list"
                onClick={() => setMode({ mode: null, formId: null })}
              />
            )}
            {userData?.roleCode === "shipping" && (
              <CustomButton
                text="Back"
                href="/bl/cfs-request/liner"
                onClick={() => setMode({ mode: null, formId: null })}
              />
            )}
          </Box>
          <FormHeading text="MBL Details" />
          <Box className="grid grid-cols-4 items-end gap-2 p-2 ">
            <CustomInput
              fields={jsonData.fields}
              formData={formData}
              setFormData={setFormData}
              fieldsMode={fieldsMode}
              handleChangeEventFunctions={handleChangeEventFunctions}
              handleBlurEventFunctions={handleBlurEventFunctions}
            />
          </Box>
          <Box className="border-2 border-solid border-gray-300 p-3 mt-2 ">
            <FormHeading text="Attachment Details" />
            <TableGrid
              fields={jsonData.tblAttachment}
              formData={formData}
              setFormData={setFormData}
              fieldsMode={mode.mode}
              gridName="tblAttachment"
              tabName={""}
              buttons={cfsGridButtons}
              handleGridEventFunctions={{}}
              handleBlurEventFunctions={{}}
              handleChangeEventFunctions={{}}
            />
          </Box>
          <Box className="w-full flex mt-2 gap-3 ">
            {mode?.mode !== "view" && userData?.roleCode === "customer" && (
              <CustomButton
                text={"Submit"}
                type="submit"
                disabled={disableSubmit}
              />
            )}
            {userData?.roleCode === "customer" && (
              <CustomButton
                text={"Request"}
                onClick={() => requestHandler(formData, setDisableRequest)}
                disabled={disableRequest}
              />
            )}
          </Box>
        </section>
      </form>
      <ToastContainer />
    </ThemeProvider>
  );
}
