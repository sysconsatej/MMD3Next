const fieldData = {
  mblFields: [
    {
      label: "Location(POD)",
      name: "department",
      type: "dropdown",
      labelType: "port",
    },
    {
      label: "Liner/FF",
      name: "liner",
      type: "dropdown",
      labelType: "port",
    },
    {
      label: "MBL No",
      name: "mblNo",
    },
    {
      label: "MBL Date",
      name: "bookingReferenceNo",
      type: "date",
    },
    {
      label: "Line No.",
      name: "lineNo",
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
      type: "radio",
      radioData: [
        { label: "Yes", value: "Y" },
        { label: "No", value: "N" },
      ],
    },
  ],

  hblfields: [
    {
      label: " HBL No.",
      name: "hblNo",
    },
    {
      label: "HBL Date",
      name: "hblDate",
      type: "date",
    },
    {
      label: "CIN Type",
      name: "cinType",
      type: "dropdown",
      labelType: "cinType",
    },
    {
      label: "CIN No.",
      name: "cinNo",
    },
    {
      label: "CIN Date",
      name: "cinDate",
      type: "date",
    },
    {
      label: "CSN No.",
      name: "csnNo",
    },
    {
      label: "CSN Date",
      name: "csnDate",
      type: "date",
    },
    {
      label: "ITEM Type",
      name: "itemType",
      type: "dropdown",
      labelType: "itemType",
    },
    {
      label: "Nature of Cargo",
      name: "natureOfCargo",
      type: "dropdown",
      labelType: "natureOfCargo",
    },
    {
      label: "Short shipment",
      name: "shortShipment",
      type: "checkbox",
    },
    {
      label: "FF PAN",
      name: "ffPan",
    },
  ],

  consignorFields: [
    {
      label: "Name",
      name: "name",
    },
    {
      label: "Type",
      name: "type",
      type: "dropdown",
    },
    {
      label: "CODE",
      name: "code",
    },
    {
      label: "Country",
      name: "countryName",
      type: "dropdown",
      labelType: "country",
    },
    {
      label: "City",
      name: "cityName",
      type: "dropdown",
      labelType: "city",
      selectedCondition: "countryName",
    },
    {
      label: "State/Region",
      name: "stateRegionName",
      type: "dropdown",
      labelType: "state",
    },

    {
      label: "Post Code",
      name: "postCode",
    },
    {
      label: "Address",
      name: "address",
    },
  ],
  consigneeFields: [
    { label: "Name", name: "name" },
    {
      label: "Type",
      name: "type",
      type: "dropdown",
    },
    {
      label: "CODE",
      name: "code",
    },
    {
      label: "Country",
      name: "countryName",
      type: "dropdown",
      labelType: "country",
    },
    {
      label: "City",
      name: "cityName",
      type: "dropdown",
      labelType: "city",
      selectedCondition: "countryName",
    },
    {
      label: "State/Region",
      name: "stateRegionName",
      type: "dropdown",
      labelType: "state",
    },
    {
      label: "GSTIN",
      name: "gstin",
    },
    {
      label: "IEC",
      name: "iec",
    },
    {
      label: "Email ID",
      name: "emailId",
    },
    {
      label: "Post Code",
      name: "postCode",
    },
    {
      label: "Address",
      name: "address",
    },
    {
      label: "Notify Name",
      name: "notifyName",
      style: "mb-2",
      isEdit: true,
    },
    {
      label: "PAN Number",
      name: "panNumber",
      style: "mb-2",
      isEdit: true,
    },
    {
      label: "Country",
      name: "countryName",
      type: "dropdown",
      labelType: "country",
    },
    {
      label: "City",
      name: "cityName",
      type: "dropdown",
      labelType: "city",
      selectedCondition: "countryName",
    },
    {
      label: "State/Region",
      name: "stateRegionName",
      type: "dropdown",
      labelType: "state",
    },
    {
      label: "Post Code",
      name: "postCode",
    },
    {
      label: "Address",
      name: "address",
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
      rows: 1,
      height: "auto",
      type: "textarea",
      isEdit: true,
    },
  ],
  consigneeFields: [
    { label: "Name", name: "name" },
    {
      label: "Type",
      name: "type",
      type: "dropdown",
    },
    {
      label: "CODE",
      name: "code",
    },
    {
      label: "Country",
      name: "countryName",
      type: "dropdown",
      labelType: "country",
    },
    {
      label: "City",
      name: "cityName",
      type: "dropdown",
      labelType: "city",
      selectedCondition: "countryName",
    },
    {
      label: "State/Region",
      name: "stateRegionName",
      type: "dropdown",
      labelType: "state",
    },
    {
      label: "GSTIN",
      name: "gstin",
    },
    {
      label: "IEC",
      name: "iec",
    },
    {
      label: "Email ID",
      name: "emailId",
    },
    {
      label: "Post Code",
      name: "postCode",
    },
    {
      label: "Address",
      name: "address",
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
      label: "PAN Number",
      name: "panNumber",
      style: "mb-2",
      isEdit: true,
    },
    {
      label: "Country",
      name: "countryName",
      type: "dropdown",
      labelType: "country",
    },
    {
      label: "City",
      name: "cityName",
      type: "dropdown",
      labelType: "city",
      selectedCondition: "countryName",
    },
    {
      label: "State/Region",
      name: "stateRegionName",
      type: "dropdown",
      labelType: "state",
    },
    {
      label: "Post Code",
      name: "postCode",
    },
    {
      label: "Address",
      name: "address",
    },
  ],
  shipmentFields: [
    {
      label: "Type of Shipment",
      name: "typeofShipment",
      type: "dropdown",
      labelType: "name,tblTypeOfShipment",
    },
    {
      label: "Container Status",
      name: "containerStatus",
      type: "dropdown",
      labelType: "name,tblContainerStatus",
    },
    {
      label: "Free Days at destination",
      name: "freeDaysAtDestination",
    },
    {
      label: "Detention",
      name: "detention",
      type: "dropdown",
      labelType: "PORT",
    },
    {
      label: "Jumping Slab",
      name: "jumpingSlab",
      type: "radio",
      radioData: [
        { label: "Yes", value: "Y" },
        { label: "No", value: "N" },
      ],
    },
    {
      label: "Slab",
      name: "slab",
    },
    {
      label: "Route",
      name: "route",
      type: "dropdown",
      labelType: "name,tblRoutingType",
    },
  ],
  transportFields: [
    {
      label: "Shipping Line",
      name: "shippingLine",
      type: "dropdown",
      labelType: "company",
    },
    {
      label: "PLR",
      name: "plr",
      type: "dropdown",
      labelType: "port",
    },
    {
      label: "POL",
      name: "pol",
      type: "dropdown",
      labelType: "port",
    },
    {
      label: "POD",
      name: "pod",
      type: "dropdown",
      labelType: "port",
    },
    {
      label: "POD Agent",
      name: "podAgent",
      type: "dropdown",
      labelType: "company",
    },
    {
      label: "POD Agent Branch",
      name: "podAgentBranch",
      type: "dropdown",
      labelType: "companyBranch",
    },
    {
      label: "FPD",
      name: "fpd",
      type: "dropdown",
      labelType: "port",
    },
    {
      label: "FPD Agent",
      name: "fpdAgent",
      type: "dropdown",
      labelType: "company",
    },
    {
      label: "FPD Agent Branch",
      name: "fpdAgentBranch",
      type: "dropdown",
      labelType: "companyBranch",
    },
    {
      label: "Departure Vessel",
      name: "departureVessel",
      type: "dropdown",
      labelType: "vessel",
    },
    {
      label: "Departure Voyage",
      name: "departureVoyage",
      type: "dropdown",
      labelType: "voyage",
      selectedCondition: "departureVessel",
    },
    {
      label: "Arrival Vessel",
      name: "arrivalVessel",
      type: "dropdown",
      labelType: "vessel",
    },
    {
      label: "Arrival Voyage",
      name: "arrivalVoyage",
      type: "dropdown",
      labelType: "voyage",
      selectedCondition: "arrivalVessel",
    },
    {
      label: "Cargo Movement",
      name: "cargoMovement",
      type: "dropdown",
      labelType: "name,tblMovementType",
    },
    {
      label: "Movement Carrier",
      name: "movementCarrier",
    },
    {
      label: "Pre-Carriage",
      name: "preCarriage",
      type: "dropdown",
      labelType: "name,tblMode",
    },
    {
      label: "Post-Carriage",
      name: "postCarriage",
      type: "dropdown",
      labelType: "name,tblMode",
    },
    {
      label: "SEZ",
      name: "SEZ",
      type: "radio",
      radioData: [
        { label: "Yes", value: "Y" },
        { label: "No", value: "N" },
      ],
    },
    {
      label: "Consignee Nominated CFS",
      name: "consigneeNominatedCfs",
      type: "radio",
      radioData: [
        { label: "Yes", value: "Y" },
        { label: "No", value: "N" },
      ],
    },
    {
      label: "CSF",
      name: "csf",
      type: "dropdown",
      labelType: "port",
    },
    {
      label: "Direct Port Delivery Code",
      name: "directPortDeliveryCode",
      type: "dropdown",
      labelType: "port",
    },
    {
      label: "DPD CFS",
      name: "dpdCfs",
      type: "dropdown",
      labelType: "port",
    },
  ],
  invoicingFields: [
    {
      label: "Name",
      name: "name",
    },
    {
      label: "Address",
      name: "address",
    },
    {
      label: "GSTIN",
      name: "gstin",
    },
    {
      label: "Marks And Numbers",
      name: "marksAndNumbers",
      multiline: true,
      rows: 6,
      isEdit: true,
    },
    {
      label: "Goods and Description",
      name: "remarks",
      multiline: true,
      rows: 6,
      isEdit: true,
    },
    {
      label: "Invoice Value",
      name: "invoiceValue",
    },
    {
      label: "Currency",
      name: "currency",
      type: "dropdown",
      labelType: "currency",
    },
    {
      label: "Marks And Numbers",
      name: "marksAndNumbers",
      multiline: true,
      rows: 1,
      type: "textarea",
      isEdit: true,
    },
    {
      label: "Remarks",
      name: "remarks",
      multiline: true,
      rows: 1,
      type: "textarea",
      isEdit: true,
    },
    {
      label: "Description of Goods",
      name: "descriptionOfGoods",
      multiline: true,
      rows: 1,
      type: "textarea",
      isEdit: true,
    },
  ],
  containerFields: [
    { label: "OOG Front", name: "oogFront", type: "number", isEdit: true },
    { label: "OOG Back", name: "backFront", type: "number", isEdit: true },
  ],

  exportShippingFields1: [
    {
      label: "SB No.",
      name: "sbno",
    },
    {
      label: "SB Date",
      type: "date",
    },
    {
      label: "CIN Type",
      name: "cinType",
      type: "dropdown",
      labelType: "cinType",
    },
    {
      label: "CIN No.",
      name: "cinNo",
    },
  ],
  itineraryFields1: [
    {
      label: "SNo.",
      name: "sno",
    },
    {
      label: "From Port/ICD/sez/CFS",
      name: "fromPort",
    },
    {
      label: "To Port/ICD/sez/CFS",
      name: "toPort",
    },
    {
      label: "Mode of Transport",
      name: "modeOfTransport",
      type: "dropdown",
      labelType: "modeOfTransport",
    },
  ],
  attachmentFields1: [
    {
      label: "Others.",
      name: "others",
    },
    {
      label: "Mater Bl Copy",
      name: "materBlCopy",
    },
  ],
};

export default fieldData;
