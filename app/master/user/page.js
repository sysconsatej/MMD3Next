"use client";

import { useState, useEffect } from "react";
import { ThemeProvider, Box } from "@mui/material";
import data, { cfsGridButtons } from "./userData";
import { CustomInput } from "@/components/customInput";
import { theme } from "@/styles";
import { toast, ToastContainer } from "react-toastify";
import CustomButton from "@/components/button/button";
import { fetchForm, insertUpdateForm } from "@/apis";
import { formatDataWithForm, formatFetchForm, formatFormData } from "@/utils";
import { formStore } from "@/store";
import FormHeading from "@/components/formHeading/formHeading";
import TableGrid from "@/components/tableGrid/tableGrid";

export default function User() {
  const [formData, setFormData] = useState({});
  const [fieldsMode, setFieldsMode] = useState("");
  const [jsonData, setJsonData] = useState(data);
  const { mode, setMode } = formStore();

  const submitHandler = async (event) => {
    event.preventDefault();

    // Force userType = 'U' and pass parent PK name ("userId") for child grid linkage
    const payload = formatFormData(
      "tblUser",
      { ...formData, userType: "U" },
      mode.formId,
      "userId"
    );

    const { success, error, message } = await insertUpdateForm(payload);
    if (success) {
      toast.success(message);
      setFormData({});
      setMode({ mode: null, formId: null });
    } else {
      toast.error(error || message);
    }
  };

  useEffect(() => {
    async function fetchFormHandler() {
      if (mode.formId) {
        setFieldsMode(mode.mode);

        // Include child grid + specify parent PK
        const format = formatFetchForm(
          data,
          "tblUser",
          mode.formId,
          '["tblUserRoleMapping"]',
          "userId"
        );

        const { success, result, message, error } = await fetchForm(format);
        if (success) {
          const getData = formatDataWithForm(result, data);
          // Pin userType to 'U' even when editing existing records
          setFormData({ ...getData, userType: "U" });
        } else {
          toast.error(error || message);
        }
      } else {
        // Creating a new record — prefill once
        setFieldsMode("");
        setFormData((prev) => ({ userType: "U", ...prev }));
      }
    }

    fetchFormHandler();
  }, [mode.formId, mode.mode]);

  return (
    <ThemeProvider theme={theme}>
      <form onSubmit={submitHandler}>
        <section className="py-1 px-4">
          <Box className="flex justify-between items-end py-1">
            <h1 className="text-left text-base flex items-end m-0 ">User</h1>
            <CustomButton
              text="Back"
              href="/master/user/list"
              onClick={() => setMode({ mode: null, formId: null })}
            />
          </Box>

          <Box className="border border-solid border-black rounded-[4px] ">
            <Box className="sm:grid sm:grid-cols-5 gap-2 flex flex-col p-1 border-b border-b-solid border-b-black ">
              <CustomInput
                fields={jsonData.userFields}
                formData={formData}
                setFormData={setFormData}
                fieldsMode={fieldsMode}
              />
            </Box>

            <FormHeading
              text="Role Detail"
              variant="body2"
              style="!mx-3 border-b-2 border-solid border-[#03bafc] flex"
            />

            <TableGrid
              fields={jsonData.tblUserRoleMapping}
              formData={formData}
              setFormData={setFormData}
              fieldsMode={mode.mode}
              gridName="tblUserRoleMapping" // must match child collection key
              buttons={cfsGridButtons}
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
