import { fetchForm, getDataWithCondition } from "@/apis";
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
        whereCondition: `b.shippingLineId = '${formData?.shippingLineId?.Id}' and locationId='${userData?.location}' and b.mblNo='${mblNo}'`,
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

export const handleChange = ({ setFormData, formData }) => {
  return {
    setAttachmentType: async (name, value) => {
      console.log("Sample");
    },
  };
};

export const tableObj = ({ pageNo, pageSize, search }) => {
  const payload = {
    columns: `b.id  , 
b.mblNo as mblNo,
b.mblDate as mblDate,
b.customBrokerText as customBrokerText,
b.consigneeText as consigneeName,
l.name as locationId,
m.name as cfsRequestStatusId,
r.name as cfsTypeId,
p.name as nominatedAreaId,
c.name as  dpdId,
v.name as podVesselId,
vy.voyageNo as podVoyageId,
f.name as fpdId,
c1.name as shippingLineId
`,
    tableName: "tblBl  b",
    pageNo,
    pageSize,
    searchColumn: search.searchColumn,
    searchValue: search.searchValue,
    joins: `left join tblLocation  l on l.id = '${userData?.location}'
join tblMasterData  m on m.id  =  b.cfsRequestStatusId  and b.cfsRequestStatusId IS NOT NULL
left join tblMasterData r  on r.id  =  b.cfsTypeId  
left join tblPort p on p.id  =  b.nominatedAreaId
left join tblPort c  on  c.id  =  b.dpdId
left join tblVessel  v on  v.id  =  b.podVesselId
left join tblVoyage vy on vy.id  = b.podVoyageId
left join tblPort f on f.id  =  b.fpdId
left join tblUser u1 on u1.id=b.createdBy
left join tblCompany c1 on c1.id =u1.companyId`,
  };
  return payload;
};
