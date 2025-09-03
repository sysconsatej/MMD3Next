const fieldData = {
  igmFields: [
    {
      label: "CFS Name",
      name: "cfsName",
      type: "dropdown",
      labelType: "cfsName",
    },
    {
      label: "IGM Location",
      name: "igmLocation",
      type: "dropdown",
      labelType: "igmLocation",
    },
    { label: "IGM No.", name: "igmNo" },
    { label: "Item No.", name: "itemNo" },
    { label: "IGM Date", name: "bookingReferenceNo", type: "date" },
    { label: "Valid Till", name: "validTill", type: "date" },
    { label: "Sub Item No.", name: "subItemNo" },
    {
      type: "radio",
      radioData: [
        { label: "RMS", value: "Y" },
        { label: "Non-RMS", value: "N" },
      ],
    },
    { label: "Examine Percentage", name: "examinePercentage" },
    {
      label: "Delivery Mode",
      name: "deliveryMode",
      type: "dropdown",
      labelType: "deliveryMode",
    },
    { label: "GSTIN/Provisional ID", name: "gstin" },
    { label: "Remarks", name: "remarks" },
  ],
  attachmentFields: [
    {
      label: "Document Title",
      name: "documentTitle",
      isEdit: true,
    },
    {
      label: "Document Description",
      name: "documentDescription",
      isEdit: true,
    },
    {
      label: "Select Attachment",
      name: "selectAttachment",
      type: "fileupload",
      accept: "*/*",
      multiple: false,
    },
  ],
};

export default fieldData;
