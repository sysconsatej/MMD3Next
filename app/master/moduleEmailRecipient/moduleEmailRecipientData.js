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
      label: "Customer Name",
      name: "companyId",
      type: "dropdown",
      tableName: "tblCompany c",
      idColumn: "id",
      displayColumn: "c.name",
      searchColumn: "c.name",
      joins: `join tblCompanySubtype cs on cs.companyId = c.id join tblUser u2 on u2.id = cs.subTypeId and u2.roleCode = 'customer'`,
      orderBy: "c.name",
      foreignTable: "name,tblCompany",
      isEdit: true,
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
