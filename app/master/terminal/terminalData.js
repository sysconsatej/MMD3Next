const fieldData = {
  terminalFields: [
    {
      label: "Port code",
      name: "code",
      isEdit: "true",
    },
    {
      label: "Terminal Name",
      name: "name",
      isEdit: "true",
    },
    {
      label: "Port/Location",
      name: "portLocation",
      name: "portTypeId",
      type: "dropdown",
      labelType: "name,tblPortType",
      foreignTable: "name,tblMasterData",
      isEdit: "true",
    },
  ],
};

export default fieldData;
