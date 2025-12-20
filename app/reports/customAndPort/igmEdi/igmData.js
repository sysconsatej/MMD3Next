const fieldData = {
  igmEdiFields: [
    {
      label: "Vessel",
      name: "vessel",
      type: "dropdown",
      tableName: "tblVessel t",
      idColumn: "id",
      changeFun: "handleChangeOnVessel",
      displayColumn: "t.name",
      searchColumn: "t.name",
      orderBy: "t.name",
      isEdit: true,
    },
    {
      label: "Voyage",
      name: "voyage",
      type: "dropdown",
      tableName: "tblVoyage t",
      displayColumn: "t.voyageNo",
      searchColumn: "t.voyageNo",
      changeFun: "handleDropdownChange",
      selectedConditions: [{ vessel: "vesselId" }],
      orderBy: "t.voyageNo",
      isEdit: true,
    },
    {
      label: "POD",
      name: "pod",
      type: "dropdown",
      tableName: "tblPort p",
      displayColumn: "p.name",
      changeFun: "handleDropdownChange",
      joins: `join tblMasterData d on p.portTypeId = d.id and d.name = 'SEA PORT' join tblVoyageRoute v on v.portOfCallId = p.id`,
      selectedConditions: [{ voyage: "v.voyageId" }],
      searchColumn: "p.name",
      orderBy: "p.name",
      isEdit: true,
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
