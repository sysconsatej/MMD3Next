const fieldData = {
  companyBranchFields: [
    {
      label: "Office Type",
      name: "officeType",
      type: "dropdown",
      isEdit: true,
    },
    {
      label: " Address 1",
      name: "address",
      isEdit: true,
    },
    {
      label: " Address 1",
      name: "address",
      isEdit: true,
    },
    {
      label: "Country",
      name: "countryId",
      type: "dropdown",
      labelType: "country",
      foreignTable: "name,tblCountry",
      isEdit: "true",
    },
    {
      label: "State",
      name: "stateId",
      type: "dropdown",
      labelType: "state",
      foreignTable: "name,tblState",
      isEdit: "true",
    },
    {
      label: "City",
      name: "cityId",
      type: "dropdown",
      labelType: "city",
      selectedCondition: "countryId",
      foreignTable: "name,tblCity",
      isEdit: "true",
    },
    {
      label: "Pin Code",
      name: "pincode",
      isEdit: true,
    },
    {
      label: "Contact Person",
      name: "contactPerson",
      isEdit: true,
    },
    {
      label: "Valid From",
      name: "validForm",
      type: "date",
      isEdit: true,
    },
    {
      label: "Valid To",
      name: "validTo",
      type: "date",
      isEdit: true,
    },
    {
      label: "Phone Number",
      name: "telephoneNo",
      isEdit: true,
    },
    {
      label: "Alt Phone Number",
      name: "telephoneNo",
      isEdit: true,
    },
    {
      label: "Mobile Number",
      name: "telephoneNo",
      isEdit: true,
    },
    {
      label: "Alt Mobile Number",
      name: "telephoneNo",
      isEdit: true,
    },
    {
      label: "Email Id",
      name: "emailId",
      isEdit: true,
    },
    {
      label: " Alt Email Id",
      name: "emailId",
      isEdit: true,
    },
    {
      label: "Default Communication Address",
      name: "defaultCommunicationAddress",
      type: "checkbox",
      isEdit: true,
    },
    {
      label: "Default Billing Address",
      name: "defaultBillingAddress",
      type: "checkbox",
      isEdit: true,
    },
    {
      label: "SEZ Self Declaration",
      name: "SezSelfDeclaration",
      type: "checkbox",
      isEdit: true,
    },
    {
      label: "GSTIN No",
      name: "taxRegistrationNo",
      isEdit: true,
    },
  ],
  contactPersonFields: [
    {
      label: "Document Type",
      name: "documentTitle",
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
      label: " Attachment",
      name: "attachment",
      type: "fileupload",
      accept: "*/*",
      multiple: true,
      isEdit: true,
    },
  ],
  kycFields: [
    {
      label: "KYC Type",
      name: "kycType",
      isEdit: true,
    },
    {
      label: "Month-Year",
      name: "monthYear",
      isEdit: true,
    },
    {
      label: "Valid From",
      name: "validForm",
      type: "date",
      isEdit: true,
    },
    {
      label: "Valid To",
      name: "validTo",
      type: "date",
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
      label: "Remark",
      name: "remark",
      type: "textarea",
      rows: 1,
      gridColumn: "col-span-2 row-span-1 ",
      isEdit: "true",
    },
  ],
};

export default fieldData;
