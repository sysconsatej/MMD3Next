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
      label: "Location",
      name: "location",
      type: "dropdown",
      tableName: "tblPort p",
      displayColumn: "p.name",
      orderBy: "p.name",
      foreignTable: "name,tblPort",
      isEdit: true,
    },
    {
      label: "BL No",
      name: "blNo",
      isEdit: true,
      required: true,
      blurFun: "checkBlForCompany",
    },
    {
      label: "Type",
      name: "typeId",
      type: "dropdown",
      tableName: "tblMasterData m",
      displayColumn: "m.name",
      where: "m.masterListName='tblServiceType'",
      orderBy: "m.name",
      foreignTable: "name,tblMasterData",
      isEdit: true,
      required: true,
    },
    { label: "Third Party Name", name: "thirdPartyName", isEdit: true },
    { label: "Job No", name: "jobNo", isEdit: true },
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
    {
      label: "Inv Amt",
      name: "totalInvoiceAmount",
      type: "number",
      isEdit: true,
      required: true,
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

export const containerObj = {
  tblBlContainer: [
    {
      label: "City",
      name: "notifyParty1City",
      type: "dropdown",
      tableName: "tblCity t",
      displayColumn: "t.name",
      orderBy: "t.name",
      foreignTable: "name,tblCity",
      isEdit: true,
      required: true,
      changeFun: "setCountryAndState",
    },
    {
      label: "State",
      name: "notifyParty1State",
      type: "dropdown",
      tableName: "tblState t",
      displayColumn: "t.name",
      orderBy: "t.name",
      foreignTable: "name,tblState",
      isEdit: true,
    },
    {
      label: "Country",
      name: "notifyParty1Country",
      type: "dropdown",
      tableName: "tblCountry t",
      displayColumn: "t.name",
      orderBy: "t.name",
      foreignTable: "name,tblCountry",
      isEdit: true,
      required: true,
    },
    {
      label: "Type",
      name: "consigneeTypeId",
      type: "dropdown",
      tableName: "tblMasterData m",
      displayColumn: "ISNULL(m.code,'') + ' - ' + ISNULL(m.name,'')",
      where: "m.masterListName = 'tblIdentificationType'",
      orderBy: "m.name",
      foreignTable: "code-name,tblMasterData",
      isEdit: true,
    },
    {
      label: "City",
      name: "consigneeCity",
      type: "dropdown",
      tableName: "tblCity t",
      displayColumn: "t.name",
      orderBy: "t.name",
      foreignTable: "name,tblCity",
      isEdit: true,
      required: true,
      changeFun: "setCountryAndState",
    },
    {
      label: "State",
      name: "consigneeState",
      type: "dropdown",
      tableName: "tblState t",
      displayColumn: "t.name",
      orderBy: "t.name",
      foreignTable: "name,tblState",
      isEdit: true,
    },
    {
      label: "Country",
      name: "consigneeCountry",
      type: "dropdown",
      tableName: "tblCountry t",
      displayColumn: "t.name",
      orderBy: "t.name",
      foreignTable: "name,tblCountry",
      isEdit: true,
      required: true,
    },
    {
      label: "Type",
      name: "shipperTypeId",
      type: "dropdown",
      tableName: "tblMasterData m",
      displayColumn: "ISNULL(m.code,'') + ' - ' + ISNULL(m.name,'')",
      where: "m.masterListName = 'tblIdentificationType'",
      orderBy: "m.name",
      foreignTable: "code-name,tblMasterData",
      isEdit: true,
    },
    {
      label: "City",
      name: "shipperCity",
      type: "dropdown",
      tableName: "tblCity t",
      displayColumn: "t.name",
      orderBy: "t.name",
      foreignTable: "name,tblCity",
      required: true,
      isEdit: true,
      changeFun: "setCountryAndState",
    },
    {
      label: "Country",
      name: "shipperCountry",
      type: "dropdown",
      tableName: "tblCountry t",
      displayColumn: "t.name",
      orderBy: "t.name",
      foreignTable: "name,tblCountry",
      required: true,
      isEdit: true,
    },
    {
      label: "CONTAINER NO",
      name: "containerNo",
      isEdit: true,
      required: true,
      blurFun: "containerNumberHandler",
    },
    {
      label: "Size",
      name: "sizeId",
      type: "dropdown",
      tableName: "tblMasterData m",
      displayColumn: "ISNULL(m.code,'') + ' - ' + ISNULL(m.name,'')",
      where: "m.masterListName = 'tblSize'",
      orderBy: "m.name",
      foreignTable: "code-name,tblMasterData",
      isEdit: true,
      changeFun: "setISOBySize",
    },
    {
      label: "Type",
      name: "typeId",
      type: "dropdown",
      tableName: "tblMasterData m",
      displayColumn: "ISNULL(m.code,'') + ' - ' + ISNULL(m.name,'')",
      where: "m.masterListName = 'tblType'",
      orderBy: "m.name",
      foreignTable: "code-name,tblMasterData",
      isEdit: true,
      changeFun: "setISOByType",
    },
    {
      label: "ISO Code",
      name: "isoCode",
      type: "dropdown",
      tableName: "tblIsocode m",
      displayColumn: "m.isocode",
      foreignTable: "isocode,tblIsocode",
      isEdit: true,
      required: true,
    },
    {
      label: "Seal Type",
      name: "sealTypeId",
      type: "dropdown",
      tableName: "tblMasterData m",
      displayColumn: "ISNULL(m.code,'') + ' - ' + ISNULL(m.name,'')",
      where: "m.masterListName = 'tblSealType'",
      orderBy: "m.name",
      foreignTable: "code-name,tblMasterData",
      isEdit: true,
    },
    { label: "Seal No.", name: "agentSealNo", isEdit: true },
    {
      label: "SOC Flag",
      name: "soc",
      isEdit: true,
      type: "checkbox",
    },
    {
      label: "Cargo Gross Wt(Kgs)",
      name: "grossWt",
      type: "number",
      isEdit: true,
      required: true,
      blurFun: "countHandler",
    },
    { label: "NetWt(Kgs)", name: "netWt", type: "number", isEdit: true },
    {
      label: "Volume(CBM)",
      name: "volume",
      type: "number",
      isEdit: true,
    },
    {
      label: "NO of Package",
      name: "noOfPackages",
      type: "number",
      isEdit: true,
      required: true,
      blurFun: "countHandler",
    },
    {
      label: "Package Type",
      name: "packageId",
      type: "dropdown",
      tableName: "tblMasterData m",
      displayColumn: "ISNULL(m.code,'') + ' - ' + ISNULL(m.name,'')",
      where: "m.masterListName = 'tblPackage'",
      orderBy: "m.name",
      foreignTable: "code-name,tblMasterData",
      required: true,
      isEdit: true,
    },
  ],
};

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
