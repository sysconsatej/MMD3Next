"use client";

import { Box, Container } from "@mui/material";
import HorizontalLinearStepper from "./Wizard";
import { CustomInput } from "@/components/customInput";
import { useState } from "react";
import CustomButton from "@/components/button/button";
import { useBlWorkFlowData } from "@/store";
import { toast, ToastContainer } from "react-toastify";

const inputField = {
  fieldsData: [
    {
      name: "search",
      type: "text",
      label: "Bl No",
    },
  ],
};

const processArr = [
  {
    id: 1,
    cardType: "Request",
    bgColor: "#f47b20",
    status: "off",
    keyName: "invoiceRequest",
    link :  "/invoice/invoiceRequest"
  },
  {
    id: 2,
    cardType: "Invoices",
    bgColor: "#d47add",
    status: "off",
    keyName: "invoice",
    // link :  "/invoice/invoiceRelease",
  },
  {
    id: 3,
    cardType: "Payments",
    bgColor: "#33c6f4",
    status: "off",
    keyName: "invoicePayment",
    // link :  "",
  },
  {
    id: 4,
    cardType: "Do",
    bgColor: "#a56cc1",
    status: "off",
    keyName: "do",
    // link :  "",
  },
];

export const BlStatus = () => {
  const [formData, setFormData] = useState({ search: "" });
  const { fetchData } = useBlWorkFlowData();
  const getBlWorkFlowData = () => {
    if (!formData.search) return toast.error("Please Enter Bl NO");
    fetchData({ blNo: formData.search });
  };

  return (
    <Container>
      <Box className="flex gap-4 mt-3">
        <CustomInput
          fields={inputField.fieldsData}
          formData={formData}
          setFormData={setFormData}
        />
        <CustomButton onClick={getBlWorkFlowData} text={"Search"} />
      </Box>
      <Box className="mt-5 px-5">
        <HorizontalLinearStepper steps={processArr} />
      </Box>
      <ToastContainer />
    </Container>
  );
};
