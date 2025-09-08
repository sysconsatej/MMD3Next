const fieldData = {
  vesselFields: [
    {
      label: "Code",
      name: "code",
      isEdit: "true",
      required: true,
    },
    {
      label: "Name",
      name: "name",
      isEdit: "true",
      required: true,
    },
    {
      label: "IMO Code",
      name: "imoCode",
      isEdit: "true",
      required: true,
    },
    {
      label: "Nationality",
      name: "nationalityId",
      type: "dropdown",
      labelType: "country",
      foreignTable: "name,tblCountry",
      isEdit: "true",
    },
    {
      label: "Call Sign",
      name: "callSign",
      isEdit: "true",
    },
    {
      label: "Build Year",
      name: "buildYear",
      type: "number",
      isEdit: "true",
    },
    {
      label: "Gross Tonnage",
      name: "grossTonnage",
      type: "number",
      isEdit: "true",
    },
    {
      label: "Net Tonnage",
      name: "netTonnage",
      type: "number",
      isEdit: "true",
    },
  ],
  voyageFields: [
    {
      label: "Vessel Name",
      name: "vesselId",
      type: "dropdown",
      labelType: "vessel",
      foreignTable: "name,tblVessel",
      isEdit: "true",
      required: true,
    },
    {
      label: "Voyage No",
      name: "voyageNo",
      isEdit: "true",
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
      labelType: "country",
      foreignTable: "name,tblCountry",
      isEdit: "true",
    },
    {
      label: "Dc No",
      name: "masterIdNo",
      isEdit: "true",
    },
    {
      label: "Convey Reference No",
      name: "conveyRefNo",
      isEdit: "true",
    },
  ],
};

export default fieldData;
