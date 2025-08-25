const fieldData = {
  unitTypeFields: [
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
      label: "MasterListId",
      name: "masterListId",
      type: "dropdown",
      labelType: "name,tblUnitType,tblMasterList",
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
