const fieldData = {
  modeOfTransportFields: [
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
      labelType: "name,tblTransportType,tblMasterList",
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
