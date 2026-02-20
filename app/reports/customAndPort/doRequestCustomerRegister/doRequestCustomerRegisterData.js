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
      label: "IGM No",
      name: "igmNo",
      type: "text",
      isEdit: true,
    },

    {
      label: "Status",
      name: "status",
      type: "dropdown",
      tableName: "tblMasterData m",
      displayColumn: "m.name",
      where: "m.masterListName = 'tblDoStatus'",
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
