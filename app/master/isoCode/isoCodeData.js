const fieldData = {
  isoCodeFields: [
    {
      label: "Size",
      name: "sizeId",
      type: "dropdown",
      tableName: "tblMasterData m",
      displayColumn: "m.name",
      where: "m.masterListName = 'tblSize'",
      orderBy: "m.name",
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
      foreignTable: "name,tblMasterData",
      isEdit: true,
      required: true,
    },
    {
      label: "IAL ISO Code",
      name: "isocode",
      isEdit: true,
      required: true,
      blurFun: "isoCodeSizeGate", // ← add this
    },
    {
      label:"IGM ISO Code",
      name:"igmIsoCode",
      isEdit:true,
    }
  ],
};

export const isoCode = [
  { label: "IAL ISO Code", value: "i.isoCode" },
  { label: "Size", value: "sizeData.name" },
  { label: "Type", value: "typeData.name" },
  { label: "IGM ISO Code", value: "i.igmIsoCode" },
];

export default fieldData;
