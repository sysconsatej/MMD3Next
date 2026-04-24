import { fetchForm, getDataWithCondition, updateStatusRows } from "@/apis";
import {
  formatDataWithForm,
  formatFetchForm,
  getUserByCookies,
  setInputValue,
} from "@/utils";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { toast } from "react-toastify";

const userData = getUserByCookies();

export const createHandleChangeFunc = ({ setFormData, formData }) => {
  return {
    handleChangeOnVessel: async (name, value) => {
      const vesselId = value?.Id || null;

      setFormData((prevData) =>
        setInputValue({
          prevData,
          tabName: null,
          gridName: null,
          tabIndex: null,
          containerIndex: null,
          name: "podVoyageId",
          value: null,
        }),
      );

      if (!vesselId) return;

      try {
        const obj = {
          columns: "vo.id as Id, vo.voyageNo as Name",
          tableName: "tblVoyage vo",
          joins: `join tblVoyageRoute vr on vr.voyageId = vo.id`,
          whereCondition: `GETDATE() >= vr.gateOpenLine AND GETDATE() < vr.gateCloseLine and vo.vesselId = ${vesselId} and vo.companyid = ${formData?.shippingLineId?.Id || userData?.companyId} and vo.status = 1`,
          orderBy: "vo.voyageNo",
        };

        const { data, success } = await getDataWithCondition(obj);

        if (success && Array.isArray(data) && data.length === 1) {
          setFormData((prevData) =>
            setInputValue({
              prevData,
              tabName: null,
              gridName: null,
              tabIndex: null,
              containerIndex: null,
              name: "podVoyageId",
              value: data[0],
            }),
          );
        }
      } catch (e) {
        console.error("handleChangeOnVessel error:", e);
      }
    },
  };
};

export const createBlurFunc = ({ setFormData, setJsonData, jsonData }) => {
  return {
    getMblHandler: async (event) => {
      const { value, name } = event.target;
      const obj = {
        columns: "id",
        tableName: "tblBl",
        whereCondition: `mblNo = '${value}' and mblHblFlag = 'MBL' and status = 1`,
      };
      const { success, data } = await getDataWithCondition(obj);
      if (success) {
        const format = formatFetchForm(jsonData, "tblBl", data[0].id);
        const { result } = await fetchForm(format);
        const getData = formatDataWithForm(result, jsonData);
        setFormData((prev) => ({ ...prev, ...getData }));
        setJsonData((prev) => {
          const prevMblFields = prev.mblFields;
          const disableMbl = prevMblFields.map((item) => {
            if (item.name === "csnNo" || item.name === "csnDate") {
              return { ...item, disabled: false };
            }
            return { ...item, disabled: true };
          });
          return {
            ...prev,
            mblFields: disableMbl,
          };
        });
      }
    },
  };
};

export function advanceSearchFilter(advanceSearch) {
  const condition = [];

  if (advanceSearch?.mblNo) {
    condition.push(`csn.mblNo = '${advanceSearch.mblNo}'`);
  }

  if (advanceSearch?.podVesselId?.Id) {
    condition.push(`csn.podVesselId = ${advanceSearch.podVesselId.Id}`);
  }

  if (advanceSearch?.podVoyageId?.Id) {
    condition.push(`csn.podVoyageId = ${advanceSearch.podVoyageId.Id}`);
  }

  if (advanceSearch?.podId?.Id) {
    condition.push(`csn.podId = ${advanceSearch.podId.Id}`);
  }

  if (advanceSearch?.polId?.Id) {
    condition.push(`csn.polId = ${advanceSearch.polId.Id}`);
  }

  return condition.length ? condition.join(" AND ") : null;
}

