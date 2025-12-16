const fieldData = {
  cfsFields: [
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
      label: "Address",
      name: "address",
      type: "textarea",
      rows: 2,
      gridColumn: "col-span-2 row-span-1 ",
      isEdit: true,
    },
    {
      label: "Custom code",
      name: "ediPortCode",
      isEdit: true,
      blurFun: "duplicateHandler",
    },
    {
      label: "EDI Common Terminal Code",
      name: "ediCommonTerminalCode",
      isEdit: true,
      required: true,
      blurFun: "duplicateHandler",
    },
    {
      label: "Reference Port",
      name: "referencePortId",
      type: "dropdown",
      tableName: "tblPort p",
      displayColumn: "p.name",
      joins:
        "JOIN tblMasterData m ON m.id = p.portTypeId JOIN tblCountry c ON c.id = p.countryId",
      where: "m.name IN ('SEA PORT','INLAND PORT')",
      orderBy: "p.name",
      foreignTable: "name,tblPort",
      isEdit: true,
    },
    {
      label: "Mode Of Transport",
      name: "modeId",
      type: "dropdown",
      tableName: "tblMasterData",
      where: "masterListName ='tblMode'",
      orderBy: "name",
      foreignTable: "name,tblMasterData",
      isEdit: true,
    },

    {
      label: "Transit Bond No",
      name: "bondNo",
      isEdit: true,
    },
    {
      label: "Carrier Pan",
      name: "panNo",
      isEdit: true,
      blurFun: "validatePanCard",
    },
  ],
};

export const cfs = [
  { label: "Custom Code", value: "p.ediPortCode" },
  { label: "Name", value: "p.name" },
  { label: "Nominated Area Code", value: "p.code" },
  { label: "Terminal Code", value: "p.ediCommonTerminalCode" },
  { label: "Bond No", value: "p.bondNo" },
  { label: "Address", value: "p.address" },
];

export default fieldData;
