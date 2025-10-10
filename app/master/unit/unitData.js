const fieldData = {
  unitFields: [
    {
      label: "Code",
      name: "code",
      isEdit: true,
      required: true,
      blurFun: "duplicateHandler",
    },
    {
      label: "Name",
      name: "name",
      isEdit: true,
      required: true,
      blurFun: "duplicateHandler",
    },
    {
      label: "Unit Type",
      name: "groupId",
      type: "dropdown",
      tableName: "tblMasterData m",
      displayColumn: "m.name",
      where: "m.masterListName = 'tblUnitType'",
      foreignTable: "name,tblMasterData",
      orderBy: "m.name",
      isEdit: true,
      blurFun: "duplicateHandler",
    },
  ],
};

export const unit = [
  { label: " Name", value: "m.name" },
  { label: "Code", value: "m.code" },
];

export default fieldData;
