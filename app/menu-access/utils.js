import { getDataWithCondition } from "@/apis";
import { toast } from "react-toastify";

export const fieldsData = {
  dp: [
    {
      label: "Role",
      name: "roleCodeId",
      type: "dropdown",
      tableName: "tblUser",
      displayColumn: "name",
      orderBy: "name",
      foreignTable: "name,tblUser",
      where: "userType = 'R'",
      key: "user",
      changeFun: "getUserGroupBasedonRole",
    },
    {
      label: "SubRole",
      name: "userType",
      type: "dropdown",
      tableName: "tblUser",
      displayColumn: "name",
      orderBy: "name",
      foreignTable: "name,tblUser",
      key: "subRole",
      where: "userType = 'S'",
      selectedConditions: [{ roleCodeId: "roleCodeId" }],
      disabled: true,
    },
  ],
};

export const createHandleChangeEventFunction = ({
  setJsonData,
  setFormData,
  setMenuButtons,
  formData,
}) => {
  return {
    getUserGroupBasedonRole: async (name, value) => {
      if (!value?.Id) {
        setFormData({});
        setMenuButtons((prev) =>
          prev.map((menu) => ({
            ...menu,
            buttons: menu.buttons.map((btn) => ({
              ...btn,
              accessFlag: "N",
              roleId: formData.userType.Id,
            })),
          })),
        );
        return null;
      }

      const reqPayload = {
        columns: `u.name`,
        tableName: "tblUser u",
        whereCondition: `u.roleCodeId=${value?.Id} and u.userType='S'`,
      };

      const res = await getDataWithCondition(reqPayload);

      if (!res.data.length > 0) {
        return toast.error(res?.message);
      }

      setJsonData((prev) => {
        const prevdplFields = prev.dp;
        const upadatedFields = prevdplFields.map((item) => {
          if (item.name === "userType") {
            return { ...item, disabled: false };
          }
          return item;
        });
        return {
          ...prev,
          dp: upadatedFields,
        };
      });
    },
  };
};
