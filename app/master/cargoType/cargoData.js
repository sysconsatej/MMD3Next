const fieldData = {
  cargoFields: [
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
        label:"MasterListId",
        name:"masterListId",
        type:"dropdown",
        labelType:"masterList",
        foreignTable: "name,tblMasterList",
    }
  ],
};

export default fieldData;
