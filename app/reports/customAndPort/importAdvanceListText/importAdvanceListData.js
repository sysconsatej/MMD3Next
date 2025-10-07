const fieldData = {
  igmEdiFields: [
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
      selectedCondition: "vessel",
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
export const metaData = [];
