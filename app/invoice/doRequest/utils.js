import { fetchForm, getDataWithCondition, updateStatusRows } from "@/apis";
import { formatDataWithForm, formatFetchForm, getUserByCookies } from "@/utils";
import { toast } from "react-toastify";

export const doStatusHandler = (getData, router, setMode) => {
  const userData = getUserByCookies();

  return {
    handleView: (id) => {
      setMode({ mode: "view", formId: id?.[0] });
      router.push("/invoice/doRequest");
    },
    handleEdit: (id) => {
      setMode({ mode: "edit", formId: id?.[0] });
      router.push("/invoice/doRequest");
    },
    handleViewBL: async (ids) => {
      const id = ids[0];
      const obj = {
        columns: "b.id id, b.mblHblFlag mblHblFlag",
        tableName: "tblDoRequest d",
        joins: `
          left join tblBl b on b.id = d.blId  and b.status = 1
        `,
        whereCondition: `d.id = ${id} and d.status = 1`,
      };
      const { data, success, error } = await getDataWithCondition(obj);
      if (data?.length > 0 && success) {
        if (data?.[0]?.mblHblFlag === "HBL") {
          setMode({ mode: "view", formId: `${data?.[0]?.id}` });
          router.push("/bl/hbl");
        } else {
          setMode({ mode: "view", formId: data?.[0]?.id });
          router.push("/bl/mbl");
        }
      } else {
        console.log("error", error);
        toast.error(error);
      }
    },
    handleEditBL: async (ids) => {
      const id = ids[0];
      const obj = {
        columns: "b.id id, b.mblHblFlag mblHblFlag",
        tableName: "tblDoRequest d",
        joins: `
          left join tblBl b on b.id = d.blId  and b.status = 1
        `,
        whereCondition: `d.id = ${id} and d.status = 1`,
      };
      const { data, success, error } = await getDataWithCondition(obj);
      if (data?.length > 0 && success) {
        if (data?.[0]?.mblHblFlag === "HBL") {
          setMode({ mode: "edit", formId: `${data?.[0]?.id}` });
          router.push("/bl/hbl");
        } else {
          setMode({ mode: "edit", formId: data?.[0]?.id });
          router.push("/bl/mbl");
        }
      } else {
        console.log("error", error);
        toast.error(error);
      }
    },
    handleRequestDO: async (ids) => {
      const obj = {
        columns: "id as Id, name as Name",
        tableName: "tblMasterData",
        whereCondition: `masterListName = 'tblDoStatus' and status = 1 and name = 'Request for DO'`,
      };
      const { data, success } = await getDataWithCondition(obj);
      if (success) {
        const rowsPayload = ids?.map((id) => {
          return {
            id: id,
            doRequestStatusId: data?.[0]?.Id,
            doRejectRemarks: null,
            updatedBy: userData?.userId,
            updatedDate: new Date(),
          };
        });

        const res = await updateStatusRows({
          tableName: "tblDoRequest",
          rows: rowsPayload,
          keyColumn: "id",
        });
        const { success, message } = res || {};
        if (!success) {
          toast.error(message || "Update failed");
          return;
        }
        toast.success("Request updated successfully!");
        getData();
      }
    },
    handleConfirm: async (ids) => {
      const obj = {
        columns: "id as Id, name as Name",
        tableName: "tblMasterData",
        whereCondition: `masterListName = 'tblDoStatus' and status = 1 and name = 'Confirm for DO'`,
      };
      const { data, success } = await getDataWithCondition(obj);
      if (success) {
        const rowsPayload = ids?.map((id) => {
          return {
            id: id,
            doRequestStatusId: data?.[0]?.Id,
            doRejectRemarks: null,
            updatedBy: userData?.userId,
            updatedDate: new Date(),
          };
        });

        const res = await updateStatusRows({
          tableName: "tblDoRequest",
          rows: rowsPayload,
          keyColumn: "id",
        });
        const { success, message } = res || {};
        if (!success) {
          toast.error(message || "Update failed");
          return;
        }
        toast.success("Request updated successfully!");
        getData();
      }
    },
    handleReject: async (rejectState, setRejectState) => {
      if (rejectState.value) {
        const obj = {
          columns: "id as Id, name as Name",
          tableName: "tblMasterData",
          whereCondition: `masterListName = 'tblDoStatus' and status = 1 and name = 'Reject for DO'`,
        };
        const { data, success } = await getDataWithCondition(obj);
        if (success) {
          const rowsPayload = rejectState?.ids?.map((id) => {
            return {
              id: id,
              doRequestStatusId: data?.[0]?.Id,
              doRejectRemarks: rejectState?.value,
              updatedBy: userData?.userId,
              updatedDate: new Date(),
            };
          });

          const res = await updateStatusRows({
            tableName: "tblDoRequest",
            rows: rowsPayload,
            keyColumn: "id",
          });
          const { success, message } = res || {};
          if (!success) {
            toast.error(message || "Update failed");
            return;
          }
          toast.success("Reject updated successfully!");
          setRejectState((prev) => ({ ...prev, toggle: false, value: null }));
          getData();
        }
      } else {
        toast.warn("Please enter reject remark!");
      }
    },
    handleGenerateDO: async (ids, setReportModalForRow, setReportModalOpen) => {
      try {
        const blQuery = {
          columns: "b.id, b.mblHblFlag",
          tableName: "tblDoRequest d",
          joins: `
             left join tblBl b on isnull(b.hblNo, b.mblNo) = d.blNo
            `,
          whereCondition: `d.id = ${ids?.[0]} and b.status = 1 and d.status = 1`,
        };

        const { success, data } = await getDataWithCondition(blQuery);

        console.log("data", data);

        if (success && data?.length > 0) {
          setReportModalForRow({ id: data?.[0]?.id, clientId: 1 });
          setReportModalOpen(true);
        } else {
          toast.warn("Again this DO Request does not have Bl in system!");
        }
      } catch (error) {
        console.log("error", error);
      }
    },
  };
};

