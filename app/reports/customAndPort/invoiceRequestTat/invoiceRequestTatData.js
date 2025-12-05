const fieldData = {
  invoiceRequestTatFields: [
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
      label: "Bl No/Via NO-Cust Code",
      name: "status",
      type: "text",
      isEdit: true,
    },
    {
      label: "IGM/ItemNo",
      name: "itemNo",
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
      label: "BLStatus",
      name: "blStatus",
      type: "radio",
      radioData: [
        { label: "Requested", value: "RT" },
        { label: "Released", value: "RD" },
      ],
      isEdit: true,
    },
    {
       label: "All Invoices",
       name: "",
       type: "checkbox",
       isEdit: true,
     },
  ],
};
export default fieldData;
export const metaData = [];
