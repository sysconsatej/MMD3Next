const fieldData = {
  companyFields: [
    {
      label: "Company Code",
      name: "companyCode",
    },
    {
      label: "Company Name",
      name: "companyName",
    },
    {
      label: "Country Name",
      name: "countryName",
      type: "dropdown",
      labelType: "country",
    },
    {
      label: "State/Region Name",
      name: "stateRegionName",
      type: "dropdown",
      labelType: "state",
    },
    {
      label: "City Name",
      name: "cityName",
      type: "dropdown",
      labelType: "city",
      selectedCondition: "countryName",
    },
    {
      label: "Company Address",
      name: "companyAddress",
    },
    {
      label: "Zip Code",
      name: "zipCode",
    },
    {
      label: "Phone",
      name: "phone",
      type: "number",
    },
  ],
  numberFields: [
    {
      label: "Remarks",
      name: "remarks",
      multiline: true,
      rows: 3,
      gridColumn: "col-span-2 row-span-3 ",
      type: "textarea",
      isEdit: true,
    },
    {
      label: "Email ID",
      name: "emailId",
    },
    {
      label: "Pan No",
      name: "panNo",
    },
    {
      label: "GSTIN No",
      name: "gstinNo",
    },
    {
      label: "Company Group Name",
      name: "companyGroupName",
      type: "dropdown",
      labelType:"name,tblCompanyGroup",
    },
    {
      label: "Credit Period",
      name: "creditPeriod",
      type: "number",
    },
    {
      label: "Currency",
      name: "currency",
      type: "dropdown",
      labelType: "code,tblCurrency",
    },
    {
      label: "IEC No",
      name: "iecNo",
    },
    {
      label: "Website",
      name: "website",
    },
  ],
};

export default fieldData;
