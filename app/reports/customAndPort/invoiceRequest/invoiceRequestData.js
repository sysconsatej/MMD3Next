const fieldData = {
  invoiceRequestFields: [
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
      label: "Party Name",
      name: "party",
      type: "text",
      isEdit: true,
    },
    {
      label: "Status",
      name: "status",
      type: "dropdown",
      isEdit: true,
    },
    {
      label: "Bl No/Via NO-Cust Code",
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
      label: " Date ",
      name: "toDate",
      type: "date",
      isEdit: true,
    },
  ],
};
export default fieldData;
export const metaData = [];
