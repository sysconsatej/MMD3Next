const fieldData = {
  depotFields: [
    {
      label: "Deport Code",
      name: "code",
      isEdit: "true",
    },

    {
      label: "Name",
      name: "name",
      isEdit: "true",
    },
    {
      label: "Deport Address",
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
