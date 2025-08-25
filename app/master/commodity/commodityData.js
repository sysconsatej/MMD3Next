const fieldData = {
  commodityFields: [
    {
      label: "Commodity Code",
      name: "code",
      isEdit: "true",
    },
    {
      label: "Commodity Type",
      name: "name",
      isEdit: "true",
    },
    {
      label: "MasterListId",
      name: "masterListId",
      type: "dropdown",
      labelType: "name,tblCommodityType,tblMasterList",
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
