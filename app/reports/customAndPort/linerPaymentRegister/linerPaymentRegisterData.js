import { getUserByCookies } from "@/utils";
import { Label } from "@mui/icons-material";
const userData = getUserByCookies();
const fieldData = {
  igmGenerationFields: [
    {
      label: "Customer",
      name: "customerId",
      type: "dropdown",
      tableName: "tblCompany c",
      idColumn: "id",
      displayColumn: "c.name",
      searchColumn: "c.name",
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
      label: "Invoice No",
      name: "invoiceNo",
      type: "text",
      isEdit: true,
    },
    {
      label: "Payment Type",
      name: "paymentModeId",
      type: "dropdown",
      tableName: "tblMasterData m",
      where: "m.masterListName = 'tblPaymentType' AND m.name <> 'Receipt'",
      displayColumn: "m.name",
      foreignTable: "name,tblMasterData",
      isEdit: true,
    },
    {
      label: "Status",
      name: "status",
      type: "dropdown",
      tableName: "tblMasterData m",
      displayColumn: "m.name",
      where: "m.masterListName = 'tblPaymentStatus'",
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
  ],
};
export default fieldData;
export const metaData = [];
