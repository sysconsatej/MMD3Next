import { fetchForm, getDataWithCondition, updateStatusRows } from "@/apis";
import {
  formatDataWithForm,
  formatFetchForm,
  getUserByCookies,
  setInputValue,
} from "@/utils";
import { toast } from "react-toastify";
import { fieldData } from "./fieldsData";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";

const userData = getUserByCookies();

// export const handleBlur = ({ setFormData, formData, setMode }) => {
//   return {
//     getDataBasedonLinerAndBLNo: async (event) => {
//       const { value } = event.target;
//       if (!value) {
//         setFormData((prev) => {
//           return {
//             ...prev,
//             podVoyageId: {},
//             podVesselId: {},
//             fpdId: {},
//             mblDate: "",
//           };
//         });
//         return "";
//       }

//       if (!formData?.shippingLineId) {
//         return toast.error("Please Enter Liner");
//       }

//       const mblNo = String(value).trim();
//       const payload = {
//         columns: "b.id",
//         tableName: "tblBl b",
//         whereCondition: `b.shippingLineId = '${formData?.shippingLineId?.Id}' and locationId='${userData?.location}' and b.mblNo='${mblNo}' and mblHblFlag = 'MBL'`,
//       };

//       const res = await getDataWithCondition(payload);
//       const data = res?.data && res?.data[0];
//       const mlBlId = data && data?.id;
//       if (mlBlId) {
//         const format = formatFetchForm(
//           fieldData,
//           "tblBl",
//           mlBlId,
//           '["tblAttachment"]',
//           "blId"
//         );
//         const { success, result, message, error } = await fetchForm(format);
//         if (success) {
//           const getData = formatDataWithForm(result, fieldData);
//        //   setMode({ mode: "edit", formId: mlBlId });
//           setFormData((prev) => {
//             return {
//               ...prev,
//               ...getData,
//             };
//           });
//         } else {
//           toast.error(error || message);
//         }
//       }
//     },
//   };
// };

export const handleChange = ({ setFormData, formData, setJsonData }) => {
  return {
    setCfsType: async (name, value) => {
      try {
        let setWhere = "";
        if (value.Name === "Liner Empanelled CFS") {
          setWhere = `join tblMasterData m on m.id = p.portTypeId  and m.masterListName = 'tblPortType' and m.code = 'CFS' and p.companyId = ${formData?.shippingLineId?.Id} and p.cfsTypeId = ${value?.Id}`;
        } else {
          setWhere = `join tblMasterData m on m.id = p.portTypeId  and m.masterListName = 'tblPortType' and m.code = 'CFS' and p.companyId = ${formData?.shippingLineId?.Id}`;
        }
        setJsonData((prev) => {
          const updateFields = prev.fields.map((item) => {
            if (item?.name === "nominatedAreaId") {
              return {
                ...item,
                joins: setWhere,
              };
            }
            return item;
          });

          return {
            ...prev,
            fields: updateFields,
          };
        });
        setFormData((prevData) =>
          setInputValue({
            prevData,
            tabName: null,
            gridName: null,
            tabIndex: null,
            containerIndex: null,
            name: "nominatedAreaId",
            value: null,
          })
        );
      } catch (error) {
        console.log("error", error);
      }
    },
    setCfsAndDpd: async (name, value) => {
      setJsonData((prev) => {
        const updateFields = prev.fields.map((item) => {
          if (item?.name === "dpdId") {
            return {
              ...item,
              joins: `join tblMasterData m on m.id = p.portTypeId  and m.masterListName = 'tblPortType' and m.code = 'DPD' and p.companyId = ${value?.Id}`,
            };
          } else if (item?.name === "nominatedAreaId") {
            return {
              ...item,
              joins: `join tblMasterData m on m.id = p.portTypeId  and m.masterListName = 'tblPortType' and m.code = 'CFS' and p.companyId = ${value?.Id}`,
            };
          }
          return item;
        });

        return {
          ...prev,
          fields: updateFields,
        };
      });
    },
  };
};

export const tableObj = ({ pageNo, pageSize, search }) => {
  const payload = {
    columns: `
      b.id,
      l.name AS locationId,
      c1.name AS shippingLineName,
      b.blNo,
      r.name AS cfsType,
      p.name AS nominatedArea,
      c.name AS dpdId,
      b.customBrokerText,
      m.name AS cfsRequestStatusId,
      b.cfsRejectRemarks AS remark
    `,
    tableName: "tblCfsRequest b",
    pageNo,
    pageSize,
    searchColumn: search.searchColumn,
    searchValue: search.searchValue,
    joins: `
      left join tblLocation l on l.id = b.locationId
      left join tblMasterData m on m.id = b.cfsRequestStatusId 
      left join tblMasterData r on r.id = b.cfsTypeId
      left join tblPort p on p.id = b.nominatedAreaId
      left join tblPort c on c.id = b.dpdId
      left join tblCompany c1 on c1.id = b.shippingLineId
      left join tblUser u1 on u1.id = ${userData?.userId}
      left join tblUser u2 on u2.companyId = u1.companyId
      join tblCfsRequest b2 
        on b2.id = b.id
       and b2.createdBy = u2.id
       and b.locationId = ${userData?.location}
    `,
  };

  return payload;
};


