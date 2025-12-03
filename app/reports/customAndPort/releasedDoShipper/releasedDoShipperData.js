const fieldData = {
  releaseddoshipperFields: [
    {
      label: "Location",
      name: "pod",
      type: "dropdown",
      tableName: "tblPort p",
      displayColumn: "ISNULL(p.code,'') + ' - ' + ISNULL(p.name,'')",
      orderBy: "p.name",
      foreignTable: "code-name,tblPort",
      isEdit: true,
    },
    {
      label: "Payor Name",
      name: "status",
      type: "text",
      isEdit: true,
    },
    {
      label: "Bl No",
      name: "status",
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
    {
      label: "Status",
      name: "status",
      type: "dropdown",
      isEdit: true,
    },
  ],
};
export default fieldData;
export const metaData = [];
