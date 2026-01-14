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
    handleReject: async (ids) => {
      const obj = {
        columns: "id as Id, name as Name",
        tableName: "tblMasterData",
        whereCondition: `masterListName = 'tblDoStatus' and status = 1 and name = 'Reject for DO'`,
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
          return;
        }
        const blId = blData?.[0]?.id;

        const format = formatFetchForm(
          jsonData,
          "tblBl",
          blId,
          '["tblInvoicePayment", "tblBlContainer"]',
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
      } catch (e) {
        console.error(e);
        toast.error("Error fetching payment details.");
        setFormData({});
      }
    },
  };
};

export const changeEventFunctions = ({ mode, setFormData, formData }) => {
  return {
    freeDaysChangeHandler: async (name, value) => {
      if (value === "F") {
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
