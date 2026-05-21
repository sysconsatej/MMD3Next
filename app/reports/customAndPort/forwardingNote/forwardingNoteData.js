import { getUserByCookies } from "@/utils";

const userData = getUserByCookies();

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
      where: `t.status = 1 and t.companyid = ${userData?.companyId}`,
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
    {
      label: "FPD",
      name: "fpd",
      type: "dropdown",
      tableName: "tblPort t",
      idColumn: "id",
      displayColumn: "t.name",
      searchColumn: "t.name",
      orderBy: "t.name",
      isEdit: true,
    },
    {
      label: "Terminal",
      name: "terminal",
      type: "dropdown",
      tableName: "tblPort p",
      idColumn: "id",
      displayColumn: "p.code",
      joins: `join tblMasterData d on p.portTypeId = d.id and d.name = 'PORT TERMINAL' join tblVoyageRoute v on v.berthId = p.id`,
      selectedConditions: [
        { pod: "p.referencePortId" },
        { voyage: "v.voyageId" },
        { vessel: "v.vesselId" },
      ],
      searchColumn: "p.code",
      orderBy: "p.code",
      changeFun: "handleDropdownChange",
      isEdit: true,
    },
    {
      label: "Movement Carrier",
      name: "movementCarrierId",
      type: "dropdown",
      tableName: "tblCarrierPort t",
      displayColumn: "t.name",
      orderBy: "t.name",
      foreignTable: "name,tblCarrierPort",
      selectedConditions: [{ pod: "t.podId" }, { fpd: "t.fpdId" }],
      where: `
    t.companyId = ${userData?.companyId} 
    and t.status = 1
  `,
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
