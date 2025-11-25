"use client";
import { useState, useEffect } from "react";
import { ThemeProvider, Box } from "@mui/material";
import { fieldData } from "./agentData";
import { CustomInput } from "@/components/customInput";
import { theme } from "@/styles";
import { toast, ToastContainer } from "react-toastify";
import CustomButton from "@/components/button/button";
import { fetchForm, insertUpdateForm } from "@/apis";
import {
    formatDataWithForm,
    formatFetchForm,
    formatFormData,
} from "@/utils";
import { formStore } from "@/store";

export default function BerthAgent() {
    const [formData, setFormData] = useState({});
    const [fieldsMode, setFieldsMode] = useState("");
    const [jsonData, setJsonData] = useState(fieldData);
    const [errorState, setErrorState] = useState({});
    const { mode, setMode } = formStore();

    const submitHandler = async (event) => {
        event.preventDefault();
        const format = formatFormData(
            "tblBerthAgentCode",
            formData,
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
                const format = formatFetchForm(
                    fieldData,
                    "tblBerthAgentCode",
                    mode.formId,
                );
                const { success, result, message, error } = await fetchForm(format);
                if (success) {
                    const getData = formatDataWithForm(result, fieldData);
                    setFormData(getData);
                } else {
                    toast.error(error || message);
                }
            }
        }

        fetchFormHandler();
    }, [mode.formId]);
    const handleChangeEventFunctions = {

    };

    const handleBlurEventFunctions = {

    };

    return (
        <ThemeProvider theme={theme}>
            <form onSubmit={submitHandler}>
                <section className="py-1 px-4">
                    <Box className="flex justify-between items-end py-1">
                        <h1 className="text-left text-base flex items-end m-0 ">Berth Agent</h1>
                        <CustomButton
                            text="Back"
                            href="/master/berthAgent/list"
                            onClick={() => setMode({ mode: null, formId: null })}
                        />
                    </Box>
                    <Box className="border border-solid border-black rounded-[4px] ">
                        <Box className="sm:grid sm:grid-cols-5 gap-2 flex flex-col p-1 ">
                            <CustomInput
                                fields={jsonData.berthAgentFields}
                                formData={formData}
                                setFormData={setFormData}
                                fieldsMode={fieldsMode}
                                handleBlurEventFunctions={handleBlurEventFunctions}
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
