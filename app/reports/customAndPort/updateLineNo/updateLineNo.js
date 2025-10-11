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
      labelType: "pod",
      isEdit: "true",
    },
    {
      label: "New Line No",
      name: "newLineNo",
      type: "radio",
      radioData: [
        { label: "Yes", value: "Y" },
        { label: "No", value: "N" },
      ],
      isEdit: true,
    },
  ],
};

export default fieldData;
export const metaData = [
  {
    name: "From",
    isEdit: true,
  },
  {
    name: "To",
    isEdit: true,
  },
];
