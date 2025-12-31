"use client";

import React, { useMemo, useState } from "react";
import { ThemeProvider, Box } from "@mui/material";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { theme } from "@/styles";
import FormHeading from "@/components/formHeading/formHeading";
import CustomButton from "@/components/button/button";
import { CustomInput } from "@/components/customInput";
import TableGrid from "@/components/tableGrid/tableGrid";
import MultiFileUpload from "@/components/customInput/multiFileUpload";

import data, { dpdGridButtons } from "./uploadDpdData";
import { getUserByCookies } from "@/utils";
import { uploads } from "@/apis";
import { extractDpdPartiesFromPdfs } from "@/helper/dpdPartyPdfExtractor";


const clean = (s) => String(s ?? "").replace(/\s+/g, " ").trim();

export default function DpdPartyUploadPage() {
    const userData = getUserByCookies();

    const [formData, setFormData] = useState({
        shippingLineId: null,
        tblDpdParty: [],
    });

    const [fieldsMode] = useState("add");
    const rows = useMemo(() => formData?.tblDpdParty || [], [formData]);

    const handleFilesChange = async (fileList) => {
        try {
            const parsedRows = await extractDpdPartiesFromPdfs(fileList);

            if (parsedRows.length > 0) {
                setFormData((prev) => ({
                    ...prev,
                    tblDpdParty: parsedRows,
                }));
            } else {
                toast.warn("PDF read successfully but no matching rows found.");
            }
        } catch (err) {
            console.error("handleFilesChange error:", err);
            toast.error("PDF parse failed.");
        }
    };

    const submitHandler = async (e) => {
        e.preventDefault();

        // const shippingLineId =
        //     formData?.shippingLineId?.Id ?? formData?.shippingLineId?.id ?? null;

        // if (!shippingLineId) return toast.error("Please select Shipping Line first.");
        // if (!rows.length) return toast.error("Please upload PDF and load rows first.");

        const dataForSp = rows.map((r, idx) => ({
            srNo: String(r.srNo ?? idx + 1),
            name: r.partyName ?? "",
            dpdCode: r.dpdCode ?? "",
            panNumber: r.panNo ?? "",
            iecCode: r.iecCode ?? "",
        }));

        const obj = {
            spName: "UploadDPDParties",
            json: {
                userData,
                data: dataForSp,
            },
        };
        const resp = await uploads(obj);

        if (resp?.success) toast.success(resp?.message || "Uploaded successfully");
        else toast.error(resp?.message || "Upload failed");
    };

    return (
        <ThemeProvider theme={theme}>
            <form onSubmit={submitHandler}>
                <section className="py-2 px-4">
                    <Box className="flex justify-between items-end mb-2">
                        <h1 className="text-left text-base m-0">Upload DPD Parties</h1>
                        <Box className="flex gap-2">
                            <CustomButton text="Back" href="/masters/dpdParties/list" />
                        </Box>
                    </Box>

                    {/* <FormHeading text="Upload Filters" variant="body2" />
                    <Box className="grid grid-cols-3 gap-2 p-2">
                        <CustomInput
                            fields={data.uploadFields}
                            formData={formData}
                            setFormData={setFormData}
                            fieldsMode={fieldsMode}
                        />
                    </Box> */}

                    <FormHeading text="Upload File" variant="body2" />
                    <Box className="border border-gray-300 p-3 mt-2 flex flex-col gap-2">
                        <Box sx={{ p: 1 }}>
                            <MultiFileUpload
                                label="Upload DPD Parties PDF"
                                helperText="Upload PDF file provided by Customs / Shipping Line"
                                accept=".pdf,application/pdf"
                                onChange={handleFilesChange}
                            />
                        </Box>
                    </Box>

                    <FormHeading text="DPD Party Preview" variant="body2" />
                    <Box className="border border-gray-300 p-2 mt-2">
                        <TableGrid
                            fields={data.tblDpdParty}
                            formData={formData}
                            setFormData={setFormData}
                            fieldsMode={fieldsMode}
                            gridName="tblDpdParty"
                        />
                    </Box>

                    <Box className="w-full flex justify-center gap-2 mt-4">
                        <CustomButton text="Save Upload" type="submit" />
                    </Box>
                </section>
            </form>

            <ToastContainer />
        </ThemeProvider>
    );
}