export function statusColor(status) {
  const color = {
    RejectforDO: "#DC0E0E",
    RequestforDO: "#4E61D3",
    ConfirmforDO: "green",
    PendingforDO: "#F4B342",
  };
  return color[status];
}

export const BlurEventFunctions = ({ formData, setFormData, jsonData }) => {
  return {
    fetchInvoicePaymentByBlAndLiner: async (event) => {
      const { name, value } = event.target;
      const blNo = value?.trim();

      if (!blNo) return;

      const linerId = formData?.shippingLineId?.Id;

      if (!linerId) {
        toast.warn("Select Liner first.");
        return;
      }

      const blCheckQuery = {
        columns: "id",
        tableName: "tblDoRequest",
        whereCondition: `blNo = '${blNo}' AND status = 1 AND shippingLineId = ${linerId}`,
      };

      const { success: blCheckSuccess, data: blCheckData } =
        await getDataWithCondition(blCheckQuery);

      if (blCheckSuccess && blCheckData?.length > 0) {
        toast.warn("This blNo already exist in DO request!");
        setFormData((prev) => ({
          shippingLineId: formData?.shippingLineId,
          blNo: null,
        }));
        return;
      }

      try {
        const blQuery = {
          columns: "TOP 1 id, mblHblFlag",
          tableName: "tblBl",
          whereCondition: `ISNULL(hblNo, mblNo) = '${blNo}' AND 1 = 1 AND shippingLineId = ${linerId}`,
        };

        const { success: blSuccess, data: blData } = await getDataWithCondition(
          blQuery
        );

        if (!blSuccess || !Array.isArray(blData) || !blData.length) {
          toast.error("BL not found for selected Liner.");
        } else {
          const blId = blData?.[0]?.id;
          const format = formatFetchForm(
            jsonData,
            "tblBl",
            blId,
            '["tblBlContainer"]',
            "blId"
          );
          const { result } = await fetchForm(format);
          const getData = formatDataWithForm(result, jsonData);
          const convertData = {};
          for (let [key, value] of Object.entries(getData)) {
            if (value) {
              convertData[key] = value;
            }
          }
          const updateTblContainer = getData?.tblBlContainer?.map((subItem) => {
            return { ...subItem, selectForDO: true };
          });
          setFormData({
            ...convertData,
            blNo: value,
            blId: blId,
            tblBlContainer: updateTblContainer,
          });
        }
      } catch (e) {
        console.error(e);
        toast.error("Error fetching payment details.");
        setFormData({});
      }

      try {
        const invoiceQuery = {
          columns:
            "m2.name paymentTypeId, i.Amount Amount, i.bankName bankName, i.bankBranchName bankBranchName, i.referenceNo referenceNo, i.referenceDate referenceDate, m.name paymentStatusId, (select string_agg(i2.invoiceNo, ',') from tblInvoice i2 where  i2.id in (select try_cast(value as int) from string_split(i.invoiceIds, ','))) invoiceIds",
          tableName: "tblInvoicePayment i",
          joins: `left join tblMasterData m on m.id = i.paymentStatusId
                  left join tblMasterData m2 on m2.id = i.paymentTypeId `,
          whereCondition: `i.blNo = '${blNo}' and i.status = 1 and i.status = 1 and m.name = 'Payment Confirmed'`,
        };

        const { success: invoiceSuccess, data: invoiceData } =
          await getDataWithCondition(invoiceQuery);
        if (invoiceSuccess && invoiceData.length > 0) {
          setFormData((prev) => ({
            ...prev,
            tblInvoicePayment: invoiceData,
          }));
        }
      } catch (error) {
        console.log("error", error);
      }
    },
  };
};

