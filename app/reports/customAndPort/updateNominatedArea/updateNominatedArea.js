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
      label: "FPD",
      name: "fpd",
      type: "dropdown",
      labelType: "pod",
      isEdit: "true",
    },
    {
      label: "BL Type",
      name: "blType",
      type: "dropdown",
      labelType: "name,tblMovementType",
      isEdit: "true",
    },
    {
      label: "Nominated Area Code",
      name: "nominatedAreaCode",
      type: "dropdown",
      labelType: "port",
      isEdit: "true",
    },
    {
      label: " Dpd Code",
      name: "dpdCode",
      type: "dropdown",
      labelType: "port",
      isEdit: "true",
    },
  ],
};

export default fieldData;
export const metaData = [
  {
    name: "itemNo",
    isEdit: true,
  },
  {
    name: "Nominated Area",
    type: "dropdown",
    labelType: "port",
    isEdit: "true",
  },
  {
    name: "DPD Desciption",
    type: "dropdown",
    labelType: "port",
    isEdit: "true",
  },
  {
    name: "Third CFS Desciption",
    type: "dropdown",
    labelType: "port",
    isEdit: "true",
  },
];
