const fieldData = {
  containerSizeFields: [
    {
      label: "Code",
      name: "code",
      isEdit: "true",
    },
    {
      label: "Size",
      name: "name",
      isEdit: "true",
    },
    {
      label: "MasterListId",
      name: "masterListId",
      type: "dropdown",
      labelType: "name,tblSize,tblMasterList",
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
