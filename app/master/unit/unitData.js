const fieldData = {
  unitFields: [
    {
      label: "Code",
      name: "code",
      isEdit: "true",
      required: "true",
    },
    {
      label: "Name",
      name: "name",
      isEdit: "true",
      required: "true",
    },
    {
      label: "Unit Type",
      name: "groupId",
      type: "dropdown",
      labelType: "name,tblUnitType",
      foreignTable: "name,tblMasterData",
      isEdit: "true",
    },
  ],
};

export default fieldData;
