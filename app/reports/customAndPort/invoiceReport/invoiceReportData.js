const fieldData = {
  invoiceReportFields: [
    {
      label: "Company Type",
      name: "companyType",
      type: "dropdown",
      // tableName: "tblCompany t",
      // displayColumn: "t.name",
      // searchColumn: "t.name",
      // orderBy: "t.name",
      // foreignTable: "name,tblCompany",
      // isEdit: true,
    },
    {
      label: "Company Name",
      name: "companyId",
      type: "dropdown",
      tableName: "tblCompany t",
      displayColumn: "t.name",
      searchColumn: "t.name",
      orderBy: "t.name",
      foreignTable: "name,tblCompany",
      isEdit: true,
    },
    {
      label: "BL No",
      name: "blNo",
      isEdit: true,
    },
    { label: "IGM No", name: "igmNo", type: "text", isEdit: true },

    { label: "Item No", name: "itemNo", type: "text", isEdit: true },
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
    {
      label: "All Invoices",
      name: "allInvoices",
      type: "checkbox",
      isEdit: true,
    },
  ],
};
export default fieldData;
export const metaData = [];
