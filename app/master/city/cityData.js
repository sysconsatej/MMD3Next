const fieldData = {
  cityFields: [
    {
      label: "City",
      name: "name",
      isEdit: "true",
      required: true,
    },
    {
      label: "State",
      name: "stateId",
      type: "dropdown",
      labelType: "state",
      foreignTable: "name,tblState",
      isEdit: "true",
    },

    {
      label: "Country",
      name: "countryId",
      type: "dropdown",
      labelType: "country",
      foreignTable: "name,tblCountry",
      isEdit: "true",
    },
  ],
};

export default fieldData;
