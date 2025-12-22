import { getDataWithCondition, updateStatusRows } from "@/apis";
import { getUserByCookies } from "@/utils";
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
        columns: "mblHblFlag",
        tableName: "tblBl",
        whereCondition: `id = ${id} and status = 1`,
      };
      const { data, success } = await getDataWithCondition(obj);
      if (success) {
        if (data?.[0]?.mblHblFlag === "HBL") {
          setMode({ mode: "view", formId: `${id}` });
          router.push("/bl/hbl");
        } else {
          setMode({ mode: "view", formId: id });
          router.push("/bl/mbl");
        }
      }
    },
    handleEditBL: async (ids) => {
      const id = ids[0];
      const obj = {
        columns: "mblHblFlag",
        tableName: "tblBl",
        whereCondition: `id = ${id} and status = 1`,
      };
      const { data, success } = await getDataWithCondition(obj);
      if (success) {
        if (data?.[0]?.mblHblFlag === "HBL") {
          setMode({ mode: "edit", formId: `${id}` });
          router.push("/bl/hbl");
        } else {
          setMode({ mode: "edit", formId: id });
          router.push("/bl/mbl");
        }
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
            dostatusId: data?.[0]?.Id,
            hblRequestRemarks: null,
            updatedBy: userData?.userId,
            updatedDate: new Date(),
          };
        });

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
            dostatusId: data?.[0]?.Id,
            hblRequestRemarks: null,
            updatedBy: userData?.userId,
            updatedDate: new Date(),
          };
        });

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
            dostatusId: data?.[0]?.Id,
            hblRequestRemarks: null,
            updatedBy: userData?.userId,
            updatedDate: new Date(),
          };
        });

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
        getData();
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
