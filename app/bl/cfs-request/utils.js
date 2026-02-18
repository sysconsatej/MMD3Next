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
let deliveryTypeCache = null;

export const handleChange = ({ setFormData, formData, setJsonData }) => {
  return {
    setCfsType: async (name, value) => {
      try {
        let setWhere = "";
        if (value.Name === "Liner Empanelled CFS") {
          setWhere = `left join tblLocation l on l.id = ${userData?.location} left join tblPort p2 on p2.id = p.referencePortId left join tblCountry c on c.id = p2.countryId left join tblMasterData m2 on m2.id = p2.portTypeId and m2.name IN ('SEA PORT','INLAND PORT') join tblMasterData m on m.id = p.portTypeId and m.masterListName = 'tblPortType' and m.code = 'CFS' and p.companyId = ${formData?.shippingLineId?.Id} and p.cfsTypeId = ${value?.Id} and l.name = p2.name`;
        } else {
          setWhere = `left join tblLocation l on l.id = ${userData?.location} left join tblPort p2 on p2.id = p.referencePortId left join tblCountry c on c.id = p2.countryId left join tblMasterData m2 on m2.id = p2.portTypeId and m2.name IN ('SEA PORT','INLAND PORT') join tblMasterData m on m.id = p.portTypeId and m.masterListName = 'tblPortType' and m.code = 'CFS' and p.companyId = ${formData?.shippingLineId?.Id} and p.cfsTypeId = ${value?.Id} and l.name = p2.name`;
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
          }),
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

    setDpdMandatoryFields: async (name, value) => {
      try {
        if (!deliveryTypeCache) {
          const payload = {
            columns: "m.id as Id, m.name as Name",
            tableName: "tblMasterData m",
            whereCondition: `m.masterListName = 'tblDeliveryType' AND m.status = 1`,
          };

          const resp = await getDataWithCondition(payload);
          if (!resp?.success || !Array.isArray(resp?.data)) {
            toast.error(resp?.message || "Unable to load Delivery Types");
            return;
          }
          deliveryTypeCache = resp.data;
        }

        const selected = deliveryTypeCache.find((x) => x.Id === value?.Id);
        const dt = String(selected?.Name || value?.Name || "")
          .trim()
          .toUpperCase()
          .replace(/\s+/g, "")
          .replace(/-/g, "_");

        const rules = {
          CFS: {
            cfsTypeId: true,
            nominatedAreaId: true,
            dpdId: false,
            sezIcd: false,
          },
          "DPD/DPD": {
            cfsTypeId: false,
            nominatedAreaId: false,
            dpdId: true,
            sezIcd: false,
          },
          "DPD/CFS": {
            cfsTypeId: true,
            nominatedAreaId: true,
            dpdId: true,
            sezIcd: false,
          },
          "DPD/SEZ": {
            cfsTypeId: false,
            nominatedAreaId: false,
            dpdId: true,
            sezIcdId: true,
          },
          "DPD/SEZ/CFS": {
            cfsTypeId: true,
            nominatedAreaId: true,
            dpdId: true,
            sezIcdId: true,
          },
          "ICD/SEZ": {
            cfsTypeId: false,
            nominatedAreaId: false,
            dpdId: false,
            sezIcdId: true,
          },
        };

        const key = rules[dt]
          ? dt
          : rules[dt.replace("_", "/")]
            ? dt.replace("_", "/")
            : rules[dt.replace(/\//g, "_")]
              ? dt.replace(/\//g, "_")
              : dt;

        const req = rules[key] || {
          cfsTypeId: false,
          nominatedAreaId: false,
          dpdId: false,
          sezIcdId: false,
        };

        setJsonData((prev) => {
          const fields = prev.fields.map((f) => {
            if (!f?.name) return f;

            if (f.name === "cfsTypeId")
              return { ...f, required: !!req.cfsTypeId };
            if (f.name === "nominatedAreaId")
              return { ...f, required: !!req.nominatedAreaId };
            if (f.name === "dpdId") return { ...f, required: !!req.dpdId };
            if (f.name === "sezIcdId")
              return { ...f, required: !!req.sezIcdId };

            return f;
          });

          return { ...prev, fields };
        });

        const clearIfNotRequired = (fieldName) => {
          if (!req[fieldName]) {
            setFormData((prevData) =>
              setInputValue({
                prevData,
                tabName: null,
                gridName: null,
                tabIndex: null,
                containerIndex: null,
                name: fieldName,
                value: null,
              }),
            );
          }
        };

        clearIfNotRequired("cfsTypeId");
        clearIfNotRequired("nominatedAreaId");
        clearIfNotRequired("dpdId");
        clearIfNotRequired("sezIcdId");
      } catch (error) {
        console.log("setDpdMandatoryFields error", error);
        toast.error(
          "Something went wrong while applying Delivery Type mandatory rules",
        );
      }
    },
  };
};

export const handleBlur = ({ setErrorState, setFormData, mode }) => {
  return {
    duplicateHandler: async (event) => {
      const { name, value } = event.target;

      // only run for blNo
      if (name !== "blNo") return true;

      const normalized = String(value ?? "").trim();
      if (!normalized) return true;

      const literal = normalized.replace(/'/g, "''");

      let whereDup = `
          blNo = '${literal.toUpperCase()}'
          AND companyId = ${userData?.companyId}
          AND status = 1
        `;

      // exclude current record while edit
      if (mode?.formId) {
        whereDup += ` AND id <> ${mode.formId}`;
      }

      const obj = {
        columns: "id",
        tableName: "tblCfsRequest",
        whereCondition: whereDup,
      };

      const resp = await getDataWithCondition(obj);

      const isDuplicate = Array.isArray(resp?.data) && resp.data.length > 0;

      if (isDuplicate) {
        setErrorState((prev) => ({ ...prev, blNo: true }));
        setFormData((prev) => ({ ...prev, blNo: "" }));
        toast.error("Duplicate BL No!");
        return false;
      }

      setErrorState((prev) => ({ ...prev, blNo: false }));
      setFormData((prev) => ({ ...prev, blNo: normalized.toUpperCase() }));
      const blId = await getBlIdIfExists({
        blNo: normalized,
        shippingLineId: formData?.shippingLineId?.Id,
        locationId: userData?.location,
      });

      setFormData((prev) => ({
        ...prev,
        blId: blId,
      }));
      return true;
    },
  };
};

export function advanceSearchFilter(advanceSearch) {
  if (Object.keys(advanceSearch).length <= 0) return null;
  const condition = [];

  if (advanceSearch?.blNo) {
    condition.push(`b.blNo = '${advanceSearch?.blNo}'`);
  }

  if (advanceSearch?.cfsRequestStatusId) {
    condition.push(
      `b.cfsRequestStatusId in (${advanceSearch?.cfsRequestStatusId
        .map((item) => item.Id)
        .join(",")})`,
    );
  }

  if (advanceSearch.shippingLineId) {
    condition.push(
      `b.shippingLineId in (${advanceSearch.shippingLineId
        .map((item) => item.Id)
        .join(",")})`,
    );
  }

  if (advanceSearch.nominatedAreaId) {
    condition.push(
      `b.nominatedAreaId in (${advanceSearch.nominatedAreaId
        .map((item) => item.Id)
        .join(",")})`,
    );
  }

  if (advanceSearch?.companyId) {
    condition.push(
      `c1.name in (${advanceSearch?.companyId
        .map((item) => `'${item.Name}'`)
        .join(",")})`,
    );
  }

  return condition.length > 0 ? condition.join(" and ") : null;
}

export const tableObj = ({ pageNo, pageSize, advanceSearch }) => {
  const payload = {
    columns: `
      b.id,
      l.name AS locationId,
      c1.name AS shippingLineName,
      b.blNo,
      r.name AS cfsType,
      d.name AS deliveryType,
      ISNULL(p.code,'') + ' - ' + ISNULL(p.name,'') AS nominatedArea,
      ISNULL(c.code,'') + ' - ' + ISNULL(c.name,'') AS dpdId,
      b.customBrokerText,
      m.name AS cfsRequestStatusId,
      ISNULL(Icd.code,'') + ' - ' + ISNULL(Icd.name,'') AS sezIcd,
      b.cfsRejectRemarks AS remark
    `,
    tableName: "tblCfsRequest b",
    pageNo,
    pageSize,
    advanceSearch: advanceSearchFilter(advanceSearch),
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
      left join tblMasterData d on d.id = b.deliveryTypeId
      left join tblPort Icd on Icd.id = b.sezIcdId

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
    handleRequestAmend: async (ids, value) => {
      try {
        const payload = {
          columns: "m.id , m.name",
          tableName: "tblMasterData m",
          whereCondition: `
        m.masterListName = 'tblCfsStatusType'
        AND m.name = 'Request for Amendment'
      `,
        };

        const getStatusId = await getDataWithCondition(payload);

        if (getStatusId) {
          const rowsPayload =
            Array.isArray(ids) &&
            ids.map((info) => {
              return {
                id: info,
                cfsRequestStatusId: getStatusId?.data[0]?.id,
                cfsRequestRemarks: value, // 🔥 ADD THIS
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
            toast.success("Request for Amendment sent successfully!");
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
    if (!modal.value) {
      toast.warn("Please enter remark!");
      return;
    }

    const handler = cfsStatusHandler(getData);

    switch (modal.actionType) {
      case "REQUEST_AMEND":
        handler.handleRequestAmend(modal.ids, modal.value);
        break;

      case "REJECT_AMEND":
        handler.handleRejectAmend(modal.ids, modal.value);
        break;

      case "REJECT":
      default:
        handler.handleReject(modal.ids, modal.value);
        break;
    }

    setModal((prev) => ({ ...prev, toggle: false }));
  }

  return (
    <Dialog
      open={modal.toggle}
      onClose={() => setModal((prev) => ({ ...prev, toggle: false }))}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle>
        {modal.actionType === "REQUEST_AMEND"
          ? "Request for Amendment — Add Remarks"
          : "Reject — Add Remarks"}
      </DialogTitle>

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
        "m.masterListName = 'tblCfsStatusType' AND m.name = 'Request'",
    };

    const statusRes = await getDataWithCondition(statusPayload);
    const requestStatusId = statusRes?.data?.[0]?.Id;

    if (!requestStatusId) {
      toast.error("Request status missing in master");
      return;
    }

    if (!formData?.blNo) {
      toast.error("BL No is required before sending Request");
      return;
    }

    const checkPayload = {
      columns: "id",
      tableName: "tblCfsRequest",
      whereCondition: `
        blNo = '${formData?.blNo}'
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
          "CFS Request record not found. Please submit first.",
      );
      return;
    }
    const rowsPayload = data.map((row) => ({
      id: row.id,
      cfsRequestStatusId: requestStatusId,
      updatedBy: userData.userId,
      updatedDate: new Date(),
    }));
    const res = await updateStatusRows({
      tableName: "tblCfsRequest",
      keyColumn: "id",
      rows: rowsPayload,
    });
    if (res?.success) {
      toast.success("CFS Request sent successfully!");
      setDisableRequest(true);
    } else {
      toast.error(res?.message || "Error while sending CFS Request");
    }
  } catch (err) {
    console.error(err);
    toast.error("Something went wrong while requesting CFS");
  }
}

export const getBlIdIfExists = async ({ blNo, shippingLineId, locationId }) => {
  const resp = await getDataWithCondition({
    columns: "b.id",
    tableName: "tblBl b",
    whereCondition: `
      isNull(b.mblNo,b.hblNo) = '${blNo.toUpperCase()}'
      AND b.shippingLineId = ${shippingLineId}
      AND b.locationId = ${locationId}
      AND b.status = 1 AND b.mblHblFlag='mbl'
    `,
  });

  if (!Array.isArray(resp?.data) || resp.data.length === 0) {
    return null;
  }

  return resp.data[0].id;
};

export const checkMblActive = async (blNo, shippingLineId) => {
  try {
    const obj = {
      columns: `active`,
      tableName: "tblBl",
      whereCondition: `mblNo = '${blNo}' and status = 1 and mblHblFlag = 'MBL' and shippingLineId = ${shippingLineId?.Id}`,
    };
    const { data } = await getDataWithCondition(obj);
    if (data?.[0]?.active === false) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.log(error);
  }
};
