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
      label: "Customer code",
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
      labelType: "referencePort",
      foreignTable: "name,tblPort",
      isEdit: "true",
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
