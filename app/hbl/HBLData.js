const fieldData = {
  countryFields: [
    {
      label: "Country",
      name: "country",
      type: "dropdown",
      labelType: "country",
    },
    {
      label: "Company",
      name: "company",
      type: "dropdown",
      labelType: "company",
    },
    { label: "Date", name: "jobDate", type: "date" },
  ],

  consignorFields: [
    { label: "Text", name: "shipper", style: "mb-2" },
    {
      label: "Text Area",
      name: "shipperAddress",
      style: "sm:w-[min(100%,300px)]",
      multiline: true,
      rows: 6,
      type: "textarea",
    },
  ],

  consigneeFields: [
    {
      label: "Text",
      name: "consignee",
      style: "mb-2",
    },
    {
      label: "Text Area",
      name: "consigneeAddress",
      style: "sm:w-[min(100%,300px)]",
      multiline: true,
      rows: 6,
      type: "textarea",
    },
  ],

  notifyFields: [
    { label: "Text", name: "notifyParty", style: "mb-2" },
    {
      label: "Text Area",
      name: "notifyAddress",
      style: "sm:w-[min(100%,300px)]",
      multiline: true,
      rows: 6,
      type: "textarea",
    },
  ],

  deliveryAgentFields: [
    { label: "Text", name: "notifyParty2", style: "mb-2" },
    {
      label: "Text Area",
      name: "notify2Address",
      style: "sm:w-[min(100%,300px)]",
      multiline: true,
      rows: 6,
      height: "auto",
      type: "textarea",
    },
  ],
  receiptFields: [
    {
      label: "Dropdown",
      name: "plr",
      type: "dropdown",
      labelType: "PORT",
    },
    {
      label: "Dropdown",
      name: "pol",
      type: "dropdown",
      labelType: "PORT",
    },
    {
      label: "Dropdown",
      name: "pod",
      type: "dropdown",
      labelType: "PORT",
    },
    {
      label: "Dropdown",
      name: "fpd",
      type: "dropdown",
      labelType: "PORT",
    },
  ],
  cargoFields: [
    {
      label: "Text Area",
      name: "remarks",
      style: "sm:w-[min(100%,2fr)]",
      multiline: true,
      rows: 5,
      type: "textarea",
      gridColumn: "col-span-2 row-span-2 ",
    },
    {
      label: "Dropdown",
      name: "cargoType",
      type: "dropdown",
      labelType: "CargoType",
      changeFun: "cargoType",
    },
    {
      label: "Number",
      name: "unNo",
      type: "number",
    },
    {
      label: "Text",
      name: "class",
    },
    {
      label: "Text",
      name: "commodity",
    },
    { label: "Number", name: "HSNCode", type: "number" },
    {
      label: "Dropdown",
      name: "containerStatus",
      type: "dropdown",
      labelType: "containerStatus",
    },
    {
      label: "Dropdown",
      name: "routing",
      type: "dropdown",
      labelType: "routing",
    },
  ],
};

export default fieldData;
