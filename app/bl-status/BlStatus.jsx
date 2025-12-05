"use client";

import { Box } from "@mui/material";
import HorizontalLinearStepper from "./Wizard";
import { CustomInput } from "@/components/customInput";
import { useEffect, useState } from "react";
import { useDebounce } from "@/utils";
import { getDataWithCondition } from "@/apis";

const inputField = {
  fieldsData: [
    {
      name: "search",
      type: "text",
      label: "Enter Bl No",
      changeFunc: "getBlNoDetails",
    },
  ],
};

const processArr = [
  {
    id: 1,
    cardType: "Request",
    bgColor: "#f47b20",
    status: "off",
  },
  {
    id: 2,
    cardType: "Invoices",
    bgColor: "#d47add",
    status: "off",
  },
  {
    id: 3,
    cardType: "Payments",
    bgColor: "#33c6f4",
    status: "off",
  },
  {
    id: 4,
    cardType: "Do",
    bgColor: "#a56cc1",
    status: "off",
  },
  {
    id: 5,
    cardType: "Receipts",
    bgColor: "#f8cf3e",
    status: "off",
  },
];

export const BlStatus = () => {
  const [formData, setFormData] = useState({ search: "" });

  const debounceSearch = useDebounce(formData.search, 300);

  const fetchData   =  async()  =>  {
    // const 
    const res  =  await getDataWithCondition()
  }

  useEffect(() => {
    if (debounceSearch) {
    }
  }, [debounceSearch]);

  const handleChange = {
    getBlNoDetails: async (name, value) => {
      setFormData((prev) => {
        return { ...prev, [name]: String(value).trim().toLowerCase() };
      });
    },
  };

  return (
    <>
      <CustomInput
        fields={inputField.fieldsData}
        formData={formData}
        setFormData={setFormData}
        handleChangeEventFunctions={handleChange}
      />
      <Box className="mt-5 px-5">
        <HorizontalLinearStepper steps={processArr} />
      </Box>
    </>
  );
};
