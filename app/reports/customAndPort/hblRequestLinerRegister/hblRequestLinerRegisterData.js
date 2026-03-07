import { getUserByCookies } from "@/utils";
import { Label } from "@mui/icons-material";
const userData = getUserByCookies();
const fieldData = {
  igmGenerationFields: [
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
      where: "m.masterListName = 'tblHblStatus'",
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
