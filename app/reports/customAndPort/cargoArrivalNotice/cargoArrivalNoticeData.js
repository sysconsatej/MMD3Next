const fieldData = {
  cargoFields: [
    {
      label: "Vessel",
      name: "vessel",
      type: "dropdown",
      labelType: "vessel",
      isEdit: "true",
    },
    {
      label: "Voyage",
      name: "voyage",
      type: "dropdown",
      labelType: "voyage",
      selectedCondition: "vessel",
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
      label: "FPD",
      name: "terminal",
      type: "dropdown",
      labelType: "pod",
      isEdit: "true",
    },
  ],
};
export default fieldData;
