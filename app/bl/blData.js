const fieldData = {
  fields: [
    {
      label: "Department",
      name: "department",
      type: "dropdown",
      labelType: "department",
    },
    {
      label: "HBL No.",
      name: "hblNo",
    },
    {
      label: "HBL Date",
      name: "hblDate",
      type: "date",
    },
    {
      label: "MBL No.",
      name: "mblNo",
    },
    {
      label: "MBL Date",
      name: "bookingReferenceNo",
      type: "date",
    },
    {
      label: "MLO",
      name: "mlo",
      type: "mlo",
      labelType: "mlo",
    },
    {
      label: "SOC",
      name: "soc",
    },
  ],

  consignorFields: [
    {
      label: "Shipper Name",
      name: "shipperName",
      style: "mb-2",
      isEdit: true,
    },
    {
      label: "Shipper Address",
      name: "shipperAddress",
      style: "sm:w-[min(100%,300px)]",
      multiline: true,
      rows: 6,
      type: "textarea",
      isEdit: true,
    },
  ],

  consigneeFields: [
    {
      label: "Consignee Name",
      name: "consigneeName",
      style: "mb-2",
      isEdit: true,
    },
    {
      label: "Consignee Address",
      name: "consigneeAddress",
      style: "sm:w-[min(100%,300px)]",
      multiline: true,
      rows: 6,
      type: "textarea",
      isEdit: true,
    },
  ],

  notifyFields: [
    {
      label: "Notify Name",
      name: "notifyName",
      style: "mb-2",
      isEdit: true,
    },
    {
      label: "Notify Address",
      name: "notifyAddress",
      style: "sm:w-[min(100%,300px)]",
      multiline: true,
      rows: 6,
      type: "textarea",
      isEdit: true,
    },
  ],

  deliveryAgentFields: [
    {
      label: "Notify2 Name",
      name: "notify2Name",
      style: "mb-2",
      isEdit: true,
    },
    {
      label: "Notify2 Address",
      name: "notify2Address",
      style: "sm:w-[min(100%,300px)]",
      multiline: true,
      rows: 6,
      height: "auto",
      type: "textarea",
      isEdit: true,
    },
  ],

  receiptFields: [
    {
      label: "Place Of Receipt",
      name: "placeOfReceipt",
      type: "dropdown",
      labelType: "PORT",
    },
    {
      label: "Port Of Loading",
      name: "portOfLoading",
      type: "dropdown",
      labelType: "PORT",
    },
    {
      label: "Port Of Discharge",
      name: "portOfDischarge",
      type: "dropdown",
      labelType: "PORT",
    },
    {
      label: "Place Of Delivery",
      name: "placeOfDelivery",
      type: "dropdown",
      labelType: "PORT",
    },
  ],

  transportFields: [
    {
      label: "Vessel",
      name: "oceanVessel",
      type: "dropdown",
      labelType: "vessel",
    },
    {
      label: "Voyage No.",
      name: "voyageNo",
      type: "dropdown",
      labelType: "voyage",
    },
    {
      label: "Route/Place Of Transshipment",
      name: "routing",
      type: "dropdown",
      labelType: "routing",
    },
  ],

  goodsFields: [
    {
      label: "Marks And Numbers",
      name: "marksAndNumbers",
      multiline: true,
      rows: 6,
      gridColumn: "col-span-2 row-span-3 ",
      type: "textarea",
      isEdit: true,
    },
    {
      label: "Description of Goods",
      name: "descriptionOfGoods",
      multiline: true,
      rows: 6,
      gridColumn: "col-span-2 row-span-3 ",
      type: "textarea",
      isEdit: true,
    },
    { label: "No Of Pkgs", name: "noOfPackages", type: "number", isEdit: true },
    {
      label: "Type Of Pkgs",
      name: "typeofPkgs",
      type: "dropdown",
      labelType: "TypeofPkgs",
      isEdit: true,
    },
    {
      label: "Gross Weight",
      name: "grossWeight",
      style: "mb-2",
      type: "number",
      isEdit: true,
    },
    {
      label: "Gross Unit",
      name: "grossWtUnit",
      type: "dropdown",
      labelType: "grossWtUnit",
      isEdit: true,
    },
    {
      label: "Net Weight",
      name: "netWeight",
      style: "mb-2",
      type: "number",
      isEdit: true,
    },
    {
      label: "Net Unit",
      name: "netUnit",
      type: "dropdown",
      labelType: "netWtUnit",
      isEdit: true,
    },
    {
      label: "Volume",
      name: "volume",
      style: "mb-2",
      type: "number",
      isEdit: true,
    },
    {
      label: "Volume Unit",
      name: "volumeUnit",
      type: "dropdown",
      labelType: "volumeUnit",
      isEdit: true,
    },
    {
      label: "Cargo Type",
      name: "cargoType",
      type: "dropdown",
      labelType: "cargoType",
      changeFun: "cargoType",
      gridColumn: "span 2",
    },
    {
      label: "UN No.",
      name: "unNo",
      style: "hidden",
    },
    {
      label: "Class",
      name: "class",
      style: "hidden",
    },
  ],

  issueFields: [
    {
      label: "Freight Payable At",
      name: "freightPayableAt",
      style: "w-full",
    },
    {
      label: "Number Of Original",
      name: "numberOfOriginal",
      type: "number",
    },
    {
      label: "Place Of Issue",
      name: "placeofIssue",
      style: "w-full",
    },
    {
      label: "Date Of Issue",
      name: "dateOfIssue",
      type: "date",
    },
  ],

  containerFields1: [
    { label: "Container No.", name: "containerNo", type: "text" },
    {
      label: "Size",
      name: "size",
      type: "dropdown",
      labelType: "SIZE",
    },
    {
      label: "Type",
      name: "type",
      type: "dropdown",
      labelType: "TYPE",
      changeFun: "containerType",
    },
    { label: "Seal No", name: "sealNo", isEdit: true },
    { label: "No Of Pkgs", name: "noOfPackages", type: "number", isEdit: true },
    {
      label: "Type Of Pkgs",
      name: "package",
      type: "dropdown",
      labelType: "TypeofPkgs",
      isEdit: true,
    },
    {
      label: "Gross Weight",
      name: "grossWeight",
      type: "number",
      isEdit: true,
    },
    {
      label: "Gross Unit",
      name: "grossWeightUnit",
      type: "dropdown",
      labelType: "grossWtUnit",
      isEdit: true,
    },
    { label: "Net Weight", name: "netWeight", type: "number", isEdit: true },
    {
      label: "Net Unit",
      name: "netWeightUnit",
      type: "dropdown",
      labelType: "netWtUnit",
      isEdit: true,
    },
    { label: "Volume", name: "volume", type: "number", isEdit: true },
    {
      label: "Volume Unit",
      name: "volumeUnit",
      type: "dropdown",
      labelType: "volumeUnit",
      isEdit: true,
    },
    {
      label: "Temperature",
      name: "temp",
      type: "number",
      style: "hidden",
      isEdit: true,
    },
    {
      label: "Unit",
      name: "tempUnit",
      type: "dropdown",
      labelType: "tempUnit",
      style: "hidden",
      isEdit: true,
    },
    {
      label: "ODC Length",
      name: "length",
      type: "number",
      style: "hidden",
      isEdit: true,
    },
    {
      label: "ODC Width",
      name: "width",
      type: "number",
      style: "hidden",
      isEdit: true,
    },
    {
      label: "ODC Height",
      name: "height",
      type: "number",
      style: "hidden",
      isEdit: true,
    },
    {
      label: "ODC Dimension Unit",
      name: "dimensionUnit",
      type: "dropdown",
      labelType: "dimensionUnit",
      style: "hidden",
      isEdit: true,
    },
    { label: "ODC Guage", name: "guage", style: "hidden", isEdit: true },
  ],
};

export default fieldData;
