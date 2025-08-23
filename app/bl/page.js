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
import TableGrid from "@/components/tableGrid/tableGrid";

export default function Home() {
  const [addContainer, setAddContainer] = useState([1]);
  const [addExportShipping, setAddExportShipping] = useState([1]);
  const [addItinerary, setAddItinerary] = useState([1]);
  const [addAttachment, setAddAttachment] = useState([1]);

  const [formData, setFormData] = useState({
    containerDetails: [],
    exportShippingDetails: [],
    itineraryDetails: [],
    attachmentDetails: [],
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
  const addExportShippingHandler = () => {
    setAddExportShipping([...addExportShipping, addExportShipping.length + 1]);
    setFormData((prevData) => ({
      ...prevData,
      exportShippingDetails: [...prevData.exportShippingDetails, {}], // ✅ now safe
    }));
    setJsonData((prevData) => ({
      ...prevData,
      [`exportShippingFields${addExportShipping.length + 1}`]:
        prevData.exportShippingFields1,
    }));
  };

  const deleteExportShippingHandler = (indexToDelete) => {
    setAddExportShipping(
      addExportShipping.filter((_, index) => index !== indexToDelete)
    );
    setFormData((prevData) => ({
      ...prevData,
      exportShippingDetails: prevData.exportShippingDetails.filter(
        (_, index) => index !== indexToDelete
      ),
    }));
  };
  const addItineraryHandler = () => {
    setAddItinerary([...addItinerary, addItinerary.length + 1]);
    setFormData((prevData) => ({
      ...prevData,
      itineraryDetails: [...prevData.itineraryDetails, {}],
    }));
    setJsonData((prevData) => ({
      ...prevData,
      [`itineraryFields${addItinerary.length + 1}`]: prevData.itineraryFields1,
    }));
  };

  const deleteItineraryHandler = (indexToDelete) => {
    setAddItinerary(addItinerary.filter((_, index) => index !== indexToDelete));
    setFormData((prevData) => ({
      ...prevData,
      itineraryDetails: prevData.itineraryDetails.filter(
        (_, index) => index !== indexToDelete
      ),
    }));
  };
  const addAttachmentHandler = () => {
    setAddAttachment([...addAttachment, addAttachment.length + 1]);
    setFormData((prevData) => ({
      ...prevData,
      attachmentDetails: [...prevData.attachmentDetails, {}],
    }));
    setJsonData((prevData) => ({
      ...prevData,
      [`attachmentFields${addAttachment.length + 1}`]:
        prevData.attachmentFields1, // base attachment fields
    }));
  };

  const deleteAttachmentHandler = (indexToDelete) => {
    setAddAttachment(
      addAttachment.filter((_, index) => index !== indexToDelete)
    );
    setFormData((prevData) => ({
      ...prevData,
      attachmentDetails: prevData.attachmentDetails.filter(
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
            <Typography
              variant="caption"
              className="!ml-3 border-b border-solid "
            >
              B/L Details
            </Typography>
            <Box className="grid grid-cols-6 gap-2  border-b border-b-solid border-b-black p-2 ">
              <CustomInput
                fields={jsonData.fields}
                formData={formData}
                setFormData={setFormData}
                fieldsMode={fieldsMode}
              />
            </Box>

            <Typography
              variant="caption"
              className="!ml-3 border-b border-solid "
            >
              HBL Details
            </Typography>
            <Box className="grid grid-cols-6 gap-2  border-b border-b-solid border-b-black p-2 ">
              <CustomInput
                fields={jsonData.hblfields}
                formData={formData}
                setFormData={setFormData}
                fieldsMode={fieldsMode}
              />
            </Box>
            <Typography
              variant="caption"
              className="!ml-3 border-b border-solid "
            >
              Consignor Details
            </Typography>
            <Box className="grid grid-cols-6 gap-2 border-b border-b-solid border-b-black p-2">
              <CustomInput
                fields={jsonData.consignorFields}
                formData={formData}
                setFormData={setFormData}
                fieldsMode={fieldsMode}
              />
            </Box>
            <Typography
              variant="caption"
              className="!ml-3 border-b border-solid "
            >
              Consignee Details
            </Typography>
            <Box className="grid grid-cols-6 gap-2 border-b border-b-solid border-b-black p-2">
              <CustomInput
                fields={jsonData.consigneeFields}
                formData={formData}
                setFormData={setFormData}
                fieldsMode={fieldsMode}
              />
            </Box>
            <Typography
              variant="caption"
              className="!ml-3 border-b border-solid "
            >
              Notify Party
            </Typography>
            <Box className="grid grid-cols-7 gap-2 border-b border-b-solid border-b-black p-2">
              <CustomInput
                fields={jsonData.notifyFields}
                formData={formData}
                setFormData={setFormData}
                fieldsMode={fieldsMode}
              />
            </Box>
            <Typography
              variant="caption"
              className="!ml-3 border-b border-solid "
            >
              Invoicing Instructions
            </Typography>
            <Box className="grid grid-cols-7 gap-2 border-b border-b-solid border-b-black p-2">
              <CustomInput
                fields={jsonData.invoicingFields}
                formData={formData}
                setFormData={setFormData}
                fieldsMode={fieldsMode}
              />
            </Box>
            <Typography
              variant="caption"
              className="!ml-3 border-b border-solid "
            >
              Container Details
            </Typography>

            <TableGrid />
          </Box>

          <Box className="w-full flex mt-2">
            <CustomButton text={"Submit"} type="submit" />
          </Box>
        </section>
      </form>
      <ToastContainer />
    </ThemeProvider>
  );
}
