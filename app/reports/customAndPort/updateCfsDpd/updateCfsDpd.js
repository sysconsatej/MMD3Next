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
      selectedConditions: [{ "vessel": "vesselId" }],
      orderBy: "t.voyageNo",
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
    isEdit: true
  },
  {
    name: "DPD Description",
    type: "dropdown",
    isEdit: "true",
  },
  {
    name: "Third CFS Description",
    type: "dropdown",
    isEdit: "true",
  },
];
