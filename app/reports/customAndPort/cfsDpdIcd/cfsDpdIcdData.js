const fieldData = {
  cfsDpdIcdFields: [
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
      selectedConditions: [{ vesselId: "vesselId" }],
      orderBy: "t.voyageNo",
      isEdit: true,
    },
    {
      label: "POD",
      name: "podId",
      type: "dropdown",
      tableName: "tblPort p",
      displayColumn: "ISNULL(p.code,'') + ' - ' + ISNULL(p.name,'')",
      orderBy: "p.name",
      foreignTable: "code-name,tblPort",
      selectedConditions: [{ voyageId: "voyageId" }],
      isEdit: true,
    },
    {
      label: "Payor Name",
      name: "payorName",
      type: "text",
      isEdit: true,
    },
    {
      label: "MBL No",
      name: "mblNo",
      type: "text",
      isEdit: true,  
    },
    {
      label: "From Date",
      name: "fromDate",
      type: "date",
      isEdit: true,
    },
    {
      label: "To Date ",
      name: "toDate",
      type: "date",
      isEdit: true,
    },
    
  ],
};
export default fieldData;
export const metaData = [];
