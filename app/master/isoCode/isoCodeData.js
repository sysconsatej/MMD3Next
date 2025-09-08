const fieldData = {
  isoCodeFields: [
    {
      label: "ISO Code",
      name: "isoCode",
      isEdit: "true",
      required: "true",
    },
    {
      label: "Size",
      name: "sizeId",
      type: "dropdown",
      labelType: "name,tblSize",
      foreignTable: "name,tblMasterData",
      isEdit: "true",
      required: "true",
    },
    {
      label: "Type",
      name: "typeId",
      type: "dropdown",
      labelType: "name,tblType",
      foreignTable: "name,tblMasterData",
      isEdit: "true",
      required: "true",
    },
  ],
};

export default fieldData;
