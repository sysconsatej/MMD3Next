const fieldData = {
  movementTypeFields: [
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
      labelType: "name,tblMovementType,tblMasterList",
      foreignTable: "name,tblMasterList",
      changeFun: "masterList",
    },
    {
      label: "MasterList Name",
      name: "masterListName",
      disabled: true,
    },
  ],
};

export default fieldData;
