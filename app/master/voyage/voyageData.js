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
      labelType: "country",
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
      labelType: "vessel",
      foreignTable: "name,tblVessel",
      isEdit: "true",
    },
  ],
};

export default fieldData;
