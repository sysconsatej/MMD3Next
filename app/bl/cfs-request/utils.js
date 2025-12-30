import { fetchForm, getDataWithCondition, updateStatusRows } from "@/apis";
import { formatDataWithForm, formatFetchForm, getUserByCookies } from "@/utils";
import { toast } from "react-toastify";
import { fieldData } from "./fieldsData";

const userData = getUserByCookies();

export const handleBlur = ({
  setFormData,
  formData,
  setDefaultvalues,
  defaultValues,
}) => {
  return {
    getDataBasedonLinerAndBLNo: async (event) => {
      const { value } = event.target;
      if (!value) {
        setFormData((prev) => {
          return {
            ...prev,
            podVoyageId: {},
            podVesselId: {},
            fpdId: {},
            mblDate: "",
          };
        });
        return "";
      }

      if (!formData?.shippingLineId) {
        return toast.error("Please Enter Liner");
      }

      const mblNo = String(value).trim();
      const payload = {
        columns: "b.id",
        tableName: "tblBl b",
        whereCondition: `b.shippingLineId = '${formData?.shippingLineId?.Id}' and locationId='${userData?.location}' and b.mblNo='${mblNo}' and mblHblFlag = 'MBL'`,
      };

      const res = await getDataWithCondition(payload);
      const data = res?.data && res?.data[0];
      const mlBlId = data && data?.id;
      if (mlBlId) {
        setDefaultvalues((prev) => {
          return {
            ...prev,
            mlblId: mlBlId,
          };
        });
        const format = formatFetchForm(
          fieldData,
          "tblBl",
          mlBlId,
          '["tblAttachment"]',
          "blId"
        );
        const { success, result, message, error } = await fetchForm(format);
        if (success) {
          const getData = formatDataWithForm(result, fieldData);
          console.log(getData, " [][[]");
          setFormData((prev) => {
            return {
              ...prev,
              ...getData,
              cfsRequestStatusId: defaultValues?.cfsRequestStatusId || {},
            };
          });
        } else {
          toast.error(error || message);
        }
      }
    },
  };
};

export const handleChange = ({ setFormData, formData, setJsonData }) => {
  return {
    setAttachmentType: async (name, value) => {
      console.log("Sample");
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
    columns: `b.id  , 
b.mblNo as mblNo,
b.mblDate as mblDate,
b.customBrokerText as customBrokerText,
b.consigneeText as consigneeText,
l.name as locationId,
m.name as cfsRequestStatusId,
r.name as cfsTypeId,
p.name as nominatedAreaId,
c.name as  dpdId,
v.name as podVesselId,
vy.voyageNo as podVoyageId,
f.name as fpdId,
c1.name as shippingLineId,
b.createdBy,
c1.name as companyName
`,
    tableName: "tblBl  b",
    pageNo,
    pageSize,
    searchColumn: search.searchColumn,
    searchValue: search.searchValue,
    joins: `left join tblLocation  l on l.id = b.locationId
            left join tblMasterData  m on m.id  =  b.cfsRequestStatusId
            left join tblMasterData r  on r.id  =  b.cfsTypeId  
            left join tblPort p on p.id  =  b.nominatedAreaId
            left join tblPort c  on  c.id  =  b.dpdId
            left join tblVessel  v on  v.id  =  b.podVesselId
            left join tblVoyage vy on vy.id  = b.podVoyageId
            left join tblPort f on f.id  =  b.fpdId
            left join tblCompany c1 on c1.id = b.shippingLineId
            left join tblUser u1 on u1.id = ${userData?.userId}
            left join tblUser u2 on u2.companyId = u1.companyId
            join tblBl b2 on b2.id = b.id and b2.cfsRequestCreatedBy = u2.id and b.cfsRequestStatusId IS NOT NULL and b.locationId = ${userData?.location}`,
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
            tableName: "tblBl",
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
            tableName: "tblBl",
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
    handleReject: async (ids) => {
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
                updatedBy: userData.userId,
                updatedDate: new Date(),
              };
            });

          const res = await updateStatusRows({
            tableName: "tblBl",
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
            tableName: "tblBl",
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
            tableName: "tblBl",
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
    handleRejectAmend: async (ids) => {
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
                updatedBy: userData.userId,
                updatedDate: new Date(),
              };
            });

          const res = await updateStatusRows({
            tableName: "tblBl",
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
