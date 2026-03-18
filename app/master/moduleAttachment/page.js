"use client";

import { useEffect, useState } from "react";
import { ThemeProvider, Box } from "@mui/material";
import data from "./moduleAttachment";
import { CustomInput } from "@/components/customInput";
import { theme } from "@/styles";
import { toast, ToastContainer } from "react-toastify";
import CustomButton from "@/components/button/button";
import { fetchForm, getDataWithCondition, insertUpdateForm } from "@/apis";
import { formatDataWithForm, formatFetchForm, formatFormData } from "@/utils";
import { formStore } from "@/store";
import { getUserByCookies } from "@/utils";

export default function IsoCodeLineMapping() {
  const [formData, setFormData] = useState({});
  const [fieldsMode, setFieldsMode] = useState("");
  const [jsonData, setJsonData] = useState(data);
  const { mode, setMode } = formStore();
  const userData = getUserByCookies();
  // 🔹 Convert dropdown & multiselect objects to Ids
  const transformToIds = (data) => {
    const result = {};

    for (const key in data) {
      const value = data[key];

      if (Array.isArray(value)) {
        result[key] = value.length
          ? value.map((v) => (v?.Id ? v.Id : v)).join(",")
          : null;
      } else if (value && typeof value === "object" && "Id" in value) {
        result[key] = value.Id;
      } else {
        result[key] = value ?? null;
      }
    }

    return result;
  };
  const submitHandler = async (event) => {
    event.preventDefault();

    let normalized = {};
    if (userData?.roleCode === "admin") {
      normalized = {
        ...formData,
      };
    } else {
      normalized = {
        ...formData,
        companyId: userData?.companyId,
        companyBranchId: userData?.branchId,
        locationId: userData?.location,
      };
    }
    const transformedData = transformToIds(normalized);
    const format = formatFormData(
      "tblModuleAttachment",
      transformedData,
      mode.formId,
    );

    const { success, error, message } = await insertUpdateForm(format);

    if (success) {
      toast.success(message);
      setFormData({});
    } else {
      toast.error(error || message);
    }
  };

  const handleChangeEventFunctions = {
    duplicateModuleCheck: async (name, value) => {
      let shippingLineId = null;
      let moduleId = null;
      if (name === "shippingLineId") {
        shippingLineId = value?.Id;
        moduleId = formData?.moduleId?.Id;
      } else if (name === "moduleId") {
        shippingLineId = formData?.shippingLineId?.Id;
        moduleId = value?.Id;
      }

      const locationId = userData?.location;

      if (!shippingLineId || !moduleId || !locationId) return;

      const obj = {
        tableName: "tblModuleAttachment",
        columns: "id",
        whereCondition: `
        shippingLineId = '${shippingLineId}'
        AND locationId = '${locationId}'
        AND moduleId = '${moduleId}'
        AND status = 1
        ${mode?.formId ? `AND id <> ${mode.formId}` : ""}
      `,
      };

      const resp = await getDataWithCondition(obj);

      const isDuplicate = Array.isArray(resp?.data) && resp.data.length > 0;

      if (isDuplicate) {
        toast.error("Module already exists for this Shipping Line & Location");

        setFormData((prev) => ({
          ...prev,
          [name]: null,
        }));
      }
    },
  };
  useEffect(() => {
    if (!mode.formId && userData?.companyId) {
      setFormData((prev) => ({
        ...prev,
        shippingLineId: {
          Id: userData.companyId,
          Name: userData.companyName,
        },
      }));
    }
  }, [mode.formId]);
  useEffect(() => {
    async function fetchFormHandler() {
      if (mode.formId) {
        setFieldsMode(mode.mode);
        const format = formatFetchForm(
          data,
          "tblModuleAttachment",
          mode.formId,
        );
        const { success, result, message, error } = await fetchForm(format);
        if (success) {
          const getData = formatDataWithForm(result, data);
          const multiSelect = getData.attachmentId
            .split(",")
            .map((id) => Number(id));
          setFormData({ ...getData, attachmentId: multiSelect });
        } else {
          toast.error(error || message);
        }
      }
    }
    fetchFormHandler();
  }, [mode.formId]);

  return (
    <ThemeProvider theme={theme}>
      <form onSubmit={submitHandler}>
        <section className="py-1 px-4">
          <Box className="flex justify-between items-end py-1">
            <h1 className="text-left text-base flex items-end m-0 ">
              Module Attachment
            </h1>
            <CustomButton
              text="Back"
              href="/master/moduleAttachment/list"
              onClick={() => setMode({ mode: null, formId: null })}
            />
          </Box>
          <Box className="border border-solid border-black rounded-[4px] ">
            <Box className="sm:grid sm:grid-cols-3 gap-2 flex flex-col p-1 border-b border-b-solid border-b-black ">
              <CustomInput
                fields={jsonData.countryFields}
                formData={formData}
                setFormData={setFormData}
                fieldsMode={fieldsMode}
                handleChangeEventFunctions={handleChangeEventFunctions}
              />
            </Box>
          </Box>
          <Box className="w-full flex mt-2 ">
            {fieldsMode !== "view" && (
              <CustomButton text={"Submit"} type="submit" />
            )}
          </Box>
        </section>
      </form>
      <ToastContainer />
    </ThemeProvider>
  );
}
