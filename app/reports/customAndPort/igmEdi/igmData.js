const fieldData = {
  igmEdiFields: [
    {
      label: "Vessel",
      name: "name",
      type: "dropdown",
      labelType: "vessel",
      isEdit: "true",
    },
    {
      label: "Voyage",
      name: "stateId",
      type: "dropdown",
      labelType: "voyage",
      selectedCondition: "name",
      isEdit: "true",
    },

    {
      label: "POD",
      name: "countryId",
      type: "dropdown",
      labelType: "port",
      isEdit: "true",
    },
  ],
};

export default fieldData;
