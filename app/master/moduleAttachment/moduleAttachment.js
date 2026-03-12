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
    },
    {
      label: "Module Attachment Name ",
      name: "attachmentId",
      type: "multiselectCheckBox",
      tableName: "tblMasterData m",
      displayColumn: "m.name",
      joins:`left join tblMasterData m3 on 1=1 join tblMasterData m2 on m.id = m2.id  and m2.masterListName = m3.code`,
      selectedConditions:[{moduleId:"m3.id"}],
      orderBy: "m.name",
      isEdit: true,
    },
  ],
};

export const country = [
  { label: "Shipping Line", value: "s.name" },
  { label: "ISO Code", value: "iso.isocode" },
  { label: "Line ISO Code", value: "i.lineIsoCode" },
  { label: "Updated By", value: "u4.name" },
];

export default fieldData;
