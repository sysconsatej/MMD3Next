const fieldData = {
  fields: [
    {
      label: "Department",
      name: "department",
      type: "dropdown",
      labelType: "department",
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

  shipmentFields: [
    {
      label: "Type of Shipment",
      name: "typeofShipment",
      type: "dropdown",
      labelType: "PORT",
    },
    {
      label: "Container Status",
      name: "containerStatus",
      type: "dropdown",
      labelType: "PORT",
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
      label:"Jumping Slab",
      name:"jumpingSlab",
      type: "radio",
      radioData: [
        { label: "Yes", value: "Y" },
        { label: "No", value: "N" },
      ],
    },
        
    {
      label:"Slab",
      name:"slab",
    },
    {
      label:"Route",
      name:"route",
      type:"dropdown",
      labelType:"PORT",
    }
  ],

  transportFields: [
    {
      label: "Shipping Line",
      name: "shippingLine",
      type: "dropdown",
      labelType: "vessel",
    },
    {
      label: "PLR",
      name: "plr",
      type: "dropdown",
      labelType: "voyage",
    },
    {
      label: "POL",
      name: "pol",
      type: "dropdown",
      labelType: "routing",
    },
    {
      label: "POD",
      name: "pod",
      type: "dropdown",
      labelType: "routing",
    },
     {
      label: "POD Agent",
      name: "podAgent",
      type: "dropdown",
      labelType: "routing",
    },
     {
      label: "POD Agent Branch",
      name: "podAgentBranch",
      type: "dropdown",
      labelType: "routing",
    },
     {
      label: "FPD",
      name: "fpd",
      type: "dropdown",
      labelType: "routing",
    },
     {
      label: "FPD Agent",
      name: "fpdAgent",
      type: "dropdown",
      labelType: "routing",
    },
    {
      label: "FPD Agent Branch",
      name: "fpdAgentBranch",
      type: "dropdown",
      labelType: "routing",
    },
    {
      label: "Departure Vessel",
      name: "departureVessel",
      type: "dropdown",
      labelType: "routing",
    },
    {
      label: "Departure Voyage",
      name: "departureVoyage",
      type: "dropdown",
      labelType: "routing",
    },
    {
      label: "Arrival Vessel",
      name: "arrivalVessel",
      type: "dropdown",
      labelType: "routing",
    },
    {
      label: "Arrival Voyage",
      name: "arrivalVoyage",
      type: "dropdown",
      labelType: "routing",
    },
    {
      label: "Cargo Movement",
      name: "cargoMovemen",
      type: "dropdown",
      labelType: "routing",
    },

    {
      label:"Movement Carrier",
      name:"movementCarrier",
      type:"dropdowm",
      labelType:"routing",
    },
    {
      label:"Pre-Carriage",
      name:"preCarriage",
      type:"dropdown",
      labelType:"routing",
    },
     {
      label:"Post-Carriage",
      name:"postCarriage",
      type:"dropdown",
      labelType:"routing",
    },
   { 
    label:"SEZ",
      name:"SEZ",
      type: "radio",
      radioData: [
        { label: "Yes", value: "Y" },
        { label: "No", value: "N" },
      ],
    },
    {
      label:"Consignee Nominated CFS",
      name:"consigneeNominatedCfs",
      type:"radio",
      radioData:[
        { label: "Yes", value: "Y" },
        { label: "No", value: "N" },
      ],
    },
      {
      label:"CSF",
      name:"csf",
      type:"dropdown",
      labelType:"routing",
    },
      {
      label:"Direct Port Delivery Code",
      name:"directPortDeliveryCode",
      type:"dropdown",
      labelType:"routing",
    },
    {
      label:"DPD CFS",
      name:"dpdCfs",
      type:"dropdown",
      labelType:"routing",
    },
  ],
commodityFields:[
   {
      label: "Marks And Numbers",
      name: "marksAndNumbers",
      multiline: true,
      rows: 6,
      gridColumn: "col-span-1 row-span-3 ",
      type: "textarea",
      isEdit: true,
    },
     {
      label: "Remarks",
      name: "remarks",
      multiline: true,
      rows: 6,
      gridColumn: "col-span-1 row-span-3 ",
      type: "textarea",
      isEdit: true,
    },
      {
      label: "Description of Goods",
      name: "descriptionOfGoods",
      multiline: true,
      rows: 6,
      gridColumn: "col-span-1 row-span-3 ",
      type: "textarea",
      isEdit: true,
    },
   {
      label:"OT",
      name:"ot",
      type:"dropdown",
      labelType:"routing",
    },
     {
      label:"Cargo Type",
      name:"cargoType",
      type:"dropdown",
      labelType:"routing",
    },
     {
      label:"Commodity Type",
      name:"commodityType",
      type:"dropdown",
      labelType:"routing",
    },
    {
      label:"Commodity",
      name:"commodity",
    },
    {
     label:"HS Code",
     name:"hsCode",
    },
    {
      label:"Gross Weight",
      name:"grossWeight",
      type:"number",
    },
     {
      label:"Net Weight",
      name:"netWeight",
      type:"number",
    },
     {
      label:"Gross Weight Unit",
      name:"grossWeightUnit",
      type:"dropdown",
      typeof:"routing",
    },
     {
      label:"Cargo Volume",
      name:"cargoVolume",
      type:"number",
    },
    {
      label:"Cargo Volume Unit",
      name:"cargoVolumeUnit",
      type:"dropdown",
      typeof:"routing",
    },
     {
      label:"No of Packages",
      name:"noOfPackages",
      type:"number",
    },
    {
      label:"Type of Packages",
      name:"typeOfPackages",
      type:"dropdown",
      typeof:"routing",
    },

],


  containerFields1: [
   {
    label:"Container",
    name:"container",
    type:"dropdown",
    label:"SIZE",
   },
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

    },
    {
      label: "Status",
      name: "status",
      type: "dropdown",
      labelType: "STATUS",

    },
    { label: " Agent Seal No", name: "agentsealNo", isEdit: true },
    { label: "No Of Pkgs", name: "noOfPackages", type: "number", isEdit: true },
    {
      label: "Type Of Pkgs",
      name: "package",
      type: "dropdown",
      labelType: "TypeofPkgs",
      isEdit: true,
    },
    { label: "Net Weight", name: "netWeight", type: "number", isEdit: true },
    { label: "Tara Weight", name: "taraWeight", type: "number", isEdit: true },
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
    { label: "Reefer Temperature", name: "reeferTemperture", type: "number", isEdit: true },
    {
      label: "Ref  Temp Unit",
      name: "refTempUnit",
      type: "dropdown",
      labelType: "netWtUnit",
      isEdit: true,
    },
    { label: "OOG Front", name: "oogFront", type: "number", isEdit: true },
    { label: "OOG Back", name: "backFront", type: "number", isEdit: true },
    { label: "OOG Back left", name: "oogBackLeft", type: "number", isEdit: true },


    {
      label: "ODC Dimension Unit",
      name: "dimensionUnit",
      type: "dropdown",
      labelType: "dimensionUnit",
      style: "hidden",
      isEdit: true,
    },
  { label: "OOGRight", name: "oogRight", type: "number", isEdit: true },
  { label: "OOGTop", name: "oogTop", type: "number", isEdit: true },
    { label: "Free Days", name: "freeDays", style: "hidden", isEdit: true },
    {
      label: "Slot owner",
      name: "slotOwner",
      type: "dropdown",
      labelType: "netWtUnit",
      isEdit: true,
    },
  ],
};

export default fieldData;
