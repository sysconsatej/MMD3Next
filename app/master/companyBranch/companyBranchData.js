const fieldData = {
  companyBranchFields: [
     {
      label: "Branch address",
      name: "branchAddress",
      style: "sm:w-[min(100%,300px)]",
      multiline: true,
      gridColumn: "col-span-1 row-span-3 ",
      rows: 5,
      type: "textarea",
      isEdit: true,
    },
     {
      label: "Remarks",
      name: "remarks",
      style: "sm:w-[min(100%,300px)]",
      gridColumn: "col-span-1 row-span-3 ",
      multiline: true,
      rows: 5,
      type: "textarea",
      isEdit: true,
    },
    {
      label: "Branch Code",
      name: "branchCode",
    },
    {
      label: "Branch Name",
      name: "branchName",
    },
    {
      label: "Country Phone Code",
      name: "countryPhoneCode",
    },
    {
      label: "Country",
      name: "country",
      type: "dropdown",
      labelTypeOf: "BRANCH",
    },
    {
      label: "State",
      name: "state",
      type: "dropdown",
      labelTypeOf: "BRANCH",
    },
    {
      label: "City",
      name: "city",
      type: "dropdown",
      labelTypeOf: "BRANCH",
    },
    {
      label: "GSTIN No",
      name: "gstinNo",
    },
    {
      label: "Zipcode",
      name: "zipCode",
    },
    {
      label: "Telephone No",
      name: "telephoneNo",
    },
    {
      label: "Email Id",
      name: "emailId",
    },

    {
      label: "Language",
      name: "language",
      type: "dropdown",
      labelTypeOf: "BRANCH",
    },
  ],
};

export default fieldData;
