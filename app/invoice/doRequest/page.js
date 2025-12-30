"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { ThemeProvider, Box } from "@mui/material";
import { cfsGridButtons, fieldData } from "./doData";
import { CustomInput } from "@/components/customInput";
import { theme } from "@/styles";
import { toast, ToastContainer } from "react-toastify";
import CustomButton from "@/components/button/button";
import TableGrid from "@/components/tableGrid/tableGrid";
import FormHeading from "@/components/formHeading/formHeading";
import { formStore, useBackLinksStore } from "@/store";
import {
  fetchForm,
  getDataWithCondition,
  insertUpdateForm,
  updateStatusRows,
} from "@/apis";
import {
  formatDataWithForm,
  formatFetchForm,
  formatFormData,
  getUserByCookies,
} from "@/utils";

export default function Home() {
  const { link } = useBackLinksStore();
  const [formData, setFormData] = useState({});
  const [fieldsMode, setFieldsMode] = useState("");
  const [jsonData, setJsonData] = useState(fieldData);
  const { mode, setMode } = formStore();
  const [doStatus, setDoStatus] = useState([]);
  const [requestBtn, setRequestBtn] = useState(true);
  const userData = getUserByCookies();

  const submitHandler = async (e) => {
    e.preventDefault();
    const requestStatus = doStatus.filter(
      (item) => item.Name === "Pending for DO"
    );
    const format = formatFormData(
      "tblBl",
      {
        ...formData,
        dostatusId: requestStatus?.[0]?.Id,
        doRequestCreatedBy: userData?.userId,
      },
      mode.formId,
      "blId"
    );
    const { success, error, message } = await insertUpdateForm(format);
    if (success) {
      toast.success(message);
      setRequestBtn(false);
    } else {
      toast.error(error || message);
    }
  };

  const handleBlurEventFunctions = {
    fetchInvoicePaymentByBlAndLiner: async (eventOrValue) => {
      const blNo =
        typeof eventOrValue === "string"
          ? eventOrValue.trim()
          : eventOrValue?.target?.value?.trim();

      if (!blNo) return;

      const linerId =
        formData?.shippingLineId?.Id ?? formData?.shippingLineId ?? null;

      if (!linerId) {
        toast.warn("Select Liner first.");
        return;
      }

      try {
        const blQuery = {
          columns: "TOP 1 id, mblHblFlag",
          tableName: "tblBl",
          whereCondition: `
            ISNULL(hblNo, mblNo) = '${blNo.replace(
              /'/g,
              "''"
            )}' AND 1 = 1 AND shippingLineId = ${linerId}
          `,
        };

        const { success: blSuccess, data: blData } = await getDataWithCondition(
          blQuery
        );

        if (!blSuccess || !Array.isArray(blData) || !blData.length) {
          toast.error("BL not found for selected Liner.");
          setFormData({});
          return;
        }
        const blId = blData?.[0]?.id;

        setJsonData((prev) => {
          const updateDoRequestFields = prev?.doRequestFields?.map((item) => {
            if (item.name === "mblNo") {
              if (blData?.[0]?.mblHblFlag === "HBL") {
                return { ...item, name: "hblNo" };
              } else {
                return { ...item, name: "mblNo" };
              }
            }
            return item;
          });

          return {
            ...prev,
            doRequestFields: updateDoRequestFields,
          };
        });

        setMode({ mode: null, formId: blId });
      } catch (e) {
        console.error(e);
        toast.error("Error fetching payment details.");
        setFormData({});
      }
    },
  };

  const handleChangeEventFunctions = {
    freeDaysChangeHandler: async (name, value) => {
      if (value === "F") {
        try {
          const obj = {
            columns: "vor.arrivalDate",
            tableName: "tblBl b",
            joins:
              "inner join tblVoyageRoute vor on vor.voyageId = b.podVoyageId and vor.portOfCallId = b.podId",
            whereCondition: `b.id = ${mode.formId} and b.status = 1`,
          };
          const { data, success } = await getDataWithCondition(obj);
          if (success && data.length > 0) {
            setFormData((prev) => {
              const updateTblBlContainer = prev?.tblBlContainer?.map(
                (item) => ({
                  ...item,
                  doValidityDate: data?.[0]?.arrivalDate,
                })
              );
              return {
                ...prev,
                tblBlContainer: updateTblBlContainer,
              };
            });
          }
        } catch (e) {
          console.log("error", e.message);
        }
      } else {
        setFormData((prev) => {
          const updateTblBlContainer = prev?.tblBlContainer?.map((item) => ({
            ...item,
            doValidityDate: null,
          }));
          return {
            ...prev,
            tblBlContainer: updateTblBlContainer,
          };
        });
      }
    },
  };

  async function requestHandler() {
    const requestStatus = doStatus.filter(
      (item) => item.Name === "Request for DO"
    );
    const rowsPayload = [
      {
        id: mode?.formId,
        dostatusId: requestStatus?.[0]?.Id,
        hblRequestRemarks: null,
        updatedBy: userData?.userId,
        updatedDate: new Date(),
      },
    ];
    const res = await updateStatusRows({
      tableName: "tblBl",
      rows: rowsPayload,
      keyColumn: "id",
    });
    const { success, message } = res || {};
    if (!success) {
      toast.error(message || "Update failed");
      return;
    }
    toast.success("Request updated successfully!");
  }

  useEffect(() => {
    async function getBl() {
      const format = formatFetchForm(
        jsonData,
        "tblBl",
        mode.formId,
        '["tblInvoicePayment", "tblAttachment", "tblBlContainer"]',
        "blId"
      );
      const { result } = await fetchForm(format);
      const getData = formatDataWithForm(result, jsonData);
      if (mode.mode !== "edit" && mode.mode !== "view") {
        const updateTblContainer = getData?.tblBlContainer?.map((subItem) => {
          return { ...subItem, selectForDO: true };
        });
        setFormData({ ...getData, tblBlContainer: updateTblContainer });
      } else {
        setFormData(getData);
      }
      setFieldsMode(mode.mode);
    }
    getBl();
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
            if (item.name === "surveyor" || item.name === "emptyDepotId") {
              return { ...item, disabled: false };
            }
            return item;
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
              <CustomButton text="Back" href={link ? link?.blStatus :  "/invoice/doRequest/list"} />
            )}
            {userData?.roleCode === "shipping" && (
              <CustomButton text="Back" href={link ? link?.blStatus :  "/invoice/doRequest/liner"} />
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
                buttons={cfsGridButtons}
              />
            </Box>
          </Box>

          <Box className="w-full flex mt-2 gap-2">
            {fieldsMode !== "view" && (
              <CustomButton text={"Submit"} type="submit" />
            )}
            {userData?.roleCode === "customer" && (
              <CustomButton
                text={"Request"}
                onClick={requestHandler}
                disabled={
                  fieldsMode !== "view" && fieldsMode !== "edit" && requestBtn
                }
              />
            )}
          </Box>
        </section>
      </form>

      <ToastContainer />
    </ThemeProvider>
  );
}