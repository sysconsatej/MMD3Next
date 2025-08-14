"use client";
import { useState } from "react";
import {
  ThemeProvider,
  Box,
  Button,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import data from "./blData";
import { CustomInput } from "@/components/customInput";
import { theme } from "@/styles";
import { toast, ToastContainer } from "react-toastify";
import CustomButton from "@/components/button/button";

export default function Home() {
  const [addContainer, setAddContainer] = useState([1]);
  const [formData, setFormData] = useState({
    containerDetails: [],
  });

  const [fieldsMode, setFieldsMode] = useState("");

  const [jsonData, setJsonData] = useState(data);

  const [loading, setLoading] = useState(false);

  const addContainerHandler = () => {
    setAddContainer([...addContainer, addContainer.length + 1]);
    setFormData((prevData) => ({
      ...prevData,
      containerDetails: [...prevData.containerDetails, {}],
    }));
    setJsonData((prevData) => ({
      ...prevData,
      [`containerFields${addContainer.length + 1}`]: prevData.containerFields1,
    }));
  };

  const deleteContainerHandler = (indexToDelete) => {
    setAddContainer(addContainer.filter((_, index) => index !== indexToDelete));
    setFormData((prevData) => ({
      ...prevData,
      containerDetails: prevData.containerDetails.filter(
        (_, index) => index !== indexToDelete
      ),
    }));
  };

  const submitHandler = async (event) => {
    event.preventDefault();
    toast.success("working!");
  };

  return (
    <ThemeProvider theme={theme}>
      <form onSubmit={submitHandler}>
        <section className="py-2 px-4">
          <Box className="flex justify-between items-end mb-2">
            <h1 className="text-left text-base flex items-end m-0 ">BL Form</h1>
            <Box>
              <CustomButton text="Back" href="/bl/list" />
            </Box>
          </Box>
          <Box className="border border-solid border-black rounded-[4px] ">
            <Typography variant="caption" className="!ml-3 border-b border-solid " >B/L Details</Typography>
            <Box className="grid grid-cols-6 gap-2  border-b border-b-solid border-b-black p-2 ">
              <CustomInput
                fields={jsonData.fields}
                formData={formData}
                setFormData={setFormData}
                fieldsMode={fieldsMode}
              />
            </Box>
            <Typography variant="caption" className="!ml-3 border-b border-solid " >Export / Import Details</Typography>
            <Box className="sm:grid sm:grid-cols-4 gap-2 flex flex-col p-2 border-b border-b-solid border-b-black ">
              <Box className="flex flex-col gap-2">
                <CustomInput
                  fields={jsonData.consignorFields}
                  formData={formData}
                  setFormData={setFormData}
                  fieldsMode={fieldsMode}
                />
              </Box>
              <Box className="flex flex-col gap-2">
                <CustomInput
                  fields={jsonData.consigneeFields}
                  formData={formData}
                  setFormData={setFormData}
                  fieldsMode={fieldsMode}
                />
              </Box>
              <Box className="flex flex-col gap-2">
                <CustomInput
                  fields={jsonData.notifyFields}
                  formData={formData}
                  setFormData={setFormData}
                  fieldsMode={fieldsMode}
                />
              </Box>
              <Box className="flex flex-col gap-2">
                <CustomInput
                  fields={jsonData.deliveryAgentFields}
                  formData={formData}
                  setFormData={setFormData}
                  fieldsMode={fieldsMode}
                />
              </Box>
            </Box>
            <Typography variant="caption" className="!ml-3 border-b border-solid " >Shipment Details</Typography>
            <Box className="sm:grid sm:grid-cols-7 gap-2 flex flex-col p-2 border-b border-b-solid border-b-black ">
              <CustomInput
                fields={jsonData.shipmentFields}
                formData={formData}
                setFormData={setFormData}
                fieldsMode={fieldsMode}
              />
            </Box>
            <Typography variant="caption" className="!ml-3 border-b border-solid " >Transport Details</Typography>
            <Box className="md:grid sm:grid-cols-6 gap-2 flex flex-col p-2 border-b border-b-solid border-b-black ">
              <CustomInput
                fields={jsonData.transportFields}
                formData={formData}
                setFormData={setFormData}
                fieldsMode={fieldsMode}
              />
            </Box>
            <Typography variant="caption" className="!ml-3 border-b border-solid " >Commodity Details</Typography>
            <Box className="md:grid md:grid-cols-7 gap-2 flex flex-col p-2 border-b border-b-solid border-b-black ">
              <CustomInput
                fields={jsonData.commodityFields}
                formData={formData}
                setFormData={setFormData}
                fieldsMode={fieldsMode}
              />
            </Box>
            <Typography variant="caption" className="!ml-3 border-b border-solid " >BL Container Agency</Typography>
            <Box className=" md:overflow-y-auto h-[200px] overflow-auto p-2 w-full ">
              {addContainer?.map((containerItem, index) => (
                <Box
                  key={containerItem}
                  className="grid !grid-cols-8 gap-1 mb-2 pr-[20px]  md:w-full w-[1500px] relative group border-b border-b-solid border-b-black pb-2 "
                  sx={{ gridTemplateColumns: "repeat(14, minmax(0, 1fr))" }}
                >
                  <IconButton
                    aria-label="delete"
                    onClick={() => deleteContainerHandler(index)}
                    className="!absolute right-[0px] top-[-4px] cursor-pointer z-10 w-[20px] invisible group-hover:visible "
                    sx={{ color: "red" }}
                  >
                    <Tooltip title="Delete Row">
                      <DeleteIcon sx={{ width: "20px" }} />
                    </Tooltip>
                  </IconButton>
                  <CustomInput
                    fields={jsonData[`containerFields${containerItem}`]}
                    formData={formData}
                    setFormData={setFormData}
                    containerIndex={index}
                    fieldsMode={fieldsMode}
                  />
                </Box>
              ))}
              <Button
                sx={{
                  padding: "2px 6px",
                  fontSize: "0.75rem",
                  textTransform: "capitalize ",
                  backgroundColor: "#ffc400",
                }}
                variant="contained"
                onClick={addContainerHandler}
                className=" hover:bg-[#ffc400]"
              >
                Add
              </Button>
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
