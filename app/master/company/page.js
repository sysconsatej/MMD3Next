"use client";
import { useState, useEffect } from "react";
import { ThemeProvider, Box } from "@mui/material";
import data, { branchGridButtons } from "./companyData";
import { CustomInput } from "@/components/customInput";
import { theme } from "@/styles";
import { toast, ToastContainer } from "react-toastify";
import CustomButton from "@/components/button/button";
import { fetchForm, getDataWithCondition, insertUpdateForm } from "@/apis";
import {
  formatDataWithForm,
  formatFetchForm,
  formatFormData,
  setInputValue,
} from "@/utils";
import FormHeading from "@/components/formHeading/formHeading";
import TableGrid from "@/components/tableGrid/tableGrid";
import { formStore } from "@/store";

export default function Company() {
  const [formData, setFormData] = useState({});
  const [fieldsMode, setFieldsMode] = useState("");
  const [jsonData, setJsonData] = useState(data);
  const [errorState, setErrorState] = useState({});
  const { mode, setMode } = formStore();

  const submitHandler = async (event) => {
    event.preventDefault();
    const format = formatFormData(
      "tblCompany",
      formData,
      mode.formId,
      "companyId"
    );
    const { success, error, message } = await insertUpdateForm(format);
    if (success) {
      toast.success(message);
      setFormData({});
    } else {
      toast.error(error || message);
    }
  };

  useEffect(() => {
    async function fetchFormHandler() {
      if (mode.formId) {
        setFieldsMode(mode.mode);
        const format = formatFetchForm(
          data,
          "tblCompany",
          mode.formId,
          '["tblCompanyBranch"]',
          "companyId"
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
  const handleChangeEventFunctions = {
    setStateCountryFromCity: async (_name, value) => {
      if (!value?.Id) return;
      const obj = {
        columns: `(select id from tblState s where s.id = ci.stateId and s.status = 1) stateId,
                (select name from tblState s where s.id = ci.stateId and s.status = 1) stateName,
                (select id from tblCountry c where c.id = ci.countryId and c.status = 1) countryId,
                (select name from tblCountry c where c.id = ci.countryId and c.status = 1) countryName`,
        tableName: "tblCity ci",
        whereCondition: `ci.id = ${value.Id} and ci.status = 1`,
      };
      const { data } = await getDataWithCondition(obj);
      if (!Array.isArray(data) || !data[0]) return;

      setFormData((prevData) =>
        setInputValue({
          prevData,
          tabName: null,
          gridName: null,
          tabIndex: null,
          containerIndex: null,
          name: "stateId",
          value: { Id: data[0].stateId, Name: data[0].stateName },
        })
      );
      setFormData((prevData) =>
        setInputValue({
          prevData,
          tabName: null,
          gridName: null,
          tabIndex: null,
          containerIndex: null,
          name: "countryId",
          value: { Id: data[0].countryId, Name: data[0].countryName },
        })
      );
    },

    setBranchStateCountryFromCity: async (name, value, { containerIndex }) => {
      const obj = {
        columns: `(select id from tblState s where s.id = ci.stateId and s.status = 1) stateId,
                (select name from tblState s where s.id = ci.stateId and s.status = 1) stateName,
                (select id from tblCountry c where c.id = ci.countryId and c.status = 1) countryId,
                (select name from tblCountry c where c.id = ci.countryId and c.status = 1) countryName`,
        tableName: "tblCity ci",
        whereCondition: `ci.id = ${value.Id} and ci.status = 1`,
      };
      const { data } = await getDataWithCondition(obj);
      if (!Array.isArray(data) || !data[0]) return;

      setFormData((prevData) =>
        setInputValue({
          prevData,
          tabName: null,
          gridName: "tblCompanyBranch",
          tabIndex: null,
          containerIndex: containerIndex,
          name: "stateId",
          value: { Id: data[0].stateId, Name: data[0].stateName },
        })
      );

      setFormData((prevData) =>
        setInputValue({
          prevData,
          tabName: null,
          gridName: "tblCompanyBranch",
          tabIndex: null,
          containerIndex: containerIndex,
          name: "countryId",
          value: { Id: data[0].countryId, Name: data[0].countryName },
        })
      );
    },
  };

  const handleBlurEventFunctions = {
    validatePanCard: (e) => {
      const value = e.target.value;
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      if (value !== String(value).toUpperCase()) {
        setFormData((prev) => ({ ...prev, panNo: null }));
        return toast.error("Pan card should be always in caps");
      }

      if (panRegex.test(value)) {
        return true;
      } else {
        setFormData((prev) => ({ ...prev, panNo: null }));
        return toast.error("Pan Number is invalid ");
      }
    },
    validateGstNO: (e) => {
      const gstinRegex =
        /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
      const value = e.target.value;
      if (gstinRegex.test(value)) {
        return true;
      } else {
        setFormData((prev) => ({ ...prev, taxRegistrationNo: null }));
        return toast.error("Invalid GST Number");
      }
    },
    validateIecNO: (e) => {
      const value = String(e.target.value).toUpperCase().trim();
      const iecRegex = /^[A-Z]{3}[0-9]{7}$/;
      if (iecRegex.test(value)) {
        return true;
      } else {
        setFormData((prev) => ({ ...prev, importExportCode: null }));
        return toast.error("Invalid IEC number");
      }
    },
    duplicateHandler: async (event) => {
      const { value, name } = event.target;
      const obj = {
        columns: name,
        tableName: "tblCompany",
        whereCondition: ` ${name} = '${value}'  and status = 1`,
      };
      const { success } = await getDataWithCondition(obj);
      if (success) {
        setErrorState((prev) => ({ ...prev, [name]: true }));
        toast.error(`Duplicate ${name}!`);
      } else {
        setErrorState((prev) => ({ ...prev, [name]: false }));
      }
    },
    duplicateBranchHandler: async (event) => {
      const { value, name } = event.target;
      const obj = {
        columns: name,
        tableName: "tblCompanyBranch",
        whereCondition: ` ${name} = '${value}'  and status = 1`,
      };
      const { success } = await getDataWithCondition(obj);
      if (success) {
        setErrorState((prev) => ({ ...prev, [name]: true }));
        toast.error(`Duplicate ${name}!`);
      } else {
        setErrorState((prev) => ({ ...prev, [name]: false }));
      }
    },
  };

  return (
    <ThemeProvider theme={theme}>
      <form onSubmit={submitHandler}>
        <section className="py-1 px-4">
          <Box className="flex justify-between items-end py-1">
            <h1 className="text-left text-base flex items-end m-0 ">Company</h1>
            <CustomButton
              text="Back"
              href="/master/company/list"
              onClick={() => setMode({ mode: null, formId: null })}
            />
          </Box>
          <Box className="border border-solid border-black rounded-[4px] ">
            <Box className="sm:grid sm:grid-cols-5 gap-2 flex flex-col p-1 ">
              <CustomInput
                fields={jsonData.companyFields}
                formData={formData}
                setFormData={setFormData}
                fieldsMode={fieldsMode}
                handleBlurEventFunctions={handleBlurEventFunctions}
                handleChangeEventFunctions={handleChangeEventFunctions}
              />
            </Box>
            <FormHeading
              text="Company Branch"
              variant="body2"
              style="!mx-3 border-b-2 border-solid border-[#03bafc] flex"
            />
            <TableGrid
              fields={jsonData.tblCompanyBranch}
              formData={formData}
              setFormData={setFormData}
              fieldsMode={fieldsMode}
              gridName="tblCompanyBranch"
              buttons={branchGridButtons}
              handleBlurEventFunctions={handleBlurEventFunctions}
              handleChangeEventFunctions={handleChangeEventFunctions}
            />
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
