"use client";
import { useEffect, useState } from "react";
import { ThemeProvider, Box, Typography } from "@mui/material";
import { fieldData } from "./doData";
import { CustomInput } from "@/components/customInput";
import { theme } from "@/styles";
import { toast, ToastContainer } from "react-toastify";
import CustomButton from "@/components/button/button";
import TableGrid from "@/components/tableGrid/tableGrid";
import FormHeading from "@/components/formHeading/formHeading";
import { formStore } from "@/store";
import {
    copyHandler,
    formatDataWithForm,
    formatFetchForm,
    formatFormData,
    getUserByCookies,
    setInputValue,
    useNextPrevData,
} from "@/utils";
import { fetchForm, getDataWithCondition, insertUpdateForm } from "@/apis";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";

export default function Home() {
    const [formData, setFormData] = useState({});
    const [fieldsMode, setFieldsMode] = useState("");
    const [jsonData, setJsonData] = useState(fieldData);
    const { mode, setMode } = formStore();
    const [totals, setTotals] = useState({});
    const [packTypeState, setPackTypeState] = useState(null);
    const userData = getUserByCookies();
    const submitHandler = async (e) => {
        e.preventDefault();
    };

    return (
        <ThemeProvider theme={theme}>
            <form onSubmit={submitHandler}>
                <section className="py-2 px-4">
                    <Box className="flex justify-between items-center mb-2">
                        <h1 className="text-left text-base m-0">Do Request</h1>
                        <Box className="flex items-center gap-4">
                            {/* 
                            <CustomButton
                                text="Back"
                                href="/das"
                                onClick={() => setMode({ mode: null, formId: null })}
                            /> */}
                        </Box>
                    </Box>

                    <Box>
                        <FormHeading text="Do Request" />
                        <Box className="grid grid-cols-4 items-end gap-2 p-2 ">
                            <CustomInput
                                fields={jsonData.doRequestFields}
                                formData={formData}
                                setFormData={setFormData}
                                fieldsMode={fieldsMode}
                            />
                        </Box>
                        <FormHeading text="Transport Details">
                            <Box className="grid grid-cols-3 gap-2 p-2 ">
                                <CustomInput
                                    fields={jsonData.transportDetails}
                                    formData={formData}
                                    setFormData={setFormData}
                                    fieldsMode={fieldsMode}
                                />
                            </Box>
                        </FormHeading>
                        <FormHeading text="Shipment Details">
                            <Box className="grid grid-cols-4 gap-2 p-2 ">
                                <CustomInput
                                    fields={jsonData.ShipmentDetails}
                                    formData={formData}
                                    setFormData={setFormData}
                                    fieldsMode={fieldsMode}
                                />
                            </Box>
                        </FormHeading>
                        {/* <FormHeading text="Container New">
                            <Box className="grid grid-cols-4 gap-2 p-2 ">
                                <CustomInput
                                    fields={jsonData.ContainerNew}
                                    formData={formData}
                                    setFormData={setFormData}
                                    fieldsMode={fieldsMode}
                                />
                            </Box>
                        </FormHeading> */}

                        {/* <FormHeading text="Attachment">
                            <Box className="grid grid-cols-1 gap-2 p-2 ">
                                <CustomInput
                                    fields={jsonData.attachmentFields}
                                    formData={formData}
                                    setFormData={setFormData}
                                    fieldsMode={fieldsMode}
                                />
                            </Box>
                        </FormHeading> */}

                    </Box>
                    <Box className="w-full flex mt-2">
                        {fieldsMode !== "view" && (
                            <CustomButton text={"Print"} type="submit" />
                        )}
                    </Box>
                </section>
            </form>
            <ToastContainer />
        </ThemeProvider>
    );
}
