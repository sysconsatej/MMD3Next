"use client";
import { insertUpdateForm } from "@/apis";
import CustomButton from "@/components/button/button";
import { CustomInput } from "@/components/customInput";
import { formatFormData } from "@/utils";
import { Box, Card, CardContent } from "@mui/material";
import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";

const fieldData = {
  roleAccessFields: [
    {
      label: "Select Role",
      name: "role",
      type: "dropdown",
      tableName: "tblTestRole t",
      foreignTable: "type,tblTestRole",
      displayColumn: "t.type",
      orderBy: "t.type",
      key: "role",
    },
    {
      label: "Select User",
      name: "user",
      type: "dropdown",
      tableName: "tblTestUsers t",
      displayColumn: "t.username",
      orderBy: "t.username",
      foreignTable: "username,tblTestUsers",
      key: "user",
    },
  ],
};

const RoleAccessPage = () => {
  const [formData, setFormData] = useState({});

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    console.log("Form Data Submitted: ", formData);
    if (Object.keys(formData).length === 0) {
      toast.error("Please fill in the form before submitting.");
      return
    }

    console.log("Submitted Form Data:", formData);
    const dataToSubmit = {
      roleId: formData?.role?.Id,
    };

    const format = formatFormData(
      "tblTestUsers", // table name
      dataToSubmit,
      formData?.user?.Id, // column value to update the record
      "id" // column name to identify the record
    );
    const { success, error, message } = await insertUpdateForm(format);
    if (success) {
      toast.success(message);
      setFormData({});
    } else {
      toast.error(error || message);
    }
  };

  return (
    <main className="p-10">
      <h1>Role Access Management</h1>
      <Card className="mt-10">
        <CardContent>
          <form
            className="flex flex-col justify-around gap-10 "
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
