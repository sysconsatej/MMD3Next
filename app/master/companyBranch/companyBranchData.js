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
      label: "Country Name",
      name: "countryId",
      type: "dropdown",
      tableName: "tblCountry t",
      displayColumn: "t.name",
      orderBy: "t.name",
      labelType: "country",
      foreignTable: "name,tblCountry",
      isEdit: true,
    },

    {
      label: "State",
      name: "stateId",
      type: "dropdown",
      tableName: "tblState t",
      displayColumn: "t.name",
      orderBy: "t.name",
      labelType: "state",

      foreignTable: "name,tblState",
      isEdit: true,
    },

    {
      label: "City Name",
      name: "cityId",
      type: "dropdown",
      tableName: "tblCity t",
      displayColumn: "t.name",
      orderBy: "t.name",
      labelType: "city",
      foreignTable: "name,tblCity",
      selectedConditions: ["countryId"],
      isEdit: true,
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

export const companyBranch = [
  { label: "Code", value: "co.code" },
  { label: "Name", value: "co.name" },
  { label: "Company Branch", value: "com.name" },
  { label: "Country Name", value: "c.name" },
  { label: "State Name", value: "s.name" },
  { label: "City Name", value: "ci.name" },
  { label: "Phone No", value: "co.telephoneNo" },
  { label: "GSTIN No", value: "co.taxRegistrationNo" },
  { label: "ZipCode", value: "co.pincode" },
];

export default fieldData;
