const fieldData = {
  isoCodeFields: [
    {
      label: "ISO Code",
      name: "isocode",
      isEdit: "true",
      required: "true",
    },
    {
      label: "Size",
      name: "sizeId",
      type: "dropdown",
      tableName: "tblMasterData m",
      displayColumn: "m.name",
      where: "m.masterListName = 'tblSize'",
      orderBy: "m.name",
      labelType: "size",
      foreignTable: "name,tblMasterData",
      isEdit: true,
      required: true,
    },
    {
      label: "Type",
      name: "typeId",
      type: "dropdown",
      tableName: "tblMasterData m",
      displayColumn: "m.name",
      where: "m.masterListName = 'tblType'",
      orderBy: "m.name",
      labelType: "type",
      foreignTable: "name,tblMasterData",
      isEdit: true,
      required: true,
    },
  ],
};

export const isoCode = [
  { label: "IsoCode", value: "i.isoCode" },
  { label: "Size", value: "sizeData.name" },
  { label: "Type", value: "typeData.name" },
];

export default fieldData;