export const cfsStatusHandler = (getData, router, setMode) => {
  return {
    handleView: (id) => {
      setMode({ mode: "view", formId: id });
      router.push("/bl/cfs-request");
    },
    handleEdit: (id) => {
      setMode({ mode: "edit", formId: id });
      router.push("/bl/cfs-request");
    },
    handleRequest: async (ids) => {
      try {
        const payload = {
          columns: "m.id , m.name",
          tableName: "tblMasterData m",
          whereCondition: `m.masterListName = 'tblCfsStatusType' AND m.name = 'Request'`,
        };
        const getStatusId = await getDataWithCondition(payload);

        if (getStatusId) {
          const rowsPayload =
            Array.isArray(ids) &&
            ids.map((info) => {
              return {
                id: info,
                cfsRequestStatusId: getStatusId?.data[0]?.id,
                updatedBy: userData.userId,
                updatedDate: new Date(),
              };
            });

          const res = await updateStatusRows({
            tableName: "tblCfsRequest",
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
          whereCondition: `m.masterListName = 'tblCfsStatusType' AND m.name = 'Confirm'`,
        };
        const getStatusId = await getDataWithCondition(payload);

        if (getStatusId) {
          const rowsPayload =
            Array.isArray(ids) &&
            ids.map((info) => {
              return {
                id: info,
                cfsRequestStatusId: getStatusId?.data[0]?.id,
                updatedBy: userData.userId,
                updatedDate: new Date(),
              };
            });

          const res = await updateStatusRows({
            tableName: "tblCfsRequest",
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
          whereCondition: `m.masterListName = 'tblCfsStatusType' AND m.name = 'Reject'`,
        };
        const getStatusId = await getDataWithCondition(payload);

        if (getStatusId) {
          const rowsPayload =
            Array.isArray(ids) &&
            ids.map((info) => {
              return {
                id: info,
                cfsRequestStatusId: getStatusId?.data[0]?.id,
                cfsRejectRemarks: value,
                updatedBy: userData.userId,
                updatedDate: new Date(),
              };
            });

          const res = await updateStatusRows({
            tableName: "tblCfsRequest",
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
    handleRequestAmend: async (ids) => {
      try {
        const payload = {
          columns: "m.id , m.name",
          tableName: "tblMasterData m",
          whereCondition: `m.masterListName = 'tblCfsStatusType' AND m.name = 'Request for Amendment'`,
        };
        const getStatusId = await getDataWithCondition(payload);

        if (getStatusId) {
          const rowsPayload =
            Array.isArray(ids) &&
            ids.map((info) => {
              return {
                id: info,
                cfsRequestStatusId: getStatusId?.data[0]?.id,
                updatedBy: userData.userId,
                updatedDate: new Date(),
              };
            });

          const res = await updateStatusRows({
            tableName: "tblCfsRequest",
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
    handleConfirmAmend: async (ids) => {
      try {
        const payload = {
          columns: "m.id , m.name",
          tableName: "tblMasterData m",
          whereCondition: `m.masterListName = 'tblCfsStatusType' AND m.name = 'Confirm for Amendment'`,
        };
        const getStatusId = await getDataWithCondition(payload);

        if (getStatusId) {
          const rowsPayload =
            Array.isArray(ids) &&
            ids.map((info) => {
              return {
                id: info,
                cfsRequestStatusId: getStatusId?.data[0]?.id,
                updatedBy: userData.userId,
                updatedDate: new Date(),
              };
            });

          const res = await updateStatusRows({
            tableName: "tblCfsRequest",
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
    handleRejectAmend: async (ids, value) => {
      try {
        const payload = {
          columns: "m.id , m.name",
          tableName: "tblMasterData m",
          whereCondition: `m.masterListName = 'tblCfsStatusType' AND m.name = 'Reject for Amendment'`,
        };
        const getStatusId = await getDataWithCondition(payload);

        if (getStatusId) {
          const rowsPayload =
            Array.isArray(ids) &&
            ids.map((info) => {
              return {
                id: info,
                cfsRequestStatusId: getStatusId?.data[0]?.id,
                cfsRejectRemarks: value,
                updatedBy: userData.userId,
                updatedDate: new Date(),
              };
            });

          const res = await updateStatusRows({
            tableName: "tblCfsRequest",
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
    Pending: "#F4B342",
    Reject: "#DC0E0E",
    Request: "#4E61D3",
    Confirm: "green",
    RejectforAmendment: "#BF124D",
    RequestforAmendment: "#393D7E",
    ConfirmforAmendment: "#007E6E",
  };
  return color[status];
}

export function BlRejectModal({ modal, setModal, getData }) {
  function handlerReject() {
    if (modal.value) {
      if (modal.isAmend) {
        cfsStatusHandler(getData).handleRejectAmend(modal.ids, modal.value);
      } else {
        cfsStatusHandler(getData).handleReject(modal.ids, modal.value);
      }
      setModal((prev) => ({ ...prev, toggle: false }));
    } else {
      toast.warn("Please enter remark!");
    }
  }

  return (
    <Dialog
      open={modal.toggle}
      onClose={() => setModal((prev) => ({ ...prev, toggle: false }))}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle>Reject — Add Remarks</DialogTitle>
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
