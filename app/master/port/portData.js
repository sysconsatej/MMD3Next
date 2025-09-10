const fieldData = {
  portFields: [
    {
      label: "Port/Location",
      name: "portTypeId",
      type: "dropdown",
      labelType: "name,tblPortType",
      foreignTable: "name,tblMasterData",
      isEdit: "true",
    },
    {
      label: "Port Code",
      name: "code",
      isEdit: "true",
    },
    {
      label: "Port Name",
      name: "name",
      isEdit: "true",
    },
    {
      label: "Country",
      name: "countryId",
      type: "dropdown",
      labelType: "country",
      foreignTable: "name,tblCountry",
      isEdit: "true",
      required: true,
    },
    {
      label: "Active/Inactive",
      name: "activeInactive",
      type: "radio",
      radioData: [
        { label: "Yes", value: "Y" },
        { label: "No", value: "N" },
      ],
      isEdit: "true",
      required: true,
    },
  ],
};

export default fieldData;
