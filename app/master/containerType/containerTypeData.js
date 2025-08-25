const fieldData = {
  containerSizeFields: [
    {
      label: "Name",
      name: "name",
      isEdit: "true",
    },

    {
      label: "Code",
      name: "code",
      isEdit: "true",
    },
    {
      label: "MasterListId",
      name: "masterListId",
      type: "dropdown",
      labelType: "name,tblType,tblMasterList",
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
