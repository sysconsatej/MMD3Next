"use client";
import { useState } from "react";
import { ThemeProvider, Box, CssBaseline } from "@mui/material";
import data from "./HBLData";
import { CustomInput } from "@/components/customInput";
import { theme } from "@/styles";
import { toast, ToastContainer } from "react-toastify";
import { useRouter } from "next/navigation";
import CustomButton from "@/components/button/button";

export default function HBL() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    containerDetails: [],
  });

  const [fieldsMode, setFieldsMode] = useState("");

  const [jsonData, setJsonData] = useState(data);

  const submitHandler = async (event) => {
    event.preventDefault();
    toast.success("working!");
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <form onSubmit={submitHandler}>
        <section className="py-2 px-4">
          <Box className="flex justify-between items-end mb-2">
            <h1 className="text-left text-xl font-semibold uppercase flex items-end m-0 ">
              Bill Of Lading For Ocean Transport
            </h1>
            <CustomButton
              text={"Back"}
              onClick={() => router.push("/hbl/list")}
            />
          </Box>
          <Box className="border border-solid border-black rounded-[4px] ">
            <Box className="sm:grid sm:grid-cols-4 gap-2 flex flex-col p-2 border-b border-b-solid border-b-black ">
              <CustomInput
                fields={jsonData.receiptFields}
                formData={formData}
                setFormData={setFormData}
                fieldsMode={fieldsMode}
              />
            </Box>
          </Box>
          <Box className="w-full flex mt-2 ">
            <CustomButton text={"Submit"} type="submit" />
          </Box>
        </section>
      </form>
      <ToastContainer />
    </ThemeProvider>
  );
}
