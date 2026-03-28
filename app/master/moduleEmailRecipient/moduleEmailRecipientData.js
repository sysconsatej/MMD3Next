import { getUserByCookies } from "@/utils";

const userData = getUserByCookies();
const fieldData = {
  countryFields: [
    {
      label: "Company Name",
      name: "companyId",
      type: "dropdown",
      isEdit: true,
      tableName: "tblCompany c",
      displayColumn: "c.name",
      orderBy: "c.name",
      foreignTable: "name,tblCompany",
      where: `c.id  = '${userData?.companyId}'`,
    },
    {
      label: "Email Report",
      name: "emailReportId",
      type: "dropdown",
      tableName: "tblMasterData m",
      displayColumn: "m.name",
      where: "m.masterListName = 'tblModuleEmailRecipient'",
      orderBy: "m.name",
      foreignTable: "name,tblMasterData",
      isEdit: true,
    },
    {
      label: "Email Id",
      name: "emailId",
      isEdit: true,
    },
    {
      label: "Email CC",
      name: "emailcc",
      type: "textarea",
      gridColumn: "col-span-2 row-span-1 ",
      isEdit: true,
    },
  ],
};

export const country = [
  { label: "Shipping Line", value: "line.name" },
  { label: "Customer", value: "customer.name" },
  { label: "Email Report", value: "mas.name" },
  { label: "Location", value: "l.name" },
  { label: "Updated By", value: "u.name" },
];

export default fieldData;
