const fieldData = {
  portFields: [
    {
      label: "Port/Location",
      name: "portLocation",
      type: "dropdown",
      labelType: "name,tblPortType",
    },
    {
      label: "Port Code",
      name: "portCode",
    },
    {
      label: "Port Name",
      name: "portName",
    },
    {
      label: "Country Name",
      name: "countryName",
      type: "dropdown",
      labelType: "country",
    },
    {
      label: "Active/Inactive",
      name: "activeStatus",
      type: "radio",
      radioData: [
        { label: "Yes", value: "Y" },
        { label: "No", value: "N" },
      ],
    },
  ],
};

export default fieldData;
