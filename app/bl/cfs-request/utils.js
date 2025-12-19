import { getDataWithCondition } from "@/apis";
import { getUserByCookies } from "@/utils";
import { toast } from "react-toastify";

const userData = getUserByCookies();

export const handleBlur = ({ setFormData, formData }) => {
  return {
    getDataBasedonLinerAndBLNo: async (event) => {
      const {  name  , value }   =  event.target;
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
      }

      if (!formData?.shippingLineId) {
        return toast.error("Please Enter Liner");
      }

      const mblNo = String(value).trim();
      const payload = {
        columns:
          "b.mblDate, v.name as vesselName , v.id as  vesselId  , vy.voyageNo as voyageNo, vy.id as voyageId, p.name as portName,p.id as portId",
        tableName: "tblBl b",
        whereCondition: `b.shippingLineId = '${formData?.shippingLineId?.Id}' and b.mblNo='${mblNo}'`,
        joins:
          "left join tblVessel v on v.id = b.podVesselId left join tblVoyage vy on vy.id = b.podVoyageId  left join tblPort  p on p.id  = b.fpdId",
      };

      const res = await getDataWithCondition(payload);
      const data = res?.data && res?.data[0];
      const setObj = {
        podVoyageId: { Id: data?.voyageId, Name: data?.voyageNo },
        podVesselId: { Id: data?.vesselId, Name: data?.vesselName },
        fpdId: { Id: data?.portId, Name: data?.portName },
        mblDate: data?.mblDate,
      };
      setFormData((prev) => {
        return {
          ...prev,
          ...setObj,
        };
      });
    },
  };
};
