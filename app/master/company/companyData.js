const fieldData = {
  companyFields: [
    {
      label: "Company Name",
      name: "name",
      isEdit: "true",
      required: "true",
    },

    {
      label: "Company Short Name",
      name: "name",
      isEdit: "true",
      required: "true",
    },
    {
      label: "Company Type",
      name: "name",
      type: "dropdown",
      labelType: "name,tblCity",
      foreignTable: "name,tblMasterData",
      isEdit: "true",
      required: "true",
    },
    {
      label: "Location",
      name: "name",
      type: "multiselect",
      labelType: "port",
      isEdit: "true",
      required: "true",
    },
    {
      label: "Status",
      name: "name",
      isEdit: "true",
      required: "true",
    },
    {
      label: "KYC",
      name: "name",
      isEdit: "true",
      required: "true",
    },
  ],
  attachmentFields: [
    {
      label: "Document Type",
      name: "documentType",
      isEdit: true,
    },
    {
      label: "Document No",
      name: "documentNo",
      isEdit: true,
    },
    {
      label: "Issued Date",
      name: "issuedDate",
      type: "date",
      isEdit: true,
    },
    {
      label: "Valid Till",
      name: "validTill",
      type: "date",
      isEdit: true,
    },
    {
      label: "Attachment Type",
      name: "attachmentType",
      type: "dropdown",
      isEdit: true,
    },
    {
      label: "Select Attachment",
      name: "selectAttachment",
      type: "fileupload",
      accept: "*/*",
      multiple: true,
      isEdit: true,
    },
    {
      label: "Status",
      name: "status",
      type: "dropdown",
      isEdit: true,
    },
    {
      label: "Remarks",
      name: "remarks",
      isEdit: true,
    },
  ],
};

export default fieldData;
