import { getUserByCookies } from "@/utils";
import { Label } from "@mui/icons-material";
const userData = getUserByCookies();
const fieldData = {
  igmGenerationFields: [
    {
      label: "Liner",
      name: "shippingLineId",
      type: "dropdown",
      tableName: "tblCompany c",
      idColumn: "id",
      displayColumn: "c.name",
      searchColumn: "c.name",
      joins: `join tblCompanySubtype cs on cs.companyId = c.id join tblUser u2 on u2.id = cs.subTypeId and u2.roleCode = 'shipping'`,
      orderBy: "c.name",
      isEdit: true,
    },
    {
      label: "Bl No",
      name: "blNo",
      type: "text",
      isEdit: true,
    },

    {
      label: "Status",
      name: "status",
      type: "dropdown",
      tableName: "tblMasterData m",
      displayColumn: "m.name",
      where: "m.masterListName = 'tblInvoiceRequest'",
      orderBy: "m.name",
      isEdit: true,
    },
    {
      label: "From Date",
      name: "fromDate",
      type: "date",
      isEdit: true,
    },
    {
      label: "To Date ",
      name: "toDate",
      type: "date",
      isEdit: true,
    },
    {
      label: "Location",
      name: "locationId",
      type: "multiselectCheckBox",
      tableName: "tblLocation l",
      displayColumn: "l.name",
      foreignTable: "name,tblLocation",
      orderBy: "l.name",
      where: `id in (${userData?.locations})`,
      isEdit: true,
    },
  ],
};
export default fieldData;
export const metaData = [];
