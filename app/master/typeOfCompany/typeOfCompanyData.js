const fieldData = {
  companyTypeFields: [
    {
      label: "Company SubTypeCode",
      name: "code",
      isEdit:true,
    },
    {
      label: "Company SubType",
      name: "name",
      isEdit:true,
    },
    {
      label: "MasterListId",
      name: "masterListId",
      type: "dropdown",
      labelType: "name,tblSubtypeCompany,tblMasterList",
      foreignTable: "name,tblMasterList",
      changeFun: "masterList",
      isEdit: true,
    },
    {
      label: "MasterList Name",
      name: "masterListName",
      disabled: true,
    },
  ],
};

export default fieldData;
