const fieldData = {
  isoCodeFields: [
    {
      label: "Size",
      name: "sizeId",
      type: "dropdown",
      labelType: "name,tblSize",
      foreignTable: "name,tblMasterData",
      isEdit:"true",
    },
    {
      label: "Type",
      name: "typeId",
      type: "dropdown",
      labelType: "name,tblType",
      foreignTable: "name,tblMasterData",
      isEdit:"true",
    },
    {
      label: "ISO Code",
      name: "isocode",
      isEdit:"true",
    },
  ],
};

export default fieldData;
