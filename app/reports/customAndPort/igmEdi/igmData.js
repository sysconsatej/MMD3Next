const fieldData = {
  igmEdiFields: [
    {
      label: "Vessel",
      name: "vessel",
      type: "dropdown",
      tableName: "tblVessel t",
      idColumn: "id",
      displayColumn: "t.name",
      searchColumn: "t.name",
      orderBy: "t.name",
      labelType: "vessel",
      isEdit: true
    },
    {
      label: "Voyage",
      name: "voyage",
      type: "dropdown",
      tableName: "tblVoyage t",
      idColumn: "id",
      displayColumn: "t.voyageNo",
      searchColumn: "t.voyageNo",
      selectedCondition: "vessel",
      where: "(@selectedCondition IS NULL OR t.vesselId = @selectedCondition)",
      orderBy: "t.voyageNo",
      labelType: "voyage",
      isEdit: true
    },
    {
      label: "POD",
      name: "pod",
      type: "dropdown",
      tableName: "tblPort t",
      idColumn: "id",
      displayColumn: "t.name",
      searchColumn: "t.name",
      orderBy: "t.name",
      labelType: "port",
      isEdit: true
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