export const changeEventFunctions = ({ mode, setFormData, formData }) => {
  return {
    freeDaysChangeHandler: async (name, value) => {
      if (value === "Y") {
        try {
          const obj = {
            columns: "vor.arrivalDate",
            tableName: "tblBl b",
            joins:
              "inner join tblVoyageRoute vor on vor.voyageId = b.podVoyageId and vor.portOfCallId = b.podId",
            whereCondition: `isnull(b.hblNo, b.mblNo) = '${formData?.blNo}' and b.status = 1`,
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
};

export async function requestHandler(doStatus, blNo) {
  const userData = getUserByCookies();

  const requestStatus = doStatus.filter(
    (item) => item.Name === "Request for DO"
  );
  const obj = {
    columns: "id",
    tableName: "tblDoRequest",
    whereCondition: `blNo = '${blNo}' and status = 1`,
  };
  const { data, success: success2 } = await getDataWithCondition(obj);

  if (success2 && data.length > 0) {
    const rowsPayload = [
      {
        id: data?.[0]?.id,
        doRequestStatusId: requestStatus?.[0]?.Id,
        doRejectRemarks: null,
        updatedBy: userData?.userId,
        updatedDate: new Date(),
      },
    ];
    const res = await updateStatusRows({
      tableName: "tblDoRequest",
      rows: rowsPayload,
      keyColumn: "id",
    });
    const { success, message } = res || {};
    if (!success) {
      toast.error(message || "Update failed");
      return;
    }
    toast.success("Request updated successfully!");
  } else {
    toast.warn("Do Request Id  not fund again this form!");
  }
}

export async function getDORequest({
  setFormData,
  setFieldsMode,
  mode,
  jsonData,
}) {
  const format = formatFetchForm(
    jsonData,
    "tblDoRequest",
    mode.formId,
    '["tblAttachment"]',
    "doRequestId"
  );
  const { result } = await fetchForm(format);
  const getData = formatDataWithForm(result, jsonData);
  const obj = {
    columns: "id as id",
    tableName: "tblBl",
    whereCondition: `isnull(hblNo, mblNo) = '${getData.blNo}' and status = 1`,
  };
  const { data, success } = await getDataWithCondition(obj);

  const invoiceQuery = {
    columns:
      "m2.name paymentTypeId, i.Amount Amount, i.bankName bankName, i.bankBranchName bankBranchName, i.referenceNo referenceNo, i.referenceDate referenceDate, m.name paymentStatusId, (select string_agg(i2.invoiceNo, ',') from tblInvoice i2 where  i2.id in (select try_cast(value as int) from string_split(i.invoiceIds, ','))) invoiceIds",
    tableName: "tblInvoicePayment i",
    joins: `left join tblMasterData m on m.id = i.paymentStatusId
                  left join tblMasterData m2 on m2.id = i.paymentTypeId `,
    whereCondition: `i.blNo = '${getData.blNo}' and i.status = 1 and i.status = 1 and m.name = 'Payment Confirmed'`,
  };

  const { success: invoiceSuccess, data: invoiceData } =
    await getDataWithCondition(invoiceQuery);

  if (data?.length > 0 && success) {
    const format2 = formatFetchForm(
      jsonData,
      "tblBl",
      data?.[0]?.id,
      '["tblBlContainer"]',
      "blId"
    );
    const { result: result2 } = await fetchForm(format2);
    const getData2 = formatDataWithForm(result2, jsonData);
    if (mode.mode !== "edit" && mode.mode !== "view") {
      const updateTblContainer = getData2?.tblBlContainer?.map((subItem) => {
        return { ...subItem, selectForDO: true };
      });
      setFormData({
        ...getData,
        blId: result?.blId,
        tblBlContainer: updateTblContainer,
      });
    } else {
      setFormData({
        ...getData,
        blId: result?.blId,
        tblBlContainer: getData2?.tblBlContainer ?? [],
      });
    }
  } else {
    setFormData(getData);
  }

  if (invoiceSuccess && invoiceData.length > 0) {
    setFormData((prev) => ({
      ...prev,
      tblInvoicePayment: invoiceData,
    }));
  }

  setFieldsMode(mode.mode);
}
