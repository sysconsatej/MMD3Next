const fieldData = {
  cfsFields: [
    {
      label: "Customer code.",
      name: "ediPortCode",
      isEdit: true,
    },
    {
      label: "Name",
      name: "name",
      isEdit: true,
    },
    {
      label: "Nominated Area Code",
      name: "code",
      isEdit: true,
    },
    {
      label: "EDI Common Terminal Code",
      name: "ediCommonTerminalCode",
      isEdit: true,
    },
    {
      label: "Bond No",
      name: "bondNo",
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
      type: "dropdown",
      labelType: "name,tblTransportType",
      foreignTable: "name,tblMasterData",
      isEdit: true,
      isEdit: true,
    },

    {
      label: "Direct Delivery",
      name: "directDelivery",
      type: "checkbox",
      isEdit: true,
    },
  ],
};

export default fieldData;
