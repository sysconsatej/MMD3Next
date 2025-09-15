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
      label: "EDI Port Code",
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

export default fieldData;
