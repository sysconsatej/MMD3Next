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
      selectedCondition: "vessel",
      where: "(@selectedCondition IS NULL OR t.vesselId = @selectedCondition)",
      orderBy: "t.voyageNo",
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
    {
      label: "Nominated Area Code",
      name: "nominatedAreaCode",
      type: "dropdown",
      tableName: "tblPort t",
      idColumn: "id",
      displayColumn: "ISNULL(t.code,'') + ' - ' + ISNULL(t.name,'')",
      searchColumn: "t.code, t.name",
      orderBy: "t.code, t.name",
      labelType: "port",
      isEdit: true
    },
    {
      label: "Dpd Code",
      name: "dpdCode",
      type: "dropdown",
      tableName: "tblPort t",
      idColumn: "id",
      displayColumn: "t.code",
      searchColumn: "t.code, t.name",
      orderBy: "t.code",
      labelType: "port",
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
    label: "Nominated Area",
    name: "nominatedArea",
    type: "dropdown",
    tableName: "tblPort t",
    idColumn: "id",
    displayColumn: "t.name",
    searchColumn: "t.name",
    orderBy: "t.name",
    labelType: "port",
    isEdit: true
  },
  {
    name: "DPD Description",
    type: "dropdown",
    labelType: "port",
    isEdit: "true",
  },
  {
    name: "Third CFS Description",
    type: "dropdown",
    labelType: "port",
    isEdit: "true",
  },
];
