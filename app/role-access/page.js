"use client";
import CustomButton from "@/components/button/button";
import { CustomInput } from "@/components/customInput";
import { Box, Card, CardContent } from "@mui/material";
import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";

const fieldData = {
  roleAccessFields: [
    {
      label: "Select Role",
      name: "role",
      type: "dropdown",
      labelType: "name,tblRole",
      foreignTable: "name,tblMasterData",
      key: "role",
    },
    {
      label: "Select User",
      name: "user",
      type: "dropdown",
      labelType: "user",
      foreignTable: "name,tblUser",
      key: "user",
    },
  ],
};

const RoleAccessPage = () => {
  const [formData, setFormData] = useState({});

  const onSubmitHandler = (e) => {
    e.preventDefault();
    console.log("Form Data Submitted: ", formData);
    Object.keys(formData).length === 0
      ? toast.error("Please fill in the form before submitting.")
      : toast.info("Form submitted successfully!");
    // Handle form submission logic here
  };

  return (
    <main className="p-10">
      <h1>Role Access Management</h1>
      <Card className="mt-10">
        <CardContent>
          <form
            className="flex flex-col gap-10 "
            onSubmit={(e) => onSubmitHandler(e)}
          >
            <CustomInput
              fields={fieldData.roleAccessFields}
              formData={formData}
              fieldsMode={setFormData}
              setFormData={setFormData}
              key={Math.floor(Math.random() * 1000)}
            />
            <Box className="">
              <CustomButton text={"Submit"} type="submit" />
            </Box>
          </form>
        </CardContent>
      </Card>
      <ToastContainer />
    </main>
  );
};

export default RoleAccessPage;
