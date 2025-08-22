const fieldData = {
  nominatedAreaFields: [
    {
      label: "Nominated Area Address",
      name: "address",
      style: "sm:w-[min(100%,300px)]",
      multiline: true,
      gridColumn: "col-span-1 row-span-3 ",
      rows: 3,
      type: "textarea",
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
      label: "Nominated Area Code",
      name: "code",
      isEdit: true,
    },
    {
      label: "Nominated Area Description",
      name: "name",
      isEdit: true,
    },

    {
      label: "Direct Delivery",
      name: "directDelivery",
      type: "checkbox",
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
    },
    {
      label: "Bond No",
      name: "bondNo",
      isEdit: true,
    },
  ],
};

export default fieldData;
