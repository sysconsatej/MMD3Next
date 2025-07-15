"use client";
import { useState } from "react";
import { ThemeProvider, Box, Button, CssBaseline } from "@mui/material";
import data from "./HBLData";
import { CustomInput } from "@/components/customInput";
import { theme } from "@/styles";
import { toast, ToastContainer } from "react-toastify";
import { useRouter } from "next/navigation";

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
            <Button
              variant="contained"
              className="mx-4 my-2 capitalize hover:bg-[#ffc400] !bg-[#ffc400] "
              size="small"
              onClick={() => router.push("/hbl/list")}
            >
              Back
            </Button>
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
            <Button
              className=" hover:bg-[#ffc400]"
              sx={{
                textTransform: "capitalize",
                backgroundColor: "#ffc400",
              }}
              variant="contained"
              type="submit"
            >
              {`Submit`}
            </Button>
          </Box>
        </section>
      </form>
      <ToastContainer />
    </ThemeProvider>
  );
}
