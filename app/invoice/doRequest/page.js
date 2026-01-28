"use client";

import { useEffect, useState } from "react";
import { ThemeProvider, Box } from "@mui/material";
import { cfsGridButtons, fieldData } from "./doData";
import { CustomInput } from "@/components/customInput";
import { theme } from "@/styles";
import { toast, ToastContainer } from "react-toastify";
import CustomButton from "@/components/button/button";
import TableGrid from "@/components/tableGrid/tableGrid";
import FormHeading from "@/components/formHeading/formHeading";
import { formStore } from "@/store";
import {
  getDataWithCondition,
  insertUpdateForm,
  updateStatusRows,
} from "@/apis";
import { formatFormData, getUserByCookies } from "@/utils";
import {
  BlurEventFunctions,
  changeEventFunctions,
  checkAttachment,
  doStatusHandler,
  getDORequest,
  requestHandler,
} from "./utils";

export default function Home() {
  const [formData, setFormData] = useState({});
  const [releaseAttachment, setReleaseAttachment] = useState({});
  const [fieldsMode, setFieldsMode] = useState("");
  const [jsonData, setJsonData] = useState(fieldData);
  const { mode, setMode } = formStore();
  const [doStatus, setDoStatus] = useState([]);
  const [requestBtn, setRequestBtn] = useState(true);
  const userData = getUserByCookies();

  const submitHandler = async (e) => {
    e?.preventDefault();
    checkAttachment(formData);

    let { tblInvoicePayment, tblBlContainer, ...restData } = formData;

    if (
      userData?.roleCode === "shipping" &&
      releaseAttachment?.tblAttachmentRelease?.length > 0
    ) {
      restData.tblAttachment = [
        ...restData?.tblAttachment,
        ...releaseAttachment?.tblAttachmentRelease,
      ];
    }

    const format = formatFormData(
      "tblDoRequest",
      {
        ...restData,
        locationId: userData?.location,
        companyId: userData?.companyId,
        companyBranchId: userData?.branchId,
      },
      mode.formId,
      "doRequestId",
    );
    const { success, error, message } = await insertUpdateForm(format);
    if (success) {
      toast.success(message);
      setRequestBtn(false);
    } else {
      toast.error(error || message);
    }

    if (tblBlContainer?.length > 0) {
      const rowsPayload = tblBlContainer?.map((item) => {
        return {
          id: item?.id,
          selectForDO: item?.selectForDO,
          doValidityDate: item?.doValidityDate,
          updatedBy: userData?.userId,
          updatedDate: new Date(),
        };
      });

      const res = await updateStatusRows({
        tableName: "tblBlContainer",
        rows: rowsPayload,
        keyColumn: "id",
      });

      const { success, message } = res || {};
      if (!success) {
        toast.error(message || "Container update failed");
        return;
      } else {
        toast.success("Container updated successfully!");
      }
    }
  };

  const handleBlurEventFunctions = BlurEventFunctions({
    formData,
    setFormData,
    jsonData,
  });

  const handleChangeEventFunctions = changeEventFunctions({
    setFormData,
    mode,
    formData,
    setJsonData,
  });

  useEffect(() => {
    getDORequest({
      setFormData,
      setFieldsMode,
      mode,
      jsonData,
      setJsonData,
      setReleaseAttachment,
    });
  }, [mode]);

  useEffect(() => {
    async function getDoStatus() {
      const obj = {
        columns: "id as Id, name as Name",
        tableName: "tblMasterData",
        whereCondition: `masterListName = 'tblDoStatus' and status = 1`,
      };
      const { data, success } = await getDataWithCondition(obj);
      if (success) {
        setDoStatus(data);
      }

      if (userData?.roleCode === "shipping") {
        setJsonData((prev) => {
          const updateDoRequestFields = prev.doRequestFields.map((item) => {
            if (
              item.name === "surveyorText" ||
              item.name === "emptyDepotId" ||
              item.name === "nominatedAreaId"
            ) {
              return { ...item, disabled: false };
            }
            return { ...item, disabled: true };
          });

          return {
            ...prev,
            doRequestFields: updateDoRequestFields,
          };
        });
      }
    }
    getDoStatus();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <form onSubmit={submitHandler}>
        <section className="py-2 px-4">
          <Box className="flex justify-between items-center mb-2">
            <h1 className="text-left text-base m-0">Do Request</h1>
            {userData?.roleCode === "customer" && (
              <CustomButton text="Back" href={"/invoice/doRequest/list"} />
            )}
            {userData?.roleCode === "shipping" && (
              <CustomButton text="Back" href={"/invoice/doRequest/liner"} />
            )}
          </Box>

          <Box>
            <FormHeading text="Do Request" />
            <Box className="grid grid-cols-4 items-end gap-2 p-2 ">
              <CustomInput
                fields={jsonData.doRequestFields}
                formData={formData}
                setFormData={setFormData}
                fieldsMode={fieldsMode}
                handleBlurEventFunctions={handleBlurEventFunctions}
                handleChangeEventFunctions={handleChangeEventFunctions}
              />
            </Box>
            <Box className="mt-4 border">
              <FormHeading text="Payment Information" variant="body2" />
              <TableGrid
                fields={jsonData.tblInvoicePayment}
                formData={formData}
                setFormData={setFormData}
                fieldsMode={fieldsMode}
                gridName={"tblInvoicePayment"}
              />
            </Box>
            <Box className="mt-4 border">
              <FormHeading text="Container Information" variant="body2" />
              <TableGrid
                fields={jsonData.tblBlContainer}
                formData={formData}
                setFormData={setFormData}
                fieldsMode={fieldsMode}
                gridName={"tblBlContainer"}
              />
            </Box>
            <Box className="mt-4 border">
              <FormHeading text="Document List" variant="body2" />
              <TableGrid
                fields={jsonData.tblAttachment}
                formData={formData}
                setFormData={setFormData}
                fieldsMode={fieldsMode}
                gridName={"tblAttachment"}
                buttons={
                  userData?.roleCode === "customer" ? cfsGridButtons : []
                }
              />
            </Box>
            {((releaseAttachment?.tblAttachmentRelease?.length > 0 &&
              userData?.roleCode === "customer") ||
              userData?.roleCode === "shipping") && (
              <Box className="mt-4 border">
                <FormHeading text="DO Released" variant="body2" />
                <TableGrid
                  fields={jsonData.tblAttachmentRelease}
                  formData={releaseAttachment}
                  setFormData={setReleaseAttachment}
                  fieldsMode={fieldsMode}
                  gridName={"tblAttachmentRelease"}
                  buttons={cfsGridButtons}
                />
              </Box>
            )}
          </Box>
          <Box className="w-full flex mt-2 gap-2">
            {fieldsMode !== "view" && (
              <CustomButton
                text={"Submit"}
                type="submit"
                disabled={!requestBtn}
              />
            )}
            {userData?.roleCode === "customer" &&
              (!mode?.status || mode?.status === "Reject for DO") && (
                <CustomButton
                  text={"Request"}
                  onClick={() => requestHandler(doStatus, formData?.blNo)}
                  disabled={
                    fieldsMode !== "view" && fieldsMode !== "edit" && requestBtn
                  }
                />
              )}
            {userData?.roleCode === "shipping" && (
              <CustomButton
                text={"Confirm"}
                onClick={() => {
                  doStatusHandler(() => {}).handleConfirm([mode.formId]);
                  setMode({
                    mode: mode?.mode,
                    formId: mode?.formId,
                    status: "Confirm for DO",
                  });
                }}
                disabled={
                  mode.status === "Confirm for DO" ||
                  mode.status === "Released for DO"
                }
              />
            )}

            {userData?.roleCode === "shipping" && (
              <CustomButton
                text={"DO Release"}
                onClick={() => {
                  doStatusHandler().handleRelease(
                    [mode.formId],
                    releaseAttachment,
                    submitHandler,
                  );
                }}
                disabled={mode.status !== "Confirm for DO"}
              />
            )}
          </Box>
        </section>
      </form>
      <ToastContainer />
    </ThemeProvider>
  );
}
