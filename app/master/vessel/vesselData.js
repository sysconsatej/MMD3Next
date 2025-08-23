const fieldData = {
  vesselFields: [
    {
      label: "Vessel Code",
      name: "code",
      isEdit: "true",
    },
    {
      label: "Vessel Name",
      name: "name",
      isEdit: "true",
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
      label: "Gross Tonnage",
      name: "grossTonnage",
      type:"number",
      isEdit: "true",
    },
    {
      label: "Net Tonnage",
      name: "netTonnage",
      type:"number",
      isEdit: "true",
    },
    {
      label: "Build Year",
      name: "buildYear",
      type:"number",
      isEdit: "true",
    },
    {
      label: "IMO Code",
      name: "imoCode",
      isEdit: "true",
    },
  ],
};

export default fieldData;
