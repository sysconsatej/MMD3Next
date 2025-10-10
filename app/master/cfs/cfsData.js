const fieldData = {
  cfsFields: [
    {
      label: "Code",
      name: "code",
      isEdit: true,
      required: true,
    },
    {
      label: "Name",
      name: "name",
      isEdit: true,
      required: true,
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
    },
    {
      label: "EDI Common Terminal Code",
      name: "ediCommonTerminalCode",
      isEdit: true,
      required: true,
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
      labelType: "port",
      foreignTable: "name,tblPort",
      isEdit: true,
    },
  ],
};

export const cfs = [
  { label: "Customer Code", value: "p.ediPortCode" },
  { label: "Name", value: "p.name" },
  { label: "Nominated Area Code", value: "p.code" },
  { label: "Terminal Code", value: "p.ediCommonTerminalCode" },
  { label: "Bond No", value: "p.bondNo" },
  { label: "Address", value: "p.address" },
];

export default fieldData;
