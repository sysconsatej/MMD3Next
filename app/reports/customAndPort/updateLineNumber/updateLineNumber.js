const fieldData = {
  igmEdiFields: [
    {
      label: "Vessel",
      name: "vessel",
      type: "dropdown",
      tableName: "tblVessel t",
      idColumn: "id",
      displayColumn: "t.name",
      searchColumn: "t.name",
      orderBy: "t.name",
      labelType: "vessel",
      isEdit: true
    },
    {
      label: "Voyage",
      name: "voyage",
      type: "dropdown",
      tableName: "tblVoyage t",
      idColumn: "id",
      displayColumn: "t.voyageNo",
      searchColumn: "t.voyageNo",
      orderBy: "t.voyageNo",
      selectedCondition: "vessel",
      where: "(@selectedCondition IS NULL OR t.vesselId = @selectedCondition)",
      labelType: "voyage",
      isEdit: true
    },
    {
      label: "POD",
      name: "pod",
      type: "dropdown",
      tableName: "tblPort t",
      idColumn: "id",
      displayColumn: "t.name",
      searchColumn: "t.name",
      orderBy: "t.name",
      labelType: "pod",
      isEdit: true
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
      labelType: "pod",
      isEdit: true
    },
    {
      label: "BL Type",
      name: "typeId",
      type: "dropdown",
      tableName: "tblMasterData m",
      displayColumn: "m.name",
      where: "m.masterListName = 'tblType'",
      orderBy: "m.name",
      labelType: "name,tblType",
      foreignTable: "name,tblMasterData",
      isEdit: true
    },
  ],
};

export default fieldData;
export const metaData = [
  {
    name: "itemNo",
    isEdit: true,
  },
  {
    name: "Nominated Area",
    type: "dropdown",
    labelType: "port",
    isEdit: "true",
  },
  {
    name: "DPD Desciption",
    type: "dropdown",
    labelType: "port",
    isEdit: "true",
  },
  {
    name: "Third CFS Desciption",
    type: "dropdown",
    labelType: "port",
    isEdit: "true",
  },
];
