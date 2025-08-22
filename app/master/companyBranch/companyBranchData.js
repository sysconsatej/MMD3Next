const fieldData = {
  companyBranchFields: [
    {
      label: "Branch address",
      name: "address",
      style: "sm:w-[min(100%,300px)]",
      multiline: true,
      gridColumn: "col-span-1 row-span-3 ",
      rows: 3,
      type: "textarea",
      isEdit: true,
    },
    {
      label: "Remarks",
      name: "remarks",
      style: "sm:w-[min(100%,300px)]",
      gridColumn: "col-span-1 row-span-3 ",
      multiline: true,
      rows: 3,
      type: "textarea",
      isEdit: true,
    },
      {
      label: "Company",
      name: "companyId",
      type: "dropdown",
      labelType: "company",
      foreignTable: "name,tblCompany",
      isEdit: "true",
    },
    {
      label: "Branch Code",
      name: "code",
      isEdit: true,
    },
    {
      label: "Branch Name",
      name: "name",
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
      label: "GSTIN No",
      name: "taxRegistrationNo",
      isEdit: true,
    },
    {
      label: "Zipcode",
      name: "pincode",
      isEdit: true,
    },
    {
      label: "Telephone No",
      name: "telephoneNo",
      isEdit: true,
    },
    {
      label: "Email Id",
      name: "emailId",
      isEdit: true,
    },

    {
      label: "Language",
      name: "languageId",
      type: "dropdown",
      labelType: "name,tblLanguage",
      foreignTable: "name,tblMasterData",
      isEdit: true,
    },
  ],
};

export default fieldData;
