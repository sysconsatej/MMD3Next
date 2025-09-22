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

export const isoCode = [
  { label: "IsoCode", value: "i.isoCode" },
  { label: "Size", value: "sizeData.name" },
  { label: "Type", value: "typeData.name" },
];

export default fieldData;
