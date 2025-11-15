const fieldData = {
  igmEdiFields: [
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
      displayColumn: "t.voyageNo",
      searchColumn: "t.voyageNo",
      selectedConditions: [{ vesselId: "t.vesselId" }],
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
    {
      label: "FPD",
      name: "fpd",
      type: "dropdown",
      tableName: "tblPort t",
      idColumn: "id",
      displayColumn: "t.name",
      searchColumn: "t.name",
      orderBy: "t.name",
      isEdit: true,
    },
    {
      label: "BL Type",
      name: "typeId",
      type: "dropdown",
      tableName: "tblMasterData m",
      displayColumn: "m.name",
      where: "m.masterListName = 'tblMovementType'",
      orderBy: "m.name",
      foreignTable: "name,tblMasterData",
      isEdit: true,
    },
  ],
};

export default fieldData;
export const metaData = [
  {
    name: "Line No",
    isEdit: true,
  },
];
