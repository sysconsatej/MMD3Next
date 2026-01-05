import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";

const fieldData = {
  // BL Information
  igmFields: [
    {
      label: "Beneficiary Name",
      name: "beneficiaryName",
      type: "dropdown",
      tableName: "tblCompany c",
      displayColumn: "c.name",
      orderBy: "c.name",
      foreignTable: "name,tblCompany",
      isEdit: true,
      required: true,
    },
    {
      label: "BL No",
      name: "blNo",
      isEdit: true,
      required: true,
      blurFun: "checkBlForCompany",
    },
    {
      label: "Location",
      name: "location",
      type: "dropdown",
      tableName: "tblPort p",
      displayColumn: "p.name",
      orderBy: "p.name",
      foreignTable: "name,tblPort",
      isEdit: true,
    },

    // {
    //   label: "Type",
    //   name: "typeId",
    //   type: "dropdown",
    //   tableName: "tblMasterData m",
    //   displayColumn: "m.name",
    //   where: "m.masterListName='tblServiceType'",
    //   orderBy: "m.name",
    //   foreignTable: "name,tblMasterData",
    //   isEdit: true,
    //   required: true,
    // },
    // { label: "Third Party Name", name: "thirdPartyName", isEdit: true },
    // { label: "Job No", name: "jobNo", isEdit: true },
  ],

  // Invoice panel — split into blocks for layout like the screenshot
  invoiceFieldsTop: [
    { label: "Invoice No", name: "invoiceNo", isEdit: true, required: true },
    {
      label: "Invoice Type",
      name: "invoiceTypeId",
      type: "dropdown",
      tableName: "tblMasterData m",
      displayColumn: "m.name",
      where: "m.masterListName='tblInvoiceType'",
      orderBy: "m.name",
      foreignTable: "name,tblMasterData",
      isEdit: true,
    },

    // {
    //   label: "Currency",
    //   name: "currencyId",
    //   type: "dropdown",
    //   tableName: "tblMasterData m",
    //   displayColumn: "m.name",
    //   searchColumn: "m.name",
    //   orderBy: "m.name",
    //   where: "m.masterListName = 'tblCurrency'",
    //   foreignTable: "name,tblMasterData",
    //   isEdit: true,
    // },
    {
      label: "Invoice Date",
      name: "invoiceDate",
      type: "date",
      isEdit: true,
      required: true,
    },

    {
      label: "Invoice Category",
      name: "invoiceCategoryId",
      type: "dropdown",
      tableName: "tblMasterData m",
      displayColumn: "m.name",
      where: "m.masterListName='tblInvoiceCategory'",
      orderBy: "m.name",
      foreignTable: "name,tblMasterData",
      isEdit: true,
    },

    {
      label: "Bill to Party",
      name: "billingParty",
      isEdit: true,
      gridColumn: "col-span-2",
    },
    { label: "GSTIN", name: "billingPartyGstinNo", isEdit: true },
    {
      label: "Remarks",
      name: "remarks",
      type: "textarea",
      rows: 2,
      gridColumn: "col-span-2",
      isEdit: true,
    },
    {
      label: "Inv Amt",
      name: "totalInvoiceAmount",
      type: "number",
      isEdit: true,
      required: true,
    },
    {
      label: "Inv Tds Amt",
      name: "tdsAmount",
      type: "number",
      isEdit: true,
    },
    {
      label: "Inv Payable Amt",
      name: "invoicePayableAmount",
      type: "number",
      required: true,
      disabled: true
    },
  ],

  // Uploads (HBL-style grid)
  attachmentFields: [
    {
      name: "attachment",
      type: "fileupload",
      isEdit: true,
      dragDrop: true,
    },
  ],

  // Container rows
  tblInvoiceRequestContainer: [
    { label: "Container No", name: "containerNo", isEdit: true },
    {
      label: "Container Size",
      name: "sizeId",
      type: "dropdown",
      tableName: "tblMasterData m",
      displayColumn: "m.name",
      searchColumn: "m.name",
      orderBy: "m.name",
      where: "m.masterListName = 'tblSize'",
      foreignTable: "name,tblMasterData",
      isEdit: true,
    },
    { label: "Valid Till", name: "validTill", type: "date", isEdit: true },
  ],
  tblAttachment: [
    {
      label: "Upload Invoice",
      name: "path",
      type: "fileupload",
      isEdit: true,
      required: true,
    },
  ],
};

export default fieldData;

export const cfsGridButtons = [
  { text: "Add", icon: <AddIcon />, func: "gridAddHandler" },
  { text: "Delete", icon: <CloseIcon />, func: "gridDeleteHandler" },
];
export const invoicePaymentSearchColumns = [
  { label: "BL No", value: "b.mblNo" },
  { label: "Beneficiary Name", value: "c.name" },
  { label: "Invoice No", value: "i.invoiceNo" },
  { label: "Category", value: "cat.name" },
];
export function paymentStatusColor(status) {
  const map = {
    "Payment Confirmation Requested": "#4E61D3", // Blue
    "Payment Confirmed": "green", // Green
    "Payment Rejected": "#DC0E0E", // Red
  };

  return map[status] || "inherit";
}
// --- Advanced search config for Invoice Payment ---
export const advanceSearchFieldsPayment = {
  bl: [
    {
      label: "BL No",
      name: "blNo",
      isEdit: true,
    },
    {
      label: "Status",
      name: "statusId",
      type: "multiselect",
      tableName: "tblMasterData m",
      displayColumn: "m.name",
      where: "m.masterListName = 'tblPaymentStatus'",
      orderBy: "m.name",
      foreignTable: "name,tblMasterData",
      isEdit: true,
    },
  ],
};
export const advanceSearchFields = {
  bl: [
    {
      label: "BL No",
      name: "blNo",
      isEdit: true,
    },
    {
      label: "Status",
      name: "statusId",
      type: "multiselect",
      tableName: "tblMasterData m",
      displayColumn: "m.name",
      where: "m.masterListName = 'tblPaymentStatus'",
      orderBy: "m.name",
      foreignTable: "name,tblMasterData",
      isEdit: true,
    },
  ],
};
export function advanceSearchFilterPayment(advanceSearch) {
  if (!advanceSearch || Object.keys(advanceSearch).length === 0) return null;

  const condition = [];

  if (advanceSearch.blNo) {
    condition.push(`b.mblNo = '${advanceSearch.blNo}'`);
  }

  if (advanceSearch.statusId && advanceSearch.statusId.length > 0) {
    const ids = advanceSearch.statusId.map((s) => s.Id).join(",");
    condition.push(`ipAgg.statusId IN (${ids})`);
  }

  return condition.length > 0 ? condition.join(" AND ") : null;
}
