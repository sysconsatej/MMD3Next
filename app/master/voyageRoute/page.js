"use client";
 
import { useState, useEffect } from "react";
import { ThemeProvider, Box } from "@mui/material";
import data from "./voyageRouteData";
import { CustomInput } from "@/components/customInput";
import { theme } from "@/styles";
import { toast, ToastContainer } from "react-toastify";
import CustomButton from "@/components/button/button";
import { fetchForm, insertUpdateForm } from "@/apis";
import {
  formatDataWithForm,
  formatFetchForm,
  formatFormData,
  getUserByCookies,
} from "@/utils";
import { formStore } from "@/store";
 
export default function VoyageRoute() {
  const { mode, setMode } = formStore();
  const [fieldsMode, setFieldsMode] = useState("");
  const [formData, setFormData] = useState({
    maritimeDeclaration: mode?.mode === null ? "N" : "",
    crewListDeclaration: mode?.mode === null ? "N" : "",
    importLocking: mode?.mode === null ? "N" : "",
    exportLocking: mode?.mode === null ? "N" : "",
    passengerList: mode?.mode === null ? "N" : "",
    sameBottomCargo: mode?.mode === null ? "N" : "",
    shipStoresDeclaration: mode?.mode === null ? "N" : "",
  });
  const [jsonData, setJsonData] = useState(data);
  const userData = getUserByCookies();
  const submitHandler = async (event) => {
    event.preventDefault();
    const updatedFormdData = {
      ...formData,
      companyid: userData?.companyId,
      companyBranchid: userData?.branchId,
    };
    const format = formatFormData(
      "tblVoyageRoute ",
      updatedFormdData,
      mode.formId
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
        const format = formatFetchForm(data, "tblVoyageRoute ", mode.formId);
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
  return (
    <ThemeProvider theme={theme}>
      <form onSubmit={submitHandler}>
        <section className="py-1 px-4">
          <Box className="flex justify-between items-end py-1">
            <h1 className="text-left text-base flex items-end m-0 ">
              Voyage Route
            </h1>
            <CustomButton
              text="Back"
              href="/master/voyageRoute/list"
              onClick={() => setMode({ mode: null, formId: null })}
            />
          </Box>
          <Box className="border border-solid border-black rounded-[4px] ">
            <Box className="sm:grid sm:grid-cols-4 gap-2 flex flex-col p-2 border-b border-b-solid border-b-black ">
              <CustomInput
                fields={jsonData.voyageFields}
                formData={formData}
                setFormData={setFormData}
                fieldsMode={fieldsMode}
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
 
 