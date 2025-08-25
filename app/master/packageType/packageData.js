const fieldData = {
  packageFields: [
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
      labelType: "name,tblPackage,tblMasterList",
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
