import { getUserByCookies } from "@/utils";

const userData = getUserByCookies();

const fieldData = {
  vesselSummaryReportFields: [
    {
      label: "Vessel",
      name: "vesselId",
      type: "dropdown",
      tableName: "tblVessel t",
      changeFun: "handleChangeOnVessel",
      idColumn: "id",
      displayColumn: "t.name",
      searchColumn: "t.name",
      orderBy: "t.name",
      isEdit: true,
    },

    {
      label: "Voyage",
      name: "voyageId",
      type: "dropdown",
      tableName: "tblVoyage t",
      idColumn: "id",
      changeFun: "handleDropdownChange",
      displayColumn: "t.voyageNo",
      searchColumn: "t.voyageNo",
      selectedConditions: [{ vesselId: "vesselId" }],
      where: `t.status = 1 and t.companyid = ${userData?.companyId}`,
      orderBy: "t.voyageNo",
      isEdit: true,
    },
   {
      label: "Location",
      name: "podId",
      type: "dropdown",
      tableName: "tblPort p",
      displayColumn: "p.name",
      changeFun: "handleDropdownChange",
      joins: `join tblMasterData d on p.portTypeId = d.id and d.name = 'SEA PORT' join tblVoyageRoute v on v.portOfCallId = p.id`,
      selectedConditions: [{ voyageId: "v.voyageId" }],
      searchColumn: "p.name",
      orderBy: "p.name",
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
