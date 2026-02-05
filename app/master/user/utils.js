import { toast } from "react-toastify";

export const createHandleChangeFunc = ({ setJsonData, formData }) => {
  return {
    getUserGroupBasedonRole: (name, value) => {
      if (!value?.Id) return "";

      setJsonData((prev) => {
        const tblUserRoleMapping = prev?.tblUserRoleMapping;
        const updatedFields = tblUserRoleMapping?.map((info) => {
          return {
            ...info,
            where: `u.userType = 'S' and roleCodeId =  ${value?.Id} `,
          };
        });
        return { ...prev, tblUserRoleMapping: updatedFields };
      });
    },
    changeDuplicateValue: (name  , value) => {
      if (!value) return null;
      const arrToCheck = formData?.tblUserRoleMapping?.length  >  0  ?  formData?.tblUserRoleMapping :  [];
      if(!arrToCheck)  return  null;
      const isDuplicateExists  =  arrToCheck?.filter((info)  =>  info?.roleId  === value?.Id)
      if(isDuplicateExists)  {
        return  toast.error("You already selected Sub Role")
      }
    },
  };
};
