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
      label: "Vessel-Voyage No",
      name: "vesselVoyageNo",
      type: "dropdown",
    },
    {
      label: "Place of Delivery",
      name: "placeOfDelivery",
    },
    {
      label: "Delivery Type",
      name: "deliveryType",
      type: "dropdown",
    },
    {
      label: "CFS Type",
      name: "cfsType",
      type: "dropdown",
    },
    {
      label: "CFS Name",
      name: "cfsName",
    },
    {
      label: "Consignee Name",
      name: "consigneeName",
    },
    {
      label: "Nominated CB",
      name: "nominatedCb",
    },
    {
      label: "Status",
      name: "status",
      type: "dropdown",
    },
  ],
  attachmentFields: [
    {
      label: "Document Title",
      name: "documentTitle",
      isEdit: true,
    },
    {
      label: "Select Attachment",
      name: "selectAttachment",
      type: "fileupload",
      isEdit: true,
    },
  ],
};
export default fieldData;
