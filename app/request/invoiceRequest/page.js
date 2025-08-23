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
import data from "./invoiceRequestData";
import { CustomInput } from "@/components/customInput";
import { theme } from "@/styles";
import { toast, ToastContainer } from "react-toastify";
import CustomButton from "@/components/button/button";

export default function CFS() {
  const [addAttachment, setAddAttachment] = useState([1]);

  const [formData, setFormData] = useState({
    attachmentDetails: [{}], // first attachment row
  });

  const [fieldsMode, setFieldsMode] = useState("");

  const [jsonData] = useState({
    ...data,
    attachmentFields1: data.attachmentFields1 || [],
  });

  const addAttachmentHandler = () => {
    setAddAttachment((prev) => [...prev, prev.length + 1]);
    setFormData((prev) => ({
      ...prev,
      attachmentDetails: [...prev.attachmentDetails, {}],
    }));
  };

  const deleteAttachmentHandler = (indexToDelete) => {
    setAddAttachment((prev) => prev.filter((_, i) => i !== indexToDelete));
    setFormData((prev) => ({
      ...prev,
      attachmentDetails: prev.attachmentDetails.filter(
        (_, i) => i !== indexToDelete
      ),
    }));
  };

  const submitHandler = (event) => {
    event.preventDefault();
    console.log("👉 Final formData:", formData);
    toast.success("working!");
  };

  return (
    <ThemeProvider theme={theme}>
      <form onSubmit={submitHandler}>
        <section className="py-2 px-4">
          <Box className="flex justify-between items-end mb-2">
            <h1 className="text-left text-base flex items-end m-0">
              CFS Invoice Request
            </h1>
            <Box>
              <CustomButton text="Back" href="/bl/list" />
            </Box>
          </Box>

          {/* IGM Information */}
          <Box className="border border-solid border-black rounded-[4px]">
            <Typography
              variant="caption"
              className="!ml-3 border-b border-solid">
              IGM Information
            </Typography>
            <Box className="grid grid-cols-4 gap-2 border-b border-b-solid border-b-black p-2">
              <CustomInput
                fields={jsonData.fields}
                formData={formData} // full formData works for IGM
                setFormData={setFormData}
                fieldsMode={fieldsMode}
              />
            </Box>

            {/* Attachment Details */}
            <Typography
              variant="caption"
              className="!ml-3 border-b border-solid">
              Attachment Details
            </Typography>
            <Box className="md:overflow-y-auto h-auto overflow-auto p-2 w-full">
              {addAttachment.map((row, index) => (
                <Box
                  key={row}
                  className="grid !grid-cols-8 gap-1 mb-2 relative group pb-2"
                  sx={{ gridTemplateColumns: "repeat(14, minmax(0, 1fr))" }}>
                  <IconButton
                    aria-label="delete"
                    onClick={() => deleteAttachmentHandler(index)}
                    className="!absolute right-0 top-0 invisible group-hover:visible"
                    sx={{ color: "red" }}>
                    <Tooltip title="Delete Row">
                      <DeleteIcon />
                    </Tooltip>
                  </IconButton>

                  {/* Pass only this row of attachmentDetails */}
                  <CustomInput
                    fields={jsonData.attachmentFields1}
                    formData={formData.attachmentDetails[index]}
                    setFormData={(updatedRow) => {
                      const newDetails = [...formData.attachmentDetails];
                      newDetails[index] = updatedRow; // update only this row
                      setFormData((prev) => ({
                        ...prev,
                        attachmentDetails: newDetails,
                      }));
                    }}
                    fieldsMode={fieldsMode}
                  />
                </Box>
              ))}

              <Button
                variant="contained"
                sx={{
                  padding: "2px 6px",
                  fontSize: "0.75rem",
                  textTransform: "capitalize",
                  backgroundColor: "#ffc400",
                }}
                onClick={addAttachmentHandler}>
                Add Attachment
              </Button>
            </Box>
          </Box>

          <Box className="w-full flex mt-2">
            <CustomButton text="Submit" type="submit" />
          </Box>
        </section>
      </form>
      <ToastContainer />
    </ThemeProvider>
  );
}
