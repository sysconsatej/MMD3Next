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
      isEdit: "true",
    },
  ],
};

export default fieldData;

export const metaData = [
  // {
  //   name: "Voyage",
  //   isEdit: true,
  // },
  // {
  //   name: "BL No",
  //   isEdit: true,
  // },

  // {
  //   name: "Gross Wt",
  //   type:"number",
  //   isEdit: true,
  // },
  // {
  //   // label: "Location(POD)",
  //   name: "Place of Receipt",
  //   type: "dropdown",
  //   labelType: "pod",
  //   foreignTable: "name,tblPort",
  //   isEdit: true,
  // },
  // {
  //   // label: "Location(POD)",
  //   name: "Port of Loading",
  //   type: "dropdown",
  //   labelType: "pod",
  //   foreignTable: "name,tblPort",
  //   isEdit: true,
  // },
  // {
  //   // label: "Location(POD)",
  //   name: "Port of Discharge",
  //   type: "dropdown",
  //   labelType: "pod",
  //   foreignTable: "name,tblPort",
  //   isEdit: true,
  // },
  // {
  //   // label: "Location(POD)",
  //   name: "Final Place of Delivery",
  //   type: "dropdown",
  //   labelType: "pod",
  //   foreignTable: "name,tblPort",
  //   isEdit: true,
  // },
];
