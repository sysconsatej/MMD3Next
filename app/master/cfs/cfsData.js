const fieldData = {
  cfsFields: [
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
      label: "EDI Port Code",
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
      label: "Name",
      name: "name",
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
    {
      label: "MOT",
      name: "mot",
      isEdit: true,
    },
  ],
};

export default fieldData;
