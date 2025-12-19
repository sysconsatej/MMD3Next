import { fetchForm, getDataWithCondition } from "@/apis";
import { formatDataWithForm, formatFetchForm, getUserByCookies } from "@/utils";
import { toast } from "react-toastify";
import { fieldData } from "./fieldsData";

const userData = getUserByCookies();

export const handleBlur = ({ setFormData, formData, setMblId }) => {
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
        whereCondition: `b.shippingLineId = '${formData?.shippingLineId?.Id}' and b.mblNo='${mblNo}'`,
      };

      const res = await getDataWithCondition(payload);
      const data = res?.data && res?.data[0];
      const mlBlId = data && data?.id;
      if (mlBlId) {
        setMblId(mlBlId)
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
          setFormData(getData);
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
      console.log(value);
      if (!value?.Id) return;

      const payload = {
        columns: "m.name Name , m.id  Id",
        tableName: "tblMasterData m",
        whereCondition: `m.masterListName = 'tblCfsAttachmentType' `,
      };

      const data = await getDataWithCondition(payload);
      console.log(data);
      // setFormData((prev)  =>  {
      //   return  {
      //     ...prev,
      //     tblAttachment: data,
      //   }
      // })
    },
  };
};
