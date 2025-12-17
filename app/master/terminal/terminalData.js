const fieldData = {
  terminalFields: [
    {
      label: "Code",
      name: "code",
      isEdit: "true",
      required: true,
      blurFun: "duplicateHandler",
    },
    {
      label: "Location",
      name: "referencePortId",
      type: "dropdown",
      tableName: "tblPort p",
      displayColumn: "p.name",
      foreignTable: "name,tblPort",
      joins: "JOIN tblMasterData m ON m.id = p.portTypeId",
      where: "m.name IN ('SEA PORT','INLAND PORT')",
      orderBy: "p.name",
      foreignTable: "name,tblPort",
      isEdit: true,
      required: true,
    },
    {
      label: "Terminal Name",
      name: "name",
      isEdit: "true",
      required: true,
      blurFun: "duplicateHandler",
    },
    {
      label: "Terminal Opr Code",
      name: "ediPortCode",
      isEdit: "true",
      required: true,
    },
  ],
};

export const terminal = [
  { label: "Code", value: "p.code" },
  { label: "Terminal", value: "p.name" },
];

export default fieldData;
