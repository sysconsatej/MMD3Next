const fieldData = {
  voyageFields: [
    {
      label: "Voyage NO",
      name: "voyageNo",
      isEdit: "true",
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
      foreignTable: "name,tblCountry",
      isEdit: "true",
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
    {
      label: "Vessel Name",
      name: "vesselId",
      type: "dropdown",
      foreignTable: "name,tblVessel",
      isEdit: "true",
    },
  ],
};

export const voyage = [
  { label: "Vessel Name", value: "v1.name" },
  { label: "Voyage No", value: "v.voyageNo" },
]
export default fieldData;
