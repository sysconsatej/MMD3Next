import { getUserByCookies } from "@/utils";
const userData = getUserByCookies();
const fieldData = {
  igmGenerationFields: [
    {
      label: "Vessel",
      name: "vesselId",
      type: "dropdown",
      tableName: "tblVessel t",
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
      where: `t.status = 1`,
      orderBy: "t.voyageNo",
      isEdit: true,
    },
    {
      label: "POD",
      name: "podId",
      type: "dropdown",
      tableName: "tblPort p",
      displayColumn: "p.name",
      joins: `join tblMasterData d on p.portTypeId = d.id and d.name = 'SEA PORT' join tblVoyageRoute v on v.portOfCallId = p.id`,
      selectedConditions: [{ voyageId: "v.voyageId" }],
      searchColumn: "p.name",
      orderBy: "p.name",
      isEdit: true,
    },
  ],
};
export default fieldData;
export const metaData = [];
