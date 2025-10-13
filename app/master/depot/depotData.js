const fieldData = {
  depotFields: [
    {
      label: "Code",
      name: "code",
      isEdit: "true",
      required: true,
      blurFun: "duplicateHandler",
    },

    {
      label: "Empty Yard/Empty Depot",
      name: "name",
      isEdit: "true",
      required: true,
      blurFun: "duplicateHandler",
    },
    {
      label: "Address",
      name: "address",
      type: "textarea",
      rows: 2,
      gridColumn: "col-span-2 row-span-1 ",
      isEdit: "true",
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
  ],
};

export const depot = [
  { label: "Code", value: "p.code" },
  { label: "Empty Yard/Empty Depot", value: "p.name" },
  { label: "Address", value: "p.address" },
];

export default fieldData;
