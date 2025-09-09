const fieldData = {
  depotFields: [
    {
      label: "Code",
      name: "code",
      isEdit: "true",
    },

    {
      label: "Empty Yard/Empty Depot",
      name: "name",
      isEdit: "true",
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
      labelType: "name,tblPortType",
      foreignTable: "name,tblMasterData",
      isEdit: "true",
    },
  ],
};

export default fieldData;
