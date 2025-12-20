const fieldData = {
  hblReportsFields: [
    {
      label: "Freight Forwarder",
      name: "freightForwarderText",
      type: "text",
      isEdit: true,
    },
    {
      label: "MBL NO",
      name: "mblno",
      type: "text",
      isEdit: true,
    },
    {
      label: "HBL NO",
      name: "hblno",
      type: "text",
      isEdit: true,
    },
    // {
    //   label: "Status",
    //   name: "status",
    //   type: "text",
    //   isEdit: true,
    // },
    {
      label: "Vessel",
      name: "vesselId",
      type: "dropdown",
      tableName: "tblVessel t",
      idColumn: "id",
      displayColumn: "t.name",
      changeFun: "handleChangeOnVessel",
      searchColumn: "t.name",
      orderBy: "t.name",
      isEdit: true,
    },
    {
      label: "Voyage",
      name: "voyageId",
      type: "dropdown",
      tableName: "tblVoyage t",
      idColumn: "id",
      changeFun: "handleDropdownChange",
      displayColumn: "t.voyageNo",
      searchColumn: "t.voyageNo",
      selectedConditions: [{ vesselId: "vesselId" }],
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
      label: "From Date",
      name: "fromDate",
      type: "date",
      isEdit: true,
    },
    {
      label: " To Date ",
      name: "toDate",
      type: "date",
      isEdit: true,
    },


  ],
};
export default fieldData;
export const metaData = [];
