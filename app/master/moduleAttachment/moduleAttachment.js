import { getUserByCookies } from "@/utils";

const userData = getUserByCookies();
const fieldData = {
  countryFields: [
    {
      label: "Shipping Line",
      name: "shippingLineId",
      type: "dropdown",
      isEdit: true,
      tableName: "tblCompany c",
      displayColumn: "c.name",
      orderBy: "c.name",
      foreignTable: "name,tblCompany",
      where:
        userData?.roleCode === "shipping"
          ? `c.id  = '${userData?.companyId}'`
          : "",
    },
    {
      label: "Module Name ",
      name: "moduleId",
      type: "dropdown",
      tableName: "tblMasterData m",
      displayColumn: "m.name",
      where: "m.masterListName = 'tblModuleAttachment'",
      orderBy: "m.name",
      isEdit: true,
      foreignTable: "name,tblMasterData",
    },
    {
      label: "Module Attachment Name ",
      name: "attachmentId",
      type: "multiselectCheckBox",
      tableName: "tblMasterData m",
      displayColumn: "m.name",
      joins: `left join tblMasterData m3 on 1=1 join tblMasterData m2 on m.id = m2.id  and m2.masterListName = m3.code`,
      selectedConditions: [{ moduleId: "m3.id" }],
      orderBy: "m.name",
      isEdit: true,
      // foreignTable: ",tblMasterData",
    },
  ],
};

export const country = [
  { label: "Shipping Line", value: "line.name" },
  { label: "Location", value: "l.name" },
  { label: "Module", value: "master1.name" },
  { label: "Attachments", value: "master2.name" },
  { label: "Updated By", value: "u.name" },
];

export default fieldData;
