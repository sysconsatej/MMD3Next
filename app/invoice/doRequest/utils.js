import { getDataWithCondition, updateStatusRows } from "@/apis";
import { getUserByCookies } from "@/utils";
import { toast } from "react-toastify";

export const doStatusHandler = (getData) => {
  const userData = getUserByCookies();
  return {
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
