const fieldData = {
  hblReportsFields: [
    {
      label: "Freight Forwarder",
      name: "podId",
      type: "dropdown",
      tableName: "tblPort p",
      displayColumn: "ISNULL(p.code,'') + ' - ' + ISNULL(p.name,'')",
      orderBy: "p.name",
      foreignTable: "code-name,tblPort",
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
    {
      label: "Status",
      name: "status",
      type: "text",
      isEdit: true,
    },
    {
      label: "Vessel",
      name: "vesselId",
      type: "dropdown",
      tableName: "tblVessel t",
      idColumn: "id",
      displayColumn: "t.name",
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
      displayColumn: "t.voyageNo",
      searchColumn: "t.voyageNo",
      selectedConditions: [{ vessel: "vesselId" }],
      orderBy: "t.voyageNo",
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
    {
      label: "Pod",
      name: "podId",
      type: "dropdown",
      isEdit: true,
    },
    
  ],
};
export default fieldData;
export const metaData = [];