export const csnStatusHandler = (getData, router, setMode, path = null) => {
  return {
    handleView: (id) => {
      setMode({ mode: "view", formId: id, admin: path });
      router.push("/bl/updateCsn");
    },
    handleEdit: (id) => {
      setMode({ mode: "edit", formId: id });
      router.push("/bl/updateCsn");
    },
    handleRequest: async (ids) => {
      try {
        const payload = {
          columns: "m.id , m.name",
          tableName: "tblMasterData m",
          whereCondition: `m.masterListName = 'tblCsnStatusType' AND m.name = 'Request'`,
        };
        const getStatusId = await getDataWithCondition(payload);

        if (getStatusId) {
          const rowsPayload =
            Array.isArray(ids) &&
            ids.map((info) => {
              return {
                id: info,
                csnRequestStatusId: getStatusId?.data[0]?.id,
                updatedBy: userData.userId,
                updatedDate: new Date(),
              };
            });

          const res = await updateStatusRows({
            tableName: "tblCsn",
            rows: rowsPayload,
            keyColumn: "id",
          });

          if (res?.success === true) {
            toast.success(`Status Requested successfully!`);
            getData();
          }
        }
      } catch (err) {
        console.log(err);
      }
    },
    handleConfirm: async (ids) => {
      try {
        const payload = {
          columns: "m.id , m.name",
          tableName: "tblMasterData m",
          whereCondition: `m.masterListName = 'tblCsnStatusType' AND m.name = 'Confirm'`,
        };
        const getStatusId = await getDataWithCondition(payload);

        if (getStatusId) {
          const rowsPayload =
            Array.isArray(ids) &&
            ids.map((info) => {
              return {
                id: info,
                csnRequestStatusId: getStatusId?.data[0]?.id,
                updatedBy: userData.userId,
                updatedDate: new Date(),
              };
            });

          const res = await updateStatusRows({
            tableName: "tblCsn",
            rows: rowsPayload,
            keyColumn: "id",
          });

          if (res?.success === true) {
            toast.success(`Status Confirm successfully!`);
            getData();
          }
        }
      } catch (err) {
        console.log(err);
      }
    },
    handleReject: async (ids, value) => {
      try {
        const payload = {
          columns: "m.id , m.name",
          tableName: "tblMasterData m",
          whereCondition: `m.masterListName = 'tblCsnStatusType' AND m.name = 'Reject'`,
        };
        const getStatusId = await getDataWithCondition(payload);

        if (getStatusId) {
          const rowsPayload =
            Array.isArray(ids) &&
            ids.map((info) => {
              return {
                id: info,
                csnRequestStatusId: getStatusId?.data[0]?.id,
                csnRequestRemarks: value,
                updatedBy: userData.userId,
                updatedDate: new Date(),
              };
            });

          const res = await updateStatusRows({
            tableName: "tblCsn",
            rows: rowsPayload,
            keyColumn: "id",
          });

          if (res?.success === true) {
            toast.success(`Status Rejected successfully!`);
            getData();
          }
        }
      } catch (err) {
        console.log(err);
      }
    },
  };
};

export function statusColor(status) {
  const color = {
    Reject: "#DC0E0E",
    Request: "#4E61D3",
    Confirm: "green",
  };
  return color[status];
}

export function BlRejectModal({ modal, setModal, getData }) {
  function handlerReject() {
    if (!modal.value) {
      toast.warn("Please enter remark!");
      return;
    }

    csnStatusHandler(getData).handleReject(modal.ids, modal.value);

    setModal((prev) => ({ ...prev, toggle: false }));
  }

  return (
    <Dialog
      open={modal.toggle}
      onClose={() => setModal((prev) => ({ ...prev, toggle: false }))}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle>Add Remarks</DialogTitle>

      <DialogContent dividers>
        <TextField
          fullWidth
          margin="dense"
          multiline
          minRows={3}
          label="Remarks"
          value={modal.value}
          onChange={(e) =>
            setModal((prev) => ({ ...prev, value: e.target.value }))
          }
        />
      </DialogContent>

      <DialogActions>
        <div
          className="py-1 px-3 border border-[#B5C4F0] rounded-sm text-xs cursor-pointer hover:bg-[#B5C4F0] hover:text-white"
          onClick={() => setModal((prev) => ({ ...prev, toggle: false }))}
        >
          Cancel
        </div>
        <div
          className="py-1 px-3 border border-[#B5C4F0] rounded-sm text-xs cursor-pointer hover:bg-[#B5C4F0] hover:text-white"
          onClick={handlerReject}
        >
          Save
        </div>
      </DialogActions>
    </Dialog>
  );
}

export async function requestHandler(formData, setDisableRequest) {
  try {
    const statusPayload = {
      columns: "m.id as Id, m.name as Name",
      tableName: "tblMasterData m",
      whereCondition:
        "m.masterListName = 'tblCsnStatusType' AND m.name = 'Request'",
    };

    const statusRes = await getDataWithCondition(statusPayload);
    const requestStatusId = statusRes?.data?.[0]?.Id;

    if (!requestStatusId) {
      toast.error("Request status missing in master");
      return;
    }

    const checkPayload = {
      columns: "id",
      tableName: "tblCsn",
      whereCondition: `
        mblNo = '${formData?.mblNo}'
        AND status = 1
        AND companyId = '${userData?.companyId}'
      `,
    };

    const { data, success, message, error } =
      await getDataWithCondition(checkPayload);

    if (!success || !Array.isArray(data) || data.length === 0) {
      toast.error(
        message ||
          error ||
          "Update CSN Request record not found. Please submit first.",
      );
      return;
    }
    const rowsPayload = data.map((row) => ({
      id: row.id,
      csnRequestStatusId: requestStatusId,
      updatedBy: userData?.userId,
      updatedDate: new Date(),
    }));
    const res = await updateStatusRows({
      tableName: "tblCsn",
      keyColumn: "id",
      rows: rowsPayload,
    });
    if (res?.success) {
      toast.success("Update CSN Request sent successfully!");
      setDisableRequest(true);
    } else {
      toast.error(res?.message || "Error while sending CSN Request");
    }
  } catch (err) {
    console.error(err);
    toast.error("Something went wrong while requesting CSN");
  }
}
