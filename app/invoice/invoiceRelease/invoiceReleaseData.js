import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";

const fieldData = {
  // ✅ BL INFORMATION
  igmFields: [
    {
      label: "BL No",
      name: "blNo",
      isEdit: true,
      required: true,
    },
    {
      label: "Requested By",
      name: "requestedBy",
      isEdit: true,
    },
    {
      label: "Type Of Delivery",
      name: "deliveryTypeId",
      type: "dropdown",
      tableName: "tblMasterData m",
      displayColumn: "m.name",
      orderBy: "m.name",
      where: "m.masterListName='tblStuffingDestuffingType'",
      foreignTable: "name,tblMasterData",
      isEdit: true,
    },
    {
      name: "isFreeDays",
      type: "radio",
      radioData: [
        { label: "Free Days", value: "F" },
        { label: "Do Extension", value: "D" },
      ],
      isEdit: true,
    },
    {
      label: "High Sea Sales",
      name: "isHighSealSale",
      type: "checkbox",
      isEdit: true,
    },
    {
      label: "Valid Till",
      name: "validTill",
      type: "date",
      isEdit: true,
    },
    { label: "Contact No", name: "contactNo", isEdit: true },
    {
      label: "Remarks",
      name: "remarks",
      type: "textarea",
      rows: 2,
      isEdit: true,
    },
  ],

  // ✅ INVOICE DETAILS (TOP)
  invoiceFieldsTop: [
    { label: "Invoice No", name: "invoiceNo", isEdit: true },
    {
      label: "Invoice Date",
      name: "invoiceDate",
      type: "date",
      isEdit: true,
    },
    {
      label: "Invoice Category",
      name: "invoiceCategoryId",
      type: "dropdown",
      tableName: "tblMasterData m",
      displayColumn: "m.name",
      where: "m.masterListName='tblInvoiceCategory'",
      foreignTable: "name,tblMasterData",
      isEdit: true,
    },
    { label: "Valid Till", name: "validTill", type: "date", isEdit: true },
    {
      label: "Total Inv Amt",
      name: "totalInvoiceAmount",
      type: "number",
      isEdit: true,
    },
    {
      label: "Invoice Type",
      name: "invoiceTypeId",
      type: "dropdown",
      tableName: "tblMasterData m",
      displayColumn: "m.name",
      where: "m.masterListName='tblInvoiceType'",
      foreignTable: "name,tblMasterData",
      isEdit: true,
    },
    { label: "Bill To Party", name: "billingParty", isEdit: true },
    { label: "GSTIN", name: "billingPartyGstinNo", isEdit: true },
    {
      label: "Status",
      name: "invoicePaymentId",
      isEdit: true,
    },
    {
      label: "Remarks",
      name: "invoiceRemarks",
      type: "textarea",
      rows: 2,
      gridColumn: "col-span-2",
      isEdit: true,
    },
  ],

  // ✅ INVOICE IN NAME OF
  invoiceFields: [
    { label: "Name", name: "billingPartyName", isEdit: true },
    { label: "GSTIN/Provisional ID", name: "billPartyGSTIN", isEdit: true },
    {
      label: "Address",
      name: "billingPartyAddress",
      type: "textarea",
      rows: 2,
      gridColumn: "col-span-2",
      isEdit: true,
    },
    {
      label: "Contact",
      name: "billingPartyTelNo",
      type: "number",
      isEdit: true,
    },
    { label: "Email", name: "billingPartyEmailId", isEdit: true },
  ],

  // ✅ ATTACHMENT GRID (TOP & BOTTOM)
  attachmentFields: [
    {
      label: "Attachment",
      name: "attachment",
      type: "fileupload",
      isEdit: true,
      dragDrop: true,
    },
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

  // ✅ CONTAINER GRID
  tblInvoiceRequestContainer: [
    { label: "Container No", name: "containerNo", isEdit: true },
    {
      label: "Container Size",
      name: "sizeId",
      type: "dropdown",
      tableName: "tblMasterData m",
      displayColumn: "m.name",
      where: "m.masterListName='tblSize'",
      foreignTable: "name,tblMasterData",
      isEdit: true,
    },
    { label: "Valid Till", name: "validTill", type: "date", isEdit: true },
  ],
};

export default fieldData;

export const cfsGridButtons = [
  { text: "Add", icon: <AddIcon />, func: "gridAddHandler" },
  { text: "Delete", icon: <CloseIcon />, func: "gridDeleteHandler" },
];

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
      where: "m.masterListName = 'tblInvoiceRequest'",
      orderBy: "m.name",
      foreignTable: "name,tblMasterData",
      isEdit: true,
    },
    {
      label: "Type",
      name: "deliveryTypeId",
      type: "dropdown",
      tableName: "tblMasterData m",
      idColumn: "id",
      displayColumn: "m.name",
      searchColumn: "m.name",
      orderBy: "m.name",
      where: "m.masterListName = 'tblStuffingDestuffingType'",
      foreignTable: "name,tblMasterData",
      isEdit: true,
    },
    {
      label: "Date (From)",
      name: "fromDate",
      type: "date",
      isEdit: true,
    },
    {
      label: "Date (To)",
      name: "toDate",
      type: "date",
      isEdit: true,
    },
  ],
};
export function advanceSearchFilter(advanceSearch) {
  if (Object.keys(advanceSearch).length <= 0) return null;
  const condition = [];

  if (advanceSearch.blNo) {
    condition.push(`i.blNo = '${advanceSearch.blNo}'`);
  }

  if (advanceSearch.statusId) {
    condition.push(
      `i.invoiceRequestStatusId in (${advanceSearch.statusId
        .map((item) => item.Id)
        .join(",")})`,
    );
  }
  if (advanceSearch.deliveryTypeId?.Id) {
    condition.push(`i.deliveryTypeId = ${advanceSearch.deliveryTypeId.Id}`);
  }
  if (advanceSearch.fromDate && advanceSearch.toDate) {
    condition.push(
      `i.createdDate BETWEEN '${advanceSearch.fromDate}' AND '${advanceSearch.toDate}'`,
    );
  }
  return condition.length > 0 ? condition.join(" and ") : null;
}

export function statusColor(status) {
  const map = {
    Requested: "#4E61D3", // Blue
    Released: "green", // Green
    Rejected: "#DC0E0E", // Red
  };

  return map[status] || "inherit";
}
