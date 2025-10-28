const fieldData = {
  voyageFields: [
    {
      label: "Voyage NO",
      name: "voyageNo",
      isEdit: "true",
      required: true,
    },
    {
      label: "Vessel Name",
      name: "vesselId",
      type: "dropdown",
      tableName: "tblVessel",
      displayColumn: "t.name",
      orderBy: "t.name",
      foreignTable: "name,tblVessel",
      isEdit: true,
      required: true,
    },
    {
      label: "Master",
      name: "masterName",
      isEdit: "true",
    },
    {
      label: " Master Nationality",
      name: "masterNationalityId",
      type: "dropdown",
      tableName: "tblCountry",
      displayColumn: "t.name",
      orderBy: "t.name",
      foreignTable: "name,tblCountry",
      isEdit: true,
      required: true,
    },
    {
      label: "Dc no",
      name: "masterIdNo",
      isEdit: "true",
    },
    {
      label: "Convey Reference no",
      name: "conveyRefNo",
      isEdit: "true",
    },
  ],
};

export const voyage = [
  { label: "Vessel Name", value: "v1.name" },
  { label: "Voyage No", value: "v.voyageNo" },
];
export default fieldData;
