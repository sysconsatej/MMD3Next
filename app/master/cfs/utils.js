import { getDataWithCondition } from "@/apis";
import { getUserByCookies } from "@/utils";
import { toast } from "react-toastify";

const userData = getUserByCookies();

export async function initialHandler({ setFormData, mode }) {
  const obj = {
    columns: "id",
    tableName: "tblMasterData",
    whereCondition:
      "name = 'CONTAINER FREIGHT STATION' and masterListName = 'tblPortType' and status = 1",
  };

  const { data, message, error, success } = await getDataWithCondition(obj);
  if (success) {
    setFormData((prev) => ({
      ...prev,
      portTypeId: data?.[0].id,
      companyId: userData?.companyId,
    }));
  } else {
    toast.error(error || message);
  }

  const obj2 = {
    columns: `p.id as Id, p.name as Name`,
    tableName: "tblPort p",
    joins: `JOIN tblMasterData m ON m.id = p.portTypeId JOIN tblCountry c ON c.id = p.countryId left JOIN tblLocation l on l.id = ${userData.location}`,
    whereCondition: `m.name IN ('SEA PORT','INLAND PORT') and p.name = l.name `,
  };
  const {
    data: data1,
    message: message1,
    error: error1,
    success: success1,
  } = await getDataWithCondition(obj2);

  if (success1 && mode.mode !== "edit" && mode.mode !== "view") {
    setFormData((prev) => ({
      ...prev,
      referencePortId: data1?.[0],
    }));
  }
}

export const handleBlur = ({ mode, setErrorState, setFormData, formData }) => {
  const blurFun = {
    duplicateHandler: async (event) => {
      const { name, value } = event.target;
      const normalized = String(value ?? "").trim();

      if (!normalized) return true;

      const literal = normalized.replace(/'/g, "''");

      console.log(
        "formData?.referencePortId?.Id",
        formData?.referencePortId?.Id,
      );

      let whereDup = `
      ${name} = '${literal.toUpperCase()}'
      AND portTypeId IN (
        SELECT id FROM tblMasterData WHERE name = 'CONTAINER FREIGHT STATION'
      )
      AND companyId = ${userData?.companyId} and referencePortId = ${formData?.referencePortId?.Id} AND status = 1
    `;

      if (mode?.formId) {
        whereDup += ` AND id <> ${mode.formId}`;
      }

      const obj = {
        columns: "id",
        tableName: "tblPort",
        whereCondition: whereDup,
      };

      const resp = await getDataWithCondition(obj);

      const isDuplicate =
        resp?.success === true ||
        (Array.isArray(resp?.data) && resp.data.length > 0);

      if (isDuplicate) {
        setErrorState((prev) => ({ ...prev, [name]: true }));
        setFormData((prev) => ({ ...prev, [name]: "" }));
        toast.error(`Duplicate ${name}!`);
        return false;
      }

      setFormData((prev) => ({ ...prev, [name]: normalized }));
      setErrorState((prev) => ({ ...prev, [name]: false }));
      return true;
    },
    validatePanCard: (e) => {
      const value = e.target.value;
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      if (value !== String(value).toUpperCase()) {
        setFormData((prev) => ({ ...prev, panNo: null }));
        return toast.error("Pan card should be always in caps");
      }

      if (panRegex.test(value)) {
        return true;
      } else {
        setFormData((prev) => ({ ...prev, panNo: null }));
        return toast.error("Pan Number is invalid ");
      }
    },
    validateCustomCode: (e) => {
      const { name, value } = e.target;
      const alphaNumeric10Regex = /^[A-Za-z0-9]{10}$/;

      if (!alphaNumeric10Regex.test(String(value ?? "").trim())) {
        setFormData((prev) => ({ ...prev, [name]: "" })); // or null if you want
        setErrorState((prev) => ({ ...prev, [name]: true }));
        toast.error("Code must be exactly 10 alphanumeric characters");
        return false;
      }

      setErrorState((prev) => ({ ...prev, [name]: false }));
      return true;
    },
    duplicateHandler_ediPortCode: async (e) => {
      const ok = blurFun.validateCustomCode(e);
      if (!ok) return false;
      return await blurFun.duplicateHandler(e);
    },
  };

  return blurFun;
};

export const handleChange = ({ setJsonData }) => {
  return {
    onReferencePortChange: (name, value, { setFormData }) => {
      setJsonData((prev) => {
        const updateTblPortDetails = prev.tblPortDetails.map((field) => {
          if (field.name === "berthId") {
            return {
              ...field,
              where: `m.name IN ('PORT TERMINAL') and p.referencePortId = ${value?.Id}`,
            };
          }
          return field;
        });

        return {
          ...prev,
          tblPortDetails: updateTblPortDetails,
        };
      });
    },
  };
};
