const fieldData = {
  depotFields: [
    {
      label: "Location",
      name: "portTypeId",
      type: "dropdown",
      labelType: "name,tblPortType",
      foreignTable: "name,tblMasterData",
      isEdit: "true",
    },

    {
      label: "Deport Code",
      name: "code",
      isEdit: "true",
    },

    {
      label: "Deport Name",
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
  ],
};

export default fieldData;
