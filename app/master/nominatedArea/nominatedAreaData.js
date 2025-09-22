const fieldData = {
  nominatedAreaFields: [
    {
      label: "Nominated Area Code",
      name: "code",
      isEdit: true,
    },
    {
      label: "Port Type",
      name: "portTypeId",
      type: "dropdown",
      labelType: "name,tblPortType",
      foreignTable: "name,tblMasterData",
      isEdit: true,
    },
    {
      label: "Customer code.",
      name: "ediPortCode",
      isEdit: true,
    },
    {
      label: "Bond No",
      name: "bondNo",
      isEdit: true,
    },
    {
      label: "Direct Delivery",
      name: "directDelivery",
      type: "checkbox",
      isEdit: true,
    },
    {
      label: "EDI Common Terminal Code",
      name: "ediCommonTerminalCode",
      isEdit: true,
    },
    {
      label: "Nominated Area Description",
      name: "name",
      type: "textarea",
      rows: 2,
      gridColumn: "col-span-2 row-span-1 ",
      isEdit: true,
    },
    {
      label: "Nominated Area Address",
      name: "address",
      type: "textarea",
      rows: 2,
      gridColumn: "col-span-2 row-span-1 ",
      isEdit: true,
    },
  ],
};

export const nominatedArea = [
  { label: "Nominated Area Code", value: "p.code" },
  { label: "Nominated Area Description", value: "p.name" },
  { label: "Nominated Area Address", value: "p.address" },
  { label: "Direct Delivery", value: "p.directDelivery" },
  { label: "EDI Port Code", value: "p.ediPortCode" },
  { label: "EDI Common Terminal Code", value: "p.ediCommonTerminalCode" },
  { label: "Bond No", value: "p.bondNo" },
  { label: "Port Type", value: "m.name" },
];

export default fieldData;
