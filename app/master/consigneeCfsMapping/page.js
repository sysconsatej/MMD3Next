"use client";

import { useEffect, useState } from "react";
import { ThemeProvider, Box } from "@mui/material";
import data from "./consigneeCfsMappingData";
import { CustomInput } from "@/components/customInput";
import { theme } from "@/styles";
import { toast, ToastContainer } from "react-toastify";
import CustomButton from "@/components/button/button";
import { fetchForm, getDataWithCondition, insertUpdateForm } from "@/apis";
import {
  formatDataWithForm,
  formatFetchForm,
  formatFormData,
  getUserByCookies,
} from "@/utils";
import { formStore } from "@/store";

export default function Country() {
  const [formData, setFormData] = useState({
    activeInactive: "Y",
  });
  const [fieldsMode, setFieldsMode] = useState("");
  const [jsonData, setJsonData] = useState(data);
  const { mode, setMode } = formStore();
  const userData = getUserByCookies();

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

    const format = formatFormData(
      "tblConsigneeCfsMapping",
      normalized,
      mode.formId,
    );

    const { success, error, message } = await insertUpdateForm(format);
    if (success) {
      toast.success(message);
      setFormData({
        activeInactive: "Y",
      });
    } else {
      toast.error(error || message);
    }
  };
  const handleBlurEventFunctions = {
    validatePanCard: (e) => {
      const value = e.target.value;
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

      if (value !== String(value).toUpperCase()) {
        setFormData((prev) => ({ ...prev, consigneePan: null }));
        return toast.error("Pan card should be always in caps");
      }

      if (panRegex.test(value)) {
        return true;
      } else {
        setFormData((prev) => ({ ...prev, consigneePan: null }));
        return toast.error("Pan Number is invalid ");
      }
    },
    duplicateHandler: async (e) => {
      const { name, value } = e.target;

      let whereDup = `
        UPPER(${name}) = '${value}'
        AND companyId = ${userData?.companyId}
        AND locationId = ${userData?.location}
        AND podId = ${formData?.podId?.Id}
        AND activeInactive = 'Y'
        AND status = 1
      `;

      try {
        const resp = await getDataWithCondition({
          columns: "id",
          tableName: "tblConsigneeCfsMapping",
          whereCondition: whereDup,
        });

        const isDuplicate = Array.isArray(resp?.data) && resp.data.length > 0;

        if (isDuplicate) {
          toast.error(`Duplicate Consignee already exists`);
          setFormData((prev) => ({ ...prev, [name]: null }));
          return false;
        }

        setFormData((prev) => ({
          ...prev,
          [name]: value,
        }));
      } catch (err) {
        console.error(err);
        toast.error("Duplicate check failed");
        return false;
      }
    },
  };

  const handleChangeFunctions = {
    duplicateHandler: async (name, value) => {
      let whereDup = `
        UPPER(consignee) = '${formData?.consignee}'
        AND companyId = ${userData?.companyId}
        AND locationId = ${userData?.location}
        AND podId = ${value?.Id}
        AND activeInactive = 'Y'
        AND status = 1
      `;

      try {
        const resp = await getDataWithCondition({
          columns: "id",
          tableName: "tblConsigneeCfsMapping",
          whereCondition: whereDup,
        });

        const isDuplicate = Array.isArray(resp?.data) && resp.data.length > 0;

        if (isDuplicate) {
          toast.error(`Duplicate Port already exists`);
          setFormData((prev) => ({ ...prev, [name]: null }));
          return false;
        }

        setFormData((prev) => ({
          ...prev,
          [name]: value,
        }));
      } catch (err) {
        console.error(err);
        toast.error("Duplicate check failed");
        return false;
      }
    },
  };

  useEffect(() => {
    async function fetchFormHandler() {
      if (mode.formId) {
        setFieldsMode(mode.mode);
        const format = formatFetchForm(
          data,
          "tblConsigneeCfsMapping",
          mode.formId,
        );
        const { success, result, message, error } = await fetchForm(format);
        if (success) {
          const getData = formatDataWithForm(result, data);
          setFormData(getData);
        } else {
          toast.error(error || message);
        }
      }
    }
    fetchFormHandler();
  }, [mode.formId]);

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
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <form onSubmit={submitHandler}>
        <section className="py-1 px-4">
          <Box className="flex justify-between items-end py-1">
            <h1 className="text-left text-base flex items-end m-0 ">
              Consignee Cfs Mapping
            </h1>
            <CustomButton
              text="Back"
              href="/master/consigneeCfsMapping/list"
              onClick={() => setMode({ mode: null, formId: null })}
            />
          </Box>
          <Box className="border border-solid border-black rounded-[4px] ">
            <Box className="sm:grid sm:grid-cols-4 gap-2 flex flex-col p-1 border-b border-b-solid border-b-black ">
              <CustomInput
                fields={jsonData.countryFields}
                formData={formData}
                setFormData={setFormData}
                fieldsMode={fieldsMode}
                handleBlurEventFunctions={handleBlurEventFunctions}
                handleChangeEventFunctions={handleChangeFunctions}
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
