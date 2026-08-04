import { getUserByCookies } from "@/utils";

const userData = getUserByCookies();

const fieldData = {
  slabWiseReportFields: [
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
      label: "Type Of Delivery ",
      name: "deliveryTypeId",
      type: "dropdown",
      tableName: "tblMasterData m",
      idColumn: "id",
      displayColumn: "m.name",
      searchColumn: "m.name",
      orderBy: "m.name",
      where:
        "m.masterListName = 'tblStuffingDestuffingType' and m.name in ('Dock','Factory')",
    },
  ],
};
export default fieldData;
export const metaData = [];
