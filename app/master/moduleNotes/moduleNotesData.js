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
      where: "m.masterListName = 'tblModuleNote'",
      orderBy: "m.name",
      isEdit: true,
    },
    {
      label: "Notes",
      name: "notes",
      type: "textarea",
      gridColumn: "col-span-2 row-span-1 ",
      isEdit: true,
    },
  ],
};

export const country = [
  { label: "Shipping Line", value: "s.name" },
  { label: "Location", value: "l.name" },
  { label: "Module", value: "mas.name" },
  { label: "Note", value: "m.notes" },
  { label: "Updated By", value: "u4.name" },
];

export default fieldData;
