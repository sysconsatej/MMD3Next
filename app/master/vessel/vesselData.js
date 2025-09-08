const fieldData = {
  vesselFields: [
    {
      label: "Code",
      name: "code",
      isEdit: true,
    },
    {
      label: "Name",
      name: "name",
      isEdit: true,
    },
    {
      label: "IMO Code",
      name: "imoCode",
      isEdit: true,
    },
    {
      label: "Nationality",
      name: "nationalityId",
      type: "dropdown",
      labelType: "country",
      foreignTable: "name,tblCountry",
      isEdit: true,
    },
    {
      label: "Call Sign",
      name: "callSign",
      isEdit: true,
    },
    {
      label: "Build Year",
      name: "buildYear",
      type: "number",
      isEdit: true,
    },
    {
      label: "Gross Tonnage",
      name: "grossTonnage",
      type: "number",
      isEdit: true,
    },
    {
      label: "Net Tonnage",
      name: "netTonnage",
      type: "number",
      isEdit: true,
    },
  ],
  tblVoyage: [
    {
      label: "Voyage No",
      name: "voyageNo",
      isEdit: true,
    },
    {
      label: "Master",
      name: "masterName",
      isEdit: true,
    },
    {
      label: "Master Nationality",
      name: "masterNationalityId",
      type: "dropdown",
      labelType: "country",
      foreignTable: "name,tblCountry",
      isEdit: true,
    },
    {
      label: "Dc No",
      name: "masterIdNo",
      isEdit: true,
    },
    {
      label: "Convey Reference No",
      name: "conveyRefNo",
      isEdit: true,
    },
  ],
};

export default fieldData;
