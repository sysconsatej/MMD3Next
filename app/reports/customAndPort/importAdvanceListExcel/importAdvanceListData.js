const fieldData = {
  igmEdiFields: [
    {
      label: "Vessel",
      name: "name",
      type: "dropdown",
      labelType: "vessel",
      isEdit: "true",
      required: true,
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
      name: "pod",
      type: "dropdown",
      labelType: "port",
      isEdit: "true",
    },
    {
      label: "Terminal",
      name: "terminal",
      type: "dropdown",
      labelType: "port",
      isEdit: "true",
    },
  ],
};

export default fieldData;
