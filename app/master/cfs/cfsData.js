const fieldData = {
  cfsFields: [
    {
      label: "Nominated Area Address",
      name: "nominatedAreaAddress",
      style: "sm:w-[min(100%,300px)]",
      multiline: true,
      gridColumn: "col-span-1 row-span-3 ",
      rows: 3,
      type: "textarea",
      isEdit: true,
    },
    {
      label: "Port Type",
      name: "portType",
      type: "dropdown",
      labelTypeof: "CFS",
    },
    {
      label: "Nominated Area Code",
      name: "nominatedAreaCode",
    },
    {
      label: "Nominated Area Description",
      name: "nominatedAreaDescription",
    },
    {
      label: "Port",
      name: "port",
      type: "dropdown",
      labelTypeof: "CFS",
    },
    {
      label: "Direct Deilvery",
      name: "directDeilvery",
      type: "checkbox",
    },
    {
      label: "EDI Port Code",
      name: "ediPortCode",
    },
    {
      label: "EDI Common Terminal Code",
      name: "ediCommonTerminalCode",
    },
    {
      label: "Bond No",
      name: "bondNo",
    },
  ],
};

export default fieldData;
