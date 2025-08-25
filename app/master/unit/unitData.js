const fieldData = {
  unitFields: [
    {
      label: "Code",
      name: "code",
      isEdit: "true",
    },
    {
      label: "Name",
      name: "name",
      isEdit: "true",
    },
    {
      label: "Unit Type",
      name: "groupId",
      type: "dropdown",
      labelType: "name,tblUnitType",
      foreignTable: "name,tblMasterData",
      isEdit: "true",
    },
    {
      label: "MasterListId",
      name: "masterListId",
      type: "dropdown",
      labelType: "name,tblUnit,tblMasterList",
      foreignTable: "name,tblMasterList",
      changeFun: "masterList",
      isEdit: "true",
    },
    {
      label: "MasterList Name",
      name: "masterListName",
      disabled: true,
    },
  ],
};

export default fieldData;
