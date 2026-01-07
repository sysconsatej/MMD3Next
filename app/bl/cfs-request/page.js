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
import { handleBlur, handleChange } from "./utils";
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

    const attachments = formData?.tblAttachment || [];

    const hasValidAttachment = attachments.some(
      (att) => att?.attachmentTypeId && att?.path
    );

    if (!hasValidAttachment) {
      toast.error("At least one attachment is required");
      return;
    }
    const normalized = {
      ...formData,
      companyId: userData?.companyId,
      companyBranchId: userData?.branchId,
    };

    const format = formatFormData(
      "tblCfsRequest",
      normalized,
      mode?.formId || null,
      "blId"
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

  async function requestHandler() {
    try {
      const statusPayload = {
        columns: "m.id as Id, m.name as Name",
        tableName: "tblMasterData m",
        whereCondition:
          "m.masterListName = 'tblCfsStatusType' AND m.name = 'Request'",
      };

      const statusRes = await getDataWithCondition(statusPayload);
      const requestStatusId = statusRes?.data?.[0]?.Id;

      if (!requestStatusId) {
        toast.error("Request status missing in master");
        return;
      }

      if (!formData?.blId && !formData?.blNo) {
        toast.error("BL No is required before sending Request");
        return;
      }

      const checkPayload = {
        columns: "id",
        tableName: "tblCfsRequest",
        whereCondition: `
        blNo = '${formData?.blNo}'
        AND status = 1
        AND companyId = '${userData.companyId}'
      `,
      };

      const { data, success, message, error } = await getDataWithCondition(
        checkPayload
      );

      if (!success || !Array.isArray(data) || data.length === 0) {
        toast.error(
          message ||
            error ||
            "CFS Request record not found. Please submit first."
        );
        return;
      }
      const rowsPayload = data.map((row) => ({
        id: row.id,
        cfsRequestStatusId: requestStatusId,
        updatedBy: userData.userId,
        updatedDate: new Date(),
      }));
      const res = await updateStatusRows({
        tableName: "tblCfsRequest",
        keyColumn: "id",
        rows: rowsPayload,
      });
      if (res?.success) {
        toast.success("CFS Request sent successfully!");
        setDisableRequest(true);
        setMode((prev) => ({ ...prev, status: "Request" }));
      } else {
        toast.error(res?.message || "Error while sending CFS Request");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong while requesting CFS");
    }
  }

  useEffect(() => {
    async function fetchFormHandler() {
      if (!mode?.formId) return;

      setFieldsMode(mode?.mode);

      const format = formatFetchForm(
        fieldData,
        "tblCfsRequest",
        mode.formId,
        '["tblAttachment"]',
        "blId"
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

        const { success: stSuccess, data: stData } = await getDataWithCondition(
          statusQuery
        );

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
  }, [mode.formId, mode.mode]);

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
                onClick={requestHandler}
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
